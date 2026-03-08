const StarRating = ({ rating = 0, count, size = 'sm', interactive = false, onRate }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' }

  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((star) => (
        <svg
          key={star}
          className={`${sizes[size]} ${interactive ? 'cursor-pointer' : ''} transition-colors`}
          fill={star <= Math.round(rating) ? '#f97316' : 'none'}
          stroke={star <= Math.round(rating) ? '#f97316' : '#d1d5db'}
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          onClick={() => interactive && onRate?.(star)}
        >
          <path strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
        </svg>
      ))}
      {count !== undefined && <span className="text-xs text-gray-500 ml-1">({count})</span>}
    </div>
  )
}

export default StarRating