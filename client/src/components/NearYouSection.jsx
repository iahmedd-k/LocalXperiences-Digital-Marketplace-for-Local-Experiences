import useTranslation from '../hooks/useTranslation.js';
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion as Motion } from "framer-motion";
import { getExperiences } from "../services/experienceService.js";
import useGeolocation from "../hooks/useGeolocation.js";
import useWishlist from "../hooks/useWishlist.js";
import { ANIMATION_EASE, ANIMATION_TIMINGS, DEFAULT_RADIUS } from "../config/constants.js";
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

const getLatLngFromExperience = (exp) => {
  const raw = exp?.location?.coordinates?.coordinates;
  if (!Array.isArray(raw) || raw.length !== 2) return null;
  const [lng, lat] = raw;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
};

const toDistanceKm = (fromLat, fromLng, toLat, toLng) => {
  const R = 6371;
  const dLat = ((toLat - fromLat) * Math.PI) / 180;
  const dLng = ((toLng - fromLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((fromLat * Math.PI) / 180) * Math.cos((toLat * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export default function NearYouSection() {
  const { t } = useTranslation();

  const location = useGeolocation();
  const { isSaved, toggleWishlist, isPendingFor } = useWishlist();

  const hasCoords = Number.isFinite(location.lat) && Number.isFinite(location.lng);

  const { data: nearby = [], isLoading } = useQuery({
    queryKey: ["nearbyExperiences", location.detected, location.lat, location.lng],
    queryFn: async () => {
      if (!hasCoords) {
        const res = await getExperiences({ limit: 24, sort: "rating" });
        return res.data.data || [];
      }

      const nearRes = await getExperiences({
        lat: location.lat,
        lng: location.lng,
        radius: DEFAULT_RADIUS,
        limit: 24,
        sort: "nearest",
      });
      const nearItems = nearRes.data.data || [];

      return nearItems
        .map((exp) => {
          const serverDistanceKm = Number(exp.distanceKm);
          if (Number.isFinite(serverDistanceKm)) {
            return { ...exp, _distanceKm: serverDistanceKm };
          }

          const point = getLatLngFromExperience(exp);
          if (!point) return { ...exp, _distanceKm: Number.POSITIVE_INFINITY };
          return {
            ...exp,
            _distanceKm: toDistanceKm(location.lat, location.lng, point.lat, point.lng),
          };
        })
        .sort((a, b) => a._distanceKm - b._distanceKm);
    },
  });

  const cards = nearby
    .filter((exp) => !hasCoords || !Number.isFinite(exp._distanceKm) || exp._distanceKm <= DEFAULT_RADIUS / 1000)
    .map((exp) => ({
      _id: exp._id,
      title: exp.title,
      img: exp.photos?.[0] || "https://images.unsplash.com/photo-1521292270410-a8c4d716d518?auto=format&fit=crop&w=900&q=80",
      rating: exp.rating?.average?.toFixed(1) || "4.8",
      reviews: exp.rating?.count || 0,
      price: exp.price,
      distance: Number.isFinite(exp._distanceKm) ? Math.round(exp._distanceKm) : null,
    }));

  return (
    <section className="bg-white home-section" style={{ padding: "64px 0 72px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
        <Motion.div
          className="mb-7 flex items-end justify-between gap-3 flex-wrap home-row-header"
          variants={flowContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <Motion.div variants={flowItem}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "clamp(1.16rem,1.8vw,1.62rem)", fontWeight: 600, color: "#0f2d1a", margin: "0 0 6px", letterSpacing: "-.01em" }}>
              Explore experiences near {location.city || "you"}
            </h2>
            <p className="home-row-sub" style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".82rem", color: "#6B7280", margin: 0 }}>
              {hasCoords ? "Showing the closest experiences within 50 km" : "Enable location for nearby picks, or browse top-rated experiences"}
            </p>
          </Motion.div>

          <Motion.div variants={flowItem} className="home-row-link">
            <Link
              to="/search"
              className="flex items-center gap-1.5 no-underline shrink-0"
              style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".82rem", fontWeight: 600, color: "#00AA6C" }}
            >{t("trending_view_all")}<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </Motion.div>
        </Motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 home-card-row" style={{ gap: 20, alignItems: "stretch" }}>
          {isLoading ? (
            <p style={{ gridColumn: "1 / -1", fontFamily: "'Poppins',sans-serif", fontSize: ".9rem", color: "#6B7280" }}>{t("near_loading")}</p>
          ) : cards.length ? (
            cards.slice(0, 4).map((exp, index) => (
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
                  bottomMeta={typeof exp.distance === "number" ? (
                    <p className="text-[0.78rem] text-slate-500">{exp.distance} km away</p>
                  ) : null}
                />
              </Motion.div>
            ))
          ) : (
            <p style={{ gridColumn: "1 / -1", fontFamily: "'Poppins',sans-serif", fontSize: ".9rem", color: "#6B7280" }}>{t("near_empty")}</p>
          )}
        </div>

      </div>
    </section>
  );
}
