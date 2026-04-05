import useTranslation from '../hooks/useTranslation.js';
import { useState } from "react";
import { Link } from "react-router-dom";

const FOOTER_COLS = [
  {
    heading: "Discover",
    links: [
      { label: "Search Experiences", to: "/search" },
      { label: "Travel Stories", to: "/stories" },
      { label: "Experiences Near Me", to: "/search" },
      { label: "About Us", to: "/about" },
      { label: "Contact Us", to: "/about" },
    ],
  },
  {
    heading: "Hosting",
    links: [
      { label: "Become a Host", to: "/become-host" },
      { label: "Host Dashboard", to: "/host/dashboard" },
      { label: "Create Experience", to: "/host/experiences/create" },
      { label: "Host Bookings", to: "/host/bookings" },
      { label: "Host Reviews", to: "/host/reviews" },
      { label: "Set Up Host Profile", to: "/host/profile" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign Up", to: "/signup" },
      { label: "Log In", to: "/login" },
      { label: "My Profile", to: "/profile" },
      { label: "My Bookings", to: "/my-bookings" },
      { label: "Wishlist", to: "/wishlist" },
      { label: "Help & Support", to: "/about" },
    ],
  },
];

const BOTTOM_LINKS = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/about" },
  { label: "Support Email", href: "mailto:support@localxperiences.com" },
];

export default function Footer() {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer style={{ background: "#0c2318", fontFamily: "'Poppins',sans-serif" }}>
      <div
        className="max-w-300 mx-auto"
        style={{ padding: "60px clamp(16px, 4vw, 28px) 48px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 28 }}
      >
        <div>
          <div className="flex items-center gap-2.5 mb-4.5">
            <div
              className="flex items-center justify-center shrink-0 rounded-[10px] bg-white"
              style={{ width: 36, height: 36 }}
            >
              <img src="/logo-localx.svg" alt="LocalXperiences logo" style={{ width: 26, height: 26, objectFit: "contain" }} />
            </div>
            <span style={{ fontSize: "1rem", fontWeight: 800, color: "#fff", letterSpacing: "-.02em" }}>{t("hero_headline_local")}<span style={{ color: "#34E0A1" }}>Xperiences</span>
            </span>
          </div>

          <p style={{ fontSize: ".82rem", color: "rgba(255,255,255,.42)", lineHeight: 1.8, margin: "0 0 24px", maxWidth: 240 }}>
            Discover, book, and share unique local experiences curated for every traveler and local adventurer.
          </p>

          <p style={{ fontSize: ".72rem", fontWeight: 600, color: "rgba(255,255,255,.5)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>{t("footer_newsletter")}</p>

          {subscribed ? (
            <div className="flex items-center gap-2" style={{ color: "#34E0A1", fontSize: ".82rem", fontWeight: 600 }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              You're subscribed!
            </div>
          ) : (
            <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,.12)" }}>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ flex: 1, background: "rgba(255,255,255,.06)", border: "none", outline: "none", padding: "9px 14px", fontFamily: "'Poppins',sans-serif", fontSize: ".78rem", color: "#fff", minWidth: 0 }}
              />
              <button
                onClick={() => {
                  if (email) setSubscribed(true);
                }}
                style={{ background: "#00AA6C", border: "none", color: "#fff", padding: "9px 16px", cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: ".76rem", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0, transition: "background .2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#008A56")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#00AA6C")}
              >{t("footer_subscribe")}</button>
            </div>
          )}
        </div>

        {FOOTER_COLS.map((col) => (
          <div key={col.heading}>
            <h4 style={{ fontSize: ".72rem", fontWeight: 700, color: "rgba(255,255,255,.85)", textTransform: "uppercase", letterSpacing: ".12em", margin: "0 0 18px" }}>
              {col.heading}
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    style={{ fontSize: ".82rem", color: "rgba(255,255,255,.38)", textDecoration: "none", transition: "color .15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#34E0A1")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.38)")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,.07)" }} />

      <div
        className="max-w-300 mx-auto flex items-center justify-between flex-wrap gap-3.5"
        style={{ padding: "20px clamp(16px, 4vw, 28px)" }}
      >
        <span style={{ fontSize: ".75rem", color: "rgba(255,255,255,.25)" }}>
          © {new Date().getFullYear()} LocalXperiences. All rights reserved.
        </span>

        <div className="flex gap-4.5 flex-wrap">
          {BOTTOM_LINKS.map((link) =>
            link.href ? (
              <a
                key={link.label}
                href={link.href}
                style={{ fontSize: ".72rem", color: "rgba(255,255,255,.22)", textDecoration: "none", transition: "color .15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.55)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.22)")}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                style={{ fontSize: ".72rem", color: "rgba(255,255,255,.22)", textDecoration: "none", transition: "color .15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.55)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.22)")}
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      </div>
    </footer>
  );
}
