import useTranslation from '../hooks/useTranslation.js';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { motion as Motion } from "framer-motion";
import { ANIMATION_EASE, ANIMATION_TIMINGS } from "../config/constants.js";
import { becomeHost } from "../services/authService.js";
import { setCredentials } from "../slices/authSlice.js";

const ACCORDION_ITEMS = [
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: "Create Your Listing",
    desc: "Profile, photos, pricing — live in under 10 minutes.",
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    title: "Manage Bookings & Availability",
    desc: "Set slots, cap group sizes, update availability in real time.",
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Get Paid Securely",
    desc: "Stripe deposits after every booking. Transparent fees, zero surprises.",
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    title: "Build Your Reputation",
    desc: "Verified reviews boost your rating and bring repeat guests.",
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

export default function BecomeAHostSection() {
  const { t } = useTranslation();

  const [openIdx, setOpenIdx] = useState(-1);
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { mutate: upgrade, isPending } = useMutation({
    mutationFn: becomeHost,
    onSuccess: (res) => {
      const { user: updatedUser, token } = res.data.data;
      dispatch(setCredentials({ user: updatedUser, token }));
      toast.success("You're now a host! Let's set up your profile.");
      navigate("/host/profile");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
    },
  });

  return (
    <section className="bg-white home-section" style={{ padding: "36px 0", borderTop: "1px solid #F3F4F6" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)", gap: 52, alignItems: "center" }}>

        {/* Image — landscape, reduced height */}
        <Motion.div
          className="relative"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: ANIMATION_TIMINGS.slow, ease: ANIMATION_EASE }}
        >
          <div className="overflow-hidden relative" style={{ borderRadius: 18, aspectRatio: "4/3" }}>
            <img
              src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=900&q=90"
              alt="Become a host"
              className="w-full h-full object-cover block"
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.22) 0%,transparent 55%)" }} />
          </div>
        </Motion.div>

        {/* Content */}
        <Motion.div variants={flowContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
          {/* Badge */}
          <Motion.div variants={flowItem} style={{ display: "none" }}>
            <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            For Local Hosts
          </Motion.div>

          <Motion.h2 variants={flowItem} style={{ fontFamily: "'Poppins', sans-serif", fontSize: "clamp(1.2rem,1.9vw,1.58rem)", fontWeight: 600, color: "#0f2d1a", margin: "0 0 8px", letterSpacing: "-.01em", lineHeight: 1.25 }}>{t("host_title_1")}<br />
            <em style={{ fontStyle: "italic", color: "#00AA6C" }}>{t("host_title_2")}</em>
          </Motion.h2>

          <Motion.p variants={flowItem} style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".78rem", color: "#6B7280", lineHeight: 1.6, margin: "0 0 18px", maxWidth: 340 }}>{t("host_sub")}</Motion.p>

          {/* Accordion */}
          <Motion.div variants={flowItem} className="flex flex-col mb-5">
            {ACCORDION_ITEMS.map((item, i) => (
              <Motion.div
                key={i}
                className="overflow-hidden"
                style={{ borderTop: "1px solid #F3F4F6" }}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: ANIMATION_TIMINGS.normal, delay: Math.min(i * 0.06, ANIMATION_TIMINGS.slow), ease: ANIMATION_EASE }}
              >
                <button
                  onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-2.5 bg-transparent border-none cursor-pointer text-left"
                  style={{ padding: "10px 0" }}
                >
                  <div className="flex items-center gap-2.5 flex-1">
                    <div
                      className="flex items-center justify-center shrink-0 rounded-lg"
                      style={{ width: 28, height: 28, background: openIdx === i ? "#E8F8F2" : "#F9FAFB", color: openIdx === i ? "#00AA6C" : "#9CA3AF", transition: "all .2s" }}
                    >
                      {item.icon}
                    </div>
                    <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".8rem", fontWeight: openIdx === i ? 700 : 500, color: openIdx === i ? "#0f2d1a" : "#4B5563", transition: "color .2s" }}>
                      {item.title}
                    </span>
                  </div>
                  <svg
                    width="13" height="13" fill="none" stroke={openIdx === i ? "#00AA6C" : "#C4C4C4"} strokeWidth="2.2" viewBox="0 0 24 24"
                    className="shrink-0"
                    style={{ transition: "transform .25s", transform: openIdx === i ? "rotate(180deg)" : "rotate(0deg)" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div style={{ maxHeight: openIdx === i ? 72 : 0, overflow: "hidden", transition: "max-height .3s cubic-bezier(.22,1,.36,1)" }}>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".74rem", color: "#6B7280", lineHeight: 1.6, margin: "0 0 10px", paddingLeft: 38 }}>
                    {item.desc}
                  </p>
                </div>
              </Motion.div>
            ))}
            <div style={{ borderTop: "1px solid #F3F4F6" }} />
          </Motion.div>

          {/* CTA buttons */}
          <Motion.div variants={flowItem} className="flex gap-2 flex-wrap items-center">
            {!isAuthenticated && (
              <Link
                to="/become-host"
                className="no-underline inline-flex items-center gap-1.5"
                style={{ padding: "9px 22px", borderRadius: 100, background: "#0f2d1a", color: "#fff", fontFamily: "'Poppins',sans-serif", fontSize: ".78rem", fontWeight: 700 }}
              >
                Start Hosting — It's Free
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}

            {isAuthenticated && user?.role === "traveler" && (
              <button
                onClick={() => upgrade()}
                disabled={isPending}
                className="inline-flex items-center gap-1.5"
                style={{ padding: "9px 22px", borderRadius: 100, background: "#0f2d1a", color: "#fff", border: "none", fontFamily: "'Poppins',sans-serif", fontSize: ".78rem", fontWeight: 700, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}
              >
                {isPending ? "Upgrading…" : "Become a Host"}
                {!isPending && (
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            )}

            {isAuthenticated && user?.role === "host" && (
              <Link
                to="/host/dashboard"
                className="no-underline inline-flex items-center gap-1.5"
                style={{ padding: "9px 22px", borderRadius: 100, background: "#0f2d1a", color: "#fff", fontFamily: "'Poppins',sans-serif", fontSize: ".78rem", fontWeight: 700 }}
              >{t("host_cta_dashboard")}<svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}

            <Link
              to="/become-host"
              className="no-underline inline-flex items-center gap-1.5"
              style={{ padding: "9px 18px", borderRadius: 100, background: "transparent", color: "#6B7280", border: "1.5px solid #E5E7EB", fontFamily: "'Poppins',sans-serif", fontSize: ".78rem", fontWeight: 600 }}
            >{t("host_cta_learn")}<svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </Motion.div>
        </Motion.div>

      </div>
    </section>
  );
}
