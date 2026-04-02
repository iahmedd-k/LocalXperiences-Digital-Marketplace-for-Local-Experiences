import { Link } from "react-router-dom";
import Button from "../common/Button.jsx";

export default function BookingCard({ booking, onCancel }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-slate-800">{booking?.experienceId?.title || "Experience"}</p>
          <p className="mt-1 text-sm text-slate-500">Status: {booking?.status || "pending"}</p>
        </div>
        <div className="flex gap-2">
          {booking?.experienceId?._id && (
            <Link to={`/experiences/${booking.experienceId._id}`} className="rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 no-underline hover:bg-emerald-50">
              View
            </Link>
          )}
          {booking?.status !== "cancelled" && (
            <Button size="sm" variant="danger" onClick={() => onCancel?.(booking?._id)}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
