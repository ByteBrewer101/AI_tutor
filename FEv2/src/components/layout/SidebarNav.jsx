import { Link, useLocation } from 'react-router-dom'
import { BookOpen, RotateCcw, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/app/library', icon: BookOpen, label: 'Library' },
  { to: '/app/review', icon: RotateCcw, label: 'Review' },
  { to: '/app/dashboard', icon: BarChart3, label: 'Stats' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
]

function SidebarNav({ expanded, onNavigate }) {
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/app/library') {
      return location.pathname === '/app' || location.pathname === '/app/library' || location.pathname.startsWith('/app/notebook')
    }
    return location.pathname === path
  }

  return (
    <nav className="flex flex-col gap-1 shrink-0">
      {navItems.map(({ to, icon: Icon, label }) => {
        const active = isActive(to)
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 h-9 rounded-[3px] transition-colors duration-150 no-underline',
              expanded ? 'px-3' : 'justify-center px-0',
              active
                ? 'bg-pine/10 text-pine'
                : 'text-walnut hover:text-ink hover:bg-walnut/5'
            )}
            title={!expanded ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            <span
              className="font-body text-sm whitespace-nowrap overflow-hidden"
              style={{
                opacity: expanded ? 1 : 0,
                width: expanded ? 'auto' : 0,
                transition: 'opacity 0.15s ease 0.05s',
              }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

export { SidebarNav }
