import { useState }           from 'react'
import { Link, useNavigate }  from 'react-router-dom'
import { useDispatch }        from 'react-redux'
import toast                  from 'react-hot-toast'
import { setCredentials }     from '../../slices/authSlice.js'
import { signup, googleLogin } from '../../services/authService.js'
import { getErrorMessage }    from '../../utils/helpers.js'
import Button                 from '../../components/common/Button.jsx'
import Input                  from '../../components/common/Input.jsx'

const SignupPage = () => {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const [form,    setForm]    = useState({ name: '', email: '', password: '', role: 'traveler' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all fields')
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    try {
      setLoading(true)
      const { data } = await signup(form)
      dispatch(setCredentials({ user: data.data.user, token: data.data.token }))
      toast.success(`Welcome to LocalXperiences, ${data.data.user.name.split(' ')[0]}!`)
      navigate('/')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="font-clash text-2xl font-bold text-gray-900 block mb-8">
            Local<span className="text-orange-500">X</span>periences
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-500 mb-8">Join thousands of local explorers</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Ahmed Khan" />
            <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
            <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" />

            {/* Role selector */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'traveler', label: '🧳 Discover Experiences', desc: 'Browse & book' },
                  { value: 'host',     label: '🏠 Host Experiences',     desc: 'List & earn'  },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`p-3 rounded-xl border-2 text-left transition-all
                      ${form.role === r.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="text-sm font-semibold text-gray-800">{r.label}</div>
                    <div className="text-xs text-gray-500">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">Create Account</Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"/>
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200"/>
          </div>

          <button
            onClick={googleLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right — Visual */}
      <div className="hidden lg:flex flex-1 bg-gray-900 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0" style={{background:'radial-gradient(ellipse at 40% 60%, rgba(249,115,22,0.3) 0%, transparent 60%)'}}/>
        <div className="relative text-center px-12">
          <div className="text-7xl mb-6">✨</div>
          <h2 className="font-clash text-4xl font-bold text-white mb-4">Your Next<br/>Adventure<br/>Awaits</h2>
          <p className="text-gray-400 text-lg">From pottery workshops to hidden food tours — your perfect experience is one click away.</p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage