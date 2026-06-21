/**
 * Helper to clean and normalize transaction descriptions to identify repeating payees.
 * Strips out transaction IDs, numbers, dates, reference codes, and payment channel noise.
 */
function normalizeDescription(description) {
  if (!description) return '';
  
  return description
    .toLowerCase()
    // Remove payment type prefixes
    .replace(/^(upi|pos|neft|rtgs|imps|ach|nach|dd|wd|chq|transfer|payment)\s+/i, '')
    // Remove transaction references, digits, dates, phone numbers
    .replace(/[0-9]+/g, '')
    // Remove special characters and slashes
    .replace(/[\/\-_]/g, ' ')
    // Remove double spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detects recurring transactions (Subscriptions, EMIs, Rent, SIPs, Utilities)
 * from a list of transactions.
 */
export function detectRecurringPayments(transactions) {
  if (!transactions || transactions.length < 2) return [];

  // Group debit transactions by normalized description
  const groups = {};
  
  transactions.forEach(tx => {
    if (tx.type !== 'debit') return; // recurring payments are generally expenses (debits)
    
    const normName = normalizeDescription(tx.description);
    if (!normName || normName.length < 3) return; // ignore very short descriptions

    if (!groups[normName]) {
      groups[normName] = [];
    }
    groups[normName].push(tx);
  });

  const recurringPayments = [];

  for (const [normName, txList] of Object.entries(groups)) {
    // We need at least 2 occurrences to evaluate recurrence
    if (txList.length < 2) continue;

    // Sort by date ascending
    txList.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate intervals (in days) between consecutive occurrences
    const intervals = [];
    let isSameAmount = true;
    const firstAmount = txList[0].amount;

    for (let i = 1; i < txList.length; i++) {
      const prevDate = new Date(txList[i-1].date);
      const currDate = new Date(txList[i].date);
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      intervals.push(diffDays);

      if (Math.abs(txList[i].amount - firstAmount) > 0.01) {
        isSameAmount = false;
      }
    }

    // Determine if the intervals are regular
    // Standard windows:
    // Monthly: ~28-33 days (or multiples if a month was missed)
    // Weekly: ~6-8 days
    // Fortnightly: ~13-16 days
    let isRecurring = false;
    let frequency = 'unknown';

    // If we only have 1 interval (2 transactions)
    if (intervals.length === 1) {
      const days = intervals[0];
      if (days >= 25 && days <= 35) {
        isRecurring = true;
        frequency = 'monthly';
      } else if (days >= 5 && days <= 9) {
        isRecurring = true;
        frequency = 'weekly';
      } else if (days >= 12 && days <= 17) {
        isRecurring = true;
        frequency = 'fortnightly';
      }
    } else {
      // Multiple intervals: check consistency (standard deviation / range check)
      const sum = intervals.reduce((a, b) => a + b, 0);
      const avgInterval = sum / intervals.length;

      // Check if intervals deviate very little from the average
      const maxDeviation = Math.max(...intervals.map(d => Math.abs(d - avgInterval)));

      // If average interval matches weekly or monthly with low deviation
      if (avgInterval >= 25 && avgInterval <= 35 && maxDeviation <= 5) {
        isRecurring = true;
        frequency = 'monthly';
      } else if (avgInterval >= 5 && avgInterval <= 9 && maxDeviation <= 2) {
        isRecurring = true;
        frequency = 'weekly';
      } else if (avgInterval >= 12 && avgInterval <= 17 && maxDeviation <= 3) {
        isRecurring = true;
        frequency = 'fortnightly';
      }
    }

    if (isRecurring) {
      // Calculate representative amount (average)
      const totalAmount = txList.reduce((sum, tx) => sum + tx.amount, 0);
      const avgAmount = parseFloat((totalAmount / txList.length).toFixed(2));

      // Attempt to identify the category from the transactions
      // Take the most common category or the first one
      const category = txList[0].category || 'Uncategorized';

      recurringPayments.push({
        description: txList[0].description, // original description for reference
        normalizedDescription: normName,
        amount: avgAmount,
        isSameAmount,
        frequency,
        category,
        occurrences: txList.length,
        lastDate: txList[txList.length - 1].date,
        transactions: txList.map(tx => ({
          id: tx.id,
          date: tx.date,
          amount: tx.amount
        }))
      });
    }
  }

  return recurringPayments;
}
