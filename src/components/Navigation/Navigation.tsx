import { NavLink } from 'react-router-dom';
import { Map, BookOpen, Radio, ClipboardList } from 'lucide-react';
import { useI18n } from '../../i18n';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  labelKey: 'navMap' | 'navEncyclopedia' | 'navSpots' | 'navLog';
}

const navItems: NavItem[] = [
  { to: '/', icon: <Map className="w-4 h-4" />, labelKey: 'navMap' },
  { to: '/encyclopedia', icon: <BookOpen className="w-4 h-4" />, labelKey: 'navEncyclopedia' },
  { to: '/spots', icon: <Radio className="w-4 h-4" />, labelKey: 'navSpots' },
  { to: '/log', icon: <ClipboardList className="w-4 h-4" />, labelKey: 'navLog' },
];

interface NavigationProps {
  /** When true, renders as bottom tab bar (mobile) */
  variant?: 'tabs' | 'bottom';
}

export function Navigation({ variant = 'tabs' }: NavigationProps) {
  const { t } = useI18n();

  if (variant === 'bottom') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex sm:hidden">
        {navItems.map(({ to, icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-2 gap-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`
            }
          >
            {icon}
            <span>{t[labelKey]}</span>
          </NavLink>
        ))}
      </nav>
    );
  }

  return (
    <nav className="hidden sm:flex items-center gap-1" aria-label="Main navigation">
      {navItems.map(({ to, icon, labelKey }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
            }`
          }
        >
          {icon}
          <span>{t[labelKey]}</span>
        </NavLink>
      ))}
    </nav>
  );
}
