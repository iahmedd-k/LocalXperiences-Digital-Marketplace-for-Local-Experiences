import { useState } from "react";
import { Link } from "react-router-dom";
import { NEAR_YOU } from "../homeData.js";

function NearCard({ exp }) {
  const [h, setH] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <Link
      to={`/experiences/${exp._id || 'exp1'}`}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className="cursor-pointer block no-underline"
      style={{ fontFamily: "'Poppins',sans-serif" }}
    >
      <div className="relative rounded-2xl overflow-hidden mb-3" style={{ aspectRatio: "4/3" }}>
        <img
          src={exp.img}
          alt={exp.title}
          className="w-full h-full object-cover block"
          style={{ transform: h ? "scale(1.05)" : "scale(1)", transition: "transform .5s cubic-bezier(.22,1,.36,1)" }}
        />
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-3 right-3 flex items-center justify-center rounded-full bg-white/90 border-none cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,.15)]"
          style={{ width: 34, height: 34, transition: "transform .2s", transform: liked ? "scale(1.15)" : "scale(1)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "#ef4444" : "none"} stroke={liked ? "#ef4444" : "#374151"} strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>

      <h3 style={{ fontSize: ".88rem", fontWeight: 600, color: "#0f2d1a", margin: "0 0 5px", lineHeight: 1.35 }}>{exp.title}</h3>

      <div className="flex items-center gap-1.5 mb-1">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#00AA6C" stroke="none">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          ))}
        </div>
        <span style={{ fontSize: ".75rem", fontWeight: 700, color: "#0f2d1a" }}>{exp.rating}</span>
        <span style={{ fontSize: ".72rem", color: "#6B7280" }}>({exp.reviews})</span>
      </div>

      <p style={{ fontSize: ".78rem", color: "#6B7280", margin: 0 }}>
        from <span style={{ fontWeight: 700, color: "#0f2d1a" }}>${exp.price}</span> per adult
      </p>
    </Link>
  );
}

export default function NearYouSection() {
  return (
    <section className="bg-white" style={{ padding: "64px 28px 72px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="mb-7">
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(1.6rem,2.8vw,2.2rem)", fontWeight: 400, color: "#0f2d1a", margin: "0 0 6px", letterSpacing: "-.01em" }}>
            Explore experiences near Islamabad
          </h2>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".88rem", color: "#6B7280", margin: 0 }}>
            Can't-miss picks near you
          </p>
        </div>

        <div className="relative" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
          {NEAR_YOU.map((exp, i) => <NearCard key={i} exp={exp} />)}
          <button
            className="absolute flex items-center justify-center rounded-full bg-white cursor-pointer"
            style={{ right: -20, top: "38%", transform: "translateY(-50%)", width: 42, height: 42, border: "1px solid #E5E7EB", boxShadow: "0 4px 16px rgba(0,0,0,.12)", zIndex: 5 }}
          >
            <svg width="18" height="18" fill="none" stroke="#0f2d1a" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
