import { Link } from 'react-router-dom'

function UserProfile() {
  return (
    <Link
      to="/app/settings"
      className="flex items-center gap-2.5 px-2 py-2 rounded-[3px] hover:bg-walnut/5 transition-colors no-underline"
    >
      <div className="w-7 h-7 rounded-full bg-pine text-paper flex items-center justify-center shrink-0">
        <span className="font-display text-xs font-semibold">S</span>
      </div>
      <span className="font-body text-sm text-ink truncate">Student</span>
    </Link>
  )
}

export { UserProfile }
