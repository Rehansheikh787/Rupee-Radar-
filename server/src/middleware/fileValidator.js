import path from 'path';

/**
 * Express middleware to validate file uploads for format and size constraints.
 */
export const validateStatementUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded. Please upload a valid CSV bank statement.'
    });
  }

  // Validate file extension
  const ext = path.extname(req.file.originalname).toLowerCase();
  if (ext !== '.csv') {
    return res.status(400).json({
      success: false,
      error: 'Invalid file format. Only .csv files are supported.'
    });
  }

  // Validate file size (configured in env, default to 5MB)
  const maxSizeBytes = (parseInt(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024;
  if (req.file.size > maxSizeBytes) {
    return res.status(400).json({
      success: false,
      error: `File size exceeds the limit of ${process.env.MAX_FILE_SIZE_MB || 5}MB.`
    });
  }

  next();
};
