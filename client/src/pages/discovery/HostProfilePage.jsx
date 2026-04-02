import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Clock3, MapPin, Star } from "lucide-react";
import Navbar from "../../components/common/Navbar.jsx";
import Footer from "../../components/common/Footer.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import ExperienceCard from "../../components/experience/ExperienceCard.jsx";
import Avatar from "../../components/common/Avatar.jsx";
import { getHostProfile } from "../../services/hostService.js";
import { formatDate, formatDuration, formatPrice } from "../../utils/formatters.js";

const metricCardClass = "rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm";

export default function HostProfilePage() {
  const { id } = useParams();
  const { data: host, isLoading } = useQuery({
    queryKey: ["hostProfile", id],
    queryFn: () => getHostProfile(id).then((res) => res.data.data),
    enabled: Boolean(id),
  });

  if (isLoading) return <div className="min-h-screen flex flex-col"><Navbar /><Spinner size="lg" className="flex-1" /></div>;
  if (!host) return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center">Host not found</div><Footer /></div>;

  const experiences = Array.isArray(host?.experiences) ? host.experiences : [];
  const stories = Array.isArray(host?.stories) ? host.stories : [];
  const pathways = Array.isArray(host?.pathways) ? host.pathways : [];
  const reviews = Array.isArray(host?.reviews) ? host.reviews : [];
  const joinedLabel = host?.createdAt ? formatDate(host.createdAt) : null;
  const hostLocation = host?.hostStoryProfile?.city || host?.hostDetails?.city || experiences[0]?.location?.city || "";
  const hostCraft = host?.hostStoryProfile?.craft || host?.hostDetails?.specialty || "";
  const reviewAverage = Number(host?.reviewSummary?.average || 0);
  const reviewCount = Number(host?.reviewSummary?.count || reviews.length || 0);
  const spokenLanguages = Array.isArray(host?.languages) ? host.languages.filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-[#f7faf8] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-[1180px] overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="relative h-64 bg-slate-200 sm:h-72">
              {host?.hostStoryProfile?.coverPhoto ? (
                <img src={host.hostStoryProfile.coverPhoto} alt={host.name} className="h-full w-full object-cover" />
              ) : experiences[0]?.photos?.[0] ? (
                <img src={experiences[0].photos[0]} alt={host.name} className="h-full w-full object-cover" />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f2d1a]/75 via-[#0f2d1a]/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 px-6 py-6 sm:px-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7ef0c3]">
                  {hostLocation || "Local host"}{hostCraft ? ` • ${hostCraft}` : ""}
                </p>
                <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{host.name}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/85">
                  {host?.hostStoryProfile?.headline || host?.bio || "Explore this host's local experiences, stories, pathways, and guest feedback."}
                </p>
              </div>
            </div>

            <div className="px-6 py-8 sm:px-8">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <section className="space-y-6">
                  <div className="flex flex-wrap items-start gap-4">
                    <Avatar name={host.name} src={host.profilePic} size="xl" />
                    <div className="min-w-[220px] flex-1">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                        {hostLocation ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{hostLocation}</span> : null}
                        {joinedLabel ? <span>Joined {joinedLabel}</span> : null}
                        {spokenLanguages.length ? <span>Speaks {spokenLanguages.join(", ")}</span> : null}
                      </div>
                      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                        {host.bio || "This host has not added a bio yet."}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className={metricCardClass}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Experiences</p>
                      <p className="mt-3 text-3xl font-bold text-slate-900">{experiences.length}</p>
                    </div>
                    <div className={metricCardClass}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Stories & pathways</p>
                      <p className="mt-3 text-3xl font-bold text-slate-900">{stories.length + pathways.length}</p>
                    </div>
                    <div className={metricCardClass}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Guest rating</p>
                      <div className="mt-3 flex items-center gap-2">
                        <p className="text-3xl font-bold text-slate-900">{reviewCount ? reviewAverage.toFixed(1) : "New"}</p>
                        {reviewCount ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"><Star className="h-3.5 w-3.5 fill-current" />{reviewCount} reviews</span> : null}
                      </div>
                    </div>
                  </div>
                </section>

                <aside className="space-y-4">
                  <div className={metricCardClass}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Host details</p>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                      {hostCraft ? <p><span className="font-semibold text-slate-900">Specialty:</span> {hostCraft}</p> : null}
                      {hostLocation ? <p><span className="font-semibold text-slate-900">Based in:</span> {hostLocation}</p> : null}
                      <p><span className="font-semibold text-slate-900">Public profile:</span> Experiences, published stories, public pathways, and guest reviews.</p>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6">
          <div className="mx-auto max-w-[1180px] space-y-14">
            <section>
              <div className="mb-5 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Hosted experiences</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">Book with {host.name}</h2>
                </div>
                <Link to="/search" className="text-sm font-medium text-emerald-700">Browse all</Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {experiences.map((experience) => (
                  <ExperienceCard key={experience._id} experience={experience} />
                ))}
              </div>
              {!experiences.length ? <p className="rounded-[24px] border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-500">No public experiences are available for this host yet.</p> : null}
            </section>

            <section>
              <div className="mb-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Stories</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">Published host stories</h2>
              </div>
              {stories.length ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {stories.map((story) => (
                    <Link key={story._id} to={`/stories/${story.slug}`} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm no-underline transition hover:-translate-y-0.5 hover:shadow-md">
                      <div className="h-52 overflow-hidden bg-slate-100">
                        {story.coverImage ? <img src={story.coverImage} alt={story.coverImageAlt || story.title} className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">{story.category || "Story"}</p>
                        <h3 className="mt-2 text-xl font-bold text-slate-900">{story.title}</h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{story.excerpt}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          {story.locationLabel ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{story.locationLabel}</span> : null}
                          <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{story.readTimeMinutes || 6} min read</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : <p className="rounded-[24px] border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-500">This host has not published any stories yet.</p>}
            </section>

            <section>
              <div className="mb-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Pathways</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">Curated local pathways</h2>
              </div>
              {pathways.length ? (
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {pathways.map((pathway) => (
                    <Link key={pathway._id} to={`/pathways/${pathway._id}`} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm no-underline transition hover:-translate-y-0.5 hover:shadow-md">
                      <div className="h-44 overflow-hidden bg-slate-100">
                        {pathway.coverPhoto ? <img src={pathway.coverPhoto} alt={pathway.title} className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-slate-900">{pathway.title}</h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{pathway.description || "A curated route from this host."}</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                          {pathway.city ? <span className="rounded-full bg-slate-100 px-2.5 py-1">{pathway.city}</span> : null}
                          {pathway.totalDuration ? <span className="rounded-full bg-slate-100 px-2.5 py-1">{formatDuration(pathway.totalDuration)}</span> : null}
                          {pathway.totalPrice ? <span className="rounded-full bg-slate-100 px-2.5 py-1">{formatPrice(pathway.totalPrice)}</span> : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : <p className="rounded-[24px] border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-500">This host has not shared any public pathways yet.</p>}
            </section>

            <section>
              <div className="mb-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Reviews</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">What guests say about {host.name}</h2>
              </div>
              {reviews.length ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {reviews.map((review) => (
                    <article key={review._id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={review.userId?.name || review.guestName || "Guest"} src={review.userId?.profilePic} size="md" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{review.userId?.name || review.guestName || "Guest"}</p>
                            <p className="text-xs text-slate-500">{review.experienceId?.title || "Experience"}</p>
                          </div>
                        </div>
                        <div className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          {Number(review.rating || 0).toFixed(1)}
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-slate-600">{review.comment || "Guest left a rating."}</p>
                      <p className="mt-4 text-xs text-slate-400">{formatDate(review.createdAt)}</p>
                    </article>
                  ))}
                </div>
              ) : <p className="rounded-[24px] border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-500">No guest reviews are visible for this host yet.</p>}
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
