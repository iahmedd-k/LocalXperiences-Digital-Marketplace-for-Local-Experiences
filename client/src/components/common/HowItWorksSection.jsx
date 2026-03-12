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

export default function HowItWorksSection() {
  return (
    <section style={{ background: "#f8fdf9", padding: "64px 28px", borderTop: "1px solid #E8F5EE", borderBottom: "1px solid #E8F5EE" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>

        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-1.5 mb-4" style={{ background: "#E8F8F2", border: "1px solid #C6F0DC", color: "#00875A", fontSize: ".65rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 100 }}>
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Simple & Fast
          </div>

          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(1.7rem,2.8vw,2.3rem)", fontWeight: 400, color: "#0f2d1a", margin: "0 0 14px", letterSpacing: "-.01em", lineHeight: 1.22 }}>
            From Idea to Experience<br />
            <em style={{ fontStyle: "italic", color: "#00AA6C" }}>in Three Simple Steps</em>
          </h2>

          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".86rem", color: "#6B7280", lineHeight: 1.75, margin: "0 0 28px", maxWidth: 360 }}>
            No complicated forms, no waiting. Find, book, and enjoy authentic local experiences within minutes.
          </p>

          <button
            className="inline-flex items-center gap-2 cursor-pointer"
            style={{ padding: "11px 28px", borderRadius: 100, background: "#0f2d1a", color: "#fff", border: "none", fontFamily: "'Poppins',sans-serif", fontSize: ".85rem", fontWeight: 700, boxShadow: "0 4px 16px rgba(15,45,26,.2)", transition: "all .2s" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#00AA6C"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#0f2d1a"}
          >
            Start Exploring
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Right — vertical steps */}
        <div className="flex flex-col gap-0">
          {STEPS.map((s, i) => (
            <div key={i} className="flex gap-[18px] items-start" style={{ paddingBottom: i < STEPS.length - 1 ? 28 : 0 }}>
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
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
