import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ANIMATION_EASE, ANIMATION_MS, ANIMATION_TIMINGS } from "../config/constants.js";

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

const CITIES = [
  { name: "Paris",      label: "City of Love",         img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=85" },
  { name: "Tokyo",      label: "Where Tradition Meets Future", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=85" },
  { name: "New York",   label: "The City That Never Sleeps", img: "https://images.unsplash.com/photo-1538970272646-f61fabb3a8a2?w=800&q=85" },
  { name: "Rome",       label: "The Eternal City",     img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=85" },
  { name: "Bali",       label: "Island of the Gods",   img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=85" },
  { name: "Barcelona",  label: "Architecture & Soul",  img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=85" },
  { name: "Istanbul",   label: "Bridge of Two Worlds",  img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=85" },
  { name: "Dubai",      label: "Where Dreams are Built", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=85" },
  { name: "Lahore",     label: "The Cultural Heart",   img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=85" },
  { name: "Lisbon",     label: "City of Seven Hills",  img: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=85" },
  { name: "Bangkok",    label: "Temple & Street Food", img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=85" },
  { name: "Cape Town",  label: "Where Ocean Meets Mountain", img: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=85" },
  { name: "Marrakech",  label: "Jewel of the Desert",  img: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&q=85" },
  { name: "Kyoto",      label: "Ancient Japan Preserved", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=85" },
  { name: "Santorini",  label: "Aegean Blue Perfection", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=85" },
  { name: "London",     label: "Royal & Timeless",     img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=85" },
];

function CityCard({ city, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(city.name)}
      className="city-card group relative shrink-0 cursor-pointer border-none p-0 text-left"
      style={{ width: 200, borderRadius: 16, overflow: "hidden", display: "block" }}
    >
      <div className="city-card-inner" style={{ width: 200, aspectRatio: "3/4", position: "relative", overflow: "hidden", borderRadius: 16 }}>
        <img
          src={city.img}
          alt={city.name}
          className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-105"
          style={{ transitionDuration: ANIMATION_MS.normal }}
        />
        {/* gradient */}
        <div
          style={{
            position: "absolute", inset: 0, borderRadius: 16,
            background: "linear-gradient(to top, rgba(0,0,0,.75) 0%, rgba(0,0,0,.08) 55%, transparent 100%)",
          }}
        />
        {/* text */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "18px 14px 14px" }}>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#fff", margin: "0 0 3px", lineHeight: 1.2 }}>
            {city.name}
          </p>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: ".62rem", fontWeight: 500, color: "rgba(255,255,255,.68)", margin: 0 }}>
            {city.label}
          </p>
        </div>
        {/* hover pill */}
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{
            position: "absolute", top: 10, right: 10,
            transitionDuration: ANIMATION_MS.fast,
            background: "#00AA6C", color: "#fff",
            fontFamily: "'Poppins', sans-serif", fontSize: ".58rem", fontWeight: 700,
            padding: "3px 9px", borderRadius: 100, letterSpacing: ".06em", textTransform: "uppercase",
          }}
        >
          Explore →
        </div>
      </div>
    </button>
  );
}

export default function CitiesSection() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, []);

  const handleCityClick = (cityName) => {
    navigate(`/search?city=${encodeURIComponent(cityName)}`);
  };

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 440, behavior: "smooth" });
    window.setTimeout(updateScrollState, 280);
  };

  return (
    <section className="bg-white home-section" style={{ padding: "60px 0 68px", borderTop: "1px solid #F3F4F6" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>

        {/* Header */}
        <Motion.div
          className="flex items-end justify-between mb-8 flex-wrap gap-3 home-row-header"
          variants={flowContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <Motion.div variants={flowItem}>
            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "clamp(1.35rem, 2.4vw, 1.95rem)",
                fontWeight: 600, color: "#0f2d1a", margin: "0 0 5px", letterSpacing: "-.01em",
              }}
            >
              Iconic Places You Need to See
            </h2>
            <p className="home-row-sub" style={{ fontFamily: "'Poppins', sans-serif", fontSize: ".88rem", color: "#6B7280", margin: 0 }}>
              Click a city to explore its local experiences
            </p>
          </Motion.div>

          {/* Arrow controls */}
          <Motion.div variants={flowItem} className="flex gap-2 shrink-0 cities-arrows">
            <button
              type="button"
              onClick={() => scroll(-1)}
              disabled={!canScrollLeft}
              className="arrow-left flex items-center justify-center rounded-full bg-white border border-gray-200 hover:border-emerald-400 hover:shadow-md transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ width: 42, height: 42, transitionDuration: ANIMATION_MS.fast }}
              aria-label="Scroll left"
            >
              <svg width="18" height="18" fill="none" stroke="#0f2d1a" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              disabled={!canScrollRight}
              className="arrow-right flex items-center justify-center rounded-full bg-white border border-gray-200 hover:border-emerald-400 hover:shadow-md transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ width: 42, height: 42, transitionDuration: ANIMATION_MS.fast }}
              aria-label="Scroll right"
            >
              <svg width="18" height="18" fill="none" stroke="#0f2d1a" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </Motion.div>
        </Motion.div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-4 overflow-x-auto home-card-row"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollBehavior: "smooth",
            paddingBottom: 2,
          }}
        >
          {CITIES.map((city, index) => (
            <Motion.div
              key={city.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: ANIMATION_TIMINGS.normal, delay: Math.min(index * 0.05, ANIMATION_TIMINGS.slow), ease: ANIMATION_EASE }}
            >
              <CityCard city={city} onClick={handleCityClick} />
            </Motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
