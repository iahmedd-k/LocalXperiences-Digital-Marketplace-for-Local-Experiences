import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react'

const FALLBACK_PHOTOS = [
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1521292270410-a8c4d716d518?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1400&q=80',
]

export default function ExperienceGallery({ photos = [], title = 'Experience' }) {
  const galleryPhotos = useMemo(() => (photos.length > 0 ? photos : FALLBACK_PHOTOS), [photos])
  const previewPhotos = galleryPhotos.slice(0, 3)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const openViewer = (index) => {
    setActiveIndex(index)
    setIsViewerOpen(true)
  }

  const closeViewer = () => setIsViewerOpen(false)
  const showPrevious = () => setActiveIndex((prev) => (prev === 0 ? galleryPhotos.length - 1 : prev - 1))
  const showNext = () => setActiveIndex((prev) => (prev === galleryPhotos.length - 1 ? 0 : prev + 1))

  useEffect(() => {
    if (!isViewerOpen) return undefined

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeViewer()
      if (event.key === 'ArrowLeft') showPrevious()
      if (event.key === 'ArrowRight') showNext()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isViewerOpen, galleryPhotos.length])

  return (
    <>
      <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
        <div className="grid gap-1.5 lg:grid-cols-[minmax(0,2.15fr)_minmax(300px,1fr)]">
          <button
            type="button"
            onClick={() => openViewer(0)}
            className="group relative min-h-[320px] overflow-hidden bg-slate-900 text-left sm:min-h-[420px] lg:min-h-[510px]"
          >
            <img
              src={previewPhotos[0]}
              alt={title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
            <div className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-[#0d3b1f] px-4 py-2 text-sm font-semibold text-white shadow-lg">
              <Images className="h-4 w-4" />
              {galleryPhotos.length.toLocaleString()}
            </div>
          </button>

          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
            {previewPhotos.slice(1, 3).map((photo, index) => (
              <button
                key={`${photo}-${index}`}
                type="button"
                onClick={() => openViewer(index + 1)}
                className="group relative min-h-[180px] overflow-hidden bg-slate-900 text-left sm:min-h-[205px] lg:min-h-[254px]"
              >
                <img
                  src={photo}
                  alt={`${title} ${index + 2}`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {isViewerOpen ? (
        <div className="fixed inset-0 z-[90] bg-slate-950/55 p-4 backdrop-blur-sm sm:p-6">
          <div className="mx-auto flex h-full max-w-[1720px] flex-col overflow-hidden rounded-[26px] bg-white shadow-[0_30px_120px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
              <div className="min-w-0">
                <h2 className="truncate font-clash text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {activeIndex + 1} of {galleryPhotos.length} photos
                </p>
              </div>
              <button
                type="button"
                onClick={closeViewer}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100"
                aria-label="Close gallery"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="border-b border-slate-200 bg-white px-5 py-5 lg:border-b-0 lg:border-r lg:px-6">
                <button
                  type="button"
                  onClick={closeViewer}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to album
                </button>
                <div className="mt-6">
                  <p className="text-lg font-semibold text-slate-900">All photos</p>
                  <p className="mt-1 text-sm text-slate-500">Choose any image to preview it larger.</p>
                </div>
                <div className="mt-5 grid max-h-[52vh] grid-cols-3 gap-3 overflow-y-auto pr-1 lg:grid-cols-2 lg:max-h-[62vh]">
                  {galleryPhotos.map((photo, index) => (
                    <button
                      key={`${photo}-${index}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`overflow-hidden rounded-2xl border-2 transition ${activeIndex === index ? 'border-emerald-600 shadow-sm' : 'border-transparent hover:border-slate-300'}`}
                    >
                      <img
                        src={photo}
                        alt={`${title} thumbnail ${index + 1}`}
                        className="h-20 w-full object-cover sm:h-24"
                      />
                    </button>
                  ))}
                </div>
              </aside>

              <div className="relative min-h-[360px] bg-black">
                <div className="absolute inset-x-0 top-5 z-10 text-center text-base font-semibold text-white sm:text-2xl">
                  {activeIndex + 1} of {galleryPhotos.length} in All photos
                </div>
                <button
                  type="button"
                  onClick={showPrevious}
                  className="absolute left-4 top-1/2 z-10 inline-flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-[#0d3b1f] text-white shadow-lg transition hover:bg-[#12572d]"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <div className="flex h-full items-center justify-center px-16 py-12 sm:px-24">
                  <img
                    src={galleryPhotos[activeIndex]}
                    alt={`${title} ${activeIndex + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={showNext}
                  className="absolute right-4 top-1/2 z-10 inline-flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-[#0d3b1f] text-white shadow-lg transition hover:bg-[#12572d]"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
