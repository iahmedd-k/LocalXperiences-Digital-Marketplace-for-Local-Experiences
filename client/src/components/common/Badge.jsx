const VARIANT_MAP = {
  orange: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  blue: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  yellow: "bg-amber-50 text-amber-700 border border-amber-200",
  red: "bg-rose-50 text-rose-700 border border-rose-200",
  gray: "bg-slate-100 text-slate-600 border border-slate-200",
};

export default function Badge({ variant = "gray", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${VARIANT_MAP[variant] || VARIANT_MAP.gray} ${className}`}
    >
      {children}
    </span>
  );
}
