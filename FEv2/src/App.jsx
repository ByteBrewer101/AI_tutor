import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { LandingPage } from '@/features/landing/LandingPage'
import { AppLayout } from '@/components/layout/AppLayout'
import { LibraryPage } from '@/features/library/LibraryPage'
import { ExplorePage } from '@/features/explore/ExplorePage'
import { NotebookView } from '@/features/notebook/NotebookView'
import { TopicSession } from '@/features/session/TopicSession'
import { ReviewPage } from '@/features/review/ReviewPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { SignupPage } from '@/features/auth/SignupPage'
import { useAuth } from '@/lib/useAuth'

function RequireAuth() {
  const { status } = useAuth()
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <span className="font-display text-lg text-walnut">…</span>
      </div>
    )
  }
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

function GuestOnly() {
  const { status } = useAuth()
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <span className="font-display text-lg text-walnut">…</span>
      </div>
    )
  }
  if (status === 'authenticated') {
    return <Navigate to="/app" replace />
  }
  return <Outlet />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<LibraryPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="notebook/:notebookId" element={<NotebookView />} />
          <Route path="notebook/:notebookId/topic/:topicId" element={<TopicSession />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
