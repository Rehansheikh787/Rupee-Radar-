import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import FileUpload from './components/FileUpload/FileUpload.jsx';

function App() {
  const [page, setPage] = useState('home');
  const [analysisData, setAnalysisData] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('rupeeradar-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rupeeradar-theme', theme);
  }, [theme]);

  // Dynamic 3D Parallax Mouse Tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (window.innerWidth / 2 - e.clientX) / 60;
      const y = (window.innerHeight / 2 - e.clientY) / 60;
      document.documentElement.style.setProperty('--bg-move-x', `${x}px`);
      document.documentElement.style.setProperty('--bg-move-y', `${y}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Reset back to upload page
  const handleReset = () => {
    setAnalysisData(null);
    setPage('home');
  };

  // Manually update transaction category from frontend and re-calculate all metrics dynamically
  const handleUpdateTransactionCategory = (transactionId, newCategory) => {
    if (!analysisData) return;

    // 1. Map over transactions to update the targeted one
    const updatedTransactions = analysisData.transactions.map(t => {
      if (t.id === transactionId) {
        return { ...t, category: newCategory };
      }
      return t;
    });

    // 2. Re-calculate summary metrics and category breakdown dynamically based on the updated transactions
    let totalIncome = 0;
    let totalSpend = 0;
    const categoryTotals = {};

    updatedTransactions.forEach(t => {
      const amount = parseFloat(t.amount) || 0;
      if (t.type === 'credit') {
        totalIncome += amount;
      } else if (t.type === 'debit') {
        totalSpend += amount;
        
        // Accumulate spend by category
        const cat = t.category || 'Uncategorized';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
      }
    });

    const netSavings = totalIncome - totalSpend;
    const savingsRate = totalIncome > 0 ? parseFloat(((netSavings / totalIncome) * 100).toFixed(1)) : 0;

    // Re-construct the categoryBreakdown array
    const categoryBreakdown = Object.keys(categoryTotals).map(cat => {
      const amount = categoryTotals[cat];
      const percentage = totalSpend > 0 ? parseFloat(((amount / totalSpend) * 100).toFixed(1)) : 0;
      return {
        category: cat,
        totalAmount: amount,
        percentage,
        transactionCount: updatedTransactions.filter(t => t.type === 'debit' && t.category === cat).length
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount); // Sort by highest spend first

    // Update topTransactions as well if the edited transaction was in topTransactions
    const updatedTopTransactions = analysisData.topTransactions.map(t => {
      if (t.id === transactionId) {
        return { ...t, category: newCategory };
      }
      return t;
    });

    // 3. Set the updated state
    setAnalysisData({
      ...analysisData,
      summary: {
        ...analysisData.summary,
        totalIncome,
        totalSpend,
        netSavings,
        savingsRate
      },
      categoryBreakdown,
      topTransactions: updatedTopTransactions,
      transactions: updatedTransactions
    });
  };

  // Mock upload simulator for Phase 5 (until FileUpload is fully integrated in Phase 6)
  const handleSimulateData = () => {
    const mockData = {
      summary: {
        totalIncome: 85457.00,
        totalSpend: 27405.00,
        netSavings: 58052.00,
        savingsRate: 67.9,
        transactionCount: 7,
        dateRange: { from: '2026-04-28', to: '2026-05-28' },
        avgDailySpend: 913.50
      },
      categoryBreakdown: [
        { category: 'Entertainment & Leisure', totalAmount: 1298.00, percentage: 4.7, transactionCount: 2 },
        { category: 'Utilities & Bills', totalAmount: 1299.00, percentage: 4.7, transactionCount: 1 },
        { category: 'Food & Dining', totalAmount: 457.00, percentage: 1.7, transactionCount: 1 },
        { category: 'Uncategorized', totalAmount: 25000.00, percentage: 91.2, transactionCount: 1 }
      ],
      topTransactions: [
        { id: 'txn_5', date: '2026-05-20', description: 'TRANSFER TO SELF', amount: 25000, category: 'Uncategorized' }
      ],
      recurringPayments: [
        {
          description: 'NETFLIX SUBSCRIPTION',
          normalizedDescription: 'netflix subscription',
          amount: 649.00,
          isSameAmount: true,
          frequency: 'monthly',
          category: 'Entertainment & Leisure',
          occurrences: 2,
          lastDate: '2026-05-28'
        }
      ],
      insights: [
        {
          id: 1,
          emoji: '🥳',
          title: 'Healthy Savings Rate',
          text: 'Great job! You saved 67.9% of your income (₹58,052) this month. Keep this up!',
          type: 'success'
        },
        {
          id: 2,
          emoji: '📊',
          title: 'Top Category: Uncategorized',
          text: 'Your biggest expense category is Uncategorized, consuming ₹25,000 (91.2% of your total spends).',
          type: 'info'
        },
        {
          id: 3,
          emoji: '💸',
          title: 'Largest Transaction',
          text: 'Your largest single expense was ₹25,000 on 2026-05-20 for "TRANSFER TO SELF".',
          type: 'info'
        }
      ],
      transactions: [
        { id: 'txn_1', date: '2026-04-28', description: 'NETFLIX SUBSCRIPTION', rawDescription: 'NETFLIX SUBSCRIPTION', amount: 649.00, type: 'debit', category: 'Entertainment & Leisure' },
        { id: 'txn_2', date: '2026-05-15', description: 'UPI-SWIGGY-435267890', rawDescription: 'UPI-SWIGGY-435267890', amount: 457.00, type: 'debit', category: 'Food & Dining' },
        { id: 'txn_3', date: '2026-05-16', description: 'SALARY CREDIT', rawDescription: 'SALARY CREDIT', amount: 85000.00, type: 'credit', category: 'Salary' },
        { id: 'txn_4', date: '2026-05-18', description: 'INTERNET BILL PAY', rawDescription: 'INTERNET BILL PAY', amount: 1299.00, type: 'debit', category: 'Utilities & Bills' },
        { id: 'txn_5', date: '2026-05-20', description: 'TRANSFER TO SELF', rawDescription: 'TRANSFER TO SELF', amount: 25000.00, type: 'debit', category: 'Uncategorized' },
        { id: 'txn_6', date: '2026-05-25', description: 'REFUND SWIGGY', rawDescription: 'REFUND SWIGGY', amount: 457.00, type: 'credit', category: 'Food & Dining' },
        { id: 'txn_7', date: '2026-05-28', description: 'NETFLIX SUBSCRIPTION', rawDescription: 'NETFLIX SUBSCRIPTION', amount: 649.00, type: 'debit', category: 'Entertainment & Leisure' }
      ]
    };

    setAnalysisData(mockData);
    setPage('dashboard');
  };

  return (
    <div className="app-container">
      {/* Universal Page Header */}
      <header className="app-header no-print">
        <div className="logo-section">
          <span className="logo-radar">📡</span>
          <h1>Rupee<span className="accent-text">Radar</span></h1>
        </div>
        <button 
          onClick={toggleTheme} 
          className="btn-back" 
          style={{ 
            padding: '8px 16px', 
            borderRadius: 'var(--radius-full)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            fontSize: '0.85rem'
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </header>

      {/* Main Routing Views */}
      <main className="app-main">
        {page === 'home' && (
          <HomePage theme={theme}>
            <div className="upload-wrapper">
              <FileUpload onAnalysisComplete={(data) => {
                setAnalysisData(data);
                setPage('dashboard');
              }} />
              <div className="simulation-actions" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <button className="btn-back" onClick={handleSimulateData}>
                  🧪 Or Simulate Dashboard Flow
                </button>
              </div>
            </div>
          </HomePage>
        )}

        {page === 'dashboard' && (
          <DashboardPage 
            data={analysisData} 
            theme={theme}
            onReset={handleReset} 
            onNavigateToReport={() => setPage('report')}
            onUpdateCategory={handleUpdateTransactionCategory}
          />
        )}

        {page === 'report' && (
          <ReportPage 
            data={analysisData} 
            theme={theme}
            onNavigateToDashboard={() => setPage('dashboard')}
          />
        )}
      </main>

      {/* Universal Footer */}
      <footer className="app-footer no-print">
        <p>RupeeRadar — AI-Powered Personal Finance Companion. All data is processed locally & deleted on refresh.</p>
      </footer>
    </div>
  );
}

export default App;
