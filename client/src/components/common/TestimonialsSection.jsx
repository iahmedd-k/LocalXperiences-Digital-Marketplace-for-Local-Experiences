import { TESTIMONIALS } from "../homeData.js";

function StarRow({ n = 5, size = 13 }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(n)].map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

const VISIBLE = TESTIMONIALS.slice(0, 3);

function ReviewCard({ t }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E8EDEA",
      borderRadius: 16,
      padding: "28px 26px 24px",
      boxShadow: "0 1px 8px rgba(0,0,0,.05)",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Stars */}
      <StarRow n={t.rating} size={14} />

      {/* Quote */}
      <p style={{
        fontFamily: "'Poppins',sans-serif",
        fontSize: ".84rem",
        lineHeight: 1.75,
        color: "#374151",
        margin: "14px 0 20px",
        flex: 1,
      }}>
        "{t.text}"
      </p>

      {/* Divider */}
      <div style={{ height: 1, background: "#F3F4F6", marginBottom: 18 }} />

      {/* Author */}
      <div className="flex items-center gap-3">
        <img
          src={t.avatar}
          alt={t.name}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            objectFit: "cover",
            flexShrink: 0,
            border: "2px solid #E8F5EE",
          }}
        />
        <div className="flex-1 min-w-0">
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".82rem", fontWeight: 700, color: "#0f2d1a", display: "block" }}>
            {t.name}
          </span>
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".68rem", color: "#9CA3AF", display: "block", marginTop: 1 }}>
            {t.location}
          </span>
        </div>
        <span style={{
          fontFamily: "'Poppins',sans-serif",
          fontSize: ".63rem",
          fontWeight: 600,
          color: "#00AA6C",
          textAlign: "right",
          lineHeight: 1.45,
          maxWidth: 100,
          flexShrink: 0,
        }}>
          {t.experience}
        </span>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section style={{ background: "#f8fdf9", padding: "80px 28px 88px", borderTop: "1px solid #E8F5EE" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div className="mb-12">
          <div
            className="inline-flex items-center gap-1.5 mb-4"
            style={{ background: "#FEF9EC", border: "1px solid #FDE68A", color: "#92610A", fontSize: ".63rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "5px 13px", borderRadius: 100 }}
          >
            <svg width="10" height="10" fill="#F59E0B" viewBox="0 0 24 24">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
            Real Stories
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(1.6rem,2.6vw,2.1rem)", fontWeight: 400, color: "#0f2d1a", margin: "0 0 8px", letterSpacing: "-.01em" }}>
            Loved by Travelers Worldwide
          </h2>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".86rem", color: "#6B7280", margin: 0 }}>
            Real experiences, real people — see what our community is saying
          </p>
        </div>

        {/* Uniform 3-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {VISIBLE.map((t, i) => (
            <ReviewCard key={i} t={t} />
          ))}
        </div>

      </div>
    </section>
  );
}