import React from 'react';
import TransactionTable from '../components/TransactionTable/TransactionTable.jsx';
import CategoryPieChart from '../components/Charts/CategoryPieChart.jsx';

function DashboardPage({ data, theme, onReset, onNavigateToReport }) {
  if (!data) return null;

  const { summary, categoryBreakdown, topTransactions, recurringPayments, insights, transactions } = data;

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
    <div className="dashboard-container animate-fade-in">
      {/* Dashboard Top Header */}
      <header className="dashboard-header glass-panel">
        <div className="header-left">
          <button className="btn-back" onClick={onReset}>
            ← Upload Another Statement
          </button>
          <h2>RupeeRadar Dashboard</h2>
        </div>
        <div className="header-right">
          <span className="statement-period">
            📅 Period: {summary.dateRange.from} to {summary.dateRange.to}
          </span>
          <button className="btn-back" onClick={handleDownloadCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            📥 Export Cleaned CSV
          </button>
          <button className="btn-primary" onClick={onNavigateToReport}>
            📄 View Full Report
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="dashboard-grid">
        {/* Row 1: Summary Cards (Slot) */}
        <section className="summary-section">
          {/* Will render SummaryCards component here */}
          <div className="summary-cards-container">
            {/* Placeholder until SummaryCards.jsx is built */}
            <div className="metric-card income-card glass-panel">
              <span className="metric-icon">💰</span>
              <div className="metric-data">
                <span className="metric-label">Total Income</span>
                <h3>₹{summary.totalIncome.toLocaleString('en-IN')}</h3>
              </div>
            </div>
            <div className="metric-card spend-card glass-panel">
              <span className="metric-icon">💸</span>
              <div className="metric-data">
                <span className="metric-label">Total Spend</span>
                <h3>₹{summary.totalSpend.toLocaleString('en-IN')}</h3>
              </div>
            </div>
            <div className="metric-card savings-card glass-panel">
              <span className="metric-icon">🏦</span>
              <div className="metric-data">
                <span className="metric-label">Net Savings</span>
                <h3 className={summary.netSavings >= 0 ? 'text-income' : 'text-expense'}>
                  ₹{summary.netSavings.toLocaleString('en-IN')}
                </h3>
              </div>
            </div>
            <div className="metric-card rate-card glass-panel">
              <span className="metric-icon">📊</span>
              <div className="metric-data">
                <span className="metric-label">Savings Rate</span>
                <h3>{summary.savingsRate}%</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Row 2: Charts and Insights Panel */}
        <div className="main-content-row">
          <div className="charts-column">
            <div className="glass-panel chart-card">
              <h3>Category Breakdown</h3>
              <div className="chart-placeholder">
                <CategoryPieChart categoryBreakdown={categoryBreakdown} theme={theme} />
              </div>
              {categoryBreakdown.length > 0 && (
                <div className="custom-breakdown-list">
                  {categoryBreakdown.map((c, idx) => (
                    <div key={idx} className="breakdown-item">
                      <div className="item-label">
                        <span className={`cat-dot cat-${c.category.toLowerCase()}`}></span>
                        <span>{c.category}</span>
                      </div>
                      <div className="item-value">
                        <span>₹{c.totalAmount.toLocaleString('en-IN')}</span>
                        <span className="text-muted">({c.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="insights-column">
            <div className="glass-panel insights-card">
              <h3>AI Personal Insights</h3>
              <div className="insights-list">
                {/* Insights components will go here */}
                {insights.map((ins, idx) => (
                  <div key={idx} className={`insight-item type-${ins.type}`}>
                    <span className="insight-emoji">{ins.emoji}</span>
                    <div className="insight-text">
                      <h4>{ins.title}</h4>
                      <p>{ins.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Recurring Payments and Table Grid */}
        <div className="bottom-content-row">
          <div className="recurring-column">
            <div className="glass-panel recurring-card">
              <h3>Recurring Payments</h3>
              <div className="recurring-list-view">
                {/* Recurring list will go here */}
                {recurringPayments.length > 0 ? (
                  recurringPayments.map((rp, idx) => (
                    <div key={idx} className="recurring-item-row">
                      <div className="item-info">
                        <span className="recurring-badge">{rp.frequency}</span>
                        <h4>{rp.description}</h4>
                      </div>
                      <div className="item-pricing">
                        <h3>₹{rp.amount}</h3>
                        <span className="text-muted">{rp.occurrences} payments</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-recurring">
                    <span className="empty-icon">🔄</span>
                    <p>No repeating subscriptions or EMIs detected.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="transactions-column">
            <div className="glass-panel transactions-card">
              <h3>Transactions List</h3>
              <TransactionTable transactions={transactions} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;
