import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { parseBankStatementCSV } from '../services/parserService.js';
import { calculateFinancialMetrics } from '../services/metricsService.js';
import { categorizeTransactions } from '../services/categorizationService.js';
import { generateSpendingInsights } from '../services/insightsService.js';
import { detectRecurringPayments } from '../services/recurringService.js';

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ storage });

/**
 * Handle file upload endpoint
 */
export const handleUpload = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process file upload: ' + error.message
    });
  }
};

/**
 * Handle statement analysis endpoint
 */
export const handleAnalysis = async (req, res) => {
  const { fileId } = req.body;

  if (!fileId) {
    return res.status(400).json({
      success: false,
      error: 'Missing fileId parameter in request body.'
    });
  }

  const filePath = path.join('uploads', fileId);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'Statement file not found. It may have expired or been deleted.'
    });
  }

  try {
    // 1. Parse and Clean CSV
    const rawTransactions = parseBankStatementCSV(filePath);

    // 2. AI & Local Keyword-based Categorization
    const categorizedTransactions = await categorizeTransactions(rawTransactions);

    // 3. Compute metrics based on categorized transactions
    const metrics = calculateFinancialMetrics(categorizedTransactions);

    // 4. Detect Recurring Payments
    const recurringPayments = detectRecurringPayments(categorizedTransactions);

    // 5. AI-powered Insight Generation
    const insights = await generateSpendingInsights(metrics);

    // Clean up file after successful analysis (stateless behavior)
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkErr) {
      console.warn(`⚠️ Warning: Failed to clean up file ${fileId}:`, unlinkErr.message);
    }

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalIncome: metrics.totalIncome,
          totalSpend: metrics.totalSpend,
          netSavings: metrics.netSavings,
          savingsRate: metrics.savingsRate,
          transactionCount: metrics.transactionCount,
          dateRange: metrics.dateRange,
          avgDailySpend: metrics.avgDailySpend
        },
        categoryBreakdown: metrics.categoryBreakdown,
        topTransactions: metrics.biggestTransaction ? [metrics.biggestTransaction] : [],
        recurringPayments,
        insights,
        transactions: categorizedTransactions
      }
    });

  } catch (error) {
    // Attempt file cleanup on failure
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupErr) {
      console.error('⚠️ Failed to clean file after error:', cleanupErr.message);
    }

    res.status(500).json({
      success: false,
      error: 'Analysis pipeline failed: ' + error.message
    });
  }
};
