import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import { getPathwayById, toggleSavePathway } from "../../services/pathwayService.js";
import { formatDuration, formatPrice } from "../../utils/formatters.js";

export default function PathwayDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);
  const isAuthenticated = Boolean(user?._id);

  const { data: pathway, isLoading } = useQuery({
    queryKey: ["pathway", id],
    queryFn: () => getPathwayById(id).then((res) => res.data.data),
    enabled: Boolean(id),
  });

  const toggleSaveMutation = useMutation({
    mutationFn: toggleSavePathway,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["pathway", id]);
      toast.success(data.isSaved ? "Pathway saved" : "Pathway removed from saved");
    },
    onError: () => toast.error("Failed to toggle save"),
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex flex-col bg-[#f8faf9]">
        <Navbar />
        <Spinner size="lg" className="flex-1" />
      </div>
    );

  if (!pathway)
    return (
      <div className="min-h-screen flex flex-col bg-[#f8faf9]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center font-playfair text-xl text-slate-400">
          Journey not found
        </div>
        <Footer />
      </div>
    );

  const stops = Array.isArray(pathway.stops) ? pathway.stops : [];
  const isSaved = user?.savedPathways?.includes(pathway._id);

  const handleSave = () => {
    if (!isAuthenticated) return toast.error("Please log in to save pathways");
    toggleSaveMutation.mutate(pathway._id);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">

          {/* ── Breadcrumb + Save ── */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <nav className="flex items-center gap-1.5 text-[11px] text-slate-400 flex-wrap">
              <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/pathways" className="hover:text-emerald-600 transition-colors">Pathways</Link>
              <span>/</span>
              <span className="max-w-[160px] sm:max-w-xs truncate text-slate-600">{pathway.title}</span>
            </nav>

            <button
              onClick={handleSave}
              disabled={toggleSaveMutation.isLoading}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                isSaved
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              <span className="text-sm leading-none">{isSaved ? "♥" : "♡"}</span>
              {isSaved ? "Saved" : "Save Pathway"}
            </button>
          </div>

          {/* ── Hero Card ── */}
          <section className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm mb-8">
            {pathway.coverPhoto ? (
              <div className="relative h-[220px] sm:h-[300px] lg:h-[360px] w-full">
                <img
                  src={pathway.coverPhoto}
                  alt="Pathway Cover"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 text-white">
                  <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300 mb-2">
                    Suggested Journey
                  </p>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-playfair leading-tight">
                    {pathway.title}
                  </h1>
                  {pathway.description && (
                    <p className="mt-2 max-w-2xl text-sm text-white/80 leading-relaxed hidden sm:block">
                      {pathway.description}
                    </p>
                  )}
                  <PathwayMeta pathway={pathway} stops={stops} overlay />
                </div>
              </div>
            ) : (
              <div className="p-5 sm:p-8">
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600 mb-2">
                  Suggested Journey
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-slate-900 leading-tight">
                  {pathway.title}
                </h1>
                {pathway.description && (
                  <p className="mt-3 max-w-2xl text-sm text-slate-600 leading-relaxed">
                    {pathway.description}
                  </p>
                )}
                <PathwayMeta pathway={pathway} stops={stops} />
              </div>
            )}
          </section>

          {/* ── Description (mobile, below cover) ── */}
          {pathway.coverPhoto && pathway.description && (
            <p className="sm:hidden mb-6 text-sm text-slate-600 leading-relaxed px-1">
              {pathway.description}
            </p>
          )}

          {/* ── Main Grid ── */}
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

            {/* Stops List */}
            <div className="space-y-4">
              {stops.map((stop, index) => {
                const experience = stop.experienceId;
                if (!experience) return null;
                const isLast = index === stops.length - 1;

                return (
                  <div key={stop._id || index}>
                    <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200">
                      <div className="flex items-start gap-4">
                        {/* Step Number */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-xs font-bold text-white mt-0.5">
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1.5">
                            Step {index + 1}
                          </p>

                          <div className="flex gap-3 sm:gap-4">
                            {experience.photos?.[0] && (
                              <img
                                src={experience.photos[0]}
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0"
                                alt={experience.title}
                              />
                            )}

                            <div className="flex-1 min-w-0">
                              <h2 className="text-base sm:text-lg font-semibold text-slate-900 font-playfair leading-snug">
                                {experience.title}
                              </h2>

                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <span className="text-slate-400">📍</span>
                                  {experience.location?.city || "Local"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="text-slate-400">⏱</span>
                                  {formatDuration(experience.duration || 0)}
                                </span>
                                <span className="flex items-center gap-1 font-semibold text-slate-800">
                                  <span>💵</span>
                                  {formatPrice(experience.price || 0)}
                                </span>
                              </div>

                              <div className="mt-3">
                                <Link
                                  to={`/experiences/${experience._id}`}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900 px-4 py-1.5 text-[12px] font-semibold text-white transition hover:bg-emerald-800 active:scale-95"
                                >
                                  Book this step →
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>

                    {/* Connector */}
                    {!isLast && (
                      <div className="flex items-stretch gap-4 py-1 pl-[52px]">
                        <div className="w-[2px] bg-emerald-100 mx-auto" style={{ minHeight: "2rem" }} />
                        {stop.transitionNote && (
                          <div className="flex items-center">
                            <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-[11px] font-medium text-emerald-800 italic max-w-[260px]">
                              ⤑ {stop.transitionNote}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sidebar */}
            <aside className="rounded-2xl border border-slate-200 bg-white p-5 h-fit lg:sticky lg:top-24">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-5">
                Journey Overview
              </p>

              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-slate-100 rounded-full" />

                <div className="space-y-4 relative">
                  {stops.map((stop, index) => {
                    const experience = stop.experienceId;
                    if (!experience) return null;
                    return (
                      <div key={stop._id || index} className="flex gap-3 items-start">
                        <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                          {index + 1}
                        </span>
                        <div className="pb-1 min-w-0">
                          <p className="text-[13px] font-semibold text-slate-800 leading-snug truncate">
                            {experience.title}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {formatDuration(experience.duration || 0)} &middot;{" "}
                            {experience.location?.city || "Local"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3">
                <StatBox label="Total Stops" value={stops.length} />
                <StatBox label="Est. Duration" value={`${Math.round(pathway.totalDuration / 60)}h`} />
                <StatBox label="From" value={formatPrice(pathway.estimatedCost || 0)} />
                <StatBox label="Saves" value={pathway.saves ?? 0} />
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ── Sub-components ── */

function PathwayMeta({ pathway, stops, overlay = false }) {
  const base = overlay ? "text-white/90" : "text-slate-500";
  const pill = overlay
    ? "bg-white/10 backdrop-blur-sm border border-white/20 text-white"
    : "bg-slate-100 text-slate-600";

  return (
    <div className={`mt-4 flex flex-wrap gap-2 text-xs ${base}`}>
      <span className={`rounded-full px-3 py-1 ${pill}`}>{stops.length} stops</span>
      <span className={`rounded-full px-3 py-1 ${pill}`}>
        {Math.round(pathway.totalDuration / 60)} hrs
      </span>
      <span className={`rounded-full px-3 py-1 font-semibold ${pill}`}>
        from {formatPrice(pathway.estimatedCost || 0)}
      </span>
      <span className={`rounded-full px-3 py-1 ${pill}`}>
        ♥ {pathway.saves ?? 0} saves
      </span>
      <span className={`rounded-full px-3 py-1 ${pill}`}>
        By {pathway.creatorId?.name || "Local Guide"}
      </span>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 text-center">
      <p className="text-[11px] text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
