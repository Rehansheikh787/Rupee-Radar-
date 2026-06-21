import path from 'path';
import dotenv from 'dotenv';
import { parseBankStatementCSV } from '../src/services/parserService.js';
import { calculateFinancialMetrics } from '../src/services/metricsService.js';
import { categorizeTransactions } from '../src/services/categorizationService.js';
import { generateSpendingInsights } from '../src/services/insightsService.js';
import { detectRecurringPayments } from '../src/services/recurringService.js';

dotenv.config();

const sampleCsvPath = path.join('..', 'sample_bank_statement.csv');

async function run() {
  try {
    console.log('🧪 Starting analysis on sample_bank_statement.csv...');
    const raw = parseBankStatementCSV(sampleCsvPath);
    console.log(`✅ Parsed ${raw.length} transactions.`);

    console.log('💡 Categorizing transactions (using local keywords & Groq)...');
    const categorized = await categorizeTransactions(raw);

    console.log('📊 Calculating financial metrics...');
    const metrics = calculateFinancialMetrics(categorized);

    console.log('🔄 Detecting recurring payments...');
    const recurring = detectRecurringPayments(categorized);

    console.log('🧠 Generating AI insights...');
    const insights = await generateSpendingInsights(metrics);

    console.log('\n==================================================');
    console.log('             RUPEERADAR CLI STATEMENT REPORT        ');
    console.log('==================================================');
    console.log(`Period:           ${metrics.dateRange.from} to ${metrics.dateRange.to}`);
    console.log(`Transactions:     ${metrics.transactionCount}`);
    console.log(`Total Income:     ₹${metrics.totalIncome.toLocaleString('en-IN')}`);
    console.log(`Total Spend:      ₹${metrics.totalSpend.toLocaleString('en-IN')}`);
    console.log(`Net Savings:      ₹${metrics.netSavings.toLocaleString('en-IN')} (${metrics.savingsRate}%)`);
    console.log(`Avg Daily Spend:  ₹${metrics.avgDailySpend.toLocaleString('en-IN')}`);

    console.log('\n==================================================');
    console.log('             DETECTED RECURRING PAYMENTS          ');
    console.log('==================================================');
    if (recurring.length > 0) {
      recurring.forEach(rp => {
        console.log(`• [${rp.frequency.toUpperCase()}] ${rp.description.padEnd(25)} : ₹${rp.amount.toLocaleString('en-IN')} (${rp.occurrences} occurrences)`);
      });
    } else {
      console.log('No recurring transactions detected.');
    }

    console.log('\n==================================================');
    console.log('             AI PERSONAL INSIGHTS & ADVICE        ');
    console.log('==================================================');
    insights.forEach(ins => {
      console.log(`${ins.emoji} [${ins.title}] ${ins.text}`);
    });
    console.log('==================================================\n');

  } catch (err) {
    console.error('❌ Error during analysis:', err.message);
  }
}

run();
