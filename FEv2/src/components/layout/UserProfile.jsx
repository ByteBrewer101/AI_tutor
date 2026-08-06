import { Link, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/lib/useAuth'

function UserProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const displayName = user?.displayName || 'Student'
  const initial = displayName.charAt(0).toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex flex-col gap-0.5">
      <Link
        to="/app/settings"
        className="flex items-center gap-2.5 px-2 py-2 rounded-[3px] hover:bg-walnut/5 transition-colors no-underline"
      >
        <div className="w-7 h-7 rounded-full bg-pine text-paper flex items-center justify-center shrink-0">
          <span className="font-display text-xs font-semibold">{initial}</span>
        </div>
        <span className="font-body text-sm text-ink truncate">{displayName}</span>
      </Link>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-[3px] text-walnut hover:text-ink hover:bg-walnut/5 transition-colors cursor-pointer text-left"
      >
        <LogOut size={14} className="shrink-0" />
        <span className="font-body text-sm">Log out</span>
      </button>
    </div>
  )
}

export { UserProfile }
