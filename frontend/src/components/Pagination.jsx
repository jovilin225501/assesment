import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalMovies = 0,
  pageSize = 6,
  onPageChange
}) => {
  if (totalPages <= 1 && totalMovies <= pageSize) return null;

  const startCount = totalMovies === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endCount = Math.min(currentPage * pageSize, totalMovies);

  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <nav className="pagination-bar" aria-label="Movies pagination navigation">
      <div className="pagination-info">
        Showing <strong style={{ color: 'var(--text-main)' }}>{startCount}</strong> &ndash;{' '}
        <strong style={{ color: 'var(--text-main)' }}>{endCount}</strong> of{' '}
        <strong style={{ color: 'var(--text-main)' }}>{totalMovies}</strong> movies (Page {currentPage} of {totalPages})
      </div>

      <div className="pagination-controls">
        <button
          id="btn-prev-page"
          className="page-num-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((num) => (
          <button
            key={num}
            id={`btn-page-${num}`}
            className={`page-num-btn ${currentPage === num ? 'active' : ''}`}
            onClick={() => onPageChange(num)}
            aria-label={`Go to page ${num}`}
            aria-current={currentPage === num ? 'page' : undefined}
          >
            {num}
          </button>
        ))}

        <button
          id="btn-next-page"
          className="page-num-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next Page"
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
