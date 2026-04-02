import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { SLIDES } from "../homeData.js";
import { ANIMATION_EASE, ANIMATION_TIMINGS } from "../config/constants.js";
import useGeolocation from "../hooks/useGeolocation.js";
import useTranslation from "../hooks/useTranslation.js";

const heroFlow = {
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

const heroItem = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: ANIMATION_TIMINGS.normal, ease: ANIMATION_EASE },
  },
};

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [query, setQuery] = useState("");
  const timerRef = useRef(null);
  const location = useGeolocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSearch = () => {
    const q = query.trim();
    if (q) navigate(`/search?query=${encodeURIComponent(q)}`);
    else navigate("/search");
  };

  const goTo = (idx) => {
    if (idx === current) return;
    setCurrent(idx);
    setAnimKey((k) => k + 1);
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => {
        setAnimKey((k) => k + 1);
        return (c + 1) % SLIDES.length;
      });
    }, 6500);
  };

  useEffect(() => {
    if (!paused) startTimer();
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const hasCoords = Number.isFinite(location?.lat) && Number.isFinite(location?.lng);
  const locationDenied = location.detected && !hasCoords;
  const locationLabel = location.city
    ? `${t("hero_near")} ${location.city}`
    : (hasCoords ? t("hero_near_you") : (locationDenied ? t("hero_location_disabled") : t("hero_detecting")));

  return (
    <section
      className="relative overflow-hidden flex flex-col hero-section"
      style={{ height: "100svh", minHeight: "clamp(500px, 86svh, 700px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((s, i) => (
        <div key={i} className={`sl${i === current ? " on" : ""}`}>
          <div
            key={i === current ? `kb${i}_${animKey}` : `kb${i}`}
            className={`kb${i === current ? " active" : ""}`}
            style={{ backgroundImage: `url('${s.url}')` }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.15) 0%,rgba(0,18,10,.22) 30%,rgba(0,8,4,.82) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,rgba(0,50,25,.55) 0%,transparent 52%)" }} />
        </div>
      ))}

      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 3, backgroundImage: "radial-gradient(circle,rgba(255,255,255,.035) 1px,transparent 1px)", backgroundSize: "28px 28px" }}
      />
      <div className="mobile-contrast-layer absolute inset-0 pointer-events-none" style={{ zIndex: 4 }} />

      {/* Hero content */}
      <div
        className="relative flex-1 flex flex-col items-center justify-center text-center hero-content"
        style={{ zIndex: 10, padding: "0 clamp(20px, 5vw, 48px)", paddingBottom: 55 }}
      >
        <Motion.div variants={heroFlow} initial="hidden" animate="show" className="w-full flex flex-col items-center">
          {/* Badge */}
          <Motion.div
            variants={heroItem}
            className="fu d0 inline-flex items-center gap-2 hero-badge"
            style={{ background: "rgba(52,224,161,.12)", border: "1.5px solid rgba(52,224,161,.40)", color: "#34E0A1", fontSize: ".67rem", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", padding: "7px 20px", borderRadius: 100, backdropFilter: "blur(14px)" }}
          >
            <span className="pdot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#34E0A1", display: "inline-block", flexShrink: 0 }} />
            <span className="hero-badge-desktop">{t("hero_badge_desktop")}</span>
            <span className="hero-badge-mobile">{t("hero_badge_mobile")}</span>
          </Motion.div>

          {/* Headline */}
          <Motion.h1
            variants={heroItem}
            className="fu d1 hero-h1"
            style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(1.75rem,3.8vw,3.2rem)", fontWeight: 400, color: "#fff", lineHeight: 1.14, letterSpacing: "-.01em", margin: "0 0 14px", maxWidth: 680 }}
          >
            {t("hero_headline_1")} <em style={{ fontStyle: "italic", color: "#34E0A1", textShadow: "0 0 70px rgba(52,224,161,.65),0 0 22px rgba(52,224,161,.35)" }}>{t("hero_headline_local")}</em> {t("hero_headline_2")}
          </Motion.h1>

          {/* Subtext */}
          <Motion.p variants={heroItem} className="fu d2 hero-sub" style={{ color: "rgba(255,255,255,.68)", fontSize: ".88rem", lineHeight: 1.7, marginBottom: 24, maxWidth: 500 }}>
            {t("hero_sub")}
          </Motion.p>

          {/* Search bar */}
          <Motion.div
            variants={heroItem}
            className="fu d3 sbar w-full"
            style={{ maxWidth: 650, background: "#fff", borderRadius: 16, padding: "7px 7px 7px clamp(12px, 3vw, 22px)", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 28px 70px rgba(0,0,0,.34),0 0 0 1px rgba(255,255,255,.08)", marginBottom: 22 }}
          >
            <div className="sbar-main">
              <svg width="20" height="20" fill="none" stroke="#00AA6C" strokeWidth="2.2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <div className="sbar-divider" style={{ width: 1, height: 24, background: "#E8EAED", flexShrink: 0 }} />
              <input
                className="si"
                placeholder={isMobile ? t("hero_search_mobile") : t("hero_search_desktop")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button className="sb" onClick={handleSearch}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              {t("hero_search_btn")}
            </button>
          </Motion.div>

        </Motion.div>
      </div>

      {/* Location pill */}
      <div
        className="hero-location absolute inline-flex items-center gap-2"
        style={{ bottom: 110, left: 44, zIndex: 18, background: "rgba(0,0,0,.30)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 100, padding: "7px 12px 7px 8px", cursor: locationDenied ? "pointer" : "default" }}
        onClick={locationDenied ? location.requestLocation : undefined}
        title={locationDenied ? "Click to enable location" : ""}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: hasCoords ? "#34E0A1" : (locationDenied ? "#EF4444" : "#FBBF24"), display: "block", flexShrink: 0, boxShadow: hasCoords ? "0 0 8px rgba(52,224,161,.9)" : (locationDenied ? "0 0 8px rgba(239,68,68,.7)" : "0 0 8px rgba(251,191,36,.7)") }} />
        <span style={{ fontSize: ".72rem", fontWeight: 600, color: "rgba(255,255,255,.85)", whiteSpace: "nowrap" }}>{locationLabel}</span>
        {locationDenied ? (
          <span style={{ background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.35)", color: "#FCA5A5", fontSize: ".58rem", fontWeight: 700, padding: "2px 8px", borderRadius: 100, letterSpacing: ".06em", flexShrink: 0 }}>
            {t("hero_enable")}
          </span>
        ) : (
          <span style={{ background: hasCoords ? "rgba(52,224,161,.15)" : "rgba(251,191,36,.18)", border: hasCoords ? "1px solid rgba(52,224,161,.32)" : "1px solid rgba(251,191,36,.35)", color: hasCoords ? "#34E0A1" : "#FBBF24", fontSize: ".58rem", fontWeight: 700, padding: "2px 8px", borderRadius: 100, letterSpacing: ".06em", flexShrink: 0 }}>
            {hasCoords ? t("hero_live") : t("hero_locating")}
          </span>
        )}
      </div>

      {/* Slide dots */}
      <div className="absolute flex gap-2 items-center slider-dots" style={{ bottom: 116, left: "50%", transform: "translateX(-50%)", zIndex: 18 }}>
        {SLIDES.map((_, i) => (
          <button key={i} className={`sdot${i === current ? " on" : ""}`} onClick={() => goTo(i)} />
        ))}
      </div>

      {/* Wave */}
      <div className="absolute -bottom-0.5 left-0 w-full leading-none" style={{ zIndex: 6 }}>
        <svg className="hero-wave-svg" viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 58 }}>
          <path d="M0,24 C320,80 640,0 960,38 C1120,56 1300,10 1440,40 L1440,80 L0,80 Z" fill="#f0faf5" />
        </svg>
      </div>
    </section>
  );
}
