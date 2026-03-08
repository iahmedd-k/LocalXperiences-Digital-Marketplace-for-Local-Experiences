import { useState }         from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useQueryClient }   from '@tanstack/react-query'
import toast                from 'react-hot-toast'
import { updateProfile, changePassword } from '../../services/authService.js'
import { updateUser }       from '../../slices/authSlice.js'
import { getErrorMessage }  from '../../utils/helpers.js'
import Navbar               from '../../components/common/Navbar.jsx'
import Footer               from '../../components/common/Footer.jsx'
import Avatar               from '../../components/common/Avatar.jsx'
import Button               from '../../components/common/Button.jsx'
import Input                from '../../components/common/Input.jsx'

const ProfilePage = () => {
  const dispatch    = useDispatch()
  const { user }    = useSelector((s) => s.auth)
  const [tab,       setTab]    = useState('profile')
  const [profile,   setProfile]= useState({ name: user?.name || '', bio: user?.bio || '', phone: user?.phone || '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading,   setLoading]= useState(false)

  const handleProfile = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const { data } = await updateProfile(profile)
      dispatch(updateUser(data.data))
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match')
    if (passwords.newPassword.length < 8) return toast.error('Password must be at least 8 characters')
    try {
      setLoading(true)
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
      toast.success('Password changed!')
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto w-full px-4 py-10">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex items-center gap-5">
          <Avatar name={user?.name} src={user?.profilePic} size="xl" />
          <div>
            <h1 className="font-clash text-2xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full capitalize
              ${user?.role === 'host' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['profile','password'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition
                ${tab === t ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >{t}</button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {tab === 'profile' ? (
            <form onSubmit={handleProfile} className="flex flex-col gap-4">
              <h2 className="font-clash text-xl font-bold text-gray-900 mb-2">Edit Profile</h2>
              <Input label="Full Name" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
              <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} placeholder="+92 300 0000000" />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Bio</label>
                <textarea rows={3} value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  placeholder="Tell others about yourself..."
                  className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-400 resize-none"
                />
              </div>
              <Button type="submit" loading={loading}>Save Changes</Button>
            </form>
          ) : (
            <form onSubmit={handlePassword} className="flex flex-col gap-4">
              <h2 className="font-clash text-xl font-bold text-gray-900 mb-2">Change Password</h2>
              <Input label="Current Password" type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} />
              <Input label="New Password"     type="password" value={passwords.newPassword}     onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} />
              <Input label="Confirm Password" type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} />
              <Button type="submit" loading={loading}>Change Password</Button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ProfilePage