import path from 'path';
import dotenv from 'dotenv';
import { parseBankStatementCSV } from '../src/services/parserService.js';

dotenv.config();
import { calculateFinancialMetrics } from '../src/services/metricsService.js';
import { categorizeTransactions } from '../src/services/categorizationService.js';
import { generateSpendingInsights } from '../src/services/insightsService.js';
import { detectRecurringPayments } from '../src/services/recurringService.js';

const mockCsvPath = path.join('tests', 'mock_statement.csv');

try {
  console.log('🧪 Starting Phase 4 Integration Tests...');

  // 1. Test CSV Parsing
  const transactions = parseBankStatementCSV(mockCsvPath);
  console.log(`✅ Parsed ${transactions.length} transactions successfully.`);
  if (transactions.length !== 7) {
    throw new Error(`Expected 7 transactions, got ${transactions.length}`);
  }

  // 2. Test Categorization (with keyword matchers)
  console.log('🧪 Testing Keyword-Based Categorization...');
  const categorized = await categorizeTransactions(transactions);
  
  const expectedCategories = {
    'txn_1': 'Subscriptions', // Netflix (April)
    'txn_2': 'Food',          // Swiggy
    'txn_3': 'Salary',        // Salary Credit
    'txn_4': 'Bills',         // Internet Bill
    'txn_5': 'Other',         // Transfer to Self
    'txn_6': 'Food',          // Refund Swiggy
    'txn_7': 'Subscriptions'  // Netflix (May)
  };

  for (const tx of categorized) {
    const expected = expectedCategories[tx.id];
    console.log(`  Tx ID: ${tx.id} | Description: "${tx.description}" | Category: ${tx.category} (Expected: ${expected})`);
    if (tx.category !== expected) {
      throw new Error(`Transaction ${tx.id} ("${tx.description}") categorized as ${tx.category}, expected ${expected}`);
    }
  }
  console.log('✅ Categorization checks passed!');

  // 3. Test Recurring Payments Detection
  console.log('🧪 Testing Recurring Payments Detection...');
  const recurring = detectRecurringPayments(categorized);
  console.log('  Detected recurring payments:', JSON.stringify(recurring, null, 2));

  if (recurring.length !== 1) {
    throw new Error(`Expected 1 recurring payment, got ${recurring.length}`);
  }

  const netflixRec = recurring[0];
  if (!netflixRec.normalizedDescription.includes('netflix')) {
    throw new Error(`Expected recurring payment to be Netflix, got "${netflixRec.description}"`);
  }
  if (netflixRec.frequency !== 'monthly') {
    throw new Error(`Expected frequency to be monthly, got "${netflixRec.frequency}"`);
  }
  if (netflixRec.occurrences !== 2) {
    throw new Error(`Expected occurrences to be 2, got ${netflixRec.occurrences}`);
  }
  console.log('✅ Recurring Payments Detection checks passed!');

  // 4. Test Metrics calculations based on categories
  console.log('🧪 Testing Categorized Metrics calculations...');
  const metrics = calculateFinancialMetrics(categorized);
  console.log('  Metrics calculated:', JSON.stringify(metrics, null, 2));

  // Verify category breakdowns
  const foodBreakdown = metrics.categoryBreakdown.find(c => c.category === 'Food');
  if (!foodBreakdown || foodBreakdown.totalAmount !== 457.00) {
    throw new Error(`Expected Food breakdown total 457.00, got ${foodBreakdown ? foodBreakdown.totalAmount : 'none'}`);
  }
  
  const subsBreakdown = metrics.categoryBreakdown.find(c => c.category === 'Subscriptions');
  // Two netflix payments of 649.00 = 1298.00
  if (!subsBreakdown || subsBreakdown.totalAmount !== 1298.00) {
    throw new Error(`Expected Subscriptions total 1298.00, got ${subsBreakdown ? subsBreakdown.totalAmount : 'none'}`);
  }

  console.log('✅ Metrics calculation checks passed!');

  // 5. Test Insights Engine (fallback / static checks)
  console.log('🧪 Testing Insights Engine...');
  const insights = await generateSpendingInsights(metrics);
  console.log('  Insights generated:', JSON.stringify(insights, null, 2));

  if (insights.length < 3) {
    throw new Error(`Expected at least 3 insights, got ${insights.length}`);
  }

  console.log('✅ Insights engine checks passed!');
  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! Phase 4 data pipeline, AI layers, and recurring detection are verified and operational.');

} catch (error) {
  console.error('❌ TEST FAILED:', error.message);
  process.exit(1);
}
