import { useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FCFA] overflow-x-hidden">
      <Navbar />

      <main>
        <section style={{ padding: "34px 0 24px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".68rem", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#00AA6C", margin: "0 0 8px" }}>
              Contact
            </p>
            <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(1.8rem,3.4vw,2.5rem)", fontWeight: 700, color: "#0f2d1a", margin: "0 0 12px", letterSpacing: "-.015em" }}>
              We are Here to Help
            </h1>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".92rem", color: "#4B5563", lineHeight: 1.8, margin: 0, maxWidth: 720 }}>
              Questions about bookings, hosting, cancellations, or payments? Send us a message and our team will get back quickly.
            </p>
          </div>
        </section>

        <section style={{ padding: "14px 0 64px" }}>
          <div className="grid grid-cols-1 lg:grid-cols-5" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)", gap: 18 }}>
            <div className="lg:col-span-3" style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "20px 18px" }}>
              {submitted ? (
                <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 12, padding: "14px 12px" }}>
                  <p style={{ margin: 0, fontFamily: "'Poppins',sans-serif", fontSize: ".86rem", color: "#065F46", fontWeight: 600 }}>
                    Thanks, your message has been sent.
                  </p>
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12, marginTop: submitted ? 14 : 0 }}>
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

            <aside className="lg:col-span-2" style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "18px" }}>
              <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#0f2d1a", margin: "0 0 10px" }}>
                Support Details
              </h2>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".84rem", color: "#6B7280", margin: "0 0 8px" }}>
                Email: support@localxperiences.com
              </p>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".84rem", color: "#6B7280", margin: "0 0 8px" }}>
                Hours: Mon - Fri, 9:00 AM - 7:00 PM
              </p>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".84rem", color: "#6B7280", margin: 0 }}>
                Avg response time: under 24 hours
              </p>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
