import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { motion as Motion } from "framer-motion";
import { Compass } from "lucide-react";
import { getRecommendations } from "../services/recommendationService.js";
import Spinner from "./common/Spinner.jsx";
import useWishlist from "../hooks/useWishlist.js";
import { ANIMATION_EASE, ANIMATION_MS, ANIMATION_TIMINGS } from "../config/constants.js";
import ExperienceCard from "./experience/ExperienceCard.jsx";

const flowContainer = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_TIMINGS.slow,
      ease: ANIMATION_EASE,
      staggerChildren: ANIMATION_TIMINGS.fast,
      delayChildren: ANIMATION_TIMINGS.fast,
    },
  },
};

const flowItem = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: ANIMATION_TIMINGS.normal, ease: ANIMATION_EASE },
  },
};

export default function PickedForYouSection() {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { isSaved, toggleWishlist, isPendingFor } = useWishlist();

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ["pickedForYou"],
    queryFn: () => getRecommendations().then((r) => r.data.data || []),
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 60 * 10,
  });

  const deduped = Array.from(
    new Map((recommendations || []).map((e) => [String(e._id), e])).values()
  );

  if (!isAuthenticated) return null;

  return (
    <section className="bg-white home-section" style={{ padding: "52px 0 60px", borderTop: "1px solid #F3F4F6" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
        <Motion.div
          className="mb-6 flex items-end justify-between gap-3 flex-wrap home-row-header"
          variants={flowContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <Motion.div variants={flowItem}>

            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "clamp(1.16rem, 1.8vw, 1.62rem)",
                fontWeight: 600,
                color: "#0f2d1a",
                margin: "0 0 4px",
                letterSpacing: "-.01em",
              }}
            >
              Picked For You
            </h2>
          </Motion.div>

          <Motion.div variants={flowItem} className="home-row-link">
            <Link
              to="/search"
              className="flex items-center gap-1.5 no-underline shrink-0"
              style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".78rem", fontWeight: 600, color: "#00AA6C" }}
            >
              View all experiences
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </Motion.div>
        </Motion.div>

        {isLoading ? (
          <Spinner size="md" className="py-10" />
        ) : deduped.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-8 text-center">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-700 border border-slate-200">
              <Compass className="h-5 w-5" strokeWidth={2.1} />
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">Nothing here yet</p>
            <p className="text-xs text-slate-500">
              Book or save a few experiences and we'll suggest better matches here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 home-card-row" style={{ alignItems: "stretch" }}>
            {deduped.slice(0, 4).map((exp, index) => (
              <Motion.div
                key={exp._id}
                className="home-card-item"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: ANIMATION_TIMINGS.normal, delay: Math.min(index * 0.05, ANIMATION_TIMINGS.slow), ease: ANIMATION_EASE }}
                style={{ height: "100%" }}
              >
                <ExperienceCard
                  experience={exp}
                  saved={isSaved(exp._id)}
                  saving={isPendingFor(exp._id)}
                  onToggleWishlist={toggleWishlist}
                />
              </Motion.div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
