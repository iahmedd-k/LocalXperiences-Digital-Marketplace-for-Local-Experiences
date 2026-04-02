import StarRating from "../common/StarRating.jsx";

export default function ReviewList({ rating }) {
  const average = Number(rating?.average || rating || 0);
  const count = Number(rating?.count || 0);

  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-5">
      <h3 className="mb-3 text-xl font-bold text-slate-900">Guest Reviews</h3>
      <div className="flex items-center gap-3">
        <StarRating rating={average} size="md" />
        <p className="text-sm text-slate-600">
          {average ? average.toFixed(1) : "New"} {count > 0 ? `(${count} reviews)` : "No reviews yet"}
        </p>
      </div>
    </section>
  );
}
