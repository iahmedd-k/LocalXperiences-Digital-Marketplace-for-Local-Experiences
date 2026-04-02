import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "../../components/common/Navbar.jsx";
import Footer from "../../components/common/Footer.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import ExperienceCard from "../../components/experience/ExperienceCard.jsx";
import { getHostProfile } from "../../services/hostService.js";

export default function HostProfilePage() {
  const { id } = useParams();
  const { data: host, isLoading } = useQuery({
    queryKey: ["hostProfile", id],
    queryFn: () => getHostProfile(id).then((res) => res.data.data),
    enabled: Boolean(id),
  });

  if (isLoading) return <div className="min-h-screen flex flex-col"><Navbar /><Spinner size="lg" className="flex-1" /></div>;
  if (!host) return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center">Host not found</div><Footer /></div>;

  const storyBlocks = Array.isArray(host?.hostStoryProfile?.storyBlocks) ? host.hostStoryProfile.storyBlocks : [];

  return (
    <div className="min-h-screen bg-[#f7faf8] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-[1080px] overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="h-64 bg-slate-200">
              {host?.hostStoryProfile?.coverPhoto ? (
                <img src={host.hostStoryProfile.coverPhoto} alt={host.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="px-6 py-8">
              <div className="flex flex-wrap items-center gap-4">
                <img src={host.profilePic} alt={host.name} className="h-20 w-20 rounded-full object-cover ring-4 ring-white" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    {host?.hostStoryProfile?.city || "Local host"} {host?.hostStoryProfile?.craft ? `• ${host.hostStoryProfile.craft}` : ""}
                  </p>
                  <h1 className="mt-1 text-3xl font-bold text-slate-900">{host.name}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    {host?.hostStoryProfile?.headline || host.bio || "Host profile"}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_300px]">
                <article className="space-y-6">
                  {storyBlocks.length ? storyBlocks.map((block, index) => (
                    <section key={`${block.type}-${index}`} className="rounded-[24px] border border-slate-200 bg-white p-5">
                      {block.title ? <h2 className="text-xl font-semibold text-slate-900">{block.title}</h2> : null}
                      {block.type === "photo" && block.photo ? (
                        <div className="mt-3 overflow-hidden rounded-[18px]">
                          <img src={block.photo} alt={block.caption || block.title || host.name} className="w-full object-cover" />
                        </div>
                      ) : null}
                      {block.content ? <p className="mt-3 text-sm leading-7 text-slate-700 whitespace-pre-wrap">{block.content}</p> : null}
                      {block.caption ? <p className="mt-2 text-xs text-slate-400">{block.caption}</p> : null}
                    </section>
                  )) : (
                    <section className="rounded-[24px] border border-slate-200 bg-white p-5">
                      <p className="text-sm leading-7 text-slate-600 whitespace-pre-wrap">{host.bio || "This host hasn't added a long-form story yet."}</p>
                    </section>
                  )}
                </article>

                <aside className="space-y-4">
                  <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Insider tips</p>
                    <div className="mt-3 space-y-2">
                      {(host?.hostStoryProfile?.featuredTips || []).length ? host.hostStoryProfile.featuredTips.map((tip) => (
                        <div key={tip} className="rounded-[16px] bg-slate-50 px-3 py-3 text-sm text-slate-600">{tip}</div>
                      )) : <p className="text-sm text-slate-500">No insider tips added yet.</p>}
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Explore experiences</p>
                    <p className="mt-2 text-sm text-slate-600">Every experience below links back to this host story page.</p>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6">
          <div className="mx-auto max-w-[1080px]">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Hosted experiences</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">Book with {host.name}</h2>
              </div>
              <Link to="/search" className="text-sm font-medium text-emerald-700">Browse all</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(host.experiences || []).map((experience) => (
                <ExperienceCard key={experience._id} experience={experience} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
