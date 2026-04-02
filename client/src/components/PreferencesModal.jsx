import { useEffect, useRef, useState } from "react";
import { useCurrency, CURRENCIES } from "./Currencycontext";

const REGIONS = [
  { country: "United States",     code: "en", label: "English",    icon: "🇺🇸" },
  { country: "Argentina",         code: "es", label: "Español",    icon: "🇦🇷" },
  { country: "Australia",         code: "en", label: "English",    icon: "🇦🇺" },
  { country: "België",            code: "nl", label: "Nederlands", icon: "🇧🇪" },
  { country: "Belgique",          code: "fr", label: "Français",   icon: "🇧🇪" },
  { country: "Brasil",            code: "pt", label: "Português",  icon: "🇧🇷" },
  { country: "Canada (English)",  code: "en", label: "English",    icon: "🇨🇦" },
  { country: "Canada (Français)", code: "fr", label: "Français",   icon: "🇨🇦" },
  { country: "Chile",             code: "es", label: "Español",    icon: "🇨🇱" },
  { country: "Colombia",          code: "es", label: "Español",    icon: "🇨🇴" },
  { country: "Danmark",           code: "da", label: "Dansk",      icon: "🇩🇰" },
  { country: "Deutschland",       code: "de", label: "Deutsch",    icon: "🇩🇪" },
  { country: "España",            code: "es", label: "Español",    icon: "🇪🇸" },
  { country: "France",            code: "fr", label: "Français",   icon: "🇫🇷" },
  { country: "Hong Kong SAR",     code: "en", label: "English",    icon: "🇭🇰" },
  { country: "India",             code: "en", label: "English",    icon: "🇮🇳" },
  { country: "Indonesia",         code: "id", label: "Indonesia",  icon: "🇮🇩" },
  { country: "Ireland",           code: "en", label: "English",    icon: "🇮🇪" },
  { country: "Italia",            code: "it", label: "Italiano",   icon: "🇮🇹" },
  { country: "Malaysia",          code: "en", label: "English",    icon: "🇲🇾" },
  { country: "México",            code: "es", label: "Español",    icon: "🇲🇽" },
  { country: "Nederland",         code: "nl", label: "Nederlands", icon: "🇳🇱" },
  { country: "New Zealand",       code: "en", label: "English",    icon: "🇳🇿" },
  { country: "Norge",             code: "no", label: "Norsk",      icon: "🇳🇴" },
  { country: "Österreich",        code: "de", label: "Deutsch",    icon: "🇦🇹" },
  { country: "Perú",              code: "es", label: "Español",    icon: "🇵🇪" },
  { country: "Philippines",       code: "en", label: "English",    icon: "🇵🇭" },
  { country: "Portugal",          code: "pt", label: "Português",  icon: "🇵🇹" },
  { country: "Schweiz",           code: "de", label: "Deutsch",    icon: "🇨🇭" },
  { country: "Singapore",         code: "en", label: "English",    icon: "🇸🇬" },
  { country: "South Africa",      code: "en", label: "English",    icon: "🇿🇦" },
  { country: "Suisse",            code: "fr", label: "Français",   icon: "🇨🇭" },
  { country: "Sverige",           code: "sv", label: "Svenska",    icon: "🇸🇪" },
  { country: "Svizzera",          code: "it", label: "Italiano",   icon: "🇨🇭" },
  { country: "Türkiye",           code: "tr", label: "Türkçe",     icon: "🇹🇷" },
  { country: "United Kingdom",    code: "en", label: "English",    icon: "🇬🇧" },
  { country: "Venezuela",         code: "es", label: "Español",    icon: "🇻🇪" },
  { country: "Việt Nam",          code: "vi", label: "Tiếng Việt", icon: "🇻🇳" },
  { country: "Ελλάδα",            code: "el", label: "Ελληνικά",   icon: "🇬🇷" },
  { country: "Россия",            code: "ru", label: "Русский",    icon: "🇷🇺" },
];

export function PreferencesModal({ isOpen, onClose }) {
  const { currency, setCurrency, language, setLanguage } = useCurrency();

  const [tab, setTab] = useState("region");
  const [draftCurrency, setDraftCurrency] = useState(currency);
  const [draftRegionIdx, setDraftRegionIdx] = useState(
    () => Math.max(0, REGIONS.findIndex(r => r.code === language?.code))
  );
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setDraftCurrency(currency);
    setDraftRegionIdx(Math.max(0, REGIONS.findIndex(r => r.code === language?.code)));
    setTab("region");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleSave = () => {
    setCurrency(draftCurrency);
    setLanguage({
      code: REGIONS[draftRegionIdx].code,
      label: REGIONS[draftRegionIdx].label,
      icon: REGIONS[draftRegionIdx].icon,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,.38)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{
        width: "100%", maxWidth: 860, maxHeight: "88vh",
        background: "#fff", borderRadius: 16,
        boxShadow: "0 20px 60px rgba(0,0,0,.18)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{ padding: "22px 28px 0", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#0f2d1a", margin: 0 }}>
              Preferences
            </h2>
            <button
              onClick={onClose}
              style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              aria-label="Close"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>
          </div>
          <div style={{ display: "flex" }}>
            {[{ key: "region", label: "Region and Language" }, { key: "currency", label: "Currency" }].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: "9px 16px", background: "none", border: "none", cursor: "pointer",
                  fontFamily: "'Poppins',sans-serif", fontSize: ".82rem", fontWeight: 600,
                  color: tab === t.key ? "#0f2d1a" : "#94a3b8",
                  borderBottom: tab === t.key ? "2px solid #0f2d1a" : "2px solid transparent",
                  marginBottom: -1, transition: "all .15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "22px 28px" }}>
          {tab === "region" ? (
            <>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: ".75rem", color: "#94a3b8", marginBottom: 14, textTransform: "uppercase", letterSpacing: ".07em" }}>
                Choose a region and language
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 7 }}>
                {REGIONS.map((r, idx) => {
                  const active = draftRegionIdx === idx;
                  return (
                    <button
                      key={r.country + r.label}
                      onClick={() => setDraftRegionIdx(idx)}
                      style={{
                        textAlign: "left", padding: "11px 13px", borderRadius: 10, cursor: "pointer",
                        border: active ? "1.5px solid #0f2d1a" : "1px solid #e2e8f0",
                        background: active ? "#f0fdf4" : "#fff",
                        transition: "all .14s", outline: "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                        <span style={{ fontSize: ".82rem", lineHeight: 1 }}>{r.icon}</span>
                        <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: ".78rem", color: "#0f2d1a" }}>{r.country}</span>
                      </div>
                      <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".71rem", color: "#94a3b8" }}>{r.label}</div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: ".75rem", color: "#94a3b8", marginBottom: 14, textTransform: "uppercase", letterSpacing: ".07em" }}>
                Choose a currency
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 7 }}>
                {CURRENCIES.map((c) => {
                  const active = draftCurrency?.code === c.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => setDraftCurrency(c)}
                      style={{
                        textAlign: "left", padding: "11px 13px", borderRadius: 10, cursor: "pointer",
                        border: active ? "1.5px solid #0f2d1a" : "1px solid #e2e8f0",
                        background: active ? "#f0fdf4" : "#fff",
                        transition: "all .14s", outline: "none",
                      }}
                    >
                      <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: ".8rem", color: "#0f2d1a", marginBottom: 2 }}>
                        {c.name}
                      </div>
                      <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".71rem", color: "#94a3b8", fontWeight: 500 }}>
                        {c.code}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 28px", borderTop: "1px solid #f1f5f9", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        }}>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".72rem", color: "#94a3b8", margin: 0 }}>
            Any changes to the preferences are optional, and will persist through your user session.
          </p>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={onClose}
              style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: ".78rem", color: "#64748b" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{ padding: "8px 22px", borderRadius: 8, border: "none", cursor: "pointer", background: "#0f2d1a", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: ".78rem" }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Navbar Button — reads from context, auto-updates ─────────────────────── */
export function PreferencesButton({ isHome, onClick }) {
  const { currency } = useCurrency();
  const textColor = isHome ? "rgba(255,255,255,.9)" : "#1a2e1f";
  const borderColor = isHome ? "rgba(255,255,255,.28)" : "#D1D5DB";
  const bg = isHome ? "rgba(255,255,255,.07)" : "#ffffff";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Language and currency preferences"
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "6px 13px 6px 10px", borderRadius: 100,
        border: `1px solid ${borderColor}`, background: bg,
        cursor: "pointer", outline: "none",
        transition: "border-color .15s, background .15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = isHome ? "rgba(255,255,255,.55)" : "#a0aec0";
        e.currentTarget.style.background = isHome ? "rgba(255,255,255,.13)" : "#f7faf8";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = borderColor;
        e.currentTarget.style.background = bg;
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke={textColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <span style={{ display: "inline-block", width: 1, height: 13, background: isHome ? "rgba(255,255,255,.3)" : "#D1D5DB", flexShrink: 0 }} />
      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: ".76rem", fontWeight: 600, color: textColor, letterSpacing: ".01em", lineHeight: 1 }}>
        {currency?.code || "USD"}
      </span>
    </button>
  );
}
