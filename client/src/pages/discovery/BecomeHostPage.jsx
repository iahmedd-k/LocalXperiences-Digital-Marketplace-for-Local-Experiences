import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useTranslation from "../../hooks/useTranslation.js";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import { becomeHost } from "../../services/authService.js";
import { setCredentials } from "../../slices/authSlice.js";

const steps = [
  {
    number: "01",
    title: "Create your host profile",
    description: "Set up your public profile, experience details, pricing, and availability in one flow.",
  },
  {
    number: "02",
    title: "Manage bookings with ease",
    description: "Track upcoming guests, update schedules, and respond from the host dashboard.",
  },
  {
    number: "03",
    title: "Grow with verified reviews",
    description: "Deliver great experiences and build trust through ratings and repeat bookings.",
  },
];

const benefits = [
  "Professional host dashboard with booking tools",
  "Simple listing setup for local experiences",
  "Secure payouts and streamlined account management",
  "A clean workflow for schedules, guests, and reviews",
];

export default function BecomeHostPage() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { mutate: upgrade, isPending } = useMutation({
    mutationFn: becomeHost,
    onSuccess: (res) => {
      const { user: updatedUser, token } = res.data.data;
      dispatch(setCredentials({ user: updatedUser, token }));
      toast.success("You're now a host! Let's set up your profile.");
      navigate("/host/profile");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
    },
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <section className="grid gap-8 border-b border-slate-200 pb-10 lg:grid-cols-[1.15fr_.85fr] lg:items-start lg:gap-12">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-700">{t('become_host_badge')}</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.8rem] lg:leading-[1.08]">
              {t('become_host_title')}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
              {t('become_host_text')}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {!isAuthenticated && (
                <>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-emerald-700"
                  >
                    {t('become_host_create_account')}
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 no-underline transition-colors hover:bg-slate-50"
                  >
                    {t('become_host_log_in')}
                  </Link>
                </>
              )}

              {isAuthenticated && user?.role === "traveler" && (
                <button
                  onClick={() => upgrade()}
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPending ? t('become_host_upgrading') : t('become_host_upgrade')}
                </button>
              )}

              {isAuthenticated && user?.role === "host" && (
                <Link
                  to="/host/dashboard"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-emerald-700"
                >
                  {t('become_host_dashboard')}
                </Link>
              )}
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{t('become_host_why')}</p>
            <div className="mt-5 space-y-4">
              {[t('become_host_benefit_1'), t('become_host_benefit_2'), t('become_host_benefit_3'), t('become_host_benefit_4')].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">
                    +
                  </span>
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-emerald-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{t('become_host_theme_title')}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t('become_host_theme_text')}
              </p>
            </div>
          </aside>
        </section>

        <section className="py-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">{t('become_host_how_badge')}</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{t('become_host_how_title')}</h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { number: "01", title: t('become_host_step_1_title'), description: t('become_host_step_1_text') },
              { number: "02", title: t('become_host_step_2_title'), description: t('become_host_step_2_text') },
              { number: "03", title: t('become_host_step_3_title'), description: t('become_host_step_3_text') },
            ].map((step) => (
              <article key={step.number} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold tracking-[0.2em] text-emerald-700">
                  {step.number}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-900 px-6 py-7 text-white shadow-sm sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">{t('become_host_ready_badge')}</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">{t('become_host_ready_title')}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                {t('become_host_ready_text')}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {!isAuthenticated && (
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 no-underline transition-colors hover:bg-slate-100"
                >
                  {t('become_host_start')}
                </Link>
              )}

              {isAuthenticated && user?.role === "traveler" && (
                <button
                  onClick={() => upgrade()}
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPending ? t('become_host_upgrading') : t('become_host_badge')}
                </button>
              )}

              {isAuthenticated && user?.role === "host" && (
                <Link
                  to="/host/dashboard"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 no-underline transition-colors hover:bg-emerald-400"
                >
                  {t('become_host_open_dashboard')}
                </Link>
              )}

              <Link
                to="/search"
                className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 no-underline transition-colors hover:bg-slate-800"
              >
                {t('become_host_explore')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
