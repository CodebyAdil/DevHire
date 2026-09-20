import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import fs from 'fs';
import { AppError } from '../../utils/AppError.js';

const UPLOAD_DIR = path.resolve('uploads', 'resumes');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `${randomUUID()}${ext}`);
  },
});

const MAX_FILE_SIZE_MB = 5;
const MAX_FILES_PER_REQUEST = 10;
const FIELD_NAME = 'resumes';

function fileFilter(req, file, cb) {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (!isPdfMime || !isPdfExt) {
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

export const uploadResumes = upload.array(FIELD_NAME, MAX_FILES_PER_REQUEST);

export function handleUpload(req, res, next) {
  uploadResumes(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError(`Each file must be under ${MAX_FILE_SIZE_MB}MB`, 400));
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return next(new AppError(`You can upload at most ${MAX_FILES_PER_REQUEST} files at once`, 400));
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        // Fires when the form-data field name doesn't match what multer
        // expects — NOT when too many files are sent. Kept as its own
        // branch (previously merged with LIMIT_FILE_COUNT, which produced
        // a misleading "at most 10 files" error for this exact case).
        return next(
          new AppError(
            `File field name must be "${FIELD_NAME}" (got "${err.field}"). Check your form-data key.`,
            400
          )
        );
      }
      return next(new AppError(err.message, 400));
    }
    if (err) {
      return next(err);
    }
    if (!req.files || req.files.length === 0) {
      return next(new AppError(`No resume files were uploaded (expected field name "${FIELD_NAME}")`, 400));
    }
    next();
  });
}