import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion as Motion } from "framer-motion";
import { getExperiences, getFeatured } from "../services/experienceService.js";
import useWishlist from "../hooks/useWishlist.js";
import { ANIMATION_EASE, ANIMATION_TIMINGS } from "../config/constants.js";
import useTranslation from '../hooks/useTranslation.js';
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

const formatCategory = (value = "") =>
  value
    .split(/[-_\s]+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");

const CategoryIcon = ({ category }) => {
  const common = { width: 12, height: 12, fill: "none", stroke: "currentColor", strokeWidth: "2", viewBox: "0 0 24 24" };

  switch (category) {
    case "Food & Drink":
      return <svg {...common}><path strokeLinecap="round" strokeLinejoin="round" d="M8 2v9M12 2v9M16 2v9M6 11h12M10 22v-9M14 22v-9" /></svg>;
    case "Culture":
      return <svg {...common}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M5 10v8h14v-8M2 22h20M12 3l9 4H3l9-4z" /></svg>;
    case "Workshops":
      return <svg {...common}><path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16M8 16l8-8M14 6l4 4M7 9l8 8" /></svg>;
    case "Adventure":
      return <svg {...common}><path strokeLinecap="round" strokeLinejoin="round" d="M4 20l8-14 8 14H4z" /></svg>;
    case "Nature":
      return <svg {...common}><path strokeLinecap="round" strokeLinejoin="round" d="M12 22V9M12 9c0-3 2-5 5-5-1 3-3 5-5 5zm0 0c0-2-2-4-5-4 0 3 2 5 5 5z" /></svg>;
    case "Photography":
      return <svg {...common}><rect x="3" y="6" width="18" height="14" rx="2" /><circle cx="12" cy="13" r="3" /><path strokeLinecap="round" d="M8 6l1-2h6l1 2" /></svg>;
    case "City Tours":
      return <svg {...common}><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s7-7.2 7-12a7 7 0 10-14 0c0 4.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>;
    case "Events":
      return <svg {...common}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14v6H5zM5 11h6v10H5zM13 11h6v10h-6z" /></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M3 12h18M12 3a15 15 0 010 18" /></svg>;
  }
};

export default function TrendingSection() {
  const { isSaved, toggleWishlist, isPendingFor } = useWishlist();
  const { t } = useTranslation();

  const { data: experiences = [] } = useQuery({
    queryKey: ["homeTrending"],
    queryFn: async () => {
      const mergeUnique = (primary = [], secondary = [], target = 8) => {
        const seen = new Set()
        const merged = []

        for (const item of [...primary, ...secondary]) {
          const id = String(item?._id || '')
          if (!id || seen.has(id)) continue
          seen.add(id)
          merged.push(item)
          if (merged.length >= target) break
        }

        return merged
      }

      try {
        const featured = await getFeatured();
        const featuredData = featured.data.data || [];
        if (featuredData.length >= 4) return featuredData;

        const all = await getExperiences({ limit: 12, sort: "rating" });
        const allData = all.data.data || [];
        return mergeUnique(featuredData, allData, 8);
      } catch {
        // Fallback to general experiences below
      }

      const all = await getExperiences({ limit: 12, sort: "rating" });
      return all.data.data || [];
    },
  });

  const normalized = experiences.map((exp) => ({
    _id: exp._id,
    title: exp.title,
    img: exp.photos?.[0] || "https://images.unsplash.com/photo-1521292270410-a8c4d716d518?auto=format&fit=crop&w=900&q=80",
    category: formatCategory(exp.category || "Other"),
    price: exp.price,
    duration: exp.duration ? `${Math.max(1, Math.round(exp.duration / 60))}h` : "2h",
    city: exp.location?.city || "Pakistan",
    rating: Number(exp.rating?.average || 0),
    reviews: Number(exp.rating?.count || 0),
  }));

  return (
    <section className="bg-white home-section" style={{ padding: "72px 0 80px", borderTop: "1px solid #F3F4F6" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
        {/* Header */}
        <Motion.div
          className="flex items-end justify-between mb-7 flex-wrap gap-3 home-row-header"
          variants={flowContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <Motion.div variants={flowItem}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "clamp(1.16rem,1.8vw,1.62rem)", fontWeight: 600, color: "#0f2d1a", margin: "0 0 5px", letterSpacing: "-.01em" }}>{t("trending_title")}</h2>
            <p className="home-row-sub" style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".82rem", color: "#6B7280", margin: 0 }}>{t("trending_sub")}</p>
          </Motion.div>
          <Motion.div variants={flowItem} className="home-row-link">
            <Link to="/search" className="flex items-center gap-1.5 no-underline shrink-0" style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".82rem", fontWeight: 600, color: "#00AA6C" }}>
              {t("trending_view_all")}
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </Motion.div>
        </Motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 home-card-row" style={{ gap: 22, alignItems: "stretch" }}>
          {normalized.slice(0, 4).map((exp, index) => (
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

      </div>
    </section>
  );
}
