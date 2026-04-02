export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
      <div className={`w-full ${maxWidth} rounded-2xl border border-emerald-100 bg-white p-5 shadow-xl`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="Close"
          >
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
