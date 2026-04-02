import Avatar from "../common/Avatar.jsx";

export default function ExperienceHost({ host }) {
  const hostName = host?.name || "Local Host";

  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-5">
      <h3 className="mb-4 text-xl font-bold text-slate-900">Hosted by</h3>
      <div className="flex items-center gap-4">
        <Avatar name={hostName} src={host?.profilePic} size="lg" />
        <div>
          <p className="text-sm font-semibold text-slate-800">{hostName}</p>
          <p className="text-sm text-slate-500">Verified host · Responsive communication</p>
        </div>
      </div>
    </section>
  );
}
