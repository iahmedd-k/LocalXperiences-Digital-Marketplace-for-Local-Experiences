import { Link, useLocation } from 'react-router-dom';
import { Compass, Search, CalendarDays, User } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function MobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isDashboard = location.pathname.startsWith('/host');
  const allowedPaths = ['/', '/search', '/my-bookings', '/profile'];
  const shouldShow = allowedPaths.includes(location.pathname);

  if (isDashboard || !shouldShow) return null;

  const NAV_ITEMS = [
    { label: 'Home', to: '/', icon: Compass },
    { label: 'Search', to: '/search', icon: Search },
    { label: 'Bookings', to: '/my-bookings', icon: CalendarDays },
    { label: 'Profile', to: isAuthenticated ? '/profile' : '/login', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-200 bg-white/90 px-2 pt-2 pb-safe-area backdrop-blur-xl lg:hidden">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
        
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-1 flex-col items-center gap-1 py-1 transition-colors ${
              isActive ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <div className={`relative flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
              isActive ? 'bg-emerald-50 text-emerald-600 scale-110' : ''
            }`}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-emerald-600" />
              )}
            </div>
            <span className="text-[10px] font-bold tracking-tight uppercase">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
