import { useState, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { SidebarNav } from './SidebarNav'
import { NotebookTree } from './NotebookTree'
import { UserProfile } from './UserProfile'

function Sidebar({ mobileOpen, onClose }) {
  const [expanded, setExpanded] = useState(false)
  const timeoutRef = useRef(null)
  const location = useLocation()

  const isOnLanding = location.pathname === '/'

  const handleMouseEnter = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setExpanded(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setExpanded(false), 150)
  }, [])

  const handleCollapse = useCallback(() => {
    setExpanded(false)
  }, [])

  if (isOnLanding) return null

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="hidden lg:flex flex-col h-screen border-r border-walnut/15 bg-paper relative z-40 shrink-0"
        style={{
          width: expanded ? 260 : 60,
          transition: 'width 0.2s ease',
        }}
      >
        <div className="flex flex-col h-full py-4 px-2">
          {/* Logo */}
          <div className="flex items-center justify-center h-10 mb-4 shrink-0">
            <span className="font-display text-xl font-semibold text-pine select-none">
              M
            </span>
          </div>

          {/* Nav */}
          <SidebarNav expanded={expanded} onNavigate={handleCollapse} />

          {/* Notebook tree */}
          <div
            className="flex-1 overflow-hidden mt-2"
            style={{
              opacity: expanded ? 1 : 0,
              transition: 'opacity 0.15s ease',
              pointerEvents: expanded ? 'auto' : 'none',
            }}
          >
            <NotebookTree onNavigate={handleCollapse} />
          </div>

          {/* User */}
          <div
            className="mt-auto pt-2 border-t border-walnut/10"
            style={{
              opacity: expanded ? 1 : 0,
              transition: 'opacity 0.15s ease 0.05s',
              pointerEvents: expanded ? 'auto' : 'none',
            }}
          >
            <UserProfile />
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-ink/20 z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 w-[280px] bg-paper border-r border-walnut/15 z-50 lg:hidden flex flex-col"
            >
              <div className="flex flex-col h-full py-4 px-3">
                <div className="flex items-center justify-between h-10 mb-4 px-2">
                  <span className="font-display text-xl font-semibold text-pine">
                    The Marginalia
                  </span>
                  <button
                    onClick={onClose}
                    className="text-walnut hover:text-ink transition-colors text-sm"
                    aria-label="Close menu"
                  >
                    ✕
                  </button>
                </div>

                <SidebarNav expanded={true} onNavigate={onClose} />

                <div className="flex-1 overflow-auto mt-2">
                  <NotebookTree onNavigate={onClose} />
                </div>

                <div className="pt-2 border-t border-walnut/10">
                  <UserProfile />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export { Sidebar }
