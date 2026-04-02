import { useEffect, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import {
  Camera,
  FileImage,
  ImagePlus,
  MapPin,
  PenSquare,
  Phone,
  Plus,
  Sparkles,
  Trash2,
  User,
} from "lucide-react"

import { updateProfile } from "../../services/authService.js"
import { updateUser } from "../../slices/authSlice.js"
import Navbar from "../../components/Navbar.jsx"
import Avatar from "../../components/common/Avatar.jsx"

const INPUT_CLASS =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"

const TEXTAREA_CLASS = `${INPUT_CLASS} min-h-[120px] resize-y`

function FieldBlock({ label, required, hint, icon: Icon, children }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {Icon ? <Icon className="h-3.5 w-3.5 text-emerald-600" /> : null}
        <span>
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </span>
      </label>
      {children}
      {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
    </div>
  )
}

function StoryBlockEditor({ block, index, canRemove, onUpdate, onRemove }) {
  const isPhoto = block.type === "photo"

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-600">
            {block.type} block
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">Story section {index + 1}</p>
        </div>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        ) : null}
      </div>

      <div className="space-y-4">
        <input
          value={block.title}
          onChange={(e) => onUpdate("title", e.target.value)}
          placeholder="Give this section a short title"
          className={INPUT_CLASS}
        />

        {isPhoto ? (
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={block.photo}
              onChange={(e) => onUpdate("photo", e.target.value)}
              placeholder="Paste photo URL"
              className={INPUT_CLASS}
            />
            <input
              value={block.caption}
              onChange={(e) => onUpdate("caption", e.target.value)}
              placeholder="Write a short caption"
              className={INPUT_CLASS}
            />
          </div>
        ) : (
          <textarea
            value={block.content}
            onChange={(e) => onUpdate("content", e.target.value)}
            rows={4}
            placeholder={
              block.type === "tip"
                ? "Share a local tip guests should know."
                : "Tell your story in a warm, specific way."
            }
            className={`${INPUT_CLASS} min-h-[132px] resize-y`}
          />
        )}
      </div>
    </div>
  )
}

export default function HostProfileSetupPage() {
  const { user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const isHost = user?.role === "host"

  const [name, setName] = useState(user?.name || "")
  const [bio, setBio] = useState(user?.bio || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [languages, setLanguages] = useState((user?.languages || []).join(", "))

  const [headline, setHeadline] = useState(user?.hostStoryProfile?.headline || "")
  const [storyCity, setStoryCity] = useState(user?.hostStoryProfile?.city || "")
  const [craft, setCraft] = useState(user?.hostStoryProfile?.craft || "")
  const [featuredTips, setFeaturedTips] = useState(
    (user?.hostStoryProfile?.featuredTips || []).join("\n")
  )

  const [storyBlocks, setStoryBlocks] = useState(
    Array.isArray(user?.hostStoryProfile?.storyBlocks) &&
      user.hostStoryProfile.storyBlocks.length
      ? user.hostStoryProfile.storyBlocks
      : [{ type: "text", title: "", content: "", photo: "", caption: "" }]
  )

  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(user?.profilePic || "")

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview])

  useEffect(() => {
    if (!isHost) navigate("/become-host", { replace: true })
  }, [isHost, navigate])

  const { mutate: save, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (res) => {
      dispatch(updateUser(res.data.data))
      toast.success("Profile saved!")
      navigate("/host/dashboard")
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to save")
    },
  })

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview)
    }

    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name.trim()) return toast.error("Full name is required")
    if (bio.trim().length < 20) return toast.error("Bio must be at least 20 characters")
    if (!phone.trim()) return toast.error("Phone required")

    const fd = new FormData()
    fd.append("name", name.trim())
    fd.append("bio", bio.trim())
    fd.append("phone", phone.trim())
    if (languages.trim()) fd.append("languages", languages.trim())

    fd.append(
      "hostStoryProfile",
      JSON.stringify({
        headline: headline.trim(),
        city: storyCity.trim(),
        craft: craft.trim(),
        featuredTips: featuredTips
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean),
        storyBlocks: storyBlocks
          .map((b) => ({
            type: b.type,
            title: b.title?.trim(),
            content: b.content?.trim(),
            photo: b.photo?.trim(),
            caption: b.caption?.trim(),
          }))
          .filter((b) => b.content || b.photo || b.title),
      })
    )

    if (photoFile) fd.append("profilePic", photoFile)

    save(fd)
  }

  const updateStoryBlock = (index, field, value) => {
    setStoryBlocks((prev) =>
      prev.map((block, currentIndex) =>
        currentIndex === index ? { ...block, [field]: value } : block
      )
    )
  }

  const addStoryBlock = (type) => {
    setStoryBlocks((prev) => [
      ...prev,
      { type, title: "", content: "", photo: "", caption: "" },
    ])
  }

  const removeStoryBlock = (index) => {
    setStoryBlocks((prev) => prev.filter((_, currentIndex) => currentIndex !== index))
  }

  if (!isHost) return null

  return (
    <div className="min-h-screen bg-white">
      <Navbar isDashboard={true} onMenuToggle={() => {}} />
      <div aria-hidden="true" className="h-20 md:h-[92px]" />

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="bg-[linear-gradient(135deg,#ecfdf5_0%,#f8fafc_100%)] px-6 py-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-700">
                  Host Setup
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  Complete your host profile
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Add a confident photo, a clear story, and the details guests need before they trust you with a booking.
                </p>
              </div>

              <div className="space-y-4 px-6 py-6">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-900">What guests notice first</p>
                  <ul className="mt-3 space-y-2 text-sm text-emerald-800">
                    <li className="flex gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                      A sharp, friendly photo
                    </li>
                    <li className="flex gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                      A real story about your local expertise
                    </li>
                    <li className="flex gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                      Clear contact and language details
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Profile Preview</p>
                  <div className="mt-4 flex items-center gap-4">
                    <Avatar name={name || user?.name} src={photoPreview} size="xl" />
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-slate-900">{name || "Your name"}</p>
                      <p className="mt-1 text-sm text-slate-500">{headline || "Your host headline will appear here"}</p>
                      <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-700">
                        {storyCity || "City"}{craft ? ` · ${craft}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
                    Profile Photo
                  </p>

                  <div className="mt-5 flex flex-col items-center text-center">
                    <div className="relative">
                      <div className="rounded-full border-4 border-white shadow-lg">
                        <Avatar name={name || user?.name} src={photoPreview} size="xl" />
                      </div>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="absolute bottom-1 right-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-700"
                        aria-label="Upload profile photo"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="mt-5 text-base font-semibold text-slate-900">
                      {photoFile ? photoFile.name : "Add a polished host photo"}
                    </p>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                      Use a clear portrait with good lighting. Square images look best in listings and profile cards.
                    </p>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        <ImagePlus className="h-4 w-4" />
                        {photoPreview ? "Change photo" : "Upload photo"}
                      </button>

                      {photoPreview ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (photoPreview?.startsWith("blob:")) {
                              URL.revokeObjectURL(photoPreview)
                            }
                            setPhotoFile(null)
                            setPhotoPreview(user?.profilePic || "")
                            if (fileRef.current) fileRef.current.value = ""
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      ) : null}
                    </div>

                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhoto}
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <FieldBlock
                    label="Full name"
                    required
                    icon={User}
                    hint="This is how guests will see your name across the dashboard and public host pages."
                  >
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className={INPUT_CLASS}
                    />
                  </FieldBlock>

                  <FieldBlock
                    label="About you"
                    required
                    icon={PenSquare}
                    hint="Keep it specific. Mention what you host, why you love it, and what guests can expect from your style."
                  >
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={6}
                      placeholder="Example: I host food walks through the old city and love introducing guests to small family-run kitchens, hidden tea spots, and stories behind local dishes."
                      className={TEXTAREA_CLASS}
                    />
                  </FieldBlock>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FieldBlock label="Story headline" icon={Sparkles}>
                  <input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="A short line that captures your hosting style"
                    className={INPUT_CLASS}
                  />
                </FieldBlock>

                <FieldBlock
                  label="Phone"
                  required
                  icon={Phone}
                  hint="Only used for account and booking coordination."
                >
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className={INPUT_CLASS}
                  />
                </FieldBlock>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FieldBlock label="City" icon={MapPin}>
                  <input
                    value={storyCity}
                    onChange={(e) => setStoryCity(e.target.value)}
                    placeholder="Karachi"
                    className={INPUT_CLASS}
                  />
                </FieldBlock>

                <FieldBlock label="Craft or specialty" icon={Sparkles}>
                  <input
                    value={craft}
                    onChange={(e) => setCraft(e.target.value)}
                    placeholder="Street food, old city walks, pottery, music"
                    className={INPUT_CLASS}
                  />
                </FieldBlock>
              </div>

              <FieldBlock
                label="Languages"
                icon={User}
                hint="Separate languages with commas so guests can quickly scan them."
              >
                <input
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="English, Urdu, Punjabi"
                  className={INPUT_CLASS}
                />
              </FieldBlock>

              <FieldBlock
                label="Featured tips"
                icon={Sparkles}
                hint="Add one tip per line, like what to wear, when to arrive, or what local detail guests should not miss."
              >
                <textarea
                  value={featuredTips}
                  onChange={(e) => setFeaturedTips(e.target.value)}
                  rows={4}
                  placeholder={"Wear comfortable shoes\nArrive 10 minutes early\nBring cash for small local vendors"}
                  className={`${INPUT_CLASS} min-h-[140px] resize-y`}
                />
              </FieldBlock>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
                      Story Blocks
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-slate-900">Build a profile that feels human</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Mix story, tips, and photos so guests understand your personality before they book.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { type: "text", label: "Text" },
                      { type: "photo", label: "Photo" },
                      { type: "tip", label: "Tip" },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => addStoryBlock(item.type)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Plus className="h-4 w-4" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {storyBlocks.map((block, index) => (
                    <StoryBlockEditor
                      key={`${block.type}-${index}`}
                      block={block}
                      index={index}
                      canRemove={storyBlocks.length > 1}
                      onUpdate={(field, value) => updateStoryBlock(index, field, value)}
                      onRemove={() => removeStoryBlock(index)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                    <FileImage className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Ready to publish your host identity</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Save this profile to unlock the full host dashboard and start creating experiences.
                    </p>
                  </div>
                </div>

                <button
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300 sm:min-w-[220px]"
                >
                  {isPending ? "Saving..." : "Save & Continue"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
