import { useState } from 'react'

const ExperienceGallery = ({ photos = [], title }) => {
  const [active, setActive] = useState(0)

  if (!photos.length) return (
    <div className="w-full h-72 md:h-96 bg-gradient-to-br from-[#E8F8F2] to-[#C6F0DC] rounded-2xl flex items-center justify-center text-6xl">🌍</div>
  )

  return (
    <div className="flex flex-col gap-2">
      {/* Main image */}
      <div className="w-full h-72 md:h-[420px] rounded-2xl overflow-hidden">
        <img src={photos[active]} alt={title} className="w-full h-full object-cover" />
      </div>
      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((p, i) => (
            <img
              key={i} src={p} alt={`${title} ${i+1}`}
              onClick={() => setActive(i)}
              className={`h-16 w-24 flex-shrink-0 object-cover rounded-lg cursor-pointer border-2 transition
                ${active === i ? 'border-[#00AA6C]' : 'border-transparent hover:border-[#E8F5EE]'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ExperienceGallery