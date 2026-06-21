/**
 * Computes financial metrics and summaries from categorized transactions.
 */
export function calculateFinancialMetrics(transactions) {
  if (!transactions || transactions.length === 0) {
    return {
      totalIncome: 0,
      totalSpend: 0,
      netSavings: 0,
      savingsRate: 0,
      transactionCount: 0,
      dateRange: { from: null, to: null },
      categoryBreakdown: [],
      biggestTransaction: null,
      avgDailySpend: 0
    };
  }

  let totalIncome = 0;
  let totalSpend = 0;
  const categoryTotals = {};
  const categoryCounts = {};
  let biggestTransaction = null;

  // Track dates to find range and average daily spend
  let minDate = new Date(transactions[0].date);
  let maxDate = new Date(transactions[0].date);

  transactions.forEach(tx => {
    const amount = tx.amount || 0;
    const type = tx.type;
    const category = tx.category || 'Uncategorized';
    const txDate = new Date(tx.date);

    // Track min/max dates
    if (txDate < minDate) minDate = txDate;
    if (txDate > maxDate) maxDate = txDate;

    if (type === 'credit') {
      totalIncome += amount;
    } else if (type === 'debit') {
      totalSpend += amount;

      // Group debits by category
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;

      // Track biggest debit transaction
      if (!biggestTransaction || amount > biggestTransaction.amount) {
        biggestTransaction = {
          id: tx.id,
          date: tx.date,
          description: tx.description,
          amount: amount,
          category: category
        };
      }
    }
  });

  const netSavings = totalIncome - totalSpend;
  const savingsRate = totalIncome > 0 ? parseFloat(((netSavings / totalIncome) * 100).toFixed(1)) : 0;

  // Calculate day difference for average daily spend
  const dayTimeDiff = Math.abs(maxDate.getTime() - minDate.getTime());
  const dayCount = Math.max(1, Math.ceil(dayTimeDiff / (1000 * 60 * 60 * 24)) + 1);
  const avgDailySpend = parseFloat((totalSpend / dayCount).toFixed(2));

  // Build category breakdown array
  const categoryBreakdown = Object.keys(categoryTotals).map(catName => {
    const totalAmount = parseFloat(categoryTotals[catName].toFixed(2));
    const percentage = totalSpend > 0 ? parseFloat(((totalAmount / totalSpend) * 100).toFixed(1)) : 0;
    return {
      category: catName,
      totalAmount,
      percentage,
      transactionCount: categoryCounts[catName] || 0
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount); // sort by highest spending

  return {
    totalIncome: parseFloat(totalIncome.toFixed(2)),
    totalSpend: parseFloat(totalSpend.toFixed(2)),
    netSavings: parseFloat(netSavings.toFixed(2)),
    savingsRate,
    transactionCount: transactions.length,
    dateRange: {
      from: minDate.toISOString().split('T')[0],
      to: maxDate.toISOString().split('T')[0]
    },
    categoryBreakdown,
    biggestTransaction,
    avgDailySpend
  };
}
