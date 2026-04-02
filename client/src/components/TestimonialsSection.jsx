import { TESTIMONIALS } from "../homeData.js";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ANIMATION_EASE, ANIMATION_TIMINGS } from "../config/constants.js";

function StarRow({ n = 5, size = 13 }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(n)].map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

const VISIBLE = TESTIMONIALS.slice(0, 3);

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

function ReviewCard({ t }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E8EDEA",
      borderRadius: 16,
      padding: "28px 26px 24px",
      boxShadow: "0 1px 8px rgba(0,0,0,.05)",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Stars */}
      <StarRow n={t.rating} size={14} />

      {/* Quote */}
      <p style={{
        fontFamily: "'Poppins',sans-serif",
        fontSize: ".84rem",
        lineHeight: 1.75,
        color: "#374151",
        margin: "14px 0 20px",
        flex: 1,
      }}>
        "{t.text}"
      </p>

      {/* Divider */}
      <div style={{ height: 1, background: "#F3F4F6", marginBottom: 18 }} />

      {/* Author */}
      <div className="flex items-center gap-3">
        <img
          src={t.avatar}
          alt={t.name}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            objectFit: "cover",
            flexShrink: 0,
            border: "2px solid #E8F5EE",
          }}
        />
        <div className="flex-1 min-w-0">
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".82rem", fontWeight: 700, color: "#0f2d1a", display: "block" }}>
            {t.name}
          </span>
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".68rem", color: "#9CA3AF", display: "block", marginTop: 1 }}>
            {t.location}
          </span>
        </div>
        <span style={{
          fontFamily: "'Poppins',sans-serif",
          fontSize: ".63rem",
          fontWeight: 600,
          color: "#00AA6C",
          textAlign: "right",
          lineHeight: 1.45,
          maxWidth: 100,
          flexShrink: 0,
        }}>
          {t.experience}
        </span>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="home-section" style={{ background: "#f8fdf9", padding: "80px 0 88px", borderTop: "1px solid #E8F5EE" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>

        {/* Header */}
        <Motion.div className="mb-12 home-row-header" variants={flowContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
          <Motion.h2 variants={flowItem} style={{ fontFamily: "'Poppins', sans-serif", fontSize: "clamp(1.35rem,2.2vw,1.85rem)", fontWeight: 600, color: "#0f2d1a", margin: "0 0 8px", letterSpacing: "-.01em" }}>
            Loved by Travelers Worldwide
          </Motion.h2>
          <Motion.p variants={flowItem} className="home-row-sub" style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".86rem", color: "#6B7280", margin: 0 }}>
            Real experiences, real people — see what our community is saying
          </Motion.p>

          <Motion.div variants={flowItem} className="home-row-link" style={{ marginTop: 8 }}>
            <Link to="/search" className="no-underline inline-flex items-center gap-1.5" style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".82rem", fontWeight: 600, color: "#00AA6C" }}>
              View all
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </Motion.div>
        </Motion.div>

        {/* Uniform 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 home-card-row" style={{ gap: 20 }}>
          {VISIBLE.map((t, i) => (
            <Motion.div
              key={i}
              className="home-card-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: ANIMATION_TIMINGS.normal, delay: Math.min(i * ANIMATION_TIMINGS.fast, ANIMATION_TIMINGS.slow), ease: ANIMATION_EASE }}
            >
              <ReviewCard t={t} />
            </Motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}