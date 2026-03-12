import { useState } from "react";

const FOOTER_COLS = [
  { heading: "Explore", links: ["Experiences Near Me", "Trending This Week", "Food & Drink Tours", "Adventure Activities", "Cultural Workshops", "Photography Walks"] },
  { heading: "Company", links: ["About Us", "How It Works", "Become a Host", "Press & Media", "Careers", "Blog"] },
  { heading: "Support", links: ["Help Centre", "Booking FAQs", "Cancellation Policy", "Safety Guidelines", "Contact Us", "Report an Issue"] },
];

const SOCIAL_ICONS = [
  { label: "Instagram", d: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01M7.5 2h9A5.5 5.5 0 0122 7.5v9a5.5 5.5 0 01-5.5 5.5h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2z" },
  { label: "X", d: "M4 4l16 16M4 20L20 4" },
  { label: "Facebook", d: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
  { label: "LinkedIn", d: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer style={{ background: "#0c2318", fontFamily: "'Poppins',sans-serif" }}>
      {/* Main grid */}
      <div
        className="max-w-[1200px] mx-auto px-7"
        style={{ padding: "60px 28px 48px", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 48 }}
      >
        {/* Brand col */}
        <div>
          <div className="flex items-center gap-2.5 mb-[18px]">
            <div
              className="flex items-center justify-center shrink-0 rounded-[10px] bg-white"
              style={{ width: 36, height: 36 }}
            >
              <svg width="18" height="18" fill="none" stroke="#00AA6C" strokeWidth="2.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span style={{ fontSize: "1rem", fontWeight: 800, color: "#fff", letterSpacing: "-.02em" }}>
              Local<span style={{ color: "#34E0A1" }}>Xperiences</span>
            </span>
          </div>

          <p style={{ fontSize: ".82rem", color: "rgba(255,255,255,.42)", lineHeight: 1.8, margin: "0 0 24px", maxWidth: 240 }}>
            Discover, book, and share unique local experiences — curated for every traveler and local adventurer.
          </p>

          <p style={{ fontSize: ".72rem", fontWeight: 600, color: "rgba(255,255,255,.5)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
            Stay in the loop
          </p>

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
                onClick={() => { if (email) setSubscribed(true); }}
                style={{ background: "#00AA6C", border: "none", color: "#fff", padding: "9px 16px", cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: ".76rem", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0, transition: "background .2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#008A56"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#00AA6C"}
              >
                Subscribe
              </button>
            </div>
          )}
        </div>

        {/* Link columns */}
        {FOOTER_COLS.map((col) => (
          <div key={col.heading}>
            <h4 style={{ fontSize: ".72rem", fontWeight: 700, color: "rgba(255,255,255,.85)", textTransform: "uppercase", letterSpacing: ".12em", margin: "0 0 18px" }}>
              {col.heading}
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              {col.links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    style={{ fontSize: ".82rem", color: "rgba(255,255,255,.38)", textDecoration: "none", transition: "color .15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#34E0A1"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,.38)"}
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,.07)" }} />

      {/* Bottom bar */}
      <div
        className="max-w-[1200px] mx-auto px-7 flex items-center justify-between flex-wrap gap-3.5"
        style={{ padding: "20px 28px" }}
      >
        <span style={{ fontSize: ".75rem", color: "rgba(255,255,255,.25)" }}>
          © {new Date().getFullYear()} LocalXperiences. All rights reserved.
        </span>

        <div className="flex gap-2.5">
          {SOCIAL_ICONS.map((s) => (
            <a
              key={s.label}
              href="#"
              style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.09)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .18s", color: "rgba(255,255,255,.35)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(52,224,161,.12)"; e.currentTarget.style.borderColor = "rgba(52,224,161,.3)"; e.currentTarget.style.color = "#34E0A1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.09)"; e.currentTarget.style.color = "rgba(255,255,255,.35)"; }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d={s.d} />
              </svg>
            </a>
          ))}
        </div>

        <div className="flex gap-[18px]">
          {["Privacy Policy", "Terms of Use", "Cookie Settings"].map((l) => (
            <a
              key={l}
              href="#"
              style={{ fontSize: ".72rem", color: "rgba(255,255,255,.22)", textDecoration: "none", transition: "color .15s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,.55)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,.22)"}
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
