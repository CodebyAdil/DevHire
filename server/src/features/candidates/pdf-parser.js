import { readFile } from 'fs/promises';
import pdfParse from '@cedrugs/pdf-parse';
import { AppError } from '../../utils/AppError.js';

/**
 * DECISION UPDATE: switched from `pdf-parse` to `@cedrugs/pdf-parse` — a
 * maintained fork of the same library. The original `pdf-parse` is
 * effectively unmaintained and has known issues around ESM default-export
 * interop; this fork specifically fixes that, ships its own TypeScript
 * types, and targets Node 18+. Same API, so this file barely changed —
 * only the import line.
 *
 * KNOWN LIMITATION (unchanged): reads the text layer of a PDF — no OCR,
 * so a scanned/image-only resume extracts empty text.
 */
export async function extractTextFromPdf(filePath) {
  let buffer;
  try {
    buffer = await readFile(filePath);
  } catch (err) {
    console.error('extractTextFromPdf: failed to read file at', filePath, err);
    throw new AppError('Could not read the uploaded file', 500);
  }

  let result;
  try {
    result = await pdfParse(buffer);
  } catch (err) {
    console.error('extractTextFromPdf: pdf-parse threw:', err);
    throw new AppError('Could not extract text from this PDF — it may be corrupted or password-protected', 422);
  }

  const text = result.text?.trim() ?? '';
  return text;
}