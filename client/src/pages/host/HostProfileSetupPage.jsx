import { useEffect, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"

import { updateProfile } from "../../services/authService.js"
import { updateUser } from "../../slices/authSlice.js"

function FieldBlock({ label, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
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
  const [photoPreview, setPhotoPreview] = useState(user?.profilePic || null)

  // 🔥 Fix memory leak
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
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

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
          .filter((b) => b.content || b.photo),
      })
    )

    if (photoFile) fd.append("profilePic", photoFile)

    save(fd)
  }

  const updateStoryBlock = (i, field, value) => {
    setStoryBlocks((prev) =>
      prev.map((b, idx) => (idx === i ? { ...b, [field]: value } : b))
    )
  }

  const addStoryBlock = (type) => {
    setStoryBlocks((prev) => [
      ...prev,
      { type, title: "", content: "", photo: "", caption: "" },
    ])
  }

  const removeStoryBlock = (i) => {
    setStoryBlocks((prev) => prev.filter((_, idx) => idx !== i))
  }

  if (!isHost) return null

  return (
    <div className="min-h-screen bg-blue-50">
      <main className="max-w-xl mx-auto px-4 py-5 space-y-6">

        {/* Header */}
        <div>
          <p className="text-xs font-semibold text-emerald-600">Step 2 of 3</p>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Complete your host profile
          </h1>
          <p className="text-sm text-gray-500">
            Build trust with guests before your first booking.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Photo */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-16 h-16 rounded-full overflow-hidden border cursor-pointer bg-gray-100"
            >
              {photoPreview && (
                <img src={photoPreview} className="w-full h-full object-cover" />
              )}
            </div>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-sm font-semibold text-emerald-600"
            >
              {photoPreview ? "Change photo" : "Upload photo"}
            </button>

            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={handlePhoto}
            />
          </div>

          {/* Basic fields */}
          <FieldBlock label="Full name" required>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </FieldBlock>

          <FieldBlock label="About you" required>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="input" />
          </FieldBlock>

          <FieldBlock label="Story headline">
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} className="input" />
          </FieldBlock>

          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="City" value={storyCity} onChange={(e) => setStoryCity(e.target.value)} className="input" />
            <input placeholder="Craft" value={craft} onChange={(e) => setCraft(e.target.value)} className="input" />
          </div>

          <FieldBlock label="Featured tips">
            <textarea value={featuredTips} onChange={(e) => setFeaturedTips(e.target.value)} rows={3} className="input" />
          </FieldBlock>

          {/* Story Blocks */}
          <div className="bg-white border rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-sm">Story blocks</p>
              <div className="flex gap-2 flex-wrap">
                <button type="button" onClick={() => addStoryBlock("text")} className="btn-sm">+ Text</button>
                <button type="button" onClick={() => addStoryBlock("photo")} className="btn-sm">+ Photo</button>
                <button type="button" onClick={() => addStoryBlock("tip")} className="btn-sm">+ Tip</button>
              </div>
            </div>

            {storyBlocks.map((b, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">{b.type}</span>
                  {storyBlocks.length > 1 && (
                    <button onClick={() => removeStoryBlock(i)} className="text-red-500">Remove</button>
                  )}
                </div>

                <input
                  placeholder="Title"
                  value={b.title}
                  onChange={(e) => updateStoryBlock(i, "title", e.target.value)}
                  className="input"
                />

                {b.type === "photo" ? (
                  <>
                    <input placeholder="Photo URL" value={b.photo} onChange={(e) => updateStoryBlock(i, "photo", e.target.value)} className="input" />
                    <input placeholder="Caption" value={b.caption} onChange={(e) => updateStoryBlock(i, "caption", e.target.value)} className="input" />
                  </>
                ) : (
                  <textarea
                    value={b.content}
                    onChange={(e) => updateStoryBlock(i, "content", e.target.value)}
                    rows={3}
                    className="input"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Contact */}
          <FieldBlock label="Phone" required>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
          </FieldBlock>

          <FieldBlock label="Languages">
            <input value={languages} onChange={(e) => setLanguages(e.target.value)} className="input" />
          </FieldBlock>

          {/* Submit */}
          <button
            disabled={isPending}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg text-sm font-semibold"
          >
            {isPending ? "Saving..." : "Save & Continue"}
          </button>

        </form>
      </main>
    </div>
  )
}