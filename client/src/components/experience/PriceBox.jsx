import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/formatters.js";

export default function PriceBox({ experience, alreadyBooked }) {
  const total = Number(experience?.price || 0);

  return (
    <aside className="sticky top-24 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <p className="text-2xl font-bold text-slate-900">{formatPrice(total)} <span className="text-sm font-medium text-slate-500">/ person</span></p>
      <p className="mt-1 text-sm text-slate-500">Secure checkout and instant confirmation.</p>

      {alreadyBooked ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          You already have an active booking for this experience.
        </div>
      ) : (
        <Link
          to={`/checkout/${experience?._id}`}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white no-underline hover:bg-emerald-700"
        >
          Book now
        </Link>
      )}
    </aside>
  );
}
