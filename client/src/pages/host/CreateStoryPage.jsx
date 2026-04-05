import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useTranslation from '../../hooks/useTranslation.js'
import Button from '../../components/common/Button.jsx'
import Input from '../../components/common/Input.jsx'
import { createStory } from '../../services/storyService.js'
import { getErrorMessage } from '../../utils/helpers.js'

const EMPTY_SECTION = {
  heading: '',
  body: '',
  imagePosition: 'full',
  imageCaption: '',
  imageFile: null,
}

export default function CreateStoryPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [coverImage, setCoverImage] = useState(null)
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    category: 'Local Story',
    locationLabel: '',
    readTimeMinutes: 6,
    coverImageAlt: '',
    tags: '',
    sections: [{ ...EMPTY_SECTION }],
  })

  const coverPreview = useMemo(() => (coverImage ? URL.createObjectURL(coverImage) : ''), [coverImage])

  const updateSection = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sectionIndex) => sectionIndex === index ? { ...section, [field]: value } : section),
    }))
  }

  const addSection = () => {
    setForm((prev) => ({ ...prev, sections: [...prev.sections, { ...EMPTY_SECTION }] }))
  }

  const removeSection = (index) => {
    setForm((prev) => ({ ...prev, sections: prev.sections.filter((_, sectionIndex) => sectionIndex !== index) }))
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.excerpt.trim()) return toast.error('Excerpt is required')
    if (!coverImage) return toast.error('Cover image is required')
    if (form.sections.some((section) => !section.heading.trim() || !section.body.trim())) {
      return toast.error('Each section needs a heading and body')
    }

    try {
      setLoading(true)
      const fd = new FormData()
      fd.append('title', form.title.trim())
      fd.append('excerpt', form.excerpt.trim())
      fd.append('category', form.category.trim())
      fd.append('locationLabel', form.locationLabel.trim())
      fd.append('readTimeMinutes', String(form.readTimeMinutes || 6))
      fd.append('coverImageAlt', form.coverImageAlt.trim())
      fd.append('tags', JSON.stringify(form.tags.split(',').map((item) => item.trim()).filter(Boolean)))
      fd.append('coverImage', coverImage)

      let imageIndex = 0
      const payloadSections = form.sections.map((section) => {
        const nextSection = {
          heading: section.heading.trim(),
          body: section.body.trim(),
          imagePosition: section.imagePosition,
          imageCaption: section.imageCaption.trim(),
        }

        if (section.imageFile) {
          nextSection.imageIndex = imageIndex
          fd.append('sectionImages', section.imageFile)
          imageIndex += 1
        }

        return nextSection
      })

      fd.append('sections', JSON.stringify(payloadSections))

      const { data } = await createStory(fd)
      toast.success('Story published')
      navigate(`/stories/${data.data.slug}`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <Link to="/host/dashboard" className="text-sm text-emerald-700 hover:underline">← Dashboard</Link>
            <h1 className="mt-2 text-xl font-semibold text-slate-900">Create a host story</h1>
            <p className="mt-2 text-sm leading-7 text-slate-600">Upload a cover image, add story sections, choose image positions, and publish a real editorial-style story readers can browse.</p>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-[#d9cfbf] bg-white p-6 shadow-sm sm:p-8">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Story title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Three slow days through Lahore's old neighborhoods" />
                <Input label={t("search_category")} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Road Trip Story" />
                <Input label="Location label" value={form.locationLabel} onChange={(e) => setForm({ ...form, locationLabel: e.target.value })} placeholder="Lahore, Pakistan" />
                <Input label="Read time (minutes)" type="number" value={form.readTimeMinutes} onChange={(e) => setForm({ ...form, readTimeMinutes: Number(e.target.value) || 6 })} />
                <Input label="Cover image alt text" value={form.coverImageAlt} onChange={(e) => setForm({ ...form, coverImageAlt: e.target.value })} placeholder="Sunset over the old city rooftops" />
                <Input label="Tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="heritage, food, road-trip" />
              </div>
              <div className="mt-4 flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-700">Excerpt</label>
                <textarea rows={4} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 resize-none" placeholder="What should readers understand before opening the story?" />
              </div>
              <div className="mt-4">
                <label className="text-sm font-semibold text-slate-700">Cover image</label>
                <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0] || null)} className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:font-semibold file:text-emerald-700" />
                {coverPreview ? <img src={coverPreview} alt="Cover preview" className="mt-4 h-72 w-full rounded-[22px] object-cover" /> : null}
              </div>
            </section>

            {form.sections.map((section, index) => (
              <section key={index} className="rounded-[28px] border border-[#d9cfbf] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">Section {index + 1}</h2>
                  {form.sections.length > 1 ? (
                    <button type="button" onClick={() => removeSection(index)} className="text-sm font-semibold text-rose-600">Remove</button>
                  ) : null}
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Input label="Heading" value={section.heading} onChange={(e) => updateSection(index, 'heading', e.target.value)} />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Image position</label>
                    <select value={section.imagePosition} onChange={(e) => updateSection(index, 'imagePosition', e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500">
                      <option value="full">Full width</option>
                      <option value="left">Image left</option>
                      <option value="right">Image right</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-700">Body</label>
                  <textarea rows={8} value={section.body} onChange={(e) => updateSection(index, 'body', e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 resize-y" placeholder="Write the story section here..." />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Section image</label>
                    <input type="file" accept="image/*" onChange={(e) => updateSection(index, 'imageFile', e.target.files?.[0] || null)} className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:font-semibold file:text-emerald-700" />
                  </div>
                  <Input label="Image caption" value={section.imageCaption} onChange={(e) => updateSection(index, 'imageCaption', e.target.value)} />
                </div>
              </section>
            ))}

            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={addSection}>+ Add section</Button>
              <Button onClick={handleSubmit} loading={loading}>Publish story</Button>
            </div>
          </div>
        </div>
      </main>
      
    </div>
  )
}
