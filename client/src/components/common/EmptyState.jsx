import Button from './Button.jsx'

const EmptyState = ({ icon = '🔍', title, description, action, actionLabel }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    {description && <p className="text-gray-500 text-sm max-w-sm mb-6">{description}</p>}
    {action && <Button onClick={action}>{actionLabel}</Button>}
  </div>
)

export default EmptyState