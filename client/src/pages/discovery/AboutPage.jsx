import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FCFA] overflow-x-hidden">
      <Navbar />

      <main>
        <section style={{ padding: "34px 0 26px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".68rem", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#00AA6C", margin: "0 0 8px" }}>
              About LocalXperiences
            </p>
            <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(1.8rem,3.4vw,2.6rem)", fontWeight: 700, color: "#0f2d1a", margin: "0 0 12px", letterSpacing: "-.015em" }}>
              Making Travel More Local, Human, and Memorable
            </h1>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".95rem", color: "#4B5563", lineHeight: 1.8, margin: 0, maxWidth: 760 }}>
              LocalXperiences connects travelers with trusted local hosts for authentic tours, workshops, food trails, and hidden gems.
              We focus on quality experiences, secure booking, and a smooth host and traveler journey.
            </p>
          </div>
        </section>

        <section style={{ padding: "20px 0 50px" }}>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)", gap: 18 }}>
            {[
              {
                title: "Our Mission",
                text: "Help people discover places through locals, not generic tourist checklists.",
              },
              {
                title: "Our Trust Standard",
                text: "Profiles, reviews, and secure payments create confidence for every booking.",
              },
              {
                title: "Our Promise",
                text: "Keep discovery simple, booking fast, and experiences unforgettable.",
              },
            ].map((item) => (
              <article key={item.title} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "18px 18px 16px", boxShadow: "0 4px 14px rgba(15,45,26,.05)" }}>
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#0f2d1a", margin: "0 0 8px" }}>
                  {item.title}
                </h2>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".84rem", color: "#6B7280", lineHeight: 1.7, margin: 0 }}>
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ padding: "0 0 60px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
            <div style={{ background: "linear-gradient(120deg,#0f2d1a 0%, #0f3e26 100%)", borderRadius: 18, padding: "26px 24px", border: "1px solid rgba(52,224,161,.2)" }}>
              <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
                Want to build experiences with us?
              </h3>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".86rem", color: "rgba(255,255,255,.75)", margin: "0 0 14px" }}>
                Join as a host and turn your local knowledge into meaningful income.
              </p>
              <Link
                to="/become-host"
                className="no-underline inline-flex items-center gap-2"
                style={{ background: "#34E0A1", color: "#0f2d1a", borderRadius: 999, padding: "9px 16px", fontFamily: "'Poppins',sans-serif", fontSize: ".8rem", fontWeight: 700 }}
              >
                Become a Host
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
