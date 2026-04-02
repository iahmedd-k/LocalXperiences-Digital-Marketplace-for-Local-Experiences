const SIZE_MAP = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-2xl",
};

export default function Avatar({ name = "U", src, size = "md" }) {
  const initials = String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || "")
    .join("") || "U";

  return src ? (
    <img
      src={src}
      alt={name}
      className={`${SIZE_MAP[size] || SIZE_MAP.md} rounded-full object-cover border border-emerald-100`}
    />
  ) : (
    <div
      className={`${SIZE_MAP[size] || SIZE_MAP.md} rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold flex items-center justify-center`}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
