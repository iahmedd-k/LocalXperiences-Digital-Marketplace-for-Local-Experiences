import { useState } from 'react'

/* ─── Dummy Data ──────────────────────────────────────────────────────────── */
const EXP = {
  _id: '1',
  title: 'Lahore Old City Heritage Walk & Street Food Trail',
  category: 'Culture',
  location: { city: 'Lahore', address: 'Delhi Gate, Walled City, Lahore, Pakistan' },
  duration: 180,
  price: 75,
  rating: 4.9,
  reviewCount: 128,
  groupSize: { max: 10 },
  photos: [
    'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&q=90',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=85',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=85',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=85',
    'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&q=85',
  ],
  description: `Step into the living history of one of the world's oldest cities. This immersive 3-hour walk takes you deep into the walled city of Lahore — through narrow bazaars, centuries-old havelis, and Mughal-era monuments that most tourists never discover.\n\nYour local guide will share stories passed down through generations: the secret courtyard behind a spice merchant's shop, the rooftop where poets once gathered, the alley that still smells of saffron and cardamom from 400 years of trade.\n\nThe trail ends with a curated street food experience — from crispy samosas fresh off the tawa to the legendary Lahori chargha — all at stalls that have fed the city for decades.`,
  includes: [
    'Expert local guide (English & Urdu)',
    'Street food tastings at 4 stops',
    'Bottled water & refreshments',
    'Entry fees to all sites',
    'Printed city heritage map',
    'Small group (max 10 guests)',
  ],
  tags: ['heritage', 'food', 'culture', 'walking', 'mughal', 'lahore'],
  host: {
    name: 'Bilal Chaudhry',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80',
    bio: 'Born and raised in the Walled City, Bilal has been guiding heritage walks for 8 years. Historian by training, storyteller by passion.',
    joinedYear: 2017,
    totalGuests: 1240,
    responseRate: 98,
    languages: ['English', 'Urdu', 'Punjabi'],
    rating: 4.9,
  },
  reviews: [
    { id: 1, name: 'Sophie L.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80', location: 'Berlin, Germany', rating: 5, date: 'March 2025', text: 'Absolutely the highlight of my Pakistan trip. Bilal\'s knowledge is extraordinary — every alley had a story. The food stops were incredible.' },
    { id: 2, name: 'James T.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80', location: 'Toronto, Canada', rating: 5, date: 'February 2025', text: 'I\'ve done tours in 40+ countries. This is top 3 easily. The walled city is magical and Bilal brings it to life in a way no guidebook can.' },
    { id: 3, name: 'Aisha R.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80', location: 'Lahore, Pakistan', rating: 5, date: 'January 2025', text: 'Even as a Lahori I learned so much. Seeing my own city through Bilal\'s eyes was genuinely moving. Highly recommend to locals too.' },
  ],
  qna: [
    { id: 1, question: 'Is this suitable for elderly guests?', answer: 'Yes, the walk is mostly flat. We can adjust pace to suit all group members.', askedBy: 'Maria K.' },
    { id: 2, question: 'What should I wear?', answer: 'Comfortable walking shoes and modest clothing (covered shoulders and knees) out of respect for the local community.', askedBy: 'Tom B.' },
  ],
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const G = '#00AA6C'
const DARK = '#0f2d1a'

function formatDuration(mins) {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60), m = mins % 60
  return m ? `${h} hr ${m} min` : `${h} hr`
}

function Stars({ n = 5, size = 14, filled = 5 }) {
  return (
    <span className="flex gap-0.5">
      {[...Array(n)].map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i < filled ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </span>
  )
}

/* ─── Gallery ─────────────────────────────────────────────────────────────── */
function Gallery({ photos }) {
  const [active, setActive] = useState(null)
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 6, height: 420, borderRadius: 20, overflow: 'hidden' }}>
        {photos.slice(0, 5).map((src, i) => (
          <div
            key={i}
            onClick={() => setActive(src)}
            style={{
              gridColumn: i === 0 ? '1' : 'auto',
              gridRow: i === 0 ? '1 / 3' : 'auto',
              overflow: 'hidden', cursor: 'pointer', position: 'relative',
            }}
          >
            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s', display: 'block' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
            {i === 4 && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontFamily: "'Poppins',sans-serif", fontSize: '.85rem', fontWeight: 700 }}>+ Show all photos</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {active && (
        <div onClick={() => setActive(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          <img src={active} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
        </div>
      )}
    </>
  )
}

/* ─── Review Card ─────────────────────────────────────────────────────────── */
function ReviewCard({ r }) {
  return (
    <div style={{ padding: '20px 0', borderBottom: '1px solid #F3F4F6' }}>
      <div className="flex items-center gap-3 mb-3">
        <img src={r.avatar} alt={r.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: '.85rem', color: DARK }}>{r.name}</div>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: '.72rem', color: '#9CA3AF' }}>{r.location} · {r.date}</div>
        </div>
        <div className="ml-auto"><Stars filled={r.rating} size={12} /></div>
      </div>
      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: '.84rem', color: '#4B5563', lineHeight: 1.75, margin: 0 }}>{r.text}</p>
    </div>
  )
}

/* ─── Q&A Item ────────────────────────────────────────────────────────────── */
function QnAItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid #F3F4F6', padding: '14px 0' }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-3 text-left bg-transparent border-none cursor-pointer p-0">
        <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: '.87rem', fontWeight: 600, color: DARK, lineHeight: 1.5 }}>
          Q: {item.question}
        </span>
        <svg width="18" height="18" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24"
          style={{ flexShrink: 0, marginTop: 2, transition: 'transform .25s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
          <path strokeLinecap="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div style={{ marginTop: 10, padding: '12px 14px', background: '#F8FDF9', borderRadius: 10, border: '1px solid #E8F5EE' }}>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: '.83rem', color: '#4B5563', margin: 0, lineHeight: 1.7 }}>
            <span style={{ color: G, fontWeight: 700 }}>A: </span>{item.answer}
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── Price Box ───────────────────────────────────────────────────────────── */
function PriceBox({ exp }) {
  const [guests, setGuests] = useState(1)
  const [date, setDate] = useState('')
  const total = exp.price * guests
  const fee = Math.round(total * 0.08)

  return (
    <div style={{ position: 'sticky', top: 24, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 20, padding: '26px 24px', boxShadow: '0 8px 40px rgba(0,0,0,.09)', fontFamily: "'Poppins',sans-serif" }}>
      {/* Price */}
      <div className="flex items-end gap-2 mb-5">
        <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: '2rem', fontWeight: 400, color: DARK, lineHeight: 1 }}>${exp.price}</span>
        <span style={{ fontSize: '.82rem', color: '#9CA3AF', marginBottom: 4 }}>/ per adult</span>
      </div>

      {/* Rating row */}
      <div className="flex items-center gap-2 mb-6">
        <Stars filled={5} size={13} />
        <span style={{ fontSize: '.8rem', fontWeight: 700, color: DARK }}>{exp.rating}</span>
        <span style={{ fontSize: '.75rem', color: '#9CA3AF' }}>({exp.reviewCount} reviews)</span>
      </div>

      {/* Date picker */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: '#374151', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>Select Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontFamily: "'Poppins',sans-serif", fontSize: '.84rem', color: '#111', outline: 'none', cursor: 'pointer' }}
          onFocus={e => e.target.style.borderColor = G}
          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        />
      </div>

      {/* Guest counter */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: '#374151', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>Guests</label>
        <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
          <button onClick={() => setGuests(g => Math.max(1, g - 1))}
            style={{ width: 44, height: 44, background: '#F9FAFB', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
            onMouseLeave={e => e.currentTarget.style.background = '#F9FAFB'}>
            −
          </button>
          <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '.9rem', color: DARK }}>{guests} {guests === 1 ? 'guest' : 'guests'}</span>
          <button onClick={() => setGuests(g => Math.min(exp.groupSize.max, g + 1))}
            style={{ width: 44, height: 44, background: '#F9FAFB', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
            onMouseLeave={e => e.currentTarget.style.background = '#F9FAFB'}>
            +
          </button>
        </div>
        <p style={{ fontSize: '.68rem', color: '#9CA3AF', marginTop: 5 }}>Max {exp.groupSize.max} guests per booking</p>
      </div>

      {/* Price breakdown */}
      <div style={{ background: '#F8FDF9', borderRadius: 12, padding: '14px', marginBottom: 18, border: '1px solid #E8F5EE' }}>
        <div className="flex justify-between mb-2">
          <span style={{ fontSize: '.8rem', color: '#6B7280' }}>${exp.price} × {guests} {guests === 1 ? 'guest' : 'guests'}</span>
          <span style={{ fontSize: '.8rem', fontWeight: 600, color: DARK }}>${total}</span>
        </div>
        <div className="flex justify-between mb-3">
          <span style={{ fontSize: '.8rem', color: '#6B7280' }}>Service fee</span>
          <span style={{ fontSize: '.8rem', fontWeight: 600, color: DARK }}>${fee}</span>
        </div>
        <div style={{ borderTop: '1px solid #D1FAE5', paddingTop: 10 }} className="flex justify-between">
          <span style={{ fontSize: '.84rem', fontWeight: 700, color: DARK }}>Total</span>
          <span style={{ fontSize: '.84rem', fontWeight: 800, color: G }}>${total + fee}</span>
        </div>
      </div>

      {/* Book button */}
      <button
        style={{ width: '100%', padding: '14px', borderRadius: 12, background: G, color: '#fff', border: 'none', fontFamily: "'Poppins',sans-serif", fontSize: '.9rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 18px rgba(0,170,108,.35)', transition: 'all .2s', letterSpacing: '.01em' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#008A56'; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.background = G; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        Reserve Now
      </button>
      <p style={{ textAlign: 'center', fontSize: '.7rem', color: '#9CA3AF', marginTop: 10 }}>Free cancellation up to 24 hrs before</p>

      {/* Trust signals */}
      <div style={{ borderTop: '1px solid #F3F4F6', marginTop: 16, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { icon: '🔒', text: 'Secure payment via Stripe' },
          { icon: '✅', text: 'Verified local host' },
          { icon: '💬', text: '98% response rate' },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-2">
            <span style={{ fontSize: '.9rem' }}>{icon}</span>
            <span style={{ fontSize: '.72rem', color: '#6B7280' }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Navbar (inline minimal) ─────────────────────────────────────────────── */
function Navbar() {
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #F3F4F6', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, fontFamily: "'Poppins',sans-serif" }}>
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fff', border: '1.5px solid #E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.07)' }}>
          <svg width="17" height="17" fill="none" stroke={G} strokeWidth="2.4" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span style={{ fontSize: '.95rem', fontWeight: 800, color: DARK, letterSpacing: '-.02em' }}>Local<span style={{ color: G }}>Xperiences</span></span>
      </a>
      <div className="flex items-center gap-3">
        <a href="/search" style={{ fontSize: '.82rem', fontWeight: 500, color: '#6B7280', textDecoration: 'none', padding: '7px 14px', borderRadius: 100, transition: 'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          Explore
        </a>
        <button style={{ padding: '8px 20px', borderRadius: 100, background: G, color: '#fff', border: 'none', fontFamily: "'Poppins',sans-serif", fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,170,108,.3)', transition: 'all .2s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#008A56'}
          onMouseLeave={e => e.currentTarget.style.background = G}>
          Sign In
        </button>
      </div>
    </nav>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function ExperienceDetailPage() {
  const exp = EXP
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [question, setQuestion] = useState('')

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: "'Poppins',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Poppins:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeUp .5s both; }
      `}</style>

      <Navbar />

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-5 fade-in" style={{ fontSize: '.75rem', color: '#9CA3AF' }}>
          <a href="/" style={{ color: '#9CA3AF', textDecoration: 'none', transition: 'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color = G}
            onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>Home</a>
          <span>/</span>
          <a href="/search" style={{ color: '#9CA3AF', textDecoration: 'none', transition: 'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color = G}
            onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>Experiences</a>
          <span>/</span>
          <span style={{ color: '#374151' }}>Lahore Old City Walk</span>
        </div>

        {/* Title + meta */}
        <div className="fade-in" style={{ marginBottom: 22 }}>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(1.7rem,3vw,2.6rem)', fontWeight: 400, color: DARK, margin: '0 0 14px', lineHeight: 1.2, letterSpacing: '-.01em' }}>
            {exp.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Stars filled={5} size={14} />
              <span style={{ fontSize: '.82rem', fontWeight: 700, color: DARK }}>{exp.rating}</span>
              <span style={{ fontSize: '.78rem', color: '#9CA3AF' }}>({exp.reviewCount} reviews)</span>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#F0FDF9', border: '1px solid #C6F0DC', color: '#00875A', fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100 }}>
              {exp.category}
            </span>
            <span className="flex items-center gap-1.5" style={{ fontSize: '.8rem', color: '#6B7280' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              {exp.location.address}
            </span>
            <span className="flex items-center gap-1.5" style={{ fontSize: '.8rem', color: '#6B7280' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              {formatDuration(exp.duration)}
            </span>
            <span className="flex items-center gap-1.5" style={{ fontSize: '.8rem', color: '#6B7280' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
              Up to {exp.groupSize.max} guests
            </span>
          </div>
        </div>

        {/* Gallery */}
        <div className="fade-in" style={{ marginBottom: 40 }}>
          <Gallery photos={exp.photos} />
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'start' }}>

          {/* ── Left ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

            {/* Description */}
            <section>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.6rem', color: DARK, margin: '0 0 14px', fontWeight: 400 }}>About this experience</h2>
              <p style={{ fontSize: '.9rem', color: '#4B5563', lineHeight: 1.85, whiteSpace: 'pre-line' }}>{exp.description}</p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #F3F4F6' }} />

            {/* Includes */}
            <section>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.4rem', color: DARK, margin: '0 0 16px', fontWeight: 400 }}>What's included</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {exp.includes.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#E8F8F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="11" height="11" fill="none" stroke={G} strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span style={{ fontSize: '.83rem', color: '#374151' }}>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #F3F4F6' }} />

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {exp.tags.map(t => (
                <span key={t} style={{ background: '#F3F4F6', color: '#6B7280', fontSize: '.72rem', fontWeight: 600, padding: '4px 12px', borderRadius: 100 }}>#{t}</span>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #F3F4F6' }} />

            {/* Host */}
<section>
  <h2
    style={{
      fontFamily: "'DM Serif Display',serif",
      fontSize: "1.4rem",
      color: DARK,
      margin: "0 0 18px",
      fontWeight: 400,
    }}
  >
    Meet your host
  </h2>

  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
    <img
      src={exp.host.avatar}
      alt={exp.host.name}
      style={{
        width: 68,
        height: 68,
        borderRadius: "50%",
        objectFit: "cover",
        border: "3px solid #E8F8F2",
      }}
    />

    <span
      style={{
        fontFamily: "'DM Serif Display',serif",
        fontSize: "1.15rem",
        color: DARK,
      }}
    >
      {exp.host.name}
    </span>
  </div>
</section>

            <hr style={{ border: 'none', borderTop: '1px solid #F3F4F6' }} />

            {/* Map placeholder */}
            <section>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.4rem', color: DARK, margin: '0 0 14px', fontWeight: 400 }}>Location</h2>
              <div style={{ height: 220, borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB', background: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ textAlign: 'center' }}>
                  <svg width="32" height="32" fill="none" stroke={G} strokeWidth="1.8" viewBox="0 0 24 24" style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <p style={{ fontSize: '.8rem', color: '#6B7280', fontFamily: "'Poppins',sans-serif" }}>
                    {exp.location.city} · Map loads with Mapbox integration
                  </p>
                </div>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#C6F0DC 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: .4, pointerEvents: 'none' }} />
              </div>
              <p style={{ fontSize: '.75rem', color: '#9CA3AF', marginTop: 8 }}>{exp.location.address}</p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #F3F4F6' }} />

            {/* Reviews */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.4rem', color: DARK, fontWeight: 400, margin: 0 }}>Reviews</h2>
                <div className="flex items-center gap-1.5">
                  <Stars filled={5} size={13} />
                  <span style={{ fontSize: '.82rem', fontWeight: 700, color: DARK }}>{exp.rating}</span>
                  <span style={{ fontSize: '.75rem', color: '#9CA3AF' }}>· {exp.reviewCount} reviews</span>
                </div>
              </div>
              {exp.reviews.map(r => <ReviewCard key={r.id} r={r} />)}

              {/* Write review */}
              <div style={{ marginTop: 24, background: '#F8FDF9', borderRadius: 16, padding: '20px', border: '1px solid #E8F5EE' }}>
                <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.1rem', color: DARK, margin: '0 0 14px', fontWeight: 400 }}>Share your experience</h3>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setReviewRating(s)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24"
                        fill={s <= (hoverRating || reviewRating) ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="1.5">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Tell others about your experience..."
                  rows={3}
                  style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontFamily: "'Poppins',sans-serif", fontSize: '.84rem', color: '#111', resize: 'vertical', outline: 'none', transition: 'border .18s' }}
                  onFocus={e => e.target.style.borderColor = G}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
                <button style={{ marginTop: 10, padding: '9px 22px', borderRadius: 10, background: G, color: '#fff', border: 'none', fontFamily: "'Poppins',sans-serif", fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', transition: 'background .2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#008A56'}
                  onMouseLeave={e => e.currentTarget.style.background = G}>
                  Submit Review
                </button>
              </div>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #F3F4F6' }} />

            {/* Q&A */}
            <section>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.4rem', color: DARK, margin: '0 0 4px', fontWeight: 400 }}>Questions & Answers</h2>
              <p style={{ fontSize: '.78rem', color: '#9CA3AF', marginBottom: 16 }}>Tap a question to see the host's answer</p>
              {exp.qna.map(item => <QnAItem key={item.id} item={item} />)}

              {/* Ask question */}
              <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
                <input
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="Ask the host a question..."
                  style={{ flex: 1, border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 14px', fontFamily: "'Poppins',sans-serif", fontSize: '.84rem', color: '#111', outline: 'none', transition: 'border .18s' }}
                  onFocus={e => e.target.style.borderColor = G}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
                <button style={{ padding: '10px 20px', borderRadius: 10, background: DARK, color: '#fff', border: 'none', fontFamily: "'Poppins',sans-serif", fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background .2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = G}
                  onMouseLeave={e => e.currentTarget.style.background = DARK}>
                  Ask
                </button>
              </div>
            </section>

          </div>

          {/* ── Right: PriceBox ── */}
          <div>
            <PriceBox exp={exp} />
          </div>

        </div>
      </main>
    </div>
  )
}