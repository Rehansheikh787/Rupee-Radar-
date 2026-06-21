import React from 'react';
import Radar3D from '../components/Radar3D/Radar3D.jsx';

function HomePage({ children, theme }) {
  return (
    <div className="home-page-container animate-fade-in">
      <div className="home-hero-upload-layout">
        <div className="home-left-col">
          <section className="hero-section">
            <div className="badge-wrapper">
              <span className="premium-badge">✨ Now Powered by Groq Llama 3.1 AI</span>
            </div>
            <h1 className="hero-title">
              Smart Financial Analysis, <br />
              <span className="gradient-text">Zero Manual Effort.</span>
            </h1>
            <p className="hero-subtitle">
              Upload your bank statement and let RupeeRadar clean your transactions, 
              detect recurring EMIs/subscriptions, and generate personalized spending insights instantly.
            </p>
          </section>
          
          <div className="radar-3d-visualizer">
            <Radar3D theme={theme} />
          </div>
        </div>

        <div className="home-right-col">
          <section className="upload-section">
            <div className="glass-panel upload-card">
              {children}
            </div>
          </section>
        </div>
      </div>

      <section className="features-grid">
        <div className="glass-panel feature-item">
          <div className="feature-icon">🧹</div>
          <h3>Clean Descriptions</h3>
          <p>Messy transaction codes are cleaned and simplified for easy reading.</p>
        </div>

        <div className="glass-panel feature-item">
          <div className="feature-icon">🏷️</div>
          <h3>AI Categorization</h3>
          <p>Expenses are grouped into categories like Food, Bills, Shopping, and Rent.</p>
        </div>

        <div className="glass-panel feature-item">
          <div className="feature-icon">🔄</div>
          <h3>Recurring Detection</h3>
          <p>Automatically identifies repeating payments, EMIs, and subscriptions.</p>
        </div>

        <div className="glass-panel feature-item">
          <div className="feature-icon">💡</div>
          <h3>AI-Powered Insights</h3>
          <p>Personalized spending advice based on your actual income and expenses.</p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
