export default function Spinner({ size = "md", className = "" }) {
  const sizeMap = {
    sm: 24,
    md: 34,
    lg: 48,
  };

  const px = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span
        className="inline-block animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"
        style={{ width: px, height: px }}
        aria-label="Loading"
      />
    </div>
  );
}
