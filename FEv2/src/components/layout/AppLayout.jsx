import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { cn } from '@/lib/utils'

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  const isTopicPage = pathname.includes('/topic/')

  return (
    <div className="flex h-screen bg-paper overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            <div className={cn(isTopicPage ? 'w-full' : 'mx-auto max-w-[1040px] px-6 lg:px-10 py-6')}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export { AppLayout }
