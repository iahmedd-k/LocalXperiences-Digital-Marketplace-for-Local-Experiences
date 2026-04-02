import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "../../components/common/Navbar.jsx";
import Footer from "../../components/common/Footer.jsx";
import { getExperiences } from "../../services/experienceService.js";
import useWishlist from "../../hooks/useWishlist.js";
import useGeolocation from "../../hooks/useGeolocation.js";
import { CATEGORIES, DEFAULT_RADIUS } from "../../config/constants.js";
import { useCurrency } from '../../components/Currencycontext';
import { formatPrice } from '../../utils/formatters.js';
import ExperienceCard from "../../components/experience/ExperienceCard.jsx";

const ALL_CATS = [{ value: "All", label: "All" }, ...CATEGORIES];
const TIME_OPTIONS = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "night", label: "Night" },
];
const PRICE_MAX = 2000;
const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const toDateOnly = (d) => {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const addMonths = (date, amount) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount, 1);
  return next;
};

const monthTitle = (date) => date.toLocaleString(undefined, { month: "long", year: "numeric" });

const buildMonthGrid = (date) => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const lead = first.getDay();
  const days = last.getDate();
  const cells = [];

  for (let i = 0; i < lead; i += 1) cells.push(null);
  for (let d = 1; d <= days; d += 1) cells.push(new Date(date.getFullYear(), date.getMonth(), d));

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

const formatDateLabel = (dateFilter) => {
  if (!dateFilter || dateFilter === "All") return "Any date";
  const parsed = new Date(`${dateFilter}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Any date";
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const getTimeBucketFromStartTime = (startTime = "") => {
  const [hourString] = String(startTime).split(":");
  const hour = Number(hourString);
  if (!Number.isFinite(hour)) return "All";
  if (hour >= 5 && hour <= 11) return "morning";
  if (hour >= 12 && hour <= 16) return "afternoon";
  if (hour >= 17 && hour <= 20) return "evening";
  return "night";
};



const getTimeBucket = (durationText = "") => {
  const text = String(durationText).toLowerCase();
  if (text.includes("morning")) return "morning";
  if (text.includes("afternoon")) return "afternoon";
  if (text.includes("evening")) return "evening";
  if (text.includes("night")) return "night";
  return "All";
};

const toRad = (v) => (v * Math.PI) / 180;
const distanceKm = (aLat, aLng, bLat, bLng) => {
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const location = useGeolocation();
  const { isSaved, toggleWishlist, isPendingFor } = useWishlist();
  const panelRootRef = useRef(null);
  const { currency } = useCurrency();
  const cityFromUrl = (searchParams.get("city") || "").trim();
  const cityFromUrlNormalized = cityFromUrl.toLowerCase();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [dateFilter, setDateFilter] = useState("All");
  const [languageFilter, setLanguageFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");
  const [quickOnly, setQuickOnly] = useState(false);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(PRICE_MAX);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [activePanel, setActivePanel] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [draftFilters, setDraftFilters] = useState(null);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!panelRootRef.current?.contains(event.target)) {
        setActivePanel(null);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const hasCoords = Number.isFinite(location?.lat) && Number.isFinite(location?.lng);
  const shouldFetchNearbyResults = hasCoords && (nearbyOnly || sortBy === "nearest");
  const fetchSort = shouldFetchNearbyResults && sortBy === "nearest" ? "nearest" : "rating";

  const { data: experiences = [] } = useQuery({
    queryKey: ["searchExperiences", query, category, cityFromUrl, shouldFetchNearbyResults, fetchSort, location?.lat, location?.lng],
    queryFn: async () => {
      const params = {
        keyword: query || undefined,
        category: category !== "All" ? category : undefined,
        date: dateFilter !== "All" ? dateFilter : undefined,
        timeOfDay: timeFilter !== "All" ? timeFilter : undefined,
        city: cityFromUrl || undefined,
        lat: shouldFetchNearbyResults ? location.lat : undefined,
        lng: shouldFetchNearbyResults ? location.lng : undefined,
        radius: shouldFetchNearbyResults ? DEFAULT_RADIUS : undefined,
        limit: shouldFetchNearbyResults ? 100 : 50,
        sort: fetchSort,
      };
      const res = await getExperiences(params);
      return res.data.data || [];
    },
  });

  const normalized = useMemo(
    () =>
      experiences.map((exp) => {
        const rawCoords = exp?.location?.coordinates?.coordinates;
        const expLng = Array.isArray(rawCoords) ? rawCoords[0] : exp?.location?.coordinates?.lng;
        const expLat = Array.isArray(rawCoords) ? rawCoords[1] : exp?.location?.coordinates?.lat;
        const serverDistanceKm = Number(exp?.distanceKm);
        const canMeasure = hasCoords && Number.isFinite(expLat) && Number.isFinite(expLng);
        const km = Number.isFinite(serverDistanceKm)
          ? serverDistanceKm
          : (canMeasure ? distanceKm(location.lat, location.lng, expLat, expLng) : null);
        const availabilitySlots = Array.isArray(exp?.availability) ? exp.availability : [];
        const availabilityDateSet = new Set(
          availabilitySlots
            .map((slot) => {
              const dateValue = slot?.date;
              if (!dateValue) return null;
              const date = new Date(dateValue);
              if (Number.isNaN(date.getTime())) return null;
              return toDateOnly(date);
            })
            .filter(Boolean)
        );
        const availabilityTimeBuckets = new Set(
          availabilitySlots
            .map((slot) => getTimeBucketFromStartTime(slot?.startTime))
            .filter((bucket) => bucket !== "All")
        );
        const fallbackTimeBucket = getTimeBucket(exp.timeOfDay || exp.durationLabel || "");

        return {
          _id: exp._id,
          title: exp.title,
          category: exp.category || "Other",
          city: exp.location?.city || "Local",
          duration: exp.duration ? `${Math.max(1, Math.round(exp.duration / 60))}h` : "2h",
          durationMinutes: Number(exp?.duration || 0),
          rating: Number(exp.rating?.average || 0),
          reviews: Number(exp.rating?.count || 0),
          price: Number(exp.price || 0),
          img:
            exp.photos?.[0] ||
            "https://images.unsplash.com/photo-1521292270410-a8c4d716d518?auto=format&fit=crop&w=900&q=80",
          language:
            Array.isArray(exp.hostId?.languages) && exp.hostId.languages.length
              ? exp.hostId.languages[0]
              : "English",
          availabilityDateSet,
          availabilityTimeBuckets,
          timeBucket: fallbackTimeBucket,
          distanceKm: Number.isFinite(km) ? Number(km.toFixed(1)) : null,
        };
      }),
    [experiences, hasCoords, location],
  );

  const availableLanguages = useMemo(() => {
    const langs = new Set(["All"]);
    normalized.forEach((i) => langs.add(i.language || "English"));
    return Array.from(langs);
  }, [normalized]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return normalized.filter((item) => {
      const byQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q);
      const byCategory = category === "All" || item.category === category;
      const hasAvailabilityDates = item.availabilityDateSet && item.availabilityDateSet.size > 0;
      const byDate =
        dateFilter === "All" ||
        (hasAvailabilityDates
          ? item.availabilityDateSet.has(dateFilter)
          : true);
      const byLanguage = languageFilter === "All" || item.language === languageFilter;
      const hasAvailabilityTimes = item.availabilityTimeBuckets && item.availabilityTimeBuckets.size > 0;
      const byTime =
        timeFilter === "All" ||
        (hasAvailabilityTimes
          ? item.availabilityTimeBuckets.has(timeFilter)
          : item.timeBucket === timeFilter);
      const byPrice = item.price >= priceMin && item.price <= priceMax;
      const byNearby = !nearbyOnly || (typeof item.distanceKm === "number" && item.distanceKm <= DEFAULT_RADIUS / 1000);
      const byCityFromUrl = !cityFromUrlNormalized || item.city.toLowerCase().trim() === cityFromUrlNormalized;
      const byQuick = !quickOnly || item.durationMinutes <= 60;

      return byQuery && byCategory && byDate && byLanguage && byTime && byPrice && byNearby && byCityFromUrl && byQuick;
    });
  }, [normalized, query, category, dateFilter, languageFilter, timeFilter, priceMin, priceMax, nearbyOnly, cityFromUrlNormalized, quickOnly]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    if (sortBy === "price_asc") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price);
    if (sortBy === "nearest" && hasCoords) {
      list.sort((a, b) => {
        const ad = typeof a.distanceKm === "number" ? a.distanceKm : Number.MAX_SAFE_INTEGER;
        const bd = typeof b.distanceKm === "number" ? b.distanceKm : Number.MAX_SAFE_INTEGER;
        return ad - bd;
      });
    }
    return list;
  }, [filtered, sortBy, hasCoords]);

  const hasScheduleFilter = dateFilter !== "All" || timeFilter !== "All";

  const openAllFilters = () => {
    setDraftFilters({ category, dateFilter, languageFilter, timeFilter, priceMin, priceMax, nearbyOnly });
    setActivePanel("all");
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 sm:px-6 pt-10 pb-6">
          <div className="mx-auto max-w-300 text-center">
            <h1 className="text-[2.2rem] sm:text-[2.8rem] font-extrabold text-[#0f2d1a] tracking-tight">Discover Local Experiences</h1>
            <p className="mt-2 text-sm text-slate-500">Search and filter experiences by category, date, and language.</p>
            {cityFromUrl ? (
              <p className="mt-2 text-sm font-semibold text-emerald-700">Showing tours in {cityFromUrl}</p>
            ) : null}

            <div className="mt-6 bg-white border border-slate-200 shadow-sm rounded-full px-5 py-2 flex items-center gap-3 max-w-3xl mx-auto">
              <svg width="20" height="20" fill="none" stroke="#059669" strokeWidth="2.2" viewBox="0 0 24 24" className="shrink-0">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search experiences"
                className="flex-1 h-10 outline-none text-sm bg-transparent"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} className="shrink-0 h-9 rounded-full bg-[#059669] px-5 text-sm font-semibold text-white">
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          <div className="mx-auto max-w-300">
            <div ref={panelRootRef} className="mt-5 flex w-full">
              <div className="flex w-full overflow-x-auto pb-3 gap-2 px-1 no-scrollbar sm:flex-wrap sm:justify-center sm:overflow-visible">
                <div className="relative shrink-0">
                  <button type="button" onClick={() => setActivePanel(activePanel === "category" ? null : "category")} className="inline-flex items-center gap-2 h-11 rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-700 whitespace-nowrap">
                    {category === "All" ? "Category" : ALL_CATS.find((item) => item.value === category)?.label}
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
                  </button>
                  {activePanel === "category" ? (
                    <div className="absolute top-full left-0 mt-2 z-50 w-90 max-w-[90vw] rounded-2xl border border-slate-200 bg-white shadow-lg p-4">
                      <div className="flex flex-wrap gap-2.5">
                        {ALL_CATS.map((item) => (
                          <button key={item.value} type="button" onClick={() => { setCategory(item.value); setActivePanel(null); }} className="h-10 rounded-full border px-4 text-sm font-medium" style={{ borderColor: category === item.value ? "#0f2d1a" : "#9FB8AA", color: "#0f2d1a", background: category === item.value ? "#EAF8F2" : "#fff" }}>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="relative shrink-0">
                  <button type="button" onClick={() => setActivePanel(activePanel === "date" ? null : "date")} className="inline-flex items-center gap-2 h-11 rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-700 whitespace-nowrap">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" /></svg>
                    {formatDateLabel(dateFilter)}
                  </button>
                  {activePanel === "date" ? (
                    <div className="absolute top-full left-0 mt-2 z-50 w-190 max-w-[96vw] rounded-2xl border border-slate-200 bg-white shadow-lg p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <button type="button" onClick={() => setCalendarMonth((prev) => addMonths(prev, -1))} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-600">{"<"}</button>
                        <button type="button" onClick={() => setCalendarMonth((prev) => addMonths(prev, 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-600">{">"}</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[calendarMonth, addMonths(calendarMonth, 1)].map((month, idx) => {
                          const cells = buildMonthGrid(month);
                          return (
                            <div key={`${month.getFullYear()}-${month.getMonth()}-${idx}`}>
                              <h4 className="text-xl font-semibold text-[#0f2d1a] mb-3">{monthTitle(month)}</h4>
                              <div className="grid grid-cols-7 gap-y-1.5 mb-1.5">
                                {WEEK_DAYS.map((d, dayIndex) => <div key={`${month.getMonth()}-${dayIndex}`} className="text-center text-xs font-medium text-slate-500">{d}</div>)}
                              </div>
                              <div className="grid grid-cols-7 gap-y-1">
                                {cells.map((cell, i) => {
                                  if (!cell) return <div key={`blank-${i}`} className="h-8" />;
                                  const iso = toDateOnly(cell);
                                  const selected = dateFilter !== "All" && iso === dateFilter;
                                  return (
                                    <button key={iso} type="button" onClick={() => setDateFilter(iso)} className="h-8 w-8 mx-auto rounded-md text-sm font-medium" style={{ color: selected ? "#fff" : "#0f2d1a", background: selected ? "#003b1f" : "transparent" }}>
                                      {cell.getDate()}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <button type="button" onClick={() => setDateFilter("All")} className="h-9 rounded-full border border-slate-300 px-3 text-xs text-slate-700">Clear date</button>
                        <button type="button" onClick={() => setActivePanel(null)} className="h-10 rounded-full bg-[#003b1f] px-5 text-sm font-semibold text-white">Show results</button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => hasCoords && setNearbyOnly((v) => !v)}
                  disabled={!hasCoords}
                  className="inline-flex items-center gap-2 h-11 rounded-full border px-4 text-sm font-medium transition shrink-0 whitespace-nowrap"
                  style={{
                    borderColor: nearbyOnly ? "#003b1f" : "#d1d5db",
                    background: nearbyOnly ? "#EAF8F2" : "#fff",
                    color: nearbyOnly ? "#003b1f" : "#374151",
                    opacity: hasCoords ? 1 : 0.45,
                    cursor: hasCoords ? "pointer" : "not-allowed",
                  }}
                  title={hasCoords ? undefined : "Enable location to use nearby filter"}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" /></svg>
                  Nearby
                </button>

                <button
                  type="button"
                  onClick={() => setQuickOnly((value) => !value)}
                  className="inline-flex items-center gap-2 h-11 rounded-full border px-4 text-sm font-medium transition shrink-0 whitespace-nowrap"
                  style={{
                    borderColor: quickOnly ? "#7c2d12" : "#d1d5db",
                    background: quickOnly ? "#fff7ed" : "#fff",
                    color: quickOnly ? "#7c2d12" : "#374151",
                  }}
                >
                  Under 1 hour
                </button>

                <div className="relative shrink-0">
                  <button type="button" onClick={() => setActivePanel(activePanel === "time" ? null : "time")} className="inline-flex items-center gap-2 h-11 rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-700 whitespace-nowrap">
                    Time of Day
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
                  </button>
                  {activePanel === "time" ? (
                    <div className="absolute top-full left-0 mt-2 z-50 w-90 max-w-[90vw] rounded-2xl border border-slate-200 bg-white shadow-lg p-4">
                      <div className="flex flex-wrap gap-2.5">
                        <button type="button" onClick={() => setTimeFilter("All")} className="h-10 rounded-full border px-4 text-sm font-medium" style={{ borderColor: timeFilter === "All" ? "#0f2d1a" : "#9FB8AA", color: "#0f2d1a", background: timeFilter === "All" ? "#EAF8F2" : "#fff" }}>Any time</button>
                        {TIME_OPTIONS.map((option) => <button key={option.value} type="button" onClick={() => setTimeFilter(option.value)} className="h-10 rounded-full border px-4 text-sm font-medium" style={{ borderColor: timeFilter === option.value ? "#0f2d1a" : "#9FB8AA", color: "#0f2d1a", background: timeFilter === option.value ? "#EAF8F2" : "#fff" }}>{option.label}</button>)}
                      </div>
                      <div className="mt-4 flex justify-end"><button type="button" onClick={() => setActivePanel(null)} className="h-10 rounded-full bg-[#003b1f] px-5 text-sm font-semibold text-white">Show results</button></div>
                    </div>
                  ) : null}
                </div>

                <div className="relative shrink-0">
                  <button type="button" onClick={() => setActivePanel(activePanel === "price" ? null : "price")} className="inline-flex items-center gap-2 h-11 rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-700 whitespace-nowrap">
                    {priceMin === 0 && priceMax === PRICE_MAX ? "Price" : `$${priceMin} – $${priceMax}`}
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
                  </button>
                  {activePanel === "price" ? (
                    <div className="absolute top-full left-0 mt-2 z-50 w-80 max-w-[90vw] rounded-2xl border border-slate-200 bg-white shadow-lg p-5">
                      <p className="text-xl font-bold text-[#0f2d1a] mb-1">Price</p>
                      <p className="text-sm font-medium mb-5" style={{ color: "#00AA6C" }}>${priceMin} – ${priceMax}</p>
                      <div className="relative" style={{ height: 4, marginBottom: 28 }}>
                        <div className="absolute inset-0 rounded-full bg-slate-200" />
                        <div className="absolute h-full rounded-full bg-[#003b1f]" style={{ left: `${(priceMin / PRICE_MAX) * 100}%`, right: `${((PRICE_MAX - priceMax) / PRICE_MAX) * 100}%` }} />
                        <input type="range" min={0} max={PRICE_MAX} step={10} value={priceMin} onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax - 10))} className="price-range-input" />
                        <input type="range" min={0} max={PRICE_MAX} step={10} value={priceMax} onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin + 10))} className="price-range-input" />
                      </div>
                      <div className="flex items-center justify-between">
                        <button type="button" onClick={() => { setPriceMin(0); setPriceMax(PRICE_MAX); }} className="h-9 rounded-full border border-slate-300 px-3 text-xs text-slate-700">Reset</button>
                        <button type="button" onClick={() => setActivePanel(null)} className="h-10 rounded-full bg-[#003b1f] px-5 text-sm font-semibold text-white">Show results</button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="relative shrink-0">
                  <button type="button" onClick={() => (activePanel === "all" ? setActivePanel(null) : openAllFilters())} className="inline-flex items-center gap-2 h-11 rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-700 whitespace-nowrap">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 6h16M7 12h10M10 18h4" /></svg>
                    All filters
                  </button>
                  {activePanel === "all" && draftFilters ? (
                    <div className="absolute top-full right-0 mt-2 z-50 w-130 max-w-[96vw] rounded-2xl border border-slate-200 bg-white shadow-lg p-4">
                      {/* ... any changes to contents of all filters popup would go here ... */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* No changes needed to the inner content of all filters for now */}
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1.5">Category</p>
                        <select value={draftFilters.category} onChange={(e) => setDraftFilters((prev) => ({ ...prev, category: e.target.value }))} className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none">
                          {ALL_CATS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1.5">Date</p>
                        <input type="date" value={draftFilters.dateFilter === "All" ? "" : draftFilters.dateFilter} onChange={(e) => setDraftFilters((prev) => ({ ...prev, dateFilter: e.target.value || "All" }))} className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1.5">Language</p>
                        <select value={draftFilters.languageFilter} onChange={(e) => setDraftFilters((prev) => ({ ...prev, languageFilter: e.target.value }))} className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none">
                          {availableLanguages.map((lang) => <option key={lang} value={lang}>{lang === "All" ? "All languages" : lang}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1.5">Time of Day</p>
                        <select value={draftFilters.timeFilter} onChange={(e) => setDraftFilters((prev) => ({ ...prev, timeFilter: e.target.value }))} className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none">
                          <option value="All">Any time</option>
                          {TIME_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs font-semibold text-slate-600 mb-1">Price</p>
                        <p className="text-xs font-medium mb-3" style={{ color: "#00AA6C" }}>${draftFilters.priceMin} – ${draftFilters.priceMax}</p>
                        <div className="relative" style={{ height: 4, marginBottom: 4 }}>
                          <div className="absolute inset-0 rounded-full bg-slate-200" />
                          <div className="absolute h-full rounded-full bg-[#003b1f]" style={{ left: `${(draftFilters.priceMin / PRICE_MAX) * 100}%`, right: `${((PRICE_MAX - draftFilters.priceMax) / PRICE_MAX) * 100}%` }} />
                          <input type="range" min={0} max={PRICE_MAX} step={10} value={draftFilters.priceMin} onChange={(e) => setDraftFilters((prev) => ({ ...prev, priceMin: Math.min(Number(e.target.value), prev.priceMax - 10) }))} className="price-range-input" />
                          <input type="range" min={0} max={PRICE_MAX} step={10} value={draftFilters.priceMax} onChange={(e) => setDraftFilters((prev) => ({ ...prev, priceMax: Math.max(Number(e.target.value), prev.priceMin + 10) }))} className="price-range-input" />
                        </div>
                      </div>
                      <div className="flex items-end">
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <input type="checkbox" checked={draftFilters.nearbyOnly} onChange={(e) => setDraftFilters((prev) => ({ ...prev, nearbyOnly: e.target.checked }))} disabled={!hasCoords} />
                          Nearby only
                        </label>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <button type="button" onClick={() => setDraftFilters({ category: "All", dateFilter: "All", languageFilter: "All", timeFilter: "All", priceMin: 0, priceMax: PRICE_MAX, nearbyOnly: false })} className="h-9 rounded-full border border-slate-300 px-4 text-xs font-medium text-slate-700">Reset</button>
                      <button
                        type="button"
                        onClick={() => {
                          setCategory(draftFilters.category);
                          setDateFilter(draftFilters.dateFilter);
                          setLanguageFilter(draftFilters.languageFilter);
                          setTimeFilter(draftFilters.timeFilter);
                          setPriceMin(draftFilters.priceMin);
                          setPriceMax(draftFilters.priceMax);
                          setNearbyOnly(draftFilters.nearbyOnly);
                          setActivePanel(null);
                        }}
                        className="h-10 rounded-full bg-[#003b1f] px-5 text-sm font-semibold text-white"
                      >
                        Show results
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

            {hasScheduleFilter ? (
              <p className="mt-3 text-center text-xs text-slate-500">
                Date and time filters apply to experiences with published availability slots.
              </p>
            ) : null}
          </div>
        </section>

        <section className="px-4 sm:px-6 pb-16 overflow-hidden">
          <div className="mx-auto max-w-300">
            <div className="pt-6">
              <div className="flex items-center justify-between mb-8">
                <p className="text-[1.05rem] text-[#0f2d1a] font-semibold">{sorted.length} results</p>
                <div className="relative inline-flex items-center gap-2 text-sm text-slate-600" ref={sortRef}>
                  <span>Sort:</span>
                  <button 
                    type="button" 
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="inline-flex items-center gap-1.5 h-9 rounded-lg border border-slate-200 bg-white px-3 text-[0.95rem] font-medium text-[#0f2d1a] shadow-sm hover:bg-slate-50 transition"
                  >
                    {sortBy === "featured" && "Featured"}
                    {sortBy === "rating" && "Top rated"}
                    {sortBy === "price_asc" && "Price: low to high"}
                    {sortBy === "price_desc" && "Price: high to low"}
                    {sortBy === "nearest" && "Nearest"}
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
                  </button>
                  {isSortOpen ? (
                    <div className="absolute top-full right-0 mt-2 w-48 rounded-xl border border-slate-100 bg-white shadow-lg p-1.5 z-50">
                      {[
                        { value: "featured", label: "Featured" },
                        { value: "rating", label: "Top rated" },
                        { value: "price_asc", label: "Price: low to high" },
                        { value: "price_desc", label: "Price: high to low" },
                        ...(hasCoords ? [{ value: "nearest", label: "Nearest" }] : []),
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSortBy(option.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                            sortBy === option.value ? "bg-[#EAF8F2] text-[#0f2d1a]" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sorted.map((exp) => (
                  <ExperienceCard
                    key={exp._id}
                    experience={exp}
                    saved={isSaved(exp._id)}
                    saving={isPendingFor(exp._id)}
                    onToggleWishlist={toggleWishlist}
                    bottomMeta={
                      nearbyOnly ? (
                        <div className="flex items-center justify-between gap-3 text-[0.78rem] text-slate-500">
                          <span>{exp.city}</span>
                          <span>{typeof exp.distanceKm === "number" ? `${exp.distanceKm} km away` : exp.duration}</span>
                        </div>
                      ) : null
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
