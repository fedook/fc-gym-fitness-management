import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null

  const { current_page, last_page, total } = meta

  const pages = []
  const start = Math.max(1, current_page - 2)
  const end = Math.min(last_page, current_page + 2)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-border-color px-4 py-4 sm:flex-row">
      <p className="text-sm text-secondary-text">
        Showing page <span className="font-medium text-main-text">{current_page}</span> of{' '}
        <span className="font-medium text-main-text">{last_page}</span> ·{' '}
        <span className="font-medium text-main-text">{total}</span> total
      </p>
      <div className="flex items-center gap-1">
        <button
          className="btn-secondary !px-2.5 !py-1.5"
          disabled={current_page <= 1}
          onClick={() => onPageChange(current_page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              page === current_page
                ? 'bg-primary text-white'
                : 'text-secondary-text hover:bg-pale-green hover:text-primary'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          className="btn-secondary !px-2.5 !py-1.5"
          disabled={current_page >= last_page}
          onClick={() => onPageChange(current_page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
