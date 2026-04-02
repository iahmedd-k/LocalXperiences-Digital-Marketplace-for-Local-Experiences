import { useEffect, useRef, useState } from "react";
import { useCurrency } from "./Currencycontext";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { PreferencesButton, PreferencesModal } from "./PreferencesModal";
import useTranslation from "../hooks/useTranslation";

const NAV_ITEMS = [
  { key: "Home", labelKey: "nav_home", to: "/" },
  { key: "Search", labelKey: "nav_search", to: "/search" },
  { key: "Pathways", labelKey: "nav_pathways", to: "/pathways" },
  { key: "Stories", labelKey: "nav_stories", to: "/stories" },
  { key: "About", labelKey: "nav_about", to: "/about" },
  { key: "Contact", labelKey: "nav_contact", to: "/contact" },
  { key: "Host", labelKey: "nav_become_host", to: "/become-host" },
];

const BASE_PROFILE_ITEMS = [
  { labelKey: "nav_profile", to: "/profile" },
  { labelKey: "nav_my_bookings", to: "/my-bookings" },
  { labelKey: "nav_my_rewards", to: "/rewards" },
  { labelKey: "nav_wishlist", to: "/wishlist" },
];

const HOST_PROFILE_ITEMS = [
  { labelKey: "nav_host_dashboard", to: "/host/dashboard" },
  { labelKey: "nav_create_experience", to: "/host/experiences/create" },
];

const HOST_SETUP_ITEM = [{ labelKey: "nav_complete_host_profile", to: "/host/setup-profile" }];


export default function Navbar({ activeNav, setActiveNav, onMenuToggle, isDashboard: isDashboardProp }) {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { currency: selectedCurrency, language: selectedLanguage } = useCurrency();
  const { t } = useTranslation();
  const menuRef = useRef(null);

  const isHome = location.pathname === "/";
  const isExperienceDetail = location.pathname.startsWith("/experiences/");
  const isHost = user?.role === "host";
  const isDashboard = isDashboardProp || location.pathname.startsWith("/host");
  const hasHostProfile = Boolean(user?.bio?.trim() && user?.phone?.trim());

  const profileItems = isHost
    ? [...BASE_PROFILE_ITEMS, ...(hasHostProfile ? HOST_PROFILE_ITEMS : HOST_SETUP_ITEM)]
    : BASE_PROFILE_ITEMS;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close preferences modal
  const handlePreferencesClose = () => {
    setPreferencesOpen(false);
  };

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDocumentClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isMobile = windowWidth <= 1024;
  const sidebarWidth = 250;

  return (
    <>
      <header
        className="navbar-shell"
        style={{
          position: isExperienceDetail ? "relative" : "fixed",
          top: 0,
          left: (isDashboard && !isMobile) ? sidebarWidth : 0,
          right: 0,
          width: (isDashboard && !isMobile) ? `calc(100% - ${sidebarWidth}px)` : "100%",
          zIndex: 50,
          padding: isDashboard ? 0 : (isMobile ? "12px 16px" : "14px clamp(14px, 4vw, 28px)"),
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        <div
          className="mx-auto w-full navbar-inner"
          style={{
            maxWidth: isDashboard ? '100%' : 1280,
            background: isDashboard 
              ? "#fff"
              : (isHome
                  ? (isScrolled ? "rgba(7,15,11,.76)" : "rgba(0,0,0,.28)")
                  : (isScrolled ? "rgba(255,255,255,.96)" : "rgba(255,255,255,.92)")),
            backdropFilter: isDashboard ? "none" : "blur(20px)",
            border: isDashboard 
              ? "none" 
              : (isHome
                  ? (isScrolled ? "1px solid rgba(255,255,255,.2)" : "1px solid rgba(255,255,255,.12)")
                  : "1px solid #E5E7EB"),
            borderBottom: isDashboard ? "1px solid #E5E7EB" : undefined,
            borderRadius: isDashboard ? 0 : 20,
            padding: isDashboard 
              ? (isMobile ? "12px 16px" : "14px 40px") 
              : (isMobile ? "8px 12px" : "11px 14px"),
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            boxShadow: isDashboard 
              ? "none"
              : (isScrolled ? "0 10px 26px rgba(15,45,26,.18)" : (isHome ? "none" : "0 4px 16px rgba(15,45,26,.06)")),
            transition: "background .2s ease, border-color .2s ease, box-shadow .2s ease",
          }}
        >
          {/* LEFT: hamburger on mobile, logo on desktop */}
          <div className="flex items-center gap-2">
            {isDashboard ? (
              <button
                type="button"
                className="lg:hidden inline-flex items-center justify-center dashboard-toggle"
                onClick={onMenuToggle}
                style={{ width: 38, height: 38, borderRadius: 12, border: "1px solid #E5E7EB", background: "#fff", color: "#0f2d1a", cursor: "pointer" }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center nav-toggle"
                onClick={() => setMobileNavOpen((v) => !v)}
                aria-label="Toggle navigation"
                aria-expanded={mobileNavOpen}
                style={{ width: 36, height: 36, borderRadius: 10, border: isHome ? "1px solid rgba(255,255,255,.25)" : "1px solid #D1D5DB", background: isHome ? "rgba(255,255,255,.06)" : "#fff", color: isHome ? "#fff" : "#0f2d1a" }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  {mobileNavOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6l-12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
              </button>
            )}

            <Link to="/" className={`hidden md:flex items-center gap-2 no-underline`}>
              <div className="flex items-center justify-center rounded-[10px] bg-white shadow-sm" style={{ width: 32, height: 32 }}>
                <img src="/logo-localx.svg" alt="Logo" style={{ width: 22, height: 22, objectFit: "contain" }} />
              </div>
              <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, letterSpacing: "-.02em", color: isHome ? "#fff" : "#0f2d1a", fontSize: "1rem" }}>
                Local<span style={{ color: "#34E0A1" }}>X</span>
              </span>
            </Link>
          </div>

          {/* CENTER: logo on mobile, nav on desktop */}
          <div className="flex flex-1 justify-center">
            <Link to="/" className={`md:hidden flex items-center gap-2 no-underline`}>
              <div className="flex items-center justify-center rounded-[10px] bg-white shadow-sm" style={{ width: 30, height: 30 }}>
                <img src="/logo-localx.svg" alt="Logo" style={{ width: 20, height: 20, objectFit: "contain" }} />
              </div>
              <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, letterSpacing: "-.02em", color: isHome ? "#fff" : "#0f2d1a", fontSize: ".9rem" }}>
                Local<span style={{ color: "#34E0A1" }}>X</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeNav ? activeNav === item.key : location.pathname === item.to;
                return (
                  <Link
                    key={item.key}
                    to={item.to}
                    onClick={() => setActiveNav?.(item.key)}
                    className="no-underline"
                    style={{ padding: "8px 14px", borderRadius: 100, fontFamily: "'Poppins',sans-serif", fontSize: ".8rem", fontWeight: 600, color: isActive ? "#0f2d1a" : (isHome ? "rgba(255,255,255,.84)" : "#4B5563"), background: isActive ? "#34E0A1" : "transparent", transition: "all .2s" }}
                  >
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* RIGHT: preferences button + sign in / avatar */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <PreferencesButton
                isHome={isHome}
                selectedCurrency={selectedCurrency}
                selectedLanguage={selectedLanguage}
                onClick={() => setPreferencesOpen(true)}
              />
            </div>

            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-2"
                  style={{ borderRadius: 100, border: isHome ? "1px solid rgba(255,255,255,.3)" : "1px solid #E2E8F0", background: isHome ? "rgba(0,0,0,.15)" : "#fff", padding: "4px 8px 4px 4px", cursor: "pointer", transition: "all .2s" }}
                >
                  <span style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt={user?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a6b4a" }}>{String(user?.name || "U").charAt(0).toUpperCase()}</span>
                    )}
                  </span>
                  {!isMobile && <svg width="12" height="12" fill="none" stroke={isHome ? "#fff" : "#64748b"} strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>}
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    style={{ position: "absolute", right: 0, top: "calc(100% + 10px)", width: 240, borderRadius: 16, border: "1px solid #E2E8F0", background: "#fff", padding: 8, boxShadow: "0 10px 30px rgba(0,0,0,.12)", zIndex: 100 }}
                  >
                    <div style={{ padding: "8px 12px 12px", borderBottom: "1px solid #f1f5f9", marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{user?.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{user?.email}</div>
                    </div>
                    {profileItems.map((item) => (
                      <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="no-underline dropdown-item" style={{ display: "block", padding: "10px 12px", borderRadius: 10, color: "#475569", fontSize: "13px", fontWeight: 600 }}>
                        {t(item.labelKey)}
                      </Link>
                    ))}
                    <div style={{ height: 1, margin: "6px 0", background: "#f1f5f9" }} />
                    <Link to="/logout" onClick={() => setMenuOpen(false)} className="no-underline" style={{ display: "block", padding: "10px 12px", borderRadius: 10, color: "#ef4444", fontSize: "13px", fontWeight: 600 }}>
                      {t("nav_logout")}
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="no-underline signin-btn" style={{ background: "#1a6b4a", color: "#fff", padding: "8px 18px", borderRadius: 100, fontSize: "13px", fontWeight: 700, boxShadow: "0 4px 12px rgba(26, 107, 74, 0.2)" }}>
                {t("nav_sign_in")}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile nav dropdown (for non-dashboard) */}
        {!isDashboard && mobileNavOpen && (
          <div
            className="md:hidden mx-auto"
            style={{ maxWidth: 1280, marginTop: 8, borderRadius: 20, border: "1px solid #E5E7EB", background: "#fff", padding: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
          >
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.key}
                    to={item.to}
                    onClick={() => setMobileNavOpen(false)}
                    className="no-underline"
                    style={{ padding: "12px 14px", borderRadius: 12, fontSize: "14px", fontWeight: 600, color: isActive ? "#0f2d1a" : "#475569", background: isActive ? "#34E0A1" : "transparent" }}
                  >
                    {t(item.labelKey)}
                  </Link>
                );
              })}
              <div style={{ height: 1, margin: "8px 0", background: "#f1f5f9" }} />
              <button 
                onClick={() => { setMobileNavOpen(false); setPreferencesOpen(true); }}
                style={{ textAlign: "left", padding: "12px 14px", borderRadius: 12, fontSize: "14px", fontWeight: 600, color: "#475569", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                {selectedCurrency?.code || "USD"} · {t("nav_preferences")}
              </button>
            </div>
          </div>
        )}
      </header>

      <PreferencesModal isOpen={preferencesOpen} onClose={handlePreferencesClose} />
      {!isHome && !isExperienceDetail && <div aria-hidden="true" style={{ height: isMobile ? 80 : 92 }} />}
    </>
  );
}