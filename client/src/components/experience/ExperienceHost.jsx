import Avatar    from '../common/Avatar.jsx'
import StarRating from '../common/StarRating.jsx'

const ExperienceHost = ({ host }) => {
  if (!host) return null
  return (
    <div className="border border-gray-100 rounded-2xl p-5">
      <h3 className="font-clash font-bold text-lg text-gray-900 mb-4">Your Host</h3>
      <div className="flex items-start gap-4">
        <Avatar name={host.name} src={host.profilePic} size="lg" />
        <div className="flex-1">
          <p className="font-bold text-gray-900">{host.name}</p>
          {host.hostDetails?.tagline && <p className="text-sm text-orange-500 font-medium">{host.hostDetails.tagline}</p>}
          {host.bio && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{host.bio}</p>}
          {host.languages?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {host.languages.map((l) => (
                <span key={l} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{l}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExperienceHost