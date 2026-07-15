import { Link } from 'react-router-dom'
import { ArrowLeft, Menu } from 'lucide-react'

function Header({ title, backTo, onMenuToggle, actions }) {
  return (
    <header className="flex items-center justify-between h-12 px-6 lg:px-10 border-b border-walnut/10 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-walnut hover:text-ink transition-colors"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        {backTo && (
          <Link
            to={backTo}
            className="text-walnut hover:text-pine transition-colors no-underline"
          >
            <ArrowLeft size={16} />
          </Link>
        )}
        {title && (
          <h1 className="font-display text-lg font-medium text-ink m-0">
            {title}
          </h1>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  )
}

export { Header }
