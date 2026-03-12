import { useState } from "react";

const BRAND_GREEN = "#00AA6C";
const BRAND_DARK = "#0f2d1a";

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2.5 no-underline">
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,.12)", flexShrink: 0 }}>
        <svg width="18" height="18" fill="none" stroke={BRAND_GREEN} strokeWidth="2.4" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "1rem", fontWeight: 800, color: BRAND_DARK, letterSpacing: "-.02em" }}>
        Local<span style={{ color: BRAND_GREEN }}>Xperiences</span>
      </span>
    </a>
  );
}

function SocialButton({ icon, label, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
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
      <label style={{ display: "block", fontFamily: "'Poppins',sans-serif", fontSize: ".75rem", fontWeight: 600, color: "#374151", marginBottom: 6, letterSpacing: ".01em" }}>
        {label}
      </label>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 10,
          border: `1.5px solid ${focused ? BRAND_GREEN : "#E5E7EB"}`,
          borderRadius: 12, padding: "0 14px", background: "#fff",
          boxShadow: focused ? `0 0 0 3px rgba(0,170,108,.1)` : "none",
          transition: "all .18s",
        }}
      >
        {icon && <span style={{ color: focused ? BRAND_GREEN : "#9CA3AF", flexShrink: 0, display: "flex", transition: "color .18s" }}>{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: "none", outline: "none", padding: "12px 0",
            fontFamily: "'Poppins',sans-serif", fontSize: ".85rem", color: "#111", background: "transparent",
          }}
        />
        {right}
      </div>
    </div>
  );
}

export default function LoginPage({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);

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
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=90"
          alt="Experience"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,rgba(15,45,26,.82) 0%,rgba(0,100,60,.55) 60%,rgba(0,0,0,.3) 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, padding: "36px 40px", display: "flex", flexDirection: "column", height: "100%", gap: 0 }}>
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
              500+ Experiences Worldwide
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(1.8rem,2.4vw,2.5rem)", fontWeight: 400, color: "#fff", lineHeight: 1.2, margin: "0 0 16px", maxWidth: 340 }}>
              Every Journey Starts with a Single<em style={{ fontStyle: "italic", color: "#34E0A1" }}> Step.</em>
            </h2>
            <p style={{ fontSize: ".82rem", color: "rgba(255,255,255,.6)", lineHeight: 1.75, maxWidth: 300, margin: 0 }}>
              Join thousands of travelers discovering authentic local experiences — from hidden city tours to cultural workshops.
            </p>
          </div>

          {/* Testimonial chip */}
          <div style={{ background: "rgba(255,255,255,.08)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 16, padding: "16px 18px", display: "flex", gap: 12, alignItems: "center" }}>
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80" alt="" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(52,224,161,.4)" }} />
            <div>
              <p style={{ fontSize: ".76rem", color: "rgba(255,255,255,.8)", lineHeight: 1.6, margin: "0 0 4px" }}>"The Lahore food tour was unforgettable — totally changed how I see travel."</p>
              <span style={{ fontSize: ".65rem", color: "rgba(255,255,255,.4)", fontWeight: 600 }}>Sophia L. — Berlin, Germany</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 40px", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Heading */}
          <div className="fade1" style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.9rem", fontWeight: 400, color: BRAND_DARK, margin: "0 0 6px", letterSpacing: "-.01em" }}>Welcome back</h1>
            <p style={{ fontSize: ".83rem", color: "#6B7280", margin: 0 }}>
              Don't have an account?{" "}
              <button onClick={onSwitch} style={{ background: "none", border: "none", color: BRAND_GREEN, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: ".83rem", padding: 0 }}>
                Sign up free
              </button>
            </p>
          </div>

          {/* Social logins */}
          <div className="fade2" style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            <SocialButton
              label="Continue with Google"
              icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <SocialButton
                label="Apple"
                icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="#111"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>}
              />
              <SocialButton
                label="Facebook"
                icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="fade2" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "#F3F4F6" }} />
            <span style={{ fontSize: ".72rem", color: "#9CA3AF", fontWeight: 500, whiteSpace: "nowrap" }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: "#F3F4F6" }} />
          </div>

          {/* Form */}
          <div className="fade3" style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
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
              placeholder="Enter your password"
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

          {/* Remember + forgot */}
          <div className="fade3 flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setRemember(!remember)}
                style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${remember ? BRAND_GREEN : "#D1D5DB"}`, background: remember ? BRAND_GREEN : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .15s", flexShrink: 0 }}
              >
                {remember && <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span style={{ fontSize: ".76rem", color: "#6B7280", fontFamily: "'Poppins',sans-serif" }}>Remember me</span>
            </label>
            <button style={{ background: "none", border: "none", color: BRAND_GREEN, fontSize: ".76rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <div className="fade4">
            <button
              style={{ width: "100%", padding: "13px", borderRadius: 12, background: BRAND_GREEN, color: "#fff", border: "none", fontFamily: "'Poppins',sans-serif", fontSize: ".88rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,170,108,.35)", transition: "all .2s", letterSpacing: ".01em" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#008A56"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = BRAND_GREEN; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Sign in to LocalXperiences
            </button>
          </div>

          {/* Terms note */}
          <p className="fade5" style={{ textAlign: "center", fontSize: ".68rem", color: "#9CA3AF", marginTop: 20, lineHeight: 1.6 }}>
            By continuing, you agree to our{" "}
            <a href="#" style={{ color: BRAND_GREEN, textDecoration: "none", fontWeight: 600 }}>Terms of Service</a>
            {" "}and{" "}
            <a href="#" style={{ color: BRAND_GREEN, textDecoration: "none", fontWeight: 600 }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}