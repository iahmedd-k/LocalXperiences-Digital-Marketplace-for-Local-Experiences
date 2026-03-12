import { useState, useEffect, useRef } from "react";
import Navbar from "../common/Navbar.jsx";
import { SLIDES, STATS } from "../homeData.js";

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");
  const [query, setQuery] = useState("");
  const timerRef = useRef(null);

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

  const slide = SLIDES[current];

  return (
    <section
      className="relative overflow-hidden flex flex-col"
      style={{ height: "100vh", minHeight: 660 }}
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

      {/* Navbar */}
      <Navbar activeNav={activeNav} setActiveNav={setActiveNav} />

      {/* Hero content */}
      <div
        className="relative flex-1 flex flex-col items-center justify-center text-center px-6"
        style={{ zIndex: 10, paddingBottom: 55 }}
      >
        {/* Badge */}
        <div
          className="fu d0 inline-flex items-center gap-2 mb-4"
          style={{ background: "rgba(52,224,161,.12)", border: "1.5px solid rgba(52,224,161,.40)", color: "#34E0A1", fontSize: ".67rem", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", padding: "7px 20px", borderRadius: 100, backdropFilter: "blur(14px)" }}
        >
          <span className="pdot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#34E0A1", display: "inline-block", flexShrink: 0 }} />
          Discover · Book · Share Local Experiences
        </div>

        {/* Headline */}
        <h1
          className="fu d1"
          style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(2rem,3.8vw,3.2rem)", fontWeight: 400, color: "#fff", lineHeight: 1.14, letterSpacing: "-.01em", margin: "0 0 14px", maxWidth: 680 }}
        >
          Your Next Great Experience<br />
          <em style={{ fontStyle: "italic", color: "#34E0A1", textShadow: "0 0 70px rgba(52,224,161,.65),0 0 22px rgba(52,224,161,.35)" }}>
            Is Waiting to Be Discovered.
          </em>
        </h1>

        {/* Subtext */}
        <p className="fu d2" style={{ color: "rgba(255,255,255,.68)", fontSize: ".88rem", lineHeight: 1.7, marginBottom: 24, maxWidth: 500 }}>
          Hand-picked tours, cultural workshops, food trails & hidden gems —<br />curated for every traveler & local adventurer.
        </p>

        {/* Search bar */}
        <div
          className="fu d3 sbar w-full"
          style={{ maxWidth: 650, background: "#fff", borderRadius: 16, padding: "7px 7px 7px 22px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 28px 70px rgba(0,0,0,.34),0 0 0 1px rgba(255,255,255,.08)" }}
        >
          <svg width="20" height="20" fill="none" stroke="#00AA6C" strokeWidth="2.2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <div style={{ width: 1, height: 24, background: "#E8EAED", flexShrink: 0 }} />
          <input
            className="si"
            placeholder="Search destinations, experiences, cities…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="sb">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            Search
          </button>
        </div>

        {/* Stats bar — inline, directly below search */}
        <div
          className="fu d4 inline-flex overflow-hidden"
          style={{ marginTop: 20, background: "rgba(0,0,0,.38)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,.10)", borderRadius: 18 }}
        >
          {STATS.map((s, i) => (
            <div key={i} className="text-center" style={{ padding: "13px 26px", borderLeft: i > 0 ? "1px solid rgba(255,255,255,.09)" : "none" }}>
              <span style={{ display: "block", fontSize: "1.12rem", fontWeight: 800, color: "#34E0A1", lineHeight: 1.1 }}>{s.val}</span>
              <span style={{ display: "block", fontSize: ".55rem", fontWeight: 600, color: "rgba(255,255,255,.44)", textTransform: "uppercase", letterSpacing: ".11em", marginTop: 3 }}>{s.lbl}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Location pill */}
      <div
        className="absolute inline-flex items-center gap-2"
        style={{ bottom: 70, left: 44, zIndex: 18, background: "rgba(0,0,0,.30)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 100, padding: "7px 12px 7px 8px" }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34E0A1", display: "block", flexShrink: 0, boxShadow: "0 0 8px rgba(52,224,161,.9)" }} />
        <span style={{ fontSize: ".72rem", fontWeight: 600, color: "rgba(255,255,255,.85)", whiteSpace: "nowrap" }}>📍 {slide.city}</span>
        <span style={{ background: "rgba(52,224,161,.15)", border: "1px solid rgba(52,224,161,.32)", color: "#34E0A1", fontSize: ".58rem", fontWeight: 700, padding: "2px 8px", borderRadius: 100, letterSpacing: ".06em", flexShrink: 0 }}>LIVE</span>
      </div>

      {/* Slide dots */}
      <div className="absolute flex gap-2 items-center" style={{ bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 18 }}>
        {SLIDES.map((_, i) => (
          <button key={i} className={`sdot${i === current ? " on" : ""}`} onClick={() => goTo(i)} />
        ))}
      </div>

      {/* Wave */}
      <div className="absolute bottom-[-2px] left-0 w-full leading-none" style={{ zIndex: 6 }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 58 }}>
          <path d="M0,24 C320,80 640,0 960,38 C1120,56 1300,10 1440,40 L1440,80 L0,80 Z" fill="#f0faf5" />
        </svg>
      </div>
    </section>
  );
}