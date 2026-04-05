import useTranslation from '../hooks/useTranslation.js';
import { motion as Motion } from "framer-motion";
import { ANIMATION_EASE, ANIMATION_TIMINGS } from "../config/constants.js";

const STEPS = [
  {
    n: "01", label: "Discover",
    sub: "Search by city, category, or let AI match you to the right experience.",
    icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" /></svg>,
  },
  {
    n: "02", label: "Book Instantly",
    sub: "Pick a slot, set your group size, pay securely via Stripe. Done in 60 seconds.",
    icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" /></svg>,
  },
  {
    n: "03", label: "Experience & Share",
    sub: "Show up, immerse yourself, and leave a review for the community.",
    icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  },
];

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

export default function HowItWorksSection() {
  const { t } = useTranslation();

  return (
    <section className="home-section" style={{ background: "#f8fdf9", padding: "64px 0", borderTop: "1px solid #E8F5EE", borderBottom: "1px solid #E8F5EE" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)", gap: 64, alignItems: "center" }}>

        {/* Left */}
        <Motion.div variants={flowContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
          <Motion.h2 variants={flowItem} style={{ fontFamily: "'Poppins', sans-serif", fontSize: "clamp(1.35rem,2.4vw,1.95rem)", fontWeight: 600, color: "#0f2d1a", margin: "0 0 14px", letterSpacing: "-.01em", lineHeight: 1.22 }}>{t("hiw_title_1")}<br />
            <em style={{ fontStyle: "italic", color: "#00AA6C" }}>{t("hiw_title_2")}</em>
          </Motion.h2>

          <Motion.p variants={flowItem} style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".86rem", color: "#6B7280", lineHeight: 1.75, margin: "0 0 28px", maxWidth: 360 }}>{t("hiw_sub")}</Motion.p>

          <Motion.button
            variants={flowItem}
            className="inline-flex items-center gap-2 cursor-pointer"
            style={{ padding: "11px 28px", borderRadius: 100, background: "#0f2d1a", color: "#fff", border: "none", fontFamily: "'Poppins',sans-serif", fontSize: ".85rem", fontWeight: 700, boxShadow: "0 4px 16px rgba(15,45,26,.2)", transition: "all .2s" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#00AA6C"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#0f2d1a"}
          >{t("hiw_cta")}<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Motion.button>
        </Motion.div>

        {/* Right — vertical steps */}
        <div className="flex flex-col gap-0">
          {STEPS.map((s, i) => (
            <Motion.div
              key={i}
              className="flex gap-[18px] items-start"
              style={{ paddingBottom: i < STEPS.length - 1 ? 28 : 0 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: ANIMATION_TIMINGS.normal, delay: Math.min(i * ANIMATION_TIMINGS.fast, ANIMATION_TIMINGS.slow), ease: ANIMATION_EASE }}
            >
              <div className="flex flex-col items-center shrink-0">
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{ width: 44, height: 44, borderRadius: 12, background: "#fff", border: "1.5px solid #D1FAE5", color: "#00AA6C", boxShadow: "0 2px 10px rgba(0,170,108,.09)" }}
                >
                  {s.icon}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 1.5, flex: 1, minHeight: 24, background: "linear-gradient(to bottom,#C6F0DC,#E8F5EE)", marginTop: 8 }} />
                )}
              </div>
              <div style={{ paddingTop: 10 }}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".58rem", fontWeight: 700, color: "#00AA6C", letterSpacing: ".12em", textTransform: "uppercase" }}>{s.n}</span>
                  <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".92rem", fontWeight: 700, color: "#0f2d1a", margin: 0 }}>{s.label}</h3>
                </div>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".8rem", color: "#6B7280", lineHeight: 1.65, margin: 0 }}>{s.sub}</p>
              </div>
            </Motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
