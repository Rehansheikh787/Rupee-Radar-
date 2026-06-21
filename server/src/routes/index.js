import express from 'express';
import { handleUpload, handleAnalysis, upload } from '../controllers/analysisController.js';
import { validateStatementUpload } from '../middleware/fileValidator.js';

const router = express.Router();

// Upload statement route
router.post('/upload', upload.single('statement'), validateStatementUpload, handleUpload);

// Analyze statement route
router.post('/analyze', handleAnalysis);

export default router;
