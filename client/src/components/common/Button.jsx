const VARIANT_MAP = {
  primary: "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600",
  secondary: "bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200",
  danger: "bg-rose-600 hover:bg-rose-700 text-white border-rose-600",
  ghost: "bg-transparent hover:bg-emerald-50 text-emerald-700 border-transparent",
};

const SIZE_MAP = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border font-semibold transition ${VARIANT_MAP[variant] || VARIANT_MAP.primary} ${SIZE_MAP[size] || SIZE_MAP.md} ${fullWidth ? "w-full" : ""} ${isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      {loading && (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-current" />
      )}
      {children}
    </button>
  );
}
