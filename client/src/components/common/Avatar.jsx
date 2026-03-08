import { getInitials, getAvatarColor } from '../../utils/helpers.js'

const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' }

const Avatar = ({ name = '', src, size = 'md', className = '' }) => {
  if (src) return (
    <img src={src} alt={name} className={`rounded-full object-cover ${sizes[size]} ${className}`} />
  )
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${sizes[size]} ${className}`}
      style={{ background: getAvatarColor(name) }}
    >
      {getInitials(name)}
    </div>
  )
}

export default Avatar