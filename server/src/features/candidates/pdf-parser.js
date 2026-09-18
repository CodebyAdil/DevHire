import { readFile } from 'fs/promises';
import pdfParse from 'pdf-parse';
import { AppError } from '../../utils/AppError.js';

/**
 * Isolated in its own file for the same reason auth.service.js and
 * job.service.js separate concerns — PDF_PARSING_APPROACH was still an
 * open decision in PROJECT_SPEC.md, so keeping this to one function with
 * one job (buffer -> text) means swapping `pdf-parse` for another library
 * later (or for a Claude-API-based extraction approach) only touches this
 * file.
 *
 * KNOWN LIMITATION: pdf-parse reads the text layer of a PDF. A scanned
 * resume (a photo/image with no embedded text) will extract as empty or
 * near-empty text — there's no OCR here. If that turns out to matter for
 * your test resumes, flag it and we can look at an OCR step later; out of
 * scope for v1 for now.
 */
export async function extractTextFromPdf(filePath) {
  let buffer;
  try {
    buffer = await readFile(filePath);
  } catch (err) {
    throw new AppError('Could not read the uploaded file', 500);
  }

  let result;
  try {
    result = await pdfParse(buffer);
  } catch (err) {
    // Corrupted PDF, password-protected file, etc.
    throw new AppError('Could not extract text from this PDF — it may be corrupted or password-protected', 422);
  }

  const text = result.text?.trim() ?? '';
  return text;
}