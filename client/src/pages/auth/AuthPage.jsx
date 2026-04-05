import useTranslation from '../../hooks/useTranslation.js';
import { useState } from "react";
import { Compass, Home } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { login, signup, googleLogin } from "../../services/authService.js";
import { setCredentials } from "../../slices/authSlice.js";

const BRAND = "#00AA6C";

/* ── Icons ── */
const EyeOn = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOff = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
  </svg>
);
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
const LocationIcon = () => (
  <svg width="20" height="20" fill="none" stroke={BRAND} strokeWidth="2.2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);

/* ── Field ── */
function Field({ label, type = "text", placeholder, value, onChange, icon, right }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontSize: "0.75rem",
        fontWeight: 600,
        color: focused ? BRAND : "#64748b",
        transition: "color 0.15s",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {label}
      </label>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 14px",
        borderRadius: 12,
        border: `1.5px solid ${focused ? BRAND : "#e2e8f0"}`,
        background: focused ? "#fff" : "#f8fafc",
        boxShadow: focused ? "0 0 0 3px rgba(0,170,108,0.1)" : "none",
        transition: "all 0.15s",
        height: 48,
      }}>
        {icon && (
          <span style={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            color: focused ? BRAND : "#94a3b8",
            transition: "color 0.15s",
          }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "0.875rem",
            color: "#0f172a",
            fontFamily: "'DM Sans', sans-serif",
            height: "100%",
          }}
        />
        {right}
      </div>
    </div>
  );
}

/* ── Google Btn ── */
function GoogleBtn({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center justify-center gap-2.5 w-full py-3 px-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-all duration-150 hover:border-slate-300 hover:shadow-sm cursor-pointer">
      <GoogleIcon /> Continue with Google
    </button>
  );
}

/* ── Divider ── */
function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-slate-100" />
      <span className="text-xs text-slate-400 font-medium">or</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

/* ── Login ── */
function LoginForm({ onSwitch, onLogin, onGoogle }) {
  const { t } = useTranslation();
  const [email, setEmail]   = useState("");
  const [pw, setPw]         = useState("");
  const [show, setShow]     = useState(false);
  const [rem, setRem]       = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
          Sign in
        </h1>
        <p className="text-sm text-slate-500">
          Don't have an account?{" "}
          <button type="button" onClick={onSwitch} className="font-semibold border-none bg-transparent cursor-pointer p-0 text-sm" style={{ color: BRAND }}>
            Create one
          </button>
        </p>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-3">
        <Field
          label="Email address" type="email" placeholder="you@example.com"
          value={email} onChange={e => setEmail(e.target.value)}
          icon={<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
        />
        <Field
          label="Password" type={show ? "text" : "password"} placeholder="Enter your password"
          value={pw} onChange={e => setPw(e.target.value)}
          icon={<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4"/></svg>}
          right={
            <button type="button" onClick={() => setShow(!show)} className="flex shrink-0 p-0 border-none bg-transparent cursor-pointer text-slate-400 hover:text-slate-600 transition-colors">
              {show ? <EyeOff /> : <EyeOn />}
            </button>
          }
        />
      </div>

      {/* Remember + Forgot */}
      <div className="flex items-center justify-between -mt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setRem(!rem)}
            className="flex items-center justify-center rounded-md border-2 shrink-0 transition-all duration-150 cursor-pointer"
            style={{ width: 17, height: 17, borderColor: rem ? BRAND : "#cbd5e1", background: rem ? BRAND : "#fff" }}
          >
            {rem && <svg width="9" height="9" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
          </div>
          <span className="text-xs text-slate-500">Remember me</span>
        </label>
        <button type="button" className="text-xs font-semibold border-none bg-transparent cursor-pointer p-0" style={{ color: BRAND }}>
          Forgot password?
        </button>
      </div>

      {/* CTA */}
      <form onSubmit={async (e) => {
        e.preventDefault();
        if (!email || !pw) return toast.error("Please enter email and password");
        setLoading(true);
        await onLogin({ email, password: pw });
        setLoading(false);
      }}>
      <button
        type="submit"
        className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-150 hover:-translate-y-px cursor-pointer border-none"
        style={{
          background: loading ? "#94a3b8" : `linear-gradient(135deg, ${BRAND} 0%, #009960 100%)`,
          boxShadow: loading ? "none" : "0 4px 20px rgba(0,170,108,0.28)",
        }}
      >
        {loading
          ? <><svg className="animate-spin" width="15" height="15" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83"/></svg> Signing in...</>
          : "Sign in"
        }
      </button>
      </form>

      <Divider />
      <GoogleBtn onClick={onGoogle} />

      <p className="text-center text-slate-400 leading-relaxed" style={{ fontSize: "0.68rem" }}>
        By continuing, you agree to our{" "}
        <a href="#" className="font-semibold no-underline hover:underline" style={{ color: BRAND }}>Terms</a>
        {" "}&amp;{" "}
        <a href="#" className="font-semibold no-underline hover:underline" style={{ color: BRAND }}>{t("footer_privacy")}</a>
      </p>
    </div>
  );
}

/* ── Signup ── */
function SignupForm({ onSwitch, onSignup, onGoogle }) {
  const { t } = useTranslation();
  const [role, setRole]     = useState("traveler");
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [pw, setPw]         = useState("");
  const [show, setShow]     = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 10 ? 2 : pw.length < 14 ? 3 : 4;
  const sLabel   = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const sColor   = ["", "#ef4444", "#f59e0b", "#3b82f6", BRAND][strength];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
          Create account
        </h1>
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <button type="button" onClick={onSwitch} className="font-semibold border-none bg-transparent cursor-pointer p-0 text-sm" style={{ color: BRAND }}>
            Sign in
          </button>
        </p>
      </div>

      {/* Role selector */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-slate-500">I want to join as</p>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { key: "traveler", label: "Traveler", desc: "Discover & book", icon: <Compass size={18} /> },
            { key: "host", label: "Local Host", desc: "List experiences", icon: <Home size={18} /> },
          ].map(({ key, label, desc, icon }) => (
            <button
              key={key} type="button" onClick={() => setRole(key)}
              className="flex flex-col gap-2 p-3.5 rounded-xl text-left cursor-pointer transition-all duration-150 border-none"
              style={{
                background: role === key ? "#f0fdf9" : "#f8fafc",
                border: `1.5px solid ${role === key ? BRAND : "#e2e8f0"}`,
                boxShadow: role === key ? `0 0 0 3px rgba(0,170,108,0.08)` : "none",
              }}
            >
              <span style={{ color: role === key ? BRAND : "#94a3b8" }}>{icon}</span>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-none mb-0.5">{label}</p>
                <p className="text-slate-400 leading-none" style={{ fontSize: "0.68rem" }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-3">
        <Field
          label="Full name" placeholder="Jane Smith"
          value={name} onChange={e => setName(e.target.value)}
          icon={<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
        />
        <Field
          label="Email address" type="email" placeholder="you@example.com"
          value={email} onChange={e => setEmail(e.target.value)}
          icon={<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
        />
        <Field
          label="Password" type={show ? "text" : "password"} placeholder="Min. 8 characters"
          value={pw} onChange={e => setPw(e.target.value)}
          icon={<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4"/></svg>}
          right={
            <button type="button" onClick={() => setShow(!show)} className="flex shrink-0 p-0 border-none bg-transparent cursor-pointer text-slate-400 hover:text-slate-600 transition-colors">
              {show ? <EyeOff /> : <EyeOn />}
            </button>
          }
        />
      </div>

      {/* Password strength */}
      {pw.length > 0 && (
        <div className="-mt-2">
          <div className="flex gap-1 mb-1">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{ background: i <= strength ? sColor : "#e2e8f0" }} />
            ))}
          </div>
          <span className="text-xs font-semibold" style={{ color: sColor }}>{sLabel}</span>
        </div>
      )}

      {/* Terms */}
      <label className="flex items-start gap-2.5 cursor-pointer select-none -mt-1">
        <div
          onClick={() => setAgreed(!agreed)}
          className="flex items-center justify-center shrink-0 rounded-md border-2 transition-all duration-150 cursor-pointer mt-0.5"
          style={{ width: 17, height: 17, borderColor: agreed ? BRAND : "#cbd5e1", background: agreed ? BRAND : "#fff" }}
        >
          {agreed && <svg width="9" height="9" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
        </div>
        <span className="text-xs text-slate-500 leading-relaxed">
          I agree to the{" "}
          <a href="#" className="font-semibold no-underline hover:underline" style={{ color: BRAND }}>Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="font-semibold no-underline hover:underline" style={{ color: BRAND }}>{t("footer_privacy")}</a>
        </span>
      </label>

      {/* CTA */}
      <form onSubmit={async (e) => {
        e.preventDefault();
        if (!agreed) return;
        if (!name || !email || !pw) return toast.error("Please complete all required fields");
        setLoading(true);
        await onSignup({ name, email, password: pw, role });
        setLoading(false);
      }}>
      <button
        type="submit"
        className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-150 border-none"
        style={{
          background: !agreed || loading ? "#cbd5e1" : `linear-gradient(135deg, ${BRAND} 0%, #009960 100%)`,
          boxShadow: agreed && !loading ? "0 4px 20px rgba(0,170,108,0.28)" : "none",
          cursor: !agreed ? "not-allowed" : "pointer",
        }}
        onMouseEnter={e => { if (agreed && !loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
      >
        {loading
          ? <><svg className="animate-spin" width="15" height="15" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83"/></svg> Creating account...</>
          : "Create account"
        }
      </button>
      </form>

      <Divider />
      <GoogleBtn onClick={onGoogle} />
    </div>
  );
}

/* ── Root ── */
export default function AuthPage({
  defaultMode = "login",
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState(defaultMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const AUTH_PATHS = ['/login', '/signup'];
  const from = (() => {
    const rawFrom = location.state?.from;
    if (!rawFrom) return null;

    if (typeof rawFrom === 'string') {
      const [rawPath = ''] = rawFrom.split('?');
      const normalizedPath = rawPath.split('#')[0] || '/';
      return AUTH_PATHS.includes(normalizedPath) ? null : rawFrom;
    }

    if (typeof rawFrom === 'object') {
      const pathname = rawFrom.pathname || '/';
      if (AUTH_PATHS.includes(pathname)) return null;
      return `${pathname}${rawFrom.search || ''}${rawFrom.hash || ''}`;
    }

    return null;
  })();

  const handleLogin = async (payload) => {
    try {
      const res = await login(payload);
      const { user, token } = res.data.data;
      dispatch(setCredentials({ user, token }));
      toast.success("Signed in successfully");
      navigate(from || "/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    }
  };

  const handleSignup = async (payload) => {
    try {
      const res = await signup(payload);
      const { user, token } = res.data.data;
      dispatch(setCredentials({ user, token }));
      toast.success("Account created successfully");
      // Hosts go to profile setup first; travellers go back to where they came from
      navigate(user?.role === "host" ? "/host/profile" : (from || "/"));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Signup failed");
    }
  };

  const handleGoogle = () => {
    googleLogin();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* Full page — subtle dot pattern bg */}
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          background: "#f8fafc",
          backgroundImage: "radial-gradient(circle, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 16px",
          boxSizing: "border-box",
        }}
      >
        {/* Logo */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, textDecoration: "none" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0fdf9", border: "1.5px solid rgba(0,170,108,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/logo-localx.svg" alt="LocalXperiences logo" style={{ width: 24, height: 24, objectFit: "contain" }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a", letterSpacing: "-0.02em", fontFamily: "'DM Sans', sans-serif" }}>{t("hero_headline_local")}<span style={{ color: BRAND }}>Xperiences</span>
          </span>
        </a>

        {/* Card */}
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            background: "#fff",
            borderRadius: 20,
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {/* Tab toggle */}
          <div style={{ display: "flex", background: "#f8fafc", padding: "6px 6px 0 6px", gap: 4 }}>
            {["login", "signup"].map(tab => (
              <button
                type="button"
                key={tab} onClick={() => setMode(tab)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: "8px 8px 0 0",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  transition: "all 0.2s",
                  background: mode === tab ? "#fff" : "transparent",
                  color: mode === tab ? "#0f172a" : "#94a3b8",
                  borderBottom: mode === tab ? `2px solid ${BRAND}` : "2px solid transparent",
                }}
              >
                {tab === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          {/* Form */}
          <div style={{ padding: "32px 32px 28px" }}>
          <div key={mode} className="fade-up">
            {mode === "login"
              ? <LoginForm onSwitch={() => setMode("signup")} onLogin={handleLogin} onGoogle={handleGoogle} />
              : <SignupForm onSwitch={() => setMode("login")} onSignup={handleSignup} onGoogle={handleGoogle} />
            }
          </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-slate-400 text-center">
          © {new Date().getFullYear()} LocalXperiences · All rights reserved
        </p>
      </div>
    </>
  );
}
