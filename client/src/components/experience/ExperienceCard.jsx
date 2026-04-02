import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/formatters.js";

export default function ExperienceCard({
  experience,
  saved = false,
  saving = false,
  onToggleWishlist = null,
  bottomMeta = null,
  className = "",
}) {
  const id = experience?._id || experience?.id;
  const image = experience?.photos?.[0] || experience?.img || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80";
  const rating = Number(experience?.rating?.average || experience?.rating || 0);
  const reviews = Number(experience?.rating?.count || experience?.reviews || 0);
  const price = experience?.price;
  const showWishlist = typeof onToggleWishlist === "function" && id;

  return (
    <Link
      to={id ? `/experiences/${id}` : "/search"}
      className={`block overflow-hidden rounded-2xl border border-slate-100 bg-white no-underline shadow-sm transition hover:-translate-y-1 hover:shadow-md ${className}`}
    >
      <div className="relative overflow-hidden">
        <img src={image} alt={experience?.title || "Experience"} className="h-52 w-full object-cover transition duration-500 hover:scale-105" />
        {showWishlist ? (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleWishlist(id);
            }}
            disabled={saving}
            className="absolute top-3 right-3 flex items-center justify-center rounded-full bg-white/90 border-none cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,.15)]"
            style={{ width: 34, height: 34, transform: saved ? "scale(1.15)" : "scale(1)", opacity: saving ? 0.6 : 1 }}
            aria-label="Save to wishlist"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "#ef4444" : "none"} stroke={saved ? "#ef4444" : "#374151"} strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
        ) : null}
      </div>
      <div className="flex flex-col p-4">
        <p className="mb-2 min-h-11 text-[1rem] font-bold text-[#0f2d1a] leading-6 line-clamp-2">{experience?.title || "Untitled Experience"}</p>
        <div className="mb-2 flex items-center gap-1.5">
          <span className="text-sm text-slate-700">{rating.toFixed(1)}</span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < Math.floor(rating) ? "#00AA6C" : "none"} stroke="#00AA6C" strokeWidth="2">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-slate-600">({reviews})</span>
        </div>
        <div className="mt-auto pt-2">
          {typeof price === "number" ? <p className="text-[1rem] font-semibold text-[#0f2d1a]">from <span className="font-extrabold">{formatPrice(price)}</span> per adult</p> : <p className="text-xs text-slate-500">{experience?.location?.city || "Location pending"}</p>}
          {bottomMeta ? <div className="mt-2">{bottomMeta}</div> : null}
        </div>
      </div>
    </Link>
  );
}
