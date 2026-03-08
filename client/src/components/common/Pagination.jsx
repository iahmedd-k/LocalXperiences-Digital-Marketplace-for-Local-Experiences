const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition"
      >← Prev</button>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce((acc, p, i, arr) => {
          if (i > 0 && p - arr[i - 1] > 1) acc.push('...')
          acc.push(p)
          return acc
        }, [])
        .map((p, i) => p === '...'
          ? <span key={i} className="px-2 text-gray-400">...</span>
          : <button key={p} onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition
                ${page === p ? 'bg-orange-500 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
            >{p}</button>
        )
      }

      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition"
      >Next →</button>
    </div>
  )
}

export default Pagination