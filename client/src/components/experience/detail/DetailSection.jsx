const DetailSection = ({ id, eyebrow, title, meta, children, className = '' }) => {
  return (
    <section id={id} className={`scroll-mt-36 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-7 ${className}`.trim()}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">{eyebrow}</p> : null}
          <h2 className="mt-2 font-clash text-2xl font-bold text-slate-900">{title}</h2>
        </div>
        {meta ? <div>{meta}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

export default DetailSection