export default function Input({
  label,
  className = "",
  error,
  ...props
}) {
  return (
    <label className="block w-full">
      {label && <span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>}
      <input
        {...props}
        className={`w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 ${className}`}
      />
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}
