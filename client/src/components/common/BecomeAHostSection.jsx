import { useState } from "react";

const ACCORDION_ITEMS = [
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: "Create Your Experience Listing",
    desc: "Set up your profile, describe your experience, upload photos, and define pricing — all in under 10 minutes.",
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    title: "Manage Bookings & Availability",
    desc: "Control your calendar, set group sizes, and manage slot availability in real time from your host dashboard.",
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Get Paid Securely",
    desc: "Payments via Stripe deposited directly to you after each completed experience. Transparent fees, no surprises.",
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    title: "Build Your Reputation",
    desc: "Earn verified reviews after every session. Grow your rating, visibility, and repeat bookings over time.",
  },
];

export default function BecomeAHostSection() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="bg-white" style={{ padding: "56px 28px", borderTop: "1px solid #F3F4F6" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>

        {/* Image — clean, no badges */}
        <div className="relative">
          <div className="overflow-hidden relative" style={{ borderRadius: 24, aspectRatio: "4/5" }}>
            <img
              src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=900&q=90"
              alt="Become a host"
              className="w-full h-full object-cover block"
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.28) 0%,transparent 50%)" }} />
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 mb-4" style={{ background: "#F0FDF9", border: "1px solid #C6F0DC", color: "#00875A", fontSize: ".62rem", fontWeight: 700, letterSpacing: ".11em", textTransform: "uppercase", padding: "5px 13px", borderRadius: 100 }}>
            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            For Local Hosts
          </div>

          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(1.45rem,2.2vw,1.9rem)", fontWeight: 400, color: "#0f2d1a", margin: "0 0 10px", letterSpacing: "-.01em", lineHeight: 1.25 }}>
            Turn Your Passion Into a<br />
            <em style={{ fontStyle: "italic", color: "#00AA6C" }}>Thriving Experience</em>
          </h2>

          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".8rem", color: "#6B7280", lineHeight: 1.7, margin: "0 0 24px", maxWidth: 380 }}>
            You know your city better than anyone. Share that knowledge with the world — and earn doing what you love.
          </p>

          {/* Accordion */}
          <div className="flex flex-col mb-[26px]">
            {ACCORDION_ITEMS.map((item, i) => (
              <div key={i} className="overflow-hidden" style={{ borderTop: "1px solid #F3F4F6" }}>
                <button
                  onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-2.5 bg-transparent border-none cursor-pointer text-left"
                  style={{ padding: "13px 0" }}
                >
                  <div className="flex items-center gap-2.5 flex-1">
                    <div
                      className="flex items-center justify-center shrink-0 rounded-lg"
                      style={{ width: 30, height: 30, background: openIdx === i ? "#E8F8F2" : "#F9FAFB", color: openIdx === i ? "#00AA6C" : "#9CA3AF", transition: "all .2s" }}
                    >
                      {item.icon}
                    </div>
                    <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".82rem", fontWeight: openIdx === i ? 700 : 500, color: openIdx === i ? "#0f2d1a" : "#4B5563", transition: "color .2s" }}>
                      {item.title}
                    </span>
                  </div>
                  <svg
                    width="14" height="14" fill="none" stroke={openIdx === i ? "#00AA6C" : "#C4C4C4"} strokeWidth="2.2" viewBox="0 0 24 24"
                    className="shrink-0"
                    style={{ transition: "transform .25s", transform: openIdx === i ? "rotate(180deg)" : "rotate(0deg)" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div style={{ maxHeight: openIdx === i ? 80 : 0, overflow: "hidden", transition: "max-height .3s cubic-bezier(.22,1,.36,1)" }}>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".76rem", color: "#6B7280", lineHeight: 1.65, margin: "0 0 13px", paddingLeft: 40 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #F3F4F6" }} />
          </div>

          {/* CTA buttons */}
          <div className="flex gap-2.5 flex-wrap items-center">
            <button
              className="inline-flex items-center gap-1.5 cursor-pointer"
              style={{ padding: "10px 24px", borderRadius: 100, background: "#0f2d1a", color: "#fff", border: "none", fontFamily: "'Poppins',sans-serif", fontSize: ".8rem", fontWeight: 700, boxShadow: "0 4px 14px rgba(15,45,26,.16)", transition: "all .2s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#00AA6C"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#0f2d1a"}
            >
              Start Hosting — It's Free
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <button
              className="inline-flex items-center gap-1.5 cursor-pointer"
              style={{ padding: "10px 20px", borderRadius: 100, background: "transparent", color: "#6B7280", border: "1.5px solid #E5E7EB", fontFamily: "'Poppins',sans-serif", fontSize: ".8rem", fontWeight: 600, transition: "all .2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0f2d1a"; e.currentTarget.style.color = "#0f2d1a"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#6B7280"; }}
            >
              Learn More
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
