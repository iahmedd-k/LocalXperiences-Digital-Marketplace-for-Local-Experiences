import { useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES_LIST, TRENDING_DATA } from "../homeData.js";

const CAT_EMOJI = { "Food & Drink": "🍽️", "Culture": "🏛️", "Workshops": "🎨", "Adventure": "🧗", "Nature": "🌿", "Photography": "📸", "City Tours": "🚶", "Events": "🎭" };

function TrendingCard({ exp }) {
  const [h, setH] = useState(false);

  return (
    <Link
      to={`/experiences/${exp._id || 'exp1'}`}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className="rounded-[20px] overflow-hidden bg-white cursor-pointer block no-underline"
      style={{ border: "1px solid #F3F4F6", boxShadow: h ? "0 20px 48px rgba(0,0,0,.11)" : "0 2px 12px rgba(0,0,0,.05)", transform: h ? "translateY(-6px)" : "translateY(0)", transition: "all .3s cubic-bezier(.22,1,.36,1)" }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <img
          src={exp.img}
          alt={exp.title}
          className="w-full h-full object-cover block"
          style={{ transform: h ? "scale(1.07)" : "scale(1)", transition: "transform .5s cubic-bezier(.22,1,.36,1)" }}
        />
        <div style={{ position: "absolute", top: 14, left: 14, background: "rgba(0,0,0,.32)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.18)", color: "#fff", fontFamily: "'Poppins',sans-serif", fontSize: ".62rem", fontWeight: 700, padding: "5px 12px", borderRadius: 100 }}>
          {CAT_EMOJI[exp.category] || "🌍"} {exp.category}
        </div>
        <div style={{ position: "absolute", top: 14, right: 14, background: "#00AA6C", color: "#fff", fontFamily: "'Poppins',sans-serif", fontSize: ".75rem", fontWeight: 700, padding: "5px 12px", borderRadius: 100, boxShadow: "0 4px 12px rgba(0,170,108,.40)" }}>
          ${exp.price}
        </div>
        <div className="absolute bottom-3.5 left-3.5 flex items-center gap-1.5" style={{ background: "rgba(0,0,0,.30)", backdropFilter: "blur(10px)", borderRadius: 100, padding: "4px 10px" }}>
          <svg width="11" height="11" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
          </svg>
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".62rem", fontWeight: 600, color: "rgba(255,255,255,.9)" }}>{exp.duration}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px 18px" }}>
        <div className="flex items-center gap-1 mb-1.5">
          <svg width="11" height="11" fill="none" stroke="#00AA6C" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".65rem", fontWeight: 500, color: "#00AA6C" }}>{exp.city}</span>
        </div>

        <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".9rem", fontWeight: 700, color: "#0f2d1a", margin: "0 0 12px", lineHeight: 1.35 }}>{exp.title}</h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i < Math.floor(exp.rating) ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="2">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              ))}
            </div>
            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".72rem", fontWeight: 600, color: "#374151" }}>{exp.rating}</span>
            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".68rem", color: "#9CA3AF" }}>({exp.reviews})</span>
          </div>
          <button
            style={{ background: h ? "#00AA6C" : "#F0FDF9", color: h ? "#fff" : "#00AA6C", border: `1.5px solid ${h ? "#00AA6C" : "#C6F0DC"}`, borderRadius: 100, fontFamily: "'Poppins',sans-serif", fontSize: ".72rem", fontWeight: 700, padding: "7px 15px", cursor: "pointer", transition: "all .25s" }}
          >
            Book Now
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function TrendingSection() {
  const [activeCat, setActiveCat] = useState("All");
  const filtered = activeCat === "All" ? TRENDING_DATA : TRENDING_DATA.filter((e) => e.category === activeCat);

  return (
    <section className="bg-white" style={{ padding: "72px 28px 80px", borderTop: "1px solid #F3F4F6" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div className="flex items-end justify-between mb-7 flex-wrap gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 mb-3" style={{ background: "#FEF9EC", border: "1px solid #FDE68A", color: "#92610A", fontSize: ".65rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 100 }}>
              <svg width="11" height="11" fill="#F59E0B" viewBox="0 0 24 24">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
              Most Popular
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(1.6rem,2.8vw,2.2rem)", fontWeight: 400, color: "#0f2d1a", margin: "0 0 5px", letterSpacing: "-.01em" }}>Trending Experiences</h2>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".88rem", color: "#6B7280", margin: 0 }}>What travelers are loving right now</p>
          </div>
          <a href="#" className="flex items-center gap-1.5 no-underline shrink-0" style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".82rem", fontWeight: 600, color: "#00AA6C" }}>
            View all experiences
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mb-9 overflow-x-auto pb-1">
          {CATEGORIES_LIST.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCat(cat.label)}
              className="flex items-center gap-1.5 shrink-0 cursor-pointer"
              style={{
                padding: "8px 18px", borderRadius: 100, fontFamily: "'Poppins',sans-serif", fontSize: ".8rem", fontWeight: 600, whiteSpace: "nowrap", transition: "all .18s",
                background: activeCat === cat.label ? "#0f2d1a" : "#fff",
                color: activeCat === cat.label ? "#fff" : "#6B7280",
                border: activeCat === cat.label ? "1.5px solid #0f2d1a" : "1.5px solid #E5E7EB",
                boxShadow: activeCat === cat.label ? "0 4px 14px rgba(15,45,26,.18)" : "none",
              }}
            >
              <span style={{ fontSize: ".85rem" }}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 22 }}>
          {(filtered.length > 0 ? filtered : TRENDING_DATA).slice(0, 4).map((exp, i) => (
            <TrendingCard key={`${activeCat}-${i}`} exp={exp} />
          ))}
        </div>
      </div>
    </section>
  );
}
