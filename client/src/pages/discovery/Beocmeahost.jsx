import { useState } from "react";

// ── Design tokens match LocalXperiences system ────────────────────────────────
// Primary: #00AA6C  Accent: #34E0A1  Dark: #0f2d1a  BG: #f0faf5  Footer: #0c2318

const STEPS = [
  {
    num: "01",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: "Create Your Profile",
    desc: "Sign up and build your host profile. Add your bio, expertise, languages you speak, and a profile photo. Travelers trust hosts who feel real and local.",
    tip: "Hosts with complete profiles get 3× more bookings",
    color: "#E8F8F2",
    accent: "#00AA6C",
  },
  {
    num: "02",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: "List Your Experience",
    desc: "Give your experience a compelling title, rich description, and great photos. Set your category, duration, group size, and price per adult. Takes under 10 minutes.",
    tip: "Listings with 5+ photos earn 40% more revenue",
    color: "#EEF2FF",
    accent: "#4338CA",
  },
  {
    num: "03",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" /><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    title: "Set Availability",
    desc: "Open your calendar and define exactly when you're available. Set recurring slots, block dates you're busy, and control your maximum group size per session.",
    tip: "Hosts offering weekend slots fill up 2× faster",
    color: "#FEF9EC",
    accent: "#92610A",
  },
  {
    num: "04",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Get Paid Securely",
    desc: "Payments are processed via Stripe and deposited directly to you after each completed experience. Transparent fee structure — no hidden charges, ever.",
    tip: "Average host earns $1,200/month within 3 months",
    color: "#F0FFF4",
    accent: "#00AA6C",
  },
];

const PERKS = [
  { icon: "🌍", title: "Global Reach", desc: "Your experience is visible to travelers from 50+ countries browsing LocalXperiences." },
  { icon: "📅", title: "You Control Everything", desc: "Set your own price, availability, group size, and cancellation terms. Full autonomy." },
  { icon: "⭐", title: "Build Your Reputation", desc: "Verified reviews and a public host profile help you grow a loyal audience over time." },
  { icon: "💬", title: "Direct Traveler Q&A", desc: "Travelers can ask questions before booking. Build trust before they even arrive." },
  { icon: "📊", title: "Host Dashboard", desc: "Track earnings, upcoming bookings, and ratings all in one clean dashboard." },
  { icon: "🔒", title: "Secure & Protected", desc: "All payments are Stripe-secured. We handle the transactions — you focus on hosting." },
];

const FAQS = [
  { q: "Do I need to be a professional guide?", a: "Not at all. Anyone with genuine local knowledge and passion can host — food lovers, photographers, hikers, artists, storytellers. If you know something special about your city, you qualify." },
  { q: "How much does it cost to list?", a: "Listing is completely free. LocalXperiences takes a small service fee only when a booking is confirmed — so you only pay when you earn." },
  { q: "How do I get paid?", a: "Payouts are handled via Stripe and deposited directly to your bank account after each completed experience, typically within 1–3 business days." },
  { q: "Can I host multiple experiences?", a: "Absolutely. Many hosts run 3–5 different experiences. You can manage all your listings, calendars, and bookings from a single host dashboard." },
  { q: "What if a traveler cancels?", a: "You set your own cancellation policy when listing. Options include flexible, moderate, and strict — you're in control of the terms." },
  { q: "Is there support if something goes wrong?", a: "Yes. Our host support team is available 7 days a week. We also have a host community forum where experienced hosts share tips and advice." },
];

const STORIES = [
  { name: "Ayesha R.", city: "Islamabad, Pakistan", exp: "Heritage Walking Tours", earnings: "$980/mo", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80", quote: "I started just sharing my love for old Islamabad. Now I host 12 tours a month and met travelers from 18 countries." },
  { name: "Marco T.", city: "Florence, Italy", exp: "Pasta Making Workshop", earnings: "$1,840/mo", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80", quote: "My nonna's recipes, my kitchen, my schedule. LocalXperiences made it possible to share something deeply personal." },
  { name: "Priya K.", city: "Kyoto, Japan", exp: "Tea Ceremony & Zen Walk", earnings: "$1,320/mo", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80", quote: "I was skeptical at first. Three months in, I had to expand to two sessions a day. The demand from travelers is real." },
];

export default function BecomeAHostPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#f0faf5", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }

        .host-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 32px; border-radius: 100px;
          background: #00AA6C; color: #fff; border: none;
          font-family: 'Poppins', sans-serif; font-size: .9rem; font-weight: 700;
          cursor: pointer; transition: all .22s;
          box-shadow: 0 6px 24px rgba(0,170,108,.35);
        }
        .host-btn-primary:hover { background: #008A56; transform: translateY(-2px); box-shadow: 0 10px 32px rgba(0,170,108,.45); }

        .host-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px; border-radius: 100px;
          background: transparent; color: #0f2d1a;
          border: 1.5px solid #C6F0DC;
          font-family: 'Poppins', sans-serif; font-size: .88rem; font-weight: 600;
          cursor: pointer; transition: all .22s;
        }
        .host-btn-ghost:hover { border-color: #00AA6C; color: #00AA6C; background: #f0faf5; }

        .step-card { transition: all .28s cubic-bezier(.22,1,.36,1); cursor: pointer; }
        .step-card:hover { transform: translateY(-4px); }

        .perk-card { transition: all .25s cubic-bezier(.22,1,.36,1); }
        .perk-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,.08) !important; }

        .faq-item { border-top: 1px solid #E8F5EE; overflow: hidden; }
        .faq-btn { width: 100%; display: flex; align-items: center; justify-content: space-between;
          gap: 16px; padding: 20px 0; background: transparent; border: none; cursor: pointer; text-align: left; }

        .story-card { transition: all .28s cubic-bezier(.22,1,.36,1); }
        .story-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,.09) !important; }

        @keyframes floatup { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .anim { animation: floatup .8s cubic-bezier(.22,1,.36,1) forwards; }
        .d1 { animation-delay: .1s; opacity:0; }
        .d2 { animation-delay: .22s; opacity:0; }
        .d3 { animation-delay: .36s; opacity:0; }
        .d4 { animation-delay: .50s; opacity:0; }

        @keyframes shimmer { from{background-position:200% center} to{background-position:-200% center} }
        .shimmer-text {
          background: linear-gradient(90deg, #00AA6C, #34E0A1, #00AA6C);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(240,250,245,.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid #D1FAE5", padding: "0 10px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#0f2d1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" fill="none" stroke="#34E0A1" strokeWidth="2.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span style={{ fontSize: "1rem", fontWeight: 800, color: "#0f2d1a", letterSpacing: "-.02em" }}>
              Local<span style={{ color: "#00AA6C" }}>Xperiences</span>
            </span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="#" style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".82rem", fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>
              ← Back to Home
            </a>
            <button className="host-btn-primary" style={{ padding: "10px 24px", fontSize: ".82rem" }}>
              Start Hosting — It's Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: "#0f2d1a", position: "relative", overflow: "hidden", padding: "96px 28px 100px" }}>
        {/* Background texture */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(52,224,161,.06) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -120, right: -80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,170,108,.18) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -40, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,224,161,.10) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          {/* Badge */}
          <div className="anim d1" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(52,224,161,.12)", border: "1.5px solid rgba(52,224,161,.30)", color: "#34E0A1", fontSize: ".65rem", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", padding: "7px 20px", borderRadius: 100, marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34E0A1", display: "inline-block", flexShrink: 0, boxShadow: "0 0 8px rgba(52,224,161,.9)" }} />
            Join 500+ hosts across 50+ cities
          </div>

          <h1 className="anim d2" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 400, color: "#fff", lineHeight: 1.1, letterSpacing: "-.02em", marginBottom: 20 }}>
            Share What You Love.<br />
            <em className="shimmer-text" style={{ fontStyle: "italic" }}>Earn Doing It.</em>
          </h1>

          <p className="anim d3" style={{ fontSize: ".95rem", color: "rgba(255,255,255,.6)", lineHeight: 1.8, marginBottom: 36, maxWidth: 560, margin: "0 auto 36px" }}>
            Turn your local knowledge into unforgettable experiences for travelers from around the world. Set your own schedule, your own price, your own rules.
          </p>

          <div className="anim d4" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="host-btn-primary" style={{ fontSize: ".92rem", padding: "15px 36px" }}>
              Start Hosting — It's Free
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
            <button className="host-btn-ghost" style={{ color: "rgba(255,255,255,.75)", borderColor: "rgba(255,255,255,.2)", fontSize: ".88rem" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#34E0A1"; e.currentTarget.style.color = "#34E0A1"; e.currentTarget.style.background = "rgba(52,224,161,.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; e.currentTarget.style.color = "rgba(255,255,255,.75)"; e.currentTarget.style.background = "transparent"; }}>
              Watch how it works
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M10 8l6 4-6 4V8z" /></svg>
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 0, justifyContent: "center", marginTop: 56, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, overflow: "hidden", maxWidth: 600, margin: "56px auto 0" }}>
            {[
              { val: "500+", lbl: "Active Hosts" },
              { val: "$1.2K", lbl: "Avg Monthly Earn" },
              { val: "4.9★", lbl: "Host Rating" },
              { val: "50+", lbl: "Cities" },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: "20px 12px", textAlign: "center", borderLeft: i > 0 ? "1px solid rgba(255,255,255,.08)" : "none" }}>
                <span style={{ display: "block", fontSize: "1.3rem", fontWeight: 800, color: "#34E0A1", lineHeight: 1.1 }}>{s.val}</span>
                <span style={{ display: "block", fontSize: ".58rem", fontWeight: 600, color: "rgba(255,255,255,.38)", textTransform: "uppercase", letterSpacing: ".1em", marginTop: 4 }}>{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: "#fff", padding: "88px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#E8F8F2", border: "1px solid #C6F0DC", color: "#00875A", fontSize: ".63rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 100, marginBottom: 14 }}>
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Simple Process
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 400, color: "#0f2d1a", margin: "0 0 12px", letterSpacing: "-.01em" }}>
              How to Become a Host
            </h2>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".9rem", color: "#6B7280", maxWidth: 480, margin: "0 auto" }}>
              From sign-up to your first booking in 4 straightforward steps
            </p>
          </div>

          {/* Step selector tabs */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 40, flexWrap: "wrap" }}>
            {STEPS.map((s, i) => (
              <button key={i} onClick={() => setActiveStep(i)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", borderRadius: 100, fontFamily: "'Poppins',sans-serif", fontSize: ".8rem", fontWeight: 600, cursor: "pointer", transition: "all .2s", border: "1.5px solid", background: activeStep === i ? "#0f2d1a" : "#fff", color: activeStep === i ? "#fff" : "#6B7280", borderColor: activeStep === i ? "#0f2d1a" : "#E5E7EB", boxShadow: activeStep === i ? "0 4px 14px rgba(15,45,26,.18)" : "none" }}>
                <span style={{ fontWeight: 700, fontSize: ".72rem", opacity: .7 }}>{s.num}</span>
                {s.title}
              </button>
            ))}
          </div>

          {/* Active step detail */}
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: activeStep === i ? "grid" : "none", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
              {/* Left — big icon + number */}
              <div style={{ background: s.color, borderRadius: 28, padding: "52px 40px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 24, position: "relative", overflow: "hidden", minHeight: 320 }}>
                <div style={{ position: "absolute", top: -30, right: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.4)", pointerEvents: "none" }} />
                <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: "5rem", fontWeight: 400, color: s.accent, opacity: .15, lineHeight: 1, position: "absolute", bottom: 16, right: 28 }}>{s.num}</span>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: s.accent, boxShadow: "0 4px 20px rgba(0,0,0,.08)" }}>
                  {s.icon}
                </div>
                <div>
                  <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.8rem", fontWeight: 400, color: "#0f2d1a", margin: "0 0 8px" }}>{s.title}</h3>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: `1px solid ${s.accent}22`, color: s.accent, fontSize: ".68rem", fontWeight: 700, padding: "4px 12px", borderRadius: 100 }}>
                    💡 {s.tip}
                  </div>
                </div>
              </div>
              {/* Right — description + nav */}
              <div>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".95rem", color: "#4B5563", lineHeight: 1.85, marginBottom: 32 }}>{s.desc}</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setActiveStep(Math.max(0, i - 1))} disabled={i === 0}
                    style={{ width: 40, height: 40, borderRadius: "50%", border: "1.5px solid #E5E7EB", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: i === 0 ? "not-allowed" : "pointer", opacity: i === 0 ? .35 : 1, transition: "all .18s" }}>
                    <svg width="16" height="16" fill="none" stroke="#0f2d1a" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" /></svg>
                  </button>
                  <button onClick={() => setActiveStep(Math.min(STEPS.length - 1, i + 1))} disabled={i === STEPS.length - 1}
                    style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: i === STEPS.length - 1 ? "#E5E7EB" : "#0f2d1a", display: "flex", alignItems: "center", justifyContent: "center", cursor: i === STEPS.length - 1 ? "not-allowed" : "pointer", opacity: i === STEPS.length - 1 ? .5 : 1, transition: "all .18s" }}>
                    <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" /></svg>
                  </button>
                  {i < STEPS.length - 1 && (
                    <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".78rem", color: "#9CA3AF", display: "flex", alignItems: "center", marginLeft: 6 }}>
                      Next: {STEPS[i + 1].title}
                    </span>
                  )}
                  {i === STEPS.length - 1 && (
                    <button className="host-btn-primary" style={{ marginLeft: 6, padding: "10px 22px", fontSize: ".8rem" }}>
                      I'm Ready — Let's Go!
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PERKS ── */}
      <section style={{ background: "#f8fdf9", padding: "80px 28px", borderTop: "1px solid #E8F5EE", borderBottom: "1px solid #E8F5EE" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.7rem, 2.8vw, 2.4rem)", fontWeight: 400, color: "#0f2d1a", margin: "0 0 10px", letterSpacing: "-.01em" }}>
              Why Host on LocalXperiences?
            </h2>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".88rem", color: "#6B7280" }}>
              Everything you need to run a successful experience business
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {PERKS.map((p, i) => (
              <div key={i} className="perk-card" style={{ background: "#fff", borderRadius: 20, padding: "28px 26px", border: "1px solid #F3F4F6", boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
                <div style={{ fontSize: "1.6rem", marginBottom: 14 }}>{p.icon}</div>
                <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".95rem", fontWeight: 700, color: "#0f2d1a", margin: "0 0 8px" }}>{p.title}</h3>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".82rem", color: "#6B7280", lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOST STORIES ── */}
      <section style={{ background: "#fff", padding: "80px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 44, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FEF9EC", border: "1px solid #FDE68A", color: "#92610A", fontSize: ".63rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 100, marginBottom: 12 }}>
                ⭐ Real Host Stories
              </div>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.7rem, 2.8vw, 2.3rem)", fontWeight: 400, color: "#0f2d1a", margin: 0, letterSpacing: "-.01em" }}>
                Hosts Who Took the Leap
              </h2>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
            {STORIES.map((s, i) => (
              <div key={i} className="story-card" style={{ background: "#f8fdf9", borderRadius: 24, padding: "28px", border: "1px solid #E8F5EE", boxShadow: "0 2px 14px rgba(0,0,0,.04)" }}>
                {/* Quote */}
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "2.4rem", color: "#C6F0DC", lineHeight: 1, marginBottom: 6 }}>"</div>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".85rem", color: "#4B5563", lineHeight: 1.8, margin: "0 0 22px", fontStyle: "italic" }}>{s.quote}</p>
                {/* Author */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid #E8F5EE", paddingTop: 18 }}>
                  <img src={s.avatar} alt={s.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid #C6F0DC" }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".85rem", fontWeight: 700, color: "#0f2d1a", display: "block" }}>{s.name}</span>
                    <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".72rem", color: "#6B7280", display: "block" }}>{s.exp} · {s.city}</span>
                  </div>
                  <div style={{ background: "#E8F8F2", border: "1px solid #C6F0DC", borderRadius: 10, padding: "6px 12px", textAlign: "center" }}>
                    <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".75rem", fontWeight: 800, color: "#00AA6C", display: "block" }}>{s.earnings}</span>
                    <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".58rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: ".08em" }}>earned</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: "#f8fdf9", padding: "80px 28px", borderTop: "1px solid #E8F5EE" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.7rem, 2.8vw, 2.3rem)", fontWeight: 400, color: "#0f2d1a", margin: "0 0 10px", letterSpacing: "-.01em" }}>
              Common Questions
            </h2>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".88rem", color: "#6B7280" }}>
              Everything you need to know before hosting your first experience
            </p>
          </div>
          <div>
            {FAQS.map((f, i) => (
              <div key={i} className="faq-item">
                <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".92rem", fontWeight: openFaq === i ? 700 : 600, color: openFaq === i ? "#0f2d1a" : "#374151", flex: 1, textAlign: "left" }}>{f.q}</span>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: openFaq === i ? "#0f2d1a" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>
                    <svg width="14" height="14" fill="none" stroke={openFaq === i ? "#fff" : "#6B7280"} strokeWidth="2.4" viewBox="0 0 24 24" style={{ transition: "transform .25s", transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div style={{ maxHeight: openFaq === i ? 200 : 0, overflow: "hidden", transition: "max-height .35s cubic-bezier(.22,1,.36,1)" }}>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".85rem", color: "#6B7280", lineHeight: 1.8, paddingBottom: 20 }}>{f.a}</p>
                </div>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #E8F5EE" }} />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: "#0f2d1a", padding: "88px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(52,224,161,.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,170,108,.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(52,224,161,.12)", border: "1.5px solid rgba(52,224,161,.25)", color: "#34E0A1", fontSize: ".65rem", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", padding: "7px 18px", borderRadius: 100, marginBottom: 22 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34E0A1", display: "inline-block", boxShadow: "0 0 6px rgba(52,224,161,.8)" }} />
            Ready when you are
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, color: "#fff", margin: "0 0 16px", letterSpacing: "-.01em", lineHeight: 1.15 }}>
            Your First Experience<br />
            <em style={{ fontStyle: "italic", color: "#34E0A1" }}>Is Just a Few Clicks Away.</em>
          </h2>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".9rem", color: "rgba(255,255,255,.55)", lineHeight: 1.8, margin: "0 0 36px" }}>
            No commitment. No upfront cost. List your first experience for free and see bookings come in.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="host-btn-primary" style={{ fontSize: ".92rem", padding: "15px 36px" }}>
              Become a Host — Start Free
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
            <button className="host-btn-ghost"
              style={{ color: "rgba(255,255,255,.6)", borderColor: "rgba(255,255,255,.15)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#34E0A1"; e.currentTarget.style.color = "#34E0A1"; e.currentTarget.style.background = "rgba(52,224,161,.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "rgba(255,255,255,.6)"; e.currentTarget.style.background = "transparent"; }}>
              Talk to a Host Advisor
            </button>
          </div>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".75rem", color: "rgba(255,255,255,.25)", marginTop: 20 }}>
            Free to list · No hidden fees · Cancel anytime
          </p>
        </div>
      </section>

    </div>
  );
}