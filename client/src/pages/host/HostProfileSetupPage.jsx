import useTranslation from '../../hooks/useTranslation.js';
import { useEffect, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import {
  Camera,
  ImagePlus,
  MapPin,
  PenSquare,
  Phone,
  Sparkles,
  Trash2,
  User,
} from "lucide-react"

import { updateProfile } from "../../services/authService.js"
import { updateUser } from "../../slices/authSlice.js"
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

export default function HostProfileSetupPage() {
  const { t } = useTranslation();

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
        craft: user?.hostStoryProfile?.craft || "",
        featuredTips: Array.isArray(user?.hostStoryProfile?.featuredTips)
          ? user.hostStoryProfile.featuredTips
          : [],
        storyBlocks: Array.isArray(user?.hostStoryProfile?.storyBlocks)
          ? user.hostStoryProfile.storyBlocks
          : [],
      })
    )

    if (photoFile) fd.append("profilePic", photoFile)

    save(fd)
  }

  if (!isHost) return null

  return (
    <div className="pb-8 sm:pb-10">
      <main className="mx-auto max-w-5xl px-0 sm:px-2">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3 sm:mb-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Profile
            </h1>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Profile Photo
                </p>

                <div className="mt-4 flex flex-col items-center text-center">
                  <div className="relative">
                    <Avatar name={name || user?.name} src={photoPreview} size="xl" />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="absolute bottom-0 right-0 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white shadow-md transition hover:bg-emerald-700"
                      aria-label="Upload profile photo"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="mt-4 max-w-full break-all text-sm font-semibold text-slate-900">
                    {photoFile ? photoFile.name : "Upload a clear host photo"}
                  </p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                    A clean portrait helps guests trust the profile faster.
                  </p>

                  <div className="mt-4 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
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
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
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
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldBlock
                    label="Full name"
                    required
                    icon={User}
                    hint="This appears across the host dashboard and public-facing pages."
                  >
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className={INPUT_CLASS}
                    />
                  </FieldBlock>

                  <FieldBlock
                    label={t("checkout_phone")}
                    required
                    icon={Phone}
                    hint="Used for account and booking coordination."
                  >
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className={INPUT_CLASS}
                    />
                  </FieldBlock>
                </div>

                <FieldBlock
                  label="About you"
                  required
                  icon={PenSquare}
                  hint="Keep it specific and welcoming so guests understand your hosting style."
                >
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={6}
                    placeholder="Example: I host food walks through the old city and love introducing guests to small family-run kitchens, hidden tea spots, and stories behind local dishes."
                    className={TEXTAREA_CLASS}
                  />
                </FieldBlock>

                <div className="grid gap-4 md:grid-cols-2">
                  <FieldBlock label="Headline" icon={Sparkles}>
                    <input
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="A short line that captures your hosting style"
                      className={INPUT_CLASS}
                    />
                  </FieldBlock>

                  <FieldBlock label="City" icon={MapPin}>
                    <input
                      value={storyCity}
                      onChange={(e) => setStoryCity(e.target.value)}
                      placeholder="Karachi"
                      className={INPUT_CLASS}
                    />
                  </FieldBlock>
                </div>

                <FieldBlock
                  label="Languages"
                  icon={User}
                  hint="Separate languages with commas so guests can scan them quickly."
                >
                  <input
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    placeholder="English, Urdu, Punjabi"
                    className={INPUT_CLASS}
                  />
                </FieldBlock>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button
                disabled={isPending}
                className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300 sm:w-auto sm:min-w-[220px]"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
