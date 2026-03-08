import { CATEGORIES } from '../../config/constants.js'

const CategoryTabs = ({ active, onChange, dark = false }) => (
  <div className="flex gap-2 flex-wrap justify-center">
    <button
      onClick={() => onChange('')}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap
        ${active === ''
          ? 'bg-orange-500 text-white'
          : dark
            ? 'bg-white/10 border border-white/20 text-gray-300 hover:bg-orange-500 hover:border-orange-500 hover:text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600'
        }`}
    >
      🌍 All
    </button>
    {CATEGORIES.map((cat) => (
      <button
        key={cat.value}
        onClick={() => onChange(cat.value)}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap
          ${active === cat.value
            ? 'bg-orange-500 text-white'
            : dark
              ? 'bg-white/10 border border-white/20 text-gray-300 hover:bg-orange-500 hover:border-orange-500 hover:text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600'
          }`}
      >
        {cat.label}
      </button>
    ))}
  </div>
)

export default CategoryTabs