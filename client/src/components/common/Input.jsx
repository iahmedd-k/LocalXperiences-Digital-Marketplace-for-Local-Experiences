const Input = ({ label, error, icon, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
      <input
        className={`
          w-full px-4 py-2.5 rounded-lg border text-sm font-satoshi
          outline-none transition-all duration-200
          ${icon ? 'pl-10' : ''}
          ${error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
          }
          ${className}
        `}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

export default Input