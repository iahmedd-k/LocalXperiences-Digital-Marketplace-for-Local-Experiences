import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";

export default function AboutPage() {
  const [submitted, setSubmitted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash !== "#contact") return;

    const timer = window.setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [location.hash]);

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

        <section id="contact" style={{ padding: "0 0 72px", scrollMarginTop: 96 }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".68rem", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#00AA6C", margin: "0 0 8px" }}>
                Contact
              </p>
              <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(1.5rem,3vw,2.15rem)", fontWeight: 700, color: "#0f2d1a", margin: "0 0 12px", letterSpacing: "-.015em" }}>
                Talk to the LocalXperiences team
              </h2>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".92rem", color: "#4B5563", lineHeight: 1.8, margin: 0, maxWidth: 720 }}>
                Questions about bookings, hosting, cancellations, or payments? Send us a message and our team will get back quickly.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5" style={{ gap: 18 }}>
              <div className="lg:col-span-3" style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "20px 18px", boxShadow: "0 4px 14px rgba(15,45,26,.05)" }}>
                {submitted ? (
                  <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 12, padding: "14px 12px", marginBottom: 14 }}>
                    <p style={{ margin: 0, fontFamily: "'Poppins',sans-serif", fontSize: ".86rem", color: "#065F46", fontWeight: 600 }}>
                      Thanks, your message has been sent.
                    </p>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
                  <input placeholder="Your name" style={{ border: "1px solid #D1D5DB", borderRadius: 10, padding: "10px 12px", fontFamily: "'Poppins',sans-serif", fontSize: ".84rem" }} />
                  <input placeholder="Your email" style={{ border: "1px solid #D1D5DB", borderRadius: 10, padding: "10px 12px", fontFamily: "'Poppins',sans-serif", fontSize: ".84rem" }} />
                </div>

                <select style={{ width: "100%", marginTop: 12, border: "1px solid #D1D5DB", borderRadius: 10, padding: "10px 12px", fontFamily: "'Poppins',sans-serif", fontSize: ".84rem" }} defaultValue="booking">
                  <option value="booking">Booking support</option>
                  <option value="host">Host onboarding</option>
                  <option value="payment">Payment issue</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>

                <textarea
                  rows={6}
                  placeholder="Tell us how we can help..."
                  style={{ width: "100%", marginTop: 12, border: "1px solid #D1D5DB", borderRadius: 10, padding: "12px", fontFamily: "'Poppins',sans-serif", fontSize: ".84rem", resize: "vertical" }}
                />

                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  style={{ marginTop: 14, background: "#0f2d1a", color: "#fff", border: "none", borderRadius: 999, padding: "10px 16px", fontFamily: "'Poppins',sans-serif", fontSize: ".82rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Send Message
                </button>
              </div>

              <aside className="lg:col-span-2" style={{ background: "linear-gradient(180deg,#f4fff9 0%, #ffffff 100%)", border: "1px solid #D1FAE5", borderRadius: 16, padding: "18px", boxShadow: "0 4px 14px rgba(15,45,26,.04)" }}>
                <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#0f2d1a", margin: "0 0 14px" }}>
                  Support Details
                </h3>
                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#00AA6C", margin: "0 0 4px" }}>
                      Email
                    </p>
                    <a href="mailto:support@localxperiences.com" style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".88rem", color: "#0f2d1a", textDecoration: "none", fontWeight: 600 }}>
                      support@localxperiences.com
                    </a>
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#00AA6C", margin: "0 0 4px" }}>
                      Platform Note
                    </p>
                    <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".84rem", color: "#4B5563", margin: 0 }}>
                      Like other travel platforms, we aim to respond quickly and helpfully to all travelers and hosts.
                    </p>
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#00AA6C", margin: "0 0 4px" }}>
                      Response Time
                    </p>
                    <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".84rem", color: "#4B5563", margin: 0 }}>
                      Usually within 24 hours
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
