import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ANIMATION_EASE, ANIMATION_MS, ANIMATION_TIMINGS } from "../config/constants.js";
import useTranslation from "../hooks/useTranslation.js";
import foodImg from "../assets/food.jpg";
import hikingImg from "../assets/hiking.jpg";
import artsImg from "../assets/arts.jpg";
import workshopsImg from "../assets/workshops.jpg";
import cultureImg from "../assets/culture.jpg";
import musicImg from "../assets/music.jpg";
import cityImg from "../assets/city.jpg";
import sportsImg from "../assets/sports.jpg";
import aiTechImg from "../assets/aitech.jpg";

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

const CATEGORIES = [
  { value: "food",      labelKey: "cat_food",        img: foodImg },
  { value: "adventure", labelKey: "cat_adventure",   img: hikingImg },
  { value: "art",       labelKey: "cat_art",       img: artsImg },
  { value: "workshop",  labelKey: "cat_workshop",           img: workshopsImg },
  { value: "culture",   labelKey: "cat_culture",  img: cultureImg },
  { value: "music",     labelKey: "cat_music",   img: musicImg },
  { value: "tour",      labelKey: "cat_tour",          img: cityImg },
  { value: "sports",    labelKey: "cat_sports",    img: sportsImg },
  { value: "other",     labelKey: "cat_other",           img: aiTechImg },
];

export default function CategoriesSection() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const { t } = useTranslation();

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

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 420, behavior: "smooth" });
    window.setTimeout(updateScrollState, 280);
  };

  return (
    <section className="bg-white home-section home-section-categories" style={{ padding: "52px 0 60px", borderTop: "1px solid #F3F4F6" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>

        {/* Header row: title + desktop arrows */}
        <Motion.div
          className="mb-7 flex items-center justify-between gap-4 home-row-header"
          variants={flowContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <Motion.div variants={flowItem}>
            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "clamp(1.1rem, 2.15vw, 1.75rem)",
                fontWeight: 600, color: "#0f2d1a", margin: 0, letterSpacing: "-.01em",
              }}
            >
              <span className="title-desktop">{t("cat_title_desktop")}</span>
              <span className="title-mobile">{t("cat_title_mobile")}</span>
            </h2>
          </Motion.div>

          <Motion.div variants={flowItem} className="categories-arrows flex gap-2">
            <button
              type="button"
              onClick={() => scroll(-1)}
              disabled={!canScrollLeft}
              className="arrow-left flex items-center justify-center rounded-full bg-white border border-gray-200 hover:border-emerald-400 hover:shadow-md transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ width: 42, height: 42, transitionDuration: ANIMATION_MS.fast }}
              aria-label="Scroll categories left"
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
              aria-label="Scroll categories right"
            >
              <svg width="18" height="18" fill="none" stroke="#0f2d1a" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </Motion.div>
        </Motion.div>

        {/* Scrollable cards */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-3 overflow-x-auto home-card-row"
          style={{
            flexWrap: "nowrap",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollBehavior: "smooth",
            paddingBottom: 4,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {CATEGORIES.map((cat, index) => (
            <Motion.div
              key={cat.value}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: ANIMATION_TIMINGS.normal, delay: Math.min(index * 0.05, ANIMATION_TIMINGS.slow), ease: ANIMATION_EASE }}
              style={{ flexShrink: 0 }}
            >
              <button
                type="button"
                onClick={() => navigate("/search?category=" + cat.value)}
                className="cat-card group relative shrink-0 cursor-pointer border-none p-0 text-left"
                style={{ width: 210, borderRadius: 14, overflow: "hidden", display: "block" }}
              >
                <div className="cat-card-inner" style={{ width: 210, aspectRatio: "4/3", position: "relative", overflow: "hidden", borderRadius: 14 }}>
                  <img
                    src={cat.img}
                    alt={t(cat.labelKey)}
                    className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-105"
                    style={{ transitionDuration: ANIMATION_MS.normal }}
                  />
                  <div
                    style={{
                      position: "absolute", inset: 0, borderRadius: 14,
                      background: "linear-gradient(to top, rgba(0,0,0,.72) 0%, rgba(0,0,0,.12) 52%, transparent 100%)",
                    }}
                  />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 14px 12px" }}>
                    <p
                      className="cat-label"
                      style={{
                        fontFamily: "'Poppins', sans-serif", fontSize: ".84rem", fontWeight: 700,
                        color: "#fff", margin: 0, lineHeight: 1.25, textShadow: "0 1px 4px rgba(0,0,0,.35)",
                      }}
                    >
                      {t(cat.labelKey)}
                    </p>
                  </div>
                  <div
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{
                      position: "absolute", top: 10, right: 10,
                      transitionDuration: ANIMATION_MS.fast,
                      background: "#00AA6C", color: "#fff",
                      fontFamily: "'Poppins', sans-serif", fontSize: ".55rem", fontWeight: 700,
                      padding: "3px 9px", borderRadius: 100, letterSpacing: ".06em", textTransform: "uppercase",
                    }}
                  >
                    {t("cat_explore")}
                  </div>
                </div>
              </button>
            </Motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
