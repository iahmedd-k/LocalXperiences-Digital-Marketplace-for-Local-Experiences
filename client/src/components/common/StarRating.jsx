const SIZE_MAP = {
  sm: 14,
  md: 18,
  lg: 22,
};

export default function StarRating({ rating = 0, size = "md" }) {
  const px = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div className="flex items-center gap-1 text-amber-500" aria-label={`Rating: ${rating}`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <svg key={value} width={px} height={px} viewBox="0 0 24 24" fill={value <= Math.round(rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}
