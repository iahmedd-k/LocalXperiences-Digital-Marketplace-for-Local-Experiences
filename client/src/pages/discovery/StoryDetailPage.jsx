import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import useTranslation from '../../hooks/useTranslation.js';
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import Spinner from '../../components/common/Spinner.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import { getStoryBySlug } from '../../services/storyService.js'

const SECTION_LAYOUTS = {
  full: 'grid-cols-1',
  left: 'lg:grid-cols-[0.82fr_1.18fr]',
  right: 'lg:grid-cols-[1.18fr_0.82fr]',
}

export default function StoryDetailPage() {
  const { t } = useTranslation()
  const { slug } = useParams()

  const { data: story, isLoading } = useQuery({
    queryKey: ['story', slug],
    queryFn: () => getStoryBySlug(slug).then((res) => res.data.data),
    enabled: Boolean(slug),
  })

  if (isLoading) {
    return <div className="min-h-screen flex flex-col"><Navbar /><Spinner size="lg" className="flex-1" /></div>
  }

  if (!story) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f7faf8]">
        <Navbar />
        <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-20">
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center">
            <h1 className="font-clash text-3xl font-bold text-[#0f2d1a]">{t('story_not_found')}</h1>
            <Link to="/stories" className="mt-4 inline-flex rounded-full bg-[#003b1f] px-5 py-3 text-sm font-semibold text-white no-underline">{t('story_back')}</Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-900">
      <Navbar />
      <main className="px-4 pb-14 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl">
            <div className="relative min-h-[380px] sm:min-h-[520px]">
              <img src={story.coverImage} alt={story.coverImageAlt || story.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f2d1a]/80 via-[#0f2d1a]/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#34E0A1]">{story.category || t('story_local_story')}</p>
                <h1 className="mt-3 max-w-4xl font-clash text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">{story.title}</h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/84 sm:text-lg">{story.excerpt}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={story.hostId?.name} src={story.hostId?.profilePic} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{story.hostId?.name || t('story_host_storyteller')}</p>
                    <p className="text-xs text-slate-500">{story.readTimeMinutes || 6} {t('story_min_read')}</p>
                  </div>
                </div>
                {story.locationLabel ? <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0f2d1a]">{story.locationLabel}</span> : null}
                {story.tags?.map((tag) => <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#00AA6C]">#{tag}</span>)}
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-8">
            {story.sections.map((section, index) => {
              const imageFirst = section.image && section.imagePosition === 'left'
              const imageLast = section.image && section.imagePosition === 'right'

              return (
                <section key={`${section.heading}-${index}`} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition sm:p-8">
                  {section.image && section.imagePosition === 'full' ? (
                    <div className="mb-6 overflow-hidden rounded-[24px]">
                      <img src={section.image} alt={section.imageCaption || section.heading} className="h-[320px] w-full object-cover sm:h-[430px]" />
                      {section.imageCaption ? <p className="mt-3 text-sm text-slate-500">{section.imageCaption}</p> : null}
                    </div>
                  ) : null}

                  <div className={`grid gap-6 ${SECTION_LAYOUTS[section.imagePosition] || SECTION_LAYOUTS.full}`}>
                    {imageFirst ? (
                      <div className="overflow-hidden rounded-[24px]">
                        <img src={section.image} alt={section.imageCaption || section.heading} className="h-full w-full object-cover" />
                        {section.imageCaption ? <p className="mt-3 text-sm text-slate-500">{section.imageCaption}</p> : null}
                      </div>
                    ) : null}

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#00AA6C]">{t('story_section')} {index + 1}</p>
                      <h2 className="mt-3 font-clash text-3xl font-bold leading-tight text-[#0f2d1a]">{section.heading}</h2>
                      <div className="mt-5 whitespace-pre-line text-[16px] leading-8 text-slate-700">{section.body}</div>
                    </div>

                    {imageLast ? (
                      <div className="overflow-hidden rounded-[24px]">
                        <img src={section.image} alt={section.imageCaption || section.heading} className="h-full w-full object-cover" />
                        {section.imageCaption ? <p className="mt-3 text-sm text-slate-500">{section.imageCaption}</p> : null}
                      </div>
                    ) : null}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
