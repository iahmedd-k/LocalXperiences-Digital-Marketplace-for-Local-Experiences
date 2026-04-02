import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import { becomeHost } from "../../services/authService.js";
import { setCredentials } from "../../slices/authSlice.js";

export default function BecomeHostPage() {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { mutate: upgrade, isPending } = useMutation({
    mutationFn: becomeHost,
    onSuccess: (res) => {
      const { user: updatedUser, token } = res.data.data;
      dispatch(setCredentials({ user: updatedUser, token }));
      toast.success("You're now a host! Let's set up your profile.");
      navigate("/host/setup-profile");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
    },
  });

  return (
    <div className="min-h-screen bg-[#F8FCFA] overflow-x-hidden">
      <Navbar />

      <main>
        <section style={{ padding: "36px 0 30px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".68rem", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#00AA6C", margin: "0 0 8px" }}>
              Become a Host
            </p>
            <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(1.9rem,3.5vw,2.6rem)", fontWeight: 700, color: "#0f2d1a", margin: "0 0 12px", letterSpacing: "-.015em" }}>
              Turn Local Knowledge into Real Income
            </h1>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".92rem", color: "#4B5563", lineHeight: 1.8, margin: 0, maxWidth: 760 }}>
              Create experiences in minutes, manage bookings from your dashboard, and get paid securely through Stripe.
            </p>
          </div>
        </section>

        <section style={{ padding: "8px 0 24px" }}>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)", gap: 16 }}>
            {[
              { title: "1. List", text: "Add photos, schedule, and pricing with simple forms." },
              { title: "2. Host", text: "Accept bookings, manage slots, and message guests." },
              { title: "3. Earn", text: "Receive payouts after successful bookings." },
            ].map((item) => (
              <article key={item.title} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "16px" }}>
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".95rem", fontWeight: 700, color: "#0f2d1a", margin: "0 0 8px" }}>{item.title}</h2>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".82rem", color: "#6B7280", lineHeight: 1.7, margin: 0 }}>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ padding: "0 0 64px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
            <div style={{ background: "linear-gradient(125deg,#0f2d1a 0%,#14532D 100%)", borderRadius: 18, padding: "28px 24px", border: "1px solid rgba(52,224,161,.22)" }}>
              <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "1.16rem", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
                Ready to start hosting?
              </h3>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: ".86rem", color: "rgba(255,255,255,.75)", margin: "0 0 14px" }}>
                Create your host account and publish your first experience today.
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                {!isAuthenticated && (
                  <>
                    <Link
                      to="/signup"
                      className="no-underline inline-flex items-center gap-2"
                      style={{ background: "#34E0A1", color: "#0f2d1a", borderRadius: 999, padding: "9px 16px", fontFamily: "'Poppins',sans-serif", fontSize: ".8rem", fontWeight: 700 }}
                    >
                      Create Host Account
                    </Link>
                    <Link
                      to="/login"
                      className="no-underline inline-flex items-center gap-2"
                      style={{ background: "transparent", color: "#D1FAE5", borderRadius: 999, padding: "8px 14px", border: "1px solid rgba(209,250,229,.45)", fontFamily: "'Poppins',sans-serif", fontSize: ".8rem", fontWeight: 600 }}
                    >
                      Already have an account? Log in
                    </Link>
                  </>
                )}

                {isAuthenticated && user?.role === "traveler" && (
                  <button
                    onClick={() => upgrade()}
                    disabled={isPending}
                    style={{ background: "#34E0A1", color: "#0f2d1a", borderRadius: 999, padding: "9px 16px", border: "none", fontFamily: "'Poppins',sans-serif", fontSize: ".8rem", fontWeight: 700, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}
                  >
                    {isPending ? "Upgrading…" : "Upgrade My Account to Host"}
                  </button>
                )}

                {isAuthenticated && user?.role === "host" && (
                  <Link
                    to="/host/dashboard"
                    className="no-underline inline-flex items-center gap-2"
                    style={{ background: "#34E0A1", color: "#0f2d1a", borderRadius: 999, padding: "9px 16px", fontFamily: "'Poppins',sans-serif", fontSize: ".8rem", fontWeight: 700 }}
                  >
                    Go to Host Dashboard →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
