import { CalendarDays, Compass, Map, MessageSquareQuote, Star, WalletCards } from 'lucide-react';

const DEFAULT_ICON = <Compass className="h-6 w-6" strokeWidth={2.1} />;

const ICON_MAP = {
  Calendar: <CalendarDays className="h-6 w-6" strokeWidth={2.1} />,
  Map: <Map className="h-6 w-6" strokeWidth={2.1} />,
  Location: <Map className="h-6 w-6" strokeWidth={2.1} />,
  Rating: <Star className="h-6 w-6" strokeWidth={2.1} />,
  Wallet: <WalletCards className="h-6 w-6" strokeWidth={2.1} />,
  QnA: <MessageSquareQuote className="h-6 w-6" strokeWidth={2.1} />,
};

export default function EmptyState({ icon, title, description, action, actionLabel }) {
  const resolvedIcon = typeof icon === 'string' ? (ICON_MAP[icon] || DEFAULT_ICON) : (icon || DEFAULT_ICON);

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 px-6 py-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-600 border border-emerald-100">
        {resolvedIcon}
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      {action && typeof action === "function" && actionLabel && (
        <button
          onClick={action}
          className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          {actionLabel}
        </button>
      )}
      {action && typeof action !== "function" && <div className="mt-4">{action}</div>}
    </div>
  );
}
