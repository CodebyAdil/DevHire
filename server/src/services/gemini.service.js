import { AppError } from '../utils/AppError.js';

/**
 * Calls Google AI Studio's Gemini API. See the extended notes further
 * down (kept from the original version) on how its wire format differs
 * from Anthropic/xAI, which this project tried earlier.
 */

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 30000;

// Retry config for TRANSIENT failures only (503 overloaded, 429 rate
// limited) — not for 400s (bad request) or 404s (bad model name), which
// will never succeed no matter how many times you retry them.
const MAX_RETRIES = 3;
const RETRYABLE_STATUS_CODES = new Set([429, 503]);
const BASE_DELAY_MS = 1000; // 1s, 2s, 4s — exponential backoff

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildPrompt({ title, description, requirements }, resumeText) {
  return `You are a recruiting assistant. Compare the candidate resume below against the job, then respond with ONLY a single JSON object — no preamble, no markdown code fences, no explanation outside the JSON.

Job title: ${title}
Job description: ${description}
Job requirements: ${requirements || '(none specified)'}

Resume text:
"""
${resumeText.slice(0, 12000)}
"""

Respond with exactly this JSON shape:
{
  "name": "candidate's full name as found in the resume, or null if not found",
  "email": "candidate's email as found in the resume, or null if not found",
  "skills": ["array", "of", "key skills found in the resume"],
  "experience": "1-2 sentence summary of their relevant work experience",
  "education": "1 sentence summary of their education background",
  "matchScore": <integer 0-100, how well this candidate matches the job requirements>,
  "matchSummary": "2-3 sentence explanation of the score — cite specific strengths and gaps against the requirements"
}`;
}

function extractJson(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

function validateShape(data) {
  const requiredKeys = ['skills', 'experience', 'education', 'matchScore', 'matchSummary'];
  for (const key of requiredKeys) {
    if (!(key in data)) {
      throw new Error(`Missing key "${key}" in AI response`);
    }
  }
  if (typeof data.matchScore !== 'number' || data.matchScore < 0 || data.matchScore > 100) {
    throw new Error('matchScore was not a number between 0 and 100');
  }
  if (!Array.isArray(data.skills)) {
    throw new Error('skills was not an array');
  }
}

/** One HTTP attempt — no retry logic in here, that lives in the caller below. */
async function callGemini(prompt) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GOOGLE_AI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 2048,
          // Gemini 2.5+/3.x models "think" before answering by default,
          // and those reasoning tokens count against maxOutputTokens.
          // For a straightforward extraction/scoring task like this one,
          // thinking isn't needed and was eating most of the token budget
          // before the model even got to writing the JSON — causing
          // responses to cut off mid-output. thinkingBudget: 0 disables
          // it (supported on Flash-tier models; Pro-tier models require a
          // minimum >0 budget, so drop this if you switch to a Pro model).
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      signal: controller.signal,
    });
    return response;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new AppError('AI scoring timed out — please try again', 504);
    }
    throw new AppError('Could not reach the AI service', 502);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * @param {{title: string, description: string, requirements?: string}} job
 * @param {string} resumeText
 * @returns {Promise<{name: string|null, email: string|null, skills: string[], experience: string, education: string, matchScore: number, matchSummary: string}>}
 */
export async function scoreCandidateResume(job, resumeText) {
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new AppError('GOOGLE_AI_API_KEY is not configured', 500);
  }

  const prompt = buildPrompt(job, resumeText);
  let response;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    response = await callGemini(prompt);

    if (response.ok) break;

    const isRetryable = RETRYABLE_STATUS_CODES.has(response.status);
    const isLastAttempt = attempt === MAX_RETRIES;

    if (!isRetryable || isLastAttempt) {
      const bodyText = await response.text().catch(() => '');
      console.error(`Gemini API error ${response.status} (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`, bodyText);

      if (response.status === 503) {
        throw new AppError('AI service is temporarily overloaded — please try again in a moment', 503);
      }
      if (response.status === 429) {
        throw new AppError('AI service rate limit reached — please try again shortly', 429);
      }
      throw new AppError('AI scoring service returned an error', 502);
    }

    // Retryable and not the last attempt — back off and try again.
    // Exponential: 1s, 2s, 4s. A tiny random jitter avoids every queued
    // request in a batch (score-all) retrying at exactly the same instant.
    const delay = BASE_DELAY_MS * 2 ** attempt + Math.random() * 250;
    console.warn(`Gemini API returned ${response.status}, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
    await sleep(delay);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;

  if (!text) {
    // Can happen if Gemini's safety filters blocked the response, or if
    // it ran out of tokens before producing any output at all — check
    // candidate?.finishReason ("SAFETY", "MAX_TOKENS", etc.) if debugging.
    console.error('Gemini returned no text content. finishReason:', candidate?.finishReason, 'promptFeedback:', data.promptFeedback);
    throw new AppError('AI response did not contain any content', 502);
  }

  let parsed;
  try {
    parsed = extractJson(text);
    validateShape(parsed);
  } catch (err) {
    const truncated = candidate?.finishReason === 'MAX_TOKENS';
    console.error(
      `Failed to parse/validate AI response${truncated ? ' (response was truncated — finishReason: MAX_TOKENS)' : ''}:`,
      text
    );
    throw new AppError(
      truncated
        ? 'AI response was cut off before completing — try increasing maxOutputTokens'
        : 'AI returned an unexpected response format',
      502
    );
  }

  return {
    name: parsed.name || null,
    email: parsed.email || null,
    skills: parsed.skills,
    experience: parsed.experience,
    education: parsed.education,
    matchScore: Math.round(parsed.matchScore),
    matchSummary: parsed.matchSummary,
  };
}