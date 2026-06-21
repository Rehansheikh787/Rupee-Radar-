import React, { useState, useMemo } from 'react';
import './TransactionTable.css';

const ALLOWED_CATEGORIES = [
  'Groceries',
  'Food & Dining',
  'Transportation',
  'Utilities & Bills',
  'Shopping',
  'Entertainment & Leisure',
  'Housing & Rent',
  'Health & Medical',
  'Transfer / Credit Card Payment',
  'Salary',
  'Investments',
  'EMI',
  'Uncategorized'
];

const getCategoryClass = (categoryName) => {
  if (!categoryName) return 'uncategorized';
  return categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
};

function TransactionTable({ transactions, onUpdateCategory }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortField, setSortField] = useState('date'); // 'date' | 'amount'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Extract unique categories present in the data for filtering dropdown
  const categoriesList = useMemo(() => {
    const categories = new Set(transactions.map(tx => tx.category));
    return ['All', ...Array.from(categories)].sort();
  }, [transactions]);

  // Handle sorting toggles
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // default to descending for new field
    }
    setCurrentPage(1); // reset to page 1
  };

  // Filter and sort transactions
  const processedTransactions = useMemo(() => {
    let filtered = transactions.filter(tx => {
      const matchesSearch = 
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        tx.rawDescription.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'All' || 
        tx.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'date') {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      }

      if (sortDirection === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });

    return filtered;
  }, [transactions, searchTerm, selectedCategory, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(processedTransactions.length / rowsPerPage);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return processedTransactions.slice(startIndex, startIndex + rowsPerPage);
  }, [processedTransactions, currentPage, rowsPerPage]);

  return (
    <div className="transaction-table-wrapper">
      {/* Search and Filter Controls */}
      <div className="table-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search descriptions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="filter-box">
          <label htmlFor="category-select">Category:</label>
          <select 
            id="category-select"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            {categoriesList.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="rows-per-page-box">
          <label htmlFor="rows-select">Show:</label>
          <select 
            id="rows-select"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-container-scroll">
        <table className="txn-data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('date')} className="sortable-header">
                Date {sortField === 'date' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th>Description</th>
              <th>Category</th>
              <th onClick={() => handleSort('amount')} className="sortable-header text-right">
                Amount {sortField === 'amount' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((tx, idx) => (
                <tr key={idx} className="table-data-row">
                  <td>{tx.date}</td>
                  <td>
                    <div className="desc-container">
                      <span className="desc-text" title={tx.rawDescription}>{tx.description}</span>
                    </div>
                  </td>
                  <td>
                    {onUpdateCategory ? (
                      <div className={`category-tag tag-${getCategoryClass(tx.category)} category-select-wrapper`}>
                        <select
                          value={tx.category || 'Uncategorized'}
                          onChange={(e) => onUpdateCategory(tx.id, e.target.value)}
                          className="category-select"
                        >
                          {ALLOWED_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className={`category-tag tag-${getCategoryClass(tx.category)}`}>
                        {tx.category}
                      </span>
                    )}
                  </td>
                  <td className={`text-right font-mono ${tx.type === 'credit' ? 'text-income' : 'text-expense'}`}>
                    {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty-table-row">
                  No transactions match your search or filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="table-pagination-footer">
          <span className="pagination-info">
            Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, processedTransactions.length)} of {processedTransactions.length} items
          </span>
          <div className="pagination-buttons">
            <button 
              className="btn-pagination-nav" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={idx}
                  className={`btn-pagination-page ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}

            <button 
              className="btn-pagination-nav" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionTable;
