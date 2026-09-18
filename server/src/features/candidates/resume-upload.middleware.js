import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import fs from 'fs';
import { AppError } from '../../utils/AppError.js';

/**
 * Storage: local disk under uploads/resumes/. Fine for a portfolio project;
 * flag for later if you deploy somewhere with an ephemeral filesystem
 * (Render/Railway free tiers wipe local disk on redeploy) — you'd want
 * S3/Cloudinary/etc. instead at that point. Swapping storage engines later
 * only touches this file, not the rest of the candidates feature.
 */
const UPLOAD_DIR = path.resolve('uploads', 'resumes');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Random filename, not the original — avoids path traversal / collision
    // issues from user-supplied filenames, and avoids leaking a candidate's
    // real name into a URL.
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `${randomUUID()}${ext}`);
  },
});

const MAX_FILE_SIZE_MB = 5;
const MAX_FILES_PER_REQUEST = 10;

function fileFilter(req, file, cb) {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (!isPdfMime || !isPdfExt) {
    // Reject with an error multer will surface via the `error` argument —
    // caught and converted to a clean 400 by handleUploadErrors below.
    return cb(new AppError('Only PDF files are allowed', 400));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: MAX_FILES_PER_REQUEST,
  },
});

/** Field name matches the decision already logged: upload.array('resumes'). */
export const uploadResumes = upload.array('resumes', MAX_FILES_PER_REQUEST);

/**
 * Multer's own errors (file too large, too many files) don't go through
 * our AppError/next(err) flow automatically — this wraps the upload
 * middleware so all failure paths end up in the same centralized error
 * handler with consistent messages.
 *
 * Usage in routes: replace `uploadResumes` with `handleUpload` directly —
 * see candidate.routes.js.
 */
export function handleUpload(req, res, next) {
  uploadResumes(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError(`Each file must be under ${MAX_FILE_SIZE_MB}MB`, 400));
      }
      if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new AppError(`You can upload at most ${MAX_FILES_PER_REQUEST} files at once`, 400));
      }
      return next(new AppError(err.message, 400));
    }
    if (err) {
      // AppError thrown from fileFilter, or anything else unexpected
      return next(err);
    }
    if (!req.files || req.files.length === 0) {
      return next(new AppError('No resume files were uploaded (expected field name "resumes")', 400));
    }
    next();
  });
}