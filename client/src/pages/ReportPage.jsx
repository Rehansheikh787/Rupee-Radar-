import React from 'react';

function ReportPage({ data, onNavigateToDashboard }) {
  if (!data) return null;

  const { summary, categoryBreakdown, topTransactions, recurringPayments, insights, transactions } = data;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (!transactions || transactions.length === 0) return;
    
    const headers = ['Date', 'Original Description', 'Cleaned Description', 'Type', 'Amount (INR)', 'Category'];
    
    const rows = transactions.map(tx => [
      tx.date,
      `"${(tx.rawDescription || '').replace(/"/g, '""')}"`,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      tx.type,
      tx.amount,
      tx.category
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `RupeeRadar_Cleaned_${summary.dateRange.from}_to_${summary.dateRange.to}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="report-container animate-fade-in">
      {/* Report Controls (hidden in printing) */}
      <header className="report-controls glass-panel no-print">
        <button className="btn-back" onClick={onNavigateToDashboard}>
          ← Back to Interactive Dashboard
        </button>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button className="btn-back" onClick={handleDownloadCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            📥 Export Cleaned CSV
          </button>
          <button className="btn-primary" onClick={handlePrint}>
            🖨️ Print or Save as PDF
          </button>
        </div>
      </header>

      {/* Printable Report Sheet */}
      <div className="report-sheet glass-panel">
        <div className="report-header">
          <div className="report-title-section">
            <h1>Rupee<span className="accent-text">Radar</span> Financial Report</h1>
            <p className="report-meta">Generated on {new Date().toLocaleDateString('en-IN')}</p>
          </div>
          <div className="report-date-range">
            <strong>Statement Period:</strong>
            <p>{summary.dateRange.from} to {summary.dateRange.to}</p>
          </div>
        </div>

        <hr className="report-divider" />

        {/* Section 1: Financial Summary */}
        <section className="report-section">
          <h2>1. Executive Financial Summary</h2>
          <table className="report-summary-table">
            <tbody>
              <tr>
                <td><strong>Total Income Credits:</strong></td>
                <td className="text-income">₹{summary.totalIncome.toLocaleString('en-IN')}</td>
                <td><strong>Total Spend Debits:</strong></td>
                <td className="text-expense">₹{summary.totalSpend.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td><strong>Net Month-End Savings:</strong></td>
                <td className={summary.netSavings >= 0 ? 'text-income' : 'text-expense'}>
                  ₹{summary.netSavings.toLocaleString('en-IN')}
                </td>
                <td><strong>Net Savings Ratio:</strong></td>
                <td>{summary.savingsRate}%</td>
              </tr>
              <tr>
                <td><strong>Average Daily Spending:</strong></td>
                <td>₹{summary.avgDailySpend.toLocaleString('en-IN')}</td>
                <td><strong>Total Statement Rows:</strong></td>
                <td>{summary.transactionCount} transactions</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Section 2: Category Allocations */}
        <section className="report-section">
          <h2>2. Expense Allocation Breakdown</h2>
          <table className="report-data-table">
            <thead>
              <tr>
                <th>Expense Category</th>
                <th className="text-right">Total Debit Amount</th>
                <th className="text-right">Percentage Allocation</th>
                <th className="text-right">Volume</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.map((c, idx) => (
                <tr key={idx}>
                  <td>
                    <span className={`cat-dot cat-${c.category.toLowerCase()}`}></span>
                    {c.category}
                  </td>
                  <td className="text-right">₹{c.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="text-right">{c.percentage}%</td>
                  <td className="text-right">{c.transactionCount} tx</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Section 3: Repeating Subscriptions & EMIs */}
        <section className="report-section">
          <h2>3. Detected Recurring Payments</h2>
          {recurringPayments.length > 0 ? (
            <table className="report-data-table">
              <thead>
                <tr>
                  <th>Payee / Description</th>
                  <th>Interval Frequency</th>
                  <th>Category</th>
                  <th className="text-right">Cycle Amount</th>
                  <th className="text-right">Total Cycles</th>
                </tr>
              </thead>
              <tbody>
                {recurringPayments.map((rp, idx) => (
                  <tr key={idx}>
                    <td>{rp.description}</td>
                    <td><span className="frequency-badge">{rp.frequency}</span></td>
                    <td>{rp.category}</td>
                    <td className="text-right">₹{rp.amount.toLocaleString('en-IN')}</td>
                    <td className="text-right">{rp.occurrences} matches</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-records">No repeating subscriptions or EMI charges detected in this statement period.</p>
          )}
        </section>

        {/* Section 4: AI Financial Recommendations */}
        <section className="report-section">
          <h2>4. AI Spending Insights & Recommendations</h2>
          <div className="report-insights-list">
            {insights.map((ins, idx) => (
              <div key={idx} className="report-insight-card">
                <span className="insight-emoji">{ins.emoji}</span>
                <div className="insight-body">
                  <strong>{ins.title}</strong>
                  <p>{ins.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="report-footer">
          <p>© 2026 RupeeRadar Personal Finance Assistant. Privacy-conscious stateless parsing.</p>
        </div>
      </div>
    </div>
  );
}

export default ReportPage;
