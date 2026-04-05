import useTranslation from '../../../hooks/useTranslation.js';
import { useState } from 'react'
import { Link } from 'react-router-dom'
import DetailSection from './DetailSection.jsx'
import ExperienceMap from '../../map/ExperienceMap.jsx'

const ItinerarySection = ({ title, steps, center, markers, polyline, hasRealItinerary, summary }) => {
  const { t } = useTranslation();

  const [expandedSteps, setExpandedSteps] = useState({})

  const toggleStepExpanded = (stepKey) => {
    setExpandedSteps((prev) => ({ ...prev, [stepKey]: !prev[stepKey] }))
  }

  return (
    <DetailSection id="itinerary" eyebrow={t("exp_itinerary")} title={title} className="p-4 sm:p-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-4 xl:gap-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-2.5 sm:mb-4 sm:gap-2.5 sm:pb-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{t("itinerary_subtitle")}</p>
              <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                {hasRealItinerary ? 'Follow the route in order.' : 'A clear trip flow so travelers know what happens first, next, and last.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-500 sm:gap-2 sm:text-xs">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600 sm:px-3 sm:py-1">{summary.stepCount} steps</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-700 sm:px-3 sm:py-1">{summary.totalDuration}</span>
            </div>
          </div>

          <div className="max-h-80 space-y-0 overflow-y-auto pr-1 sm:max-h-104 lg:max-h-96">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1
              const isExpanded = Boolean(expandedSteps[step.key])
              const description = step.description || ''
              // Lower threshold so desktop cards still show Read more for medium-long descriptions.
              const canExpandDescription = description.length > 60
              const markerClass = step.variant === 'terminal'
                ? 'bg-amber-300 text-slate-900 border border-amber-500'
                : 'bg-emerald-900 text-white'

              return (
                <div key={step.key} className="group relative flex gap-2 pb-3.5 last:pb-0 sm:gap-2.5 sm:pb-4">
                  {!isLast ? <span className="absolute left-3.5 top-8 h-[calc(100%-8px)] w-px bg-linear-to-b from-slate-300 to-slate-200" /> : null}

                  <span className={`relative z-10 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-2 ring-white transition-transform duration-200 group-hover:scale-105 ${markerClass}`}>
                    {step.badge}
                  </span>

                  <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 shadow-[0_1px_2px_rgba(2,6,23,0.04)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-emerald-100 group-hover:bg-white group-hover:shadow-[0_8px_18px_rgba(2,6,23,0.08)] sm:px-3.5 sm:py-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">{step.label}</p>
                        <p className="mt-1 line-clamp-1 text-[13px] font-bold text-slate-900 sm:text-sm">{step.name}</p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-sm">
                        {step.durationLabel}
                      </span>
                    </div>

                    {step.meta ? <p className="mt-1.5 line-clamp-1 text-xs font-medium text-slate-500">{step.meta}</p> : null}

                    {description ? (
                      <>
                        <p className={`mt-1.5 text-[13px] leading-5 text-slate-600 sm:mt-2 sm:text-sm ${isExpanded ? '' : 'line-clamp-1'}`}>
                          {description}
                        </p>
                        {canExpandDescription ? (
                          <button
                            type="button"
                            onClick={() => toggleStepExpanded(step.key)}
                            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                          >
                            {isExpanded ? 'Read less' : 'Read more'}
                          </button>
                        ) : null}
                      </>
                    ) : null}

                    {step.transitionNote ? <p className="mt-1.5 line-clamp-1 text-xs font-medium text-emerald-700">Next: {step.transitionNote}</p> : null}

                    {step.link ? (
                      <Link to={step.link} className="mt-2 inline-block text-xs font-semibold text-emerald-700 hover:text-emerald-800">{t("itinerary_see_details")}</Link>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>

          {!hasRealItinerary ? (
            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">{t("itinerary_add_journey")}</p>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100">
          <div className="h-56 sm:h-72 lg:h-96">
            <ExperienceMap center={center} markers={markers} polyline={polyline} />
          </div>
        </div>
      </div>
    </DetailSection>
  )
}

export default ItinerarySection