import { useEffect, useRef, useState } from 'react'

const DetailTabs = ({ tabs, activeSection, onTabClick }) => {
  const wrapperRef = useRef(null)
  const [isPinned, setIsPinned] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const el = wrapperRef.current
      if (!el) return

      const topOffset = window.innerWidth >= 768 ? 12 : 8
      const rect = el.getBoundingClientRect()
      setIsPinned(rect.top <= topOffset + 0.5)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      ref={wrapperRef}
      className={`sticky top-2 z-20 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white/95 px-2 py-2 backdrop-blur md:top-3 ${isPinned ? 'shadow-lg shadow-slate-300/55' : 'shadow-sm'}`}
    >
      <div className="flex min-w-max gap-1">
        {tabs.map((tab) => {
          const isActive = activeSection === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabClick(tab.id)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default DetailTabs