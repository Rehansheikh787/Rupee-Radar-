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
        { category: 'Subscriptions', totalAmount: 1298.00, percentage: 4.7, transactionCount: 2 },
        { category: 'Bills', totalAmount: 1299.00, percentage: 4.7, transactionCount: 1 },
        { category: 'Food', totalAmount: 457.00, percentage: 1.7, transactionCount: 1 },
        { category: 'Other', totalAmount: 25000.00, percentage: 91.2, transactionCount: 1 }
      ],
      topTransactions: [
        { id: 'txn_5', date: '2026-05-20', description: 'TRANSFER TO SELF', amount: 25000, category: 'Other' }
      ],
      recurringPayments: [
        {
          description: 'NETFLIX SUBSCRIPTION',
          normalizedDescription: 'netflix subscription',
          amount: 649.00,
          isSameAmount: true,
          frequency: 'monthly',
          category: 'Subscriptions',
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
          title: 'Top Category: Other',
          text: 'Your biggest expense category is Other, consuming ₹25,000 (91.2% of your total spends).',
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
        { id: 'txn_1', date: '2026-04-28', description: 'NETFLIX SUBSCRIPTION', rawDescription: 'NETFLIX SUBSCRIPTION', amount: 649.00, type: 'debit', category: 'Subscriptions' },
        { id: 'txn_2', date: '2026-05-15', description: 'UPI-SWIGGY-435267890', rawDescription: 'UPI-SWIGGY-435267890', amount: 457.00, type: 'debit', category: 'Food' },
        { id: 'txn_3', date: '2026-05-16', description: 'SALARY CREDIT', rawDescription: 'SALARY CREDIT', amount: 85000.00, type: 'credit', category: 'Salary' },
        { id: 'txn_4', date: '2026-05-18', description: 'INTERNET BILL PAY', rawDescription: 'INTERNET BILL PAY', amount: 1299.00, type: 'debit', category: 'Bills' },
        { id: 'txn_5', date: '2026-05-20', description: 'TRANSFER TO SELF', rawDescription: 'TRANSFER TO SELF', amount: 25000.00, type: 'debit', category: 'Other' },
        { id: 'txn_6', date: '2026-05-25', description: 'REFUND SWIGGY', rawDescription: 'REFUND SWIGGY', amount: 457.00, type: 'credit', category: 'Food' },
        { id: 'txn_7', date: '2026-05-28', description: 'NETFLIX SUBSCRIPTION', rawDescription: 'NETFLIX SUBSCRIPTION', amount: 649.00, type: 'debit', category: 'Subscriptions' }
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
