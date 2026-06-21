import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function CategoryPieChart({ categoryBreakdown, theme }) {
  if (!categoryBreakdown || categoryBreakdown.length === 0) {
    return <p className="no-chart-data">No expense breakdown data available.</p>;
  }

  const isLight = theme === 'light';

  // Map category names to their respective design system colors based on theme
  const categoryColors = isLight ? {
    food: '#E5A8A9',
    travel: '#98D8C8',
    shopping: '#E8D490',
    bills: '#A5CAD8',
    emi: '#D8AC95',
    subscriptions: '#C5B4E3',
    salary: '#76A08A',
    rent: '#E5A198',
    investments: '#9EC5E8',
    other: '#C4C5C0'
  } : {
    food: '#FF5E7E',
    travel: '#00F5D4',
    shopping: '#FEE440',
    bills: '#80FFDB',
    emi: '#FF9F1C',
    subscriptions: '#9D4EDD',
    salary: '#2EC4B6',
    rent: '#FF5400',
    investments: '#0077B6',
    other: '#6C757D'
  };

  const labels = categoryBreakdown.map(c => c.category);
  const dataValues = categoryBreakdown.map(c => c.totalAmount);
  const backgroundColors = categoryBreakdown.map(c => 
    categoryColors[c.category.toLowerCase()] || categoryColors.other
  );

  // Calculate total spend inside the chart for the center overlay readout
  const totalSpend = categoryBreakdown.reduce((sum, c) => sum + c.totalAmount, 0);

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Total Spend (₹)',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: isLight ? '#FFFFFF' : 'rgba(20, 18, 43, 0.85)', // match card background
        borderWidth: 3,
        borderRadius: 8,
        spacing: 4,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // Hide default legend since we render a clean interactive list below the chart
      },
      tooltip: {
        backgroundColor: isLight ? '#FFFFFF' : 'rgba(10, 9, 21, 0.95)',
        titleColor: isLight ? '#1F2623' : '#F1F0FA',
        bodyColor: isLight ? '#6E736E' : '#9DA2C0',
        borderColor: isLight ? '#E5E2DA' : 'rgba(130, 87, 230, 0.4)',
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          family: "'Space Grotesk', sans-serif"
        },
        callbacks: {
          label: function (context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += '₹' + context.parsed.toLocaleString('en-IN');
            }
            return label;
          }
        }
      }
    },
    cutout: '80%' // Makes the doughnut ring thin and elegant
  };

  return (
    <div className="donut-chart-container" style={{ position: 'relative', height: '220px', width: '100%', margin: '0 auto' }}>
      <Doughnut data={data} options={options} />
      
      {/* Central Total Spend Readout Overlay */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '120px'
        }}
      >
        <span 
          style={{
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: 'var(--color-text-muted)',
            fontWeight: '600',
            fontFamily: 'var(--font-heading)'
          }}
        >
          Total Spend
        </span>
        <span 
          style={{
            fontSize: '1.45rem',
            fontWeight: '700',
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-text)',
            marginTop: '2px',
            lineHeight: '1.2'
          }}
        >
          ₹{totalSpend.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}

export default CategoryPieChart;
