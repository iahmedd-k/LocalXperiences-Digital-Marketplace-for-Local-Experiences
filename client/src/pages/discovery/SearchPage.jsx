import { useState, useRef } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { icon: "🔥", label: "All" },
  { icon: "🍽️", label: "Food & Drink" },
  { icon: "🏛️", label: "Culture" },
  { icon: "🎨", label: "Workshops" },
  { icon: "🧗", label: "Adventure" },
  { icon: "🚶", label: "City Tours" },
  { icon: "🌿", label: "Nature" },
  { icon: "📸", label: "Photography" },
  { icon: "🎭", label: "Events" },
];

const SORT_OPTIONS = ["Most Popular", "Top Rated", "Price: Low to High", "Price: High to Low", "Newest"];

const DURATIONS = ["Any Duration", "Under 1 hour", "1–2 hours", "2–4 hours", "Half day", "Full day"];

const PRICE_RANGES = ["Any Price", "Under $25", "$25–$50", "$50–$100", "Over $100"];

const ALL_EXPERIENCES = [
  { id: 1, img: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=85", title: "Authentic Ramen-Making with Chef Hiro", category: "Food & Drink", city: "Tokyo, Japan", price: 48, duration: "2.5 hrs", rating: 5.0, reviews: 61, badge: "Bestseller", host: "Chef Hiro", tags: ["Small group", "Hands-on"] },
  { id: 2, img: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=85", title: "Sunrise Mountain Trek with Local Guide", category: "Adventure", city: "Dolomites, Italy", price: 62, duration: "4 hrs", rating: 4.9, reviews: 128, badge: "Top Rated", host: "Marco V.", tags: ["Outdoor", "Morning"] },
  { id: 3, img: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&q=85", title: "Medina Heritage Walk & Street Art Tour", category: "Culture", city: "Marrakech, Morocco", price: 28, duration: "2 hrs", rating: 4.7, reviews: 210, badge: null, host: "Fatima Z.", tags: ["Walking", "History"] },
  { id: 4, img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=85", title: "Neelum Valley Forest Sunrise Trek", category: "Nature", city: "Azad Kashmir, Pakistan", price: 55, duration: "5 hrs", rating: 5.0, reviews: 22, badge: "New", host: "Bilal A.", tags: ["Nature", "Hiking"] },
  { id: 5, img: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=85", title: "Lahore Old City Photography Walk", category: "Photography", city: "Lahore, Pakistan", price: 35, duration: "3 hrs", rating: 4.8, reviews: 47, badge: null, host: "Sara M.", tags: ["Photography", "Walking"] },
  { id: 6, img: "https://images.unsplash.com/photo-1770563182342-674fdc55d72d?w=800&q=85", title: "Tuscan Pottery & Ceramics Workshop", category: "Workshops", city: "Tuscany, Italy", price: 65, duration: "3 hrs", rating: 4.9, reviews: 88, badge: "Bestseller", host: "Lucia R.", tags: ["Hands-on", "Creative"] },
  { id: 7, img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=85", title: "Hidden Waterfalls Jungle Hike", category: "Adventure", city: "Bali, Indonesia", price: 38, duration: "3 hrs", rating: 4.8, reviews: 94, badge: null, host: "Wayan S.", tags: ["Outdoor", "Nature"] },
  { id: 8, img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=85", title: "Bangkok Night Street Food Tour", category: "Food & Drink", city: "Bangkok, Thailand", price: 29, duration: "2.5 hrs", rating: 4.8, reviews: 175, badge: "Top Rated", host: "Nong P.", tags: ["Night", "Food"] },
  { id: 9, img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=85", title: "Kyoto Tea Ceremony & Zen Garden Walk", category: "Culture", city: "Kyoto, Japan", price: 42, duration: "2 hrs", rating: 5.0, reviews: 33, badge: "New", host: "Yuki T.", tags: ["Cultural", "Mindful"] },
  { id: 10, img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85", title: "Swiss Alps Panoramic Sunrise Hike", category: "Adventure", city: "Interlaken, Switzerland", price: 89, duration: "6 hrs", rating: 4.9, reviews: 56, badge: "Top Rated", host: "Hans K.", tags: ["Outdoor", "Scenic"] },
  { id: 11, img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=85", title: "Barcelona Tapas & Wine Evening", category: "Food & Drink", city: "Barcelona, Spain", price: 54, duration: "3 hrs", rating: 4.7, reviews: 143, badge: null, host: "Carlos M.", tags: ["Evening", "Wine"] },
  { id: 12, img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=85", title: "London Street Art & Graffiti Walk", category: "City Tours", city: "London, UK", price: 22, duration: "2 hrs", rating: 4.6, reviews: 201, badge: null, host: "Jamie L.", tags: ["Walking", "Art"] },
];

const BADGE_STYLES = {
  "Bestseller": { bg: "#FEF9EC", color: "#92610A", border: "#FDE68A" },
  "Top Rated":  { bg: "#E8F8F2", color: "#00875A", border: "#C6F0DC" },
  "New":        { bg: "#EEF2FF", color: "#4338CA", border: "#C7D2FE" },
};

// ── ExperienceCard ────────────────────────────────────────────────────────────
function ExperienceCard({ exp, view }) {
  const [h, setH] = useState(false);
  const [saved, setSaved] = useState(false);
  const bs = exp.badge ? BADGE_STYLES[exp.badge] : null;

  if (view === "list") {
    return (
      <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ display: "flex", gap: 0, background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #F3F4F6", boxShadow: h ? "0 12px 36px rgba(0,0,0,.09)" : "0 2px 10px rgba(0,0,0,.04)", transform: h ? "translateY(-3px)" : "none", transition: "all .28s cubic-bezier(.22,1,.36,1)", cursor: "pointer" }}>
        <div style={{ position: "relative", width: 240, flexShrink: 0, overflow: "hidden" }}>
          <img src={exp.img} alt={exp.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: h ? "scale(1.05)" : "scale(1)", transition: "transform .5s cubic-bezier(.22,1,.36,1)" }} />
          {bs && <div style={{ position: "absolute", top: 12, left: 12, background: bs.bg, border: `1px solid ${bs.border}`, color: bs.color, fontSize: ".6rem", fontWeight: 700, padding: "3px 10px", borderRadius: 100 }}>{exp.badge}</div>}
          <button onClick={e => { e.stopPropagation(); setSaved(!saved); }} style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.14)", transition: "transform .2s", transform: saved ? "scale(1.15)" : "scale(1)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? "#ef4444" : "none"} stroke={saved ? "#ef4444" : "#374151"} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
          </button>
        </div>
        <div style={{ padding: "22px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <svg width="11" height="11" fill="none" stroke="#00AA6C" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span style={{ fontSize: ".65rem", fontWeight: 500, color: "#00AA6C" }}>{exp.city}</span>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#D1D5DB", display: "inline-block" }} />
              <span style={{ fontSize: ".65rem", color: "#9CA3AF" }}>Hosted by {exp.host}</span>
            </div>
            <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#0f2d1a", margin: "0 0 10px", lineHeight: 1.35 }}>{exp.title}</h3>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {exp.tags.map(t => (
                <span key={t} style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#6B7280", fontSize: ".66rem", fontWeight: 500, padding: "3px 10px", borderRadius: 100 }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ display: "flex", gap: 1 }}>{[...Array(5)].map((_, i) => <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i < Math.floor(exp.rating) ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>)}</div>
                <span style={{ fontSize: ".75rem", fontWeight: 700, color: "#374151" }}>{exp.rating}</span>
                <span style={{ fontSize: ".7rem", color: "#9CA3AF" }}>({exp.reviews})</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#9CA3AF" }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" /></svg>
                <span style={{ fontSize: ".72rem" }}>{exp.duration}</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".75rem", color: "#9CA3AF" }}>from</span>
                <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "1.1rem", fontWeight: 800, color: "#0f2d1a", marginLeft: 4 }}>${exp.price}</span>
                <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".72rem", color: "#9CA3AF" }}> / adult</span>
              </div>
              <button style={{ background: h ? "#00AA6C" : "#F0FDF9", color: h ? "#fff" : "#00AA6C", border: `1.5px solid ${h ? "#00AA6C" : "#C6F0DC"}`, borderRadius: 100, fontFamily: "'Poppins',sans-serif", fontSize: ".78rem", fontWeight: 700, padding: "9px 20px", cursor: "pointer", transition: "all .22s", whiteSpace: "nowrap" }}>
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ borderRadius: 20, overflow: "hidden", background: "#fff", border: "1px solid #F3F4F6", boxShadow: h ? "0 16px 40px rgba(0,0,0,.10)" : "0 2px 12px rgba(0,0,0,.04)", transform: h ? "translateY(-5px)" : "none", transition: "all .3s cubic-bezier(.22,1,.36,1)", cursor: "pointer" }}>
      <div style={{ position: "relative", overflow: "hidden", aspectRatio: "4/3" }}>
        <img src={exp.img} alt={exp.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: h ? "scale(1.06)" : "scale(1)", transition: "transform .5s cubic-bezier(.22,1,.36,1)" }} />
        {bs && <div style={{ position: "absolute", top: 12, left: 12, background: bs.bg, border: `1px solid ${bs.border}`, color: bs.color, fontFamily: "'Poppins',sans-serif", fontSize: ".6rem", fontWeight: 700, padding: "4px 11px", borderRadius: 100 }}>{exp.badge}</div>}
        <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", alignItems: "center", gap: 5, background: "rgba(0,0,0,.28)", backdropFilter: "blur(10px)", borderRadius: 100, padding: "4px 10px" }}>
          <svg width="11" height="11" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" /></svg>
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".6rem", fontWeight: 600, color: "rgba(255,255,255,.9)" }}>{exp.duration}</span>
        </div>
        <button onClick={e => { e.stopPropagation(); setSaved(!saved); }} style={{ position: "absolute", top: 11, right: 11, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.14)", transition: "transform .2s", transform: saved ? "scale(1.15)" : "scale(1)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? "#ef4444" : "none"} stroke={saved ? "#ef4444" : "#374151"} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
        </button>
      </div>
      <div style={{ padding: "14px 16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
          <svg width="11" height="11" fill="none" stroke="#00AA6C" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".63rem", fontWeight: 500, color: "#00AA6C" }}>{exp.city}</span>
        </div>
        <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".88rem", fontWeight: 700, color: "#0f2d1a", margin: "0 0 10px", lineHeight: 1.38 }}>{exp.title}</h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <div style={{ display: "flex", gap: 1 }}>{[...Array(5)].map((_, i) => <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i < Math.floor(exp.rating) ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>)}</div>
            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".72rem", fontWeight: 600, color: "#374151" }}>{exp.rating}</span>
            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".68rem", color: "#9CA3AF" }}>({exp.reviews})</span>
          </div>
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".78rem", color: "#6B7280" }}>
            from <strong style={{ color: "#0f2d1a", fontSize: ".86rem" }}>${exp.price}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ExperiencesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Most Popular");
  const [duration, setDuration] = useState("Any Duration");
  const [priceRange, setPriceRange] = useState("Any Price");
  const [view, setView] = useState("grid"); // "grid" | "list"
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter logic
  const filtered = ALL_EXPERIENCES.filter(exp => {
    const matchCat = activeCategory === "All" || exp.category === activeCategory;
    const matchSearch = search === "" || exp.title.toLowerCase().includes(search.toLowerCase()) || exp.city.toLowerCase().includes(search.toLowerCase());
    const matchPrice = priceRange === "Any Price" ||
      (priceRange === "Under $25" && exp.price < 25) ||
      (priceRange === "$25–$50" && exp.price >= 25 && exp.price <= 50) ||
      (priceRange === "$50–$100" && exp.price > 50 && exp.price <= 100) ||
      (priceRange === "Over $100" && exp.price > 100);
    const durationHours = parseFloat(exp.duration);
    const matchDuration = duration === "Any Duration" ||
      (duration === "Under 1 hour" && durationHours < 1) ||
      (duration === "1–2 hours" && durationHours >= 1 && durationHours <= 2) ||
      (duration === "2–4 hours" && durationHours > 2 && durationHours <= 4) ||
      (duration === "Half day" && durationHours > 4 && durationHours <= 6) ||
      (duration === "Full day" && durationHours > 6);
    return matchCat && matchSearch && matchPrice && matchDuration;
  }).sort((a, b) => {
    if (sortBy === "Top Rated") return b.rating - a.rating;
    if (sortBy === "Price: Low to High") return a.price - b.price;
    if (sortBy === "Price: High to Low") return b.price - a.price;
    if (sortBy === "Newest") return b.id - a.id;
    return b.reviews - a.reviews; // Most Popular
  });

  const activeFilterCount = [
    duration !== "Any Duration",
    priceRange !== "Any Price",
  ].filter(Boolean).length;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#f0faf5", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Poppins:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; } * { scrollbar-width: none; }

        .cat-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 100px;
          font-family: 'Poppins', sans-serif; font-size: .78rem; font-weight: 600;
          cursor: pointer; white-space: nowrap; flex-shrink: 0;
          border: 1.5px solid #E5E7EB; background: #fff; color: #6B7280;
          transition: all .18s;
        }
        .cat-pill:hover { border-color: #00AA6C; color: #00AA6C; background: #F0FDF9; }
        .cat-pill.active { background: #0f2d1a; color: #fff; border-color: #0f2d1a; box-shadow: 0 4px 14px rgba(15,45,26,.18); }

        .view-btn { width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #E5E7EB; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #9CA3AF; transition: all .18s; }
        .view-btn.active { background: #0f2d1a; border-color: #0f2d1a; color: #fff; }
        .view-btn:hover:not(.active) { border-color: #0f2d1a; color: #0f2d1a; }

        .filter-select {
          appearance: none; -webkit-appearance: none;
          padding: 9px 36px 9px 14px;
          border-radius: 12px; border: 1.5px solid #E5E7EB;
          background: #fff; color: #374151;
          font-family: 'Poppins', sans-serif; font-size: .8rem; font-weight: 500;
          cursor: pointer; outline: none; transition: border-color .18s;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center;
        }
        .filter-select:focus, .filter-select:hover { border-color: #00AA6C; }

        .search-input { border: none; outline: none; background: transparent; font-family: 'Poppins', sans-serif; font-size: .88rem; color: #111; flex: 1; min-width: 0; }
        .search-input::placeholder { color: #aaa; font-weight: 400; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .card-anim { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) forwards; opacity: 0; }
      `}</style>

      {/* ── STICKY NAVBAR ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(240,250,245,.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #D1FAE5", padding: "0 10px" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "#0f2d1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="17" height="17" fill="none" stroke="#34E0A1" strokeWidth="2.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <span style={{ fontSize: ".95rem", fontWeight: 800, color: "#0f2d1a", letterSpacing: "-.02em" }}>Local<span style={{ color: "#00AA6C" }}>Xperiences</span></span>
          </a>
          {/* Inline search */}
          <div style={{ flex: 1, maxWidth: 440, display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 14, padding: "8px 14px", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 10px rgba(0,0,0,.04)", transition: "border-color .2s" }}
            onFocus={e => e.currentTarget.style.borderColor = "#00AA6C"}
            onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}>
            <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input className="search-input" placeholder="Search experiences, cities…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", display: "flex", alignItems: "center" }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <a href="#" style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".8rem", fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>← Home</a>
            <button style={{ padding: "9px 20px", borderRadius: 100, background: "#00AA6C", color: "#fff", border: "none", fontFamily: "'Poppins',sans-serif", fontSize: ".8rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,170,108,.3)", transition: "all .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#008A56"}
              onMouseLeave={e => e.currentTarget.style.background = "#00AA6C"}>
              Sign Up Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── PAGE HEADER ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F3F4F6", padding: "36px 28px 0" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#E8F8F2", border: "1px solid #C6F0DC", color: "#00875A", fontSize: ".62rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "4px 12px", borderRadius: 100, marginBottom: 10 }}>
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              Browse & Discover
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 400, color: "#0f2d1a", margin: "0 0 6px", letterSpacing: "-.01em" }}>
              Explore All Experiences
            </h1>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".88rem", color: "#6B7280" }}>
              {filtered.length} hand-picked experiences across {new Set(ALL_EXPERIENCES.map(e => e.city.split(",")[1]?.trim() || e.city)).size}+ countries
            </p>
          </div>

          {/* Category pills — scrollable */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 16 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.label} className={`cat-pill${activeCategory === cat.label ? " active" : ""}`} onClick={() => setActiveCategory(cat.label)}>
                <span style={{ fontSize: ".82rem" }}>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F3F4F6", padding: "12px 28px", position: "sticky", top: 62, zIndex: 40, boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          {/* Left: filters */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#374151", fontSize: ".8rem", fontWeight: 600 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2M13 16h-2" /></svg>
              Filters
              {activeFilterCount > 0 && <span style={{ background: "#00AA6C", color: "#fff", fontSize: ".6rem", fontWeight: 700, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{activeFilterCount}</span>}
            </div>

            <div style={{ width: 1, height: 20, background: "#E5E7EB" }} />

            <div style={{ position: "relative" }}>
              <select className="filter-select" value={duration} onChange={e => setDuration(e.target.value)}>
                {DURATIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ position: "relative" }}>
              <select className="filter-select" value={priceRange} onChange={e => setPriceRange(e.target.value)}>
                {PRICE_RANGES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button onClick={() => { setDuration("Any Duration"); setPriceRange("Any Price"); }}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 10, border: "1px solid #FDE68A", background: "#FEF9EC", color: "#92610A", fontSize: ".75rem", fontWeight: 600, cursor: "pointer" }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                Clear filters
              </button>
            )}
          </div>

          {/* Right: sort + view toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: ".78rem", color: "#9CA3AF", fontWeight: 500 }}>Sort:</span>
              <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ width: 1, height: 20, background: "#E5E7EB" }} />
            <div style={{ display: "flex", gap: 5 }}>
              <button className={`view-btn${view === "grid" ? " active" : ""}`} onClick={() => setView("grid")}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
              </button>
              <button className={`view-btn${view === "list" ? " active" : ""}`} onClick={() => setView("list")}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── RESULTS ── */}
      <main style={{ maxWidth: 1300, margin: "0 auto", padding: "32px 28px 80px" }}>

        {/* Result count + active filters summary */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".85rem", color: "#6B7280" }}>
            Showing <strong style={{ color: "#0f2d1a" }}>{filtered.length}</strong> experiences
            {activeCategory !== "All" && <> in <strong style={{ color: "#00AA6C" }}>{activeCategory}</strong></>}
            {search && <> matching <strong style={{ color: "#0f2d1a" }}>"{search}"</strong></>}
          </span>
          {filtered.length > 0 && (
            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".75rem", color: "#9CA3AF" }}>
              Prices shown per adult
            </span>
          )}
        </div>

        {/* Cards */}
        {filtered.length > 0 ? (
          <div style={{
            display: view === "grid" ? "grid" : "flex",
            gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(280px, 1fr))" : undefined,
            flexDirection: view === "list" ? "column" : undefined,
            gap: view === "grid" ? 22 : 16,
          }}>
            {filtered.map((exp, i) => (
              <div key={exp.id} className="card-anim" style={{ animationDelay: `${Math.min(i, 8) * 0.06}s` }}>
                <ExperienceCard exp={exp} view={view} />
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.5rem", fontWeight: 400, color: "#0f2d1a", marginBottom: 8 }}>No experiences found</h3>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".88rem", color: "#9CA3AF", marginBottom: 20 }}>Try adjusting your filters or search term</p>
            <button onClick={() => { setActiveCategory("All"); setSearch(""); setDuration("Any Duration"); setPriceRange("Any Price"); }}
              style={{ padding: "10px 24px", borderRadius: 100, background: "#0f2d1a", color: "#fff", border: "none", fontFamily: "'Poppins',sans-serif", fontSize: ".84rem", fontWeight: 700, cursor: "pointer" }}>
              Clear all filters
            </button>
          </div>
        )}

        {/* Load more */}
        {filtered.length >= 8 && (
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <button style={{ padding: "13px 36px", borderRadius: 100, background: "#fff", border: "1.5px solid #D1FAE5", color: "#0f2d1a", fontFamily: "'Poppins',sans-serif", fontSize: ".88rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, transition: "all .2s", boxShadow: "0 2px 10px rgba(0,0,0,.04)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#00AA6C"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,170,108,.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#D1FAE5"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,.04)"; }}>
              Load more experiences
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".75rem", color: "#9CA3AF", marginTop: 10 }}>Showing {filtered.length} of 200+ experiences</p>
          </div>
        )}
      </main>

      {/* ── FOOTER STRIP ── */}
      <div style={{ background: "#0c2318", padding: "28px", textAlign: "center" }}>
        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".78rem", color: "rgba(255,255,255,.28)" }}>
          © {new Date().getFullYear()} LocalXperiences · <a href="#" style={{ color: "rgba(255,255,255,.28)", textDecoration: "none" }}>Privacy</a> · <a href="#" style={{ color: "rgba(255,255,255,.28)", textDecoration: "none" }}>Terms</a>
        </p>
      </div>

    </div>
  );
}