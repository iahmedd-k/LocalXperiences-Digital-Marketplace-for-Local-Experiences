const variants = {
  primary:  'bg-[#00AA6C] hover:bg-[#008A56] text-white',
  secondary:'bg-gray-100 hover:bg-gray-200 text-gray-800',
  outline:  'border border-[#00AA6C] text-[#00AA6C] hover:bg-[#E8F8F2]',
  ghost:    'text-gray-600 hover:bg-gray-100',
  danger:   'bg-red-500 hover:bg-red-600 text-white',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const Button = ({
  children, variant = 'primary', size = 'md',
  loading = false, fullWidth = false, className = '', ...props
}) => (
  <button
    disabled={loading || props.disabled}
    className={`
      inline-flex items-center justify-center gap-2 font-semibold rounded-lg
      transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
      font-satoshi
      ${variants[variant]} ${sizes[size]}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `}
    {...props}
  >
    {loading && (
      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    )}
    {children}
  </button>
)

export default Button