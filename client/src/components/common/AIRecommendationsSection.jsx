import { useState } from "react";
import { Link } from "react-router-dom";
import { AI_RECS } from "../homeData.js";

const TAG_COLORS = {
  "Perfect match": { bg: "#E8F8F2", color: "#00875A", border: "#C6F0DC" },
  "Highly rated":  { bg: "#FEF9EC", color: "#92610A", border: "#FDE68A" },
  "Near you":      { bg: "#EEF2FF", color: "#4338CA", border: "#C7D2FE" },
};

function AIRecCard({ exp }) {
  const [h, setH] = useState(false);
  const [saved, setSaved] = useState(false);
  const tc = TAG_COLORS[exp.tag] || TAG_COLORS["Perfect match"];

  return (
    <Link
      to={`/experiences/${exp._id || "exp1"}`}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className="block no-underline rounded-2xl overflow-hidden bg-white cursor-pointer"
      style={{
        border: "1px solid #F3F4F6",
        boxShadow: h ? "0 16px 40px rgba(0,0,0,.10)" : "0 2px 12px rgba(0,0,0,.05)",
        transform: h ? "translateY(-5px)" : "translateY(0)",
        transition: "all .3s cubic-bezier(.22,1,.36,1)",
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <img
          src={exp.img}
          alt={exp.title}
          className="w-full h-full object-cover block"
          style={{
            transform: h ? "scale(1.06)" : "scale(1)",
            transition: "transform .5s cubic-bezier(.22,1,.36,1)",
          }}
        />

        {/* Tag badge — top left */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          background: tc.bg, border: `1px solid ${tc.border}`, color: tc.color,
          fontSize: ".62rem", fontWeight: 700, padding: "4px 11px", borderRadius: 100,
          fontFamily: "'Poppins',sans-serif",
        }}>
          {exp.tag}
        </div>

        {/* Save button — top right */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSaved(!saved); }}
          className="absolute top-3 right-3 flex items-center justify-center rounded-full border-none cursor-pointer"
          style={{
            width: 34, height: 34,
            background: "rgba(255,255,255,.92)",
            boxShadow: "0 2px 8px rgba(0,0,0,.15)",
            transform: saved ? "scale(1.15)" : "scale(1)",
            transition: "transform .2s",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24"
            fill={saved ? "#00AA6C" : "none"}
            stroke={saved ? "#00AA6C" : "#374151"}
            strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px 18px" }}>

        {/* City */}
        <div className="flex items-center gap-1 mb-1">
          <svg width="11" height="11" fill="none" stroke="#00AA6C" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".65rem", fontWeight: 500, color: "#00AA6C" }}>
            {exp.city}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: "'Poppins',sans-serif", fontSize: ".9rem", fontWeight: 700,
          color: "#0f2d1a", margin: "0 0 10px", lineHeight: 1.4,
        }}>
          {exp.title}
        </h3>

        {/* Rating + price row */}
        <div className="flex items-center justify-between">
          {/* Stars + rating */}
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="11" height="11" viewBox="0 0 24 24"
                  fill={i < Math.floor(exp.rating) ? "#F59E0B" : "none"}
                  stroke="#F59E0B" strokeWidth="2">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              ))}
            </div>
            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".72rem", fontWeight: 600, color: "#374151" }}>
              {exp.rating}
            </span>
            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".68rem", color: "#9CA3AF" }}>
              ({exp.reviews})
            </span>
          </div>

          {/* Price */}
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".82rem", color: "#6B7280" }}>
            from <strong style={{ color: "#0f2d1a", fontSize: ".88rem" }}>${exp.price}</strong>
            <span style={{ fontSize: ".72rem" }}> / adult</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function AIRecommendationsSection() {
  return (
    <section className="bg-white" style={{ padding: "60px 28px 68px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Header */}
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div
              className="inline-flex items-center gap-1.5 mb-3"
              style={{
                background: "#E8F8F2", border: "1px solid #C6F0DC", color: "#00875A",
                fontSize: ".65rem", fontWeight: 700, letterSpacing: ".12em",
                textTransform: "uppercase", padding: "5px 14px", borderRadius: 100,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI-Powered
            </div>
            <h2 style={{
              fontFamily: "'DM Serif Display',serif",
              fontSize: "clamp(1.6rem,2.8vw,2.2rem)",
              fontWeight: 400, color: "#0f2d1a", margin: "0 0 5px", letterSpacing: "-.01em",
            }}>
              Recommended For You
            </h2>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".85rem", color: "#6B7280", margin: 0 }}>
            </p>
          </div>

          <a
            href="#"
            style={{
              fontFamily: "'Poppins',sans-serif", fontSize: ".82rem", fontWeight: 600,
              color: "#00AA6C", textDecoration: "none",
              display: "flex", alignItems: "center", gap: 5,
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#008A56"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#00AA6C"}
          >
            See all recommendations
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {AI_RECS.map((exp, i) => <AIRecCard key={i} exp={exp} />)}
        </div>

      </div>
    </section>
  );
}