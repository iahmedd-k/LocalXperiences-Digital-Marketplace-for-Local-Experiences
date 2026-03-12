import { useState } from "react";

const BRAND_GREEN = "#00AA6C";
const BRAND_DARK = "#0f2d1a";

function SocialButton({ icon, label }) {
  const [h, setH] = useState(false);
  return (
    <button
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        padding: "11px 20px", borderRadius: 12, cursor: "pointer", transition: "all .18s",
        background: h ? "#F9FAFB" : "#fff",
        border: `1.5px solid ${h ? "#D1D5DB" : "#E5E7EB"}`,
        fontFamily: "'Poppins',sans-serif", fontSize: ".84rem", fontWeight: 600, color: "#374151",
        boxShadow: h ? "0 2px 8px rgba(0,0,0,.06)" : "none",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function InputField({ label, type = "text", placeholder, value, onChange, icon, right }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: "block", fontFamily: "'Poppins',sans-serif", fontSize: ".75rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>
        {label}
      </label>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        border: `1.5px solid ${focused ? BRAND_GREEN : "#E5E7EB"}`,
        borderRadius: 12, padding: "0 14px", background: "#fff",
        boxShadow: focused ? `0 0 0 3px rgba(0,170,108,.1)` : "none",
        transition: "all .18s",
      }}>
        {icon && <span style={{ color: focused ? BRAND_GREEN : "#9CA3AF", flexShrink: 0, display: "flex", transition: "color .18s" }}>{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ flex: 1, border: "none", outline: "none", padding: "12px 0", fontFamily: "'Poppins',sans-serif", fontSize: ".85rem", color: "#111", background: "transparent" }}
        />
        {right}
      </div>
    </div>
  );
}

const ROLES = [
  {
    key: "traveler",
    label: "Traveler",
    desc: "Discover & book experiences",
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    key: "host",
    label: "Local Host",
    desc: "List & manage experiences",
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
];

export default function SignupPage({ onSwitch }) {
  const [role, setRole] = useState("traveler");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", minHeight: "100vh", display: "flex", background: "#F9FAFB" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Poppins:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .fade1{animation:fadeUp .5s .05s both} .fade2{animation:fadeUp .5s .15s both}
        .fade3{animation:fadeUp .5s .25s both} .fade4{animation:fadeUp .5s .35s both}
        .fade5{animation:fadeUp .5s .45s both}
      `}</style>

      {/* ── Left panel ── */}
      <div style={{ width: "45%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <img
          src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=1200&q=90"
          alt="Experience"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(155deg,rgba(15,45,26,.88) 0%,rgba(0,90,50,.5) 55%,rgba(0,0,0,.25) 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, padding: "36px 40px", display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 no-underline">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" fill="none" stroke="#34E0A1" strokeWidth="2.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span style={{ fontSize: ".95rem", fontWeight: 800, color: "#fff", letterSpacing: "-.02em" }}>
              Local<span style={{ color: "#34E0A1" }}>Xperiences</span>
            </span>
          </a>

          {/* Center copy */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: 60 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(52,224,161,.15)", border: "1px solid rgba(52,224,161,.3)", color: "#34E0A1", fontSize: ".62rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 100, marginBottom: 20, width: "fit-content" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34E0A1", flexShrink: 0 }} />
              Join 10,000+ Members
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(1.8rem,2.4vw,2.5rem)", fontWeight: 400, color: "#fff", lineHeight: 1.2, margin: "0 0 16px", maxWidth: 320 }}>
              Start Your Local <em style={{ fontStyle: "italic", color: "#34E0A1" }}>Adventure</em> Today.
            </h2>
            <p style={{ fontSize: ".82rem", color: "rgba(255,255,255,.6)", lineHeight: 1.75, maxWidth: 290, margin: "0 0 32px" }}>
              Whether you're here to explore or share your city's hidden gems — there's a place for you.
            </p>

            {/* Feature list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Discover hyper-local hidden experiences",
                "AI-powered personalized recommendations",
                "Flexible booking & group pricing",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(52,224,161,.2)", border: "1px solid rgba(52,224,161,.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="10" height="10" fill="none" stroke="#34E0A1" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span style={{ fontSize: ".78rem", color: "rgba(255,255,255,.7)", lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(255,255,255,.08)", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.1)" }}>
            {[["50+", "Cities"], ["2K+", "Experiences"], ["500+", "Hosts"]].map(([val, lbl]) => (
              <div key={lbl} style={{ padding: "14px 0", textAlign: "center", background: "rgba(255,255,255,.04)" }}>
                <span style={{ display: "block", fontSize: "1.1rem", fontWeight: 800, color: "#34E0A1", lineHeight: 1 }}>{val}</span>
                <span style={{ display: "block", fontSize: ".6rem", fontWeight: 600, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: ".1em", marginTop: 3 }}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 40px", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Heading */}
          <div className="fade1" style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.9rem", fontWeight: 400, color: BRAND_DARK, margin: "0 0 6px", letterSpacing: "-.01em" }}>Create your account</h1>
            <p style={{ fontSize: ".83rem", color: "#6B7280", margin: 0 }}>
              Already have an account?{" "}
              <button onClick={onSwitch} style={{ background: "none", border: "none", color: BRAND_GREEN, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: ".83rem", padding: 0 }}>
                Sign in
              </button>
            </p>
          </div>

          {/* Role selector */}
          <div className="fade1" style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontFamily: "'Poppins',sans-serif", fontSize: ".75rem", fontWeight: 600, color: "#374151", marginBottom: 8 }}>
              I want to join as
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4,
                    padding: "14px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                    transition: "all .18s",
                    background: role === r.key ? "#F0FDF9" : "#fff",
                    border: `1.5px solid ${role === r.key ? BRAND_GREEN : "#E5E7EB"}`,
                    boxShadow: role === r.key ? `0 0 0 3px rgba(0,170,108,.1)` : "none",
                    fontFamily: "'Poppins',sans-serif",
                  }}
                >
                  <span style={{ color: role === r.key ? BRAND_GREEN : "#9CA3AF", transition: "color .18s" }}>{r.icon}</span>
                  <span style={{ fontSize: ".82rem", fontWeight: 700, color: role === r.key ? BRAND_DARK : "#374151", transition: "color .18s" }}>{r.label}</span>
                  <span style={{ fontSize: ".68rem", color: "#9CA3AF", lineHeight: 1.4 }}>{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Social logins */}
          <div className="fade2" style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <SocialButton
              label="Continue with Google"
              icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <SocialButton label="Apple" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="#111"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>} />
              <SocialButton label="Facebook" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>} />
            </div>
          </div>

          {/* Divider */}
          <div className="fade2" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "#F3F4F6" }} />
            <span style={{ fontSize: ".72rem", color: "#9CA3AF", fontWeight: 500, whiteSpace: "nowrap" }}>or sign up with email</span>
            <div style={{ flex: 1, height: 1, background: "#F3F4F6" }} />
          </div>

          {/* Form fields */}
          <div className="fade3" style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
            <InputField
              label="Full name"
              placeholder="Jane Smith"
              value={name}
              onChange={e => setName(e.target.value)}
              icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            />
            <InputField
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            />
            <InputField
              label="Password"
              type={showPass ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" /></svg>}
              right={
                <button onClick={() => setShowPass(!showPass)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", display: "flex", padding: 0, flexShrink: 0 }}>
                  {showPass
                    ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" /></svg>
                    : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              }
            />
          </div>

          {/* Password strength bar */}
          {password.length > 0 && (
            <div className="fade3" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 100, background: password.length >= i * 3 ? (password.length >= 10 ? BRAND_GREEN : password.length >= 6 ? "#F59E0B" : "#EF4444") : "#F3F4F6", transition: "background .3s" }} />
                ))}
              </div>
              <span style={{ fontSize: ".65rem", color: "#9CA3AF" }}>
                {password.length < 6 ? "Weak" : password.length < 10 ? "Fair" : "Strong"} password
              </span>
            </div>
          )}

          {/* Terms checkbox */}
          <div className="fade3" style={{ marginBottom: 20 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
              <div
                onClick={() => setAgreed(!agreed)}
                style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${agreed ? BRAND_GREEN : "#D1D5DB"}`, background: agreed ? BRAND_GREEN : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .15s", flexShrink: 0, marginTop: 1 }}
              >
                {agreed && <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span style={{ fontSize: ".74rem", color: "#6B7280", lineHeight: 1.55, fontFamily: "'Poppins',sans-serif" }}>
                I agree to the{" "}
                <a href="#" style={{ color: BRAND_GREEN, textDecoration: "none", fontWeight: 600 }}>Terms of Service</a>
                {" "}and{" "}
                <a href="#" style={{ color: BRAND_GREEN, textDecoration: "none", fontWeight: 600 }}>Privacy Policy</a>
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="fade4">
            <button
              style={{ width: "100%", padding: "13px", borderRadius: 12, background: BRAND_GREEN, color: "#fff", border: "none", fontFamily: "'Poppins',sans-serif", fontSize: ".88rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,170,108,.35)", transition: "all .2s", letterSpacing: ".01em", opacity: agreed ? 1 : 0.6 }}
              onMouseEnter={e => { if (agreed) { e.currentTarget.style.background = "#008A56"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={e => { e.currentTarget.style.background = BRAND_GREEN; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Create Account — It's Free
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}