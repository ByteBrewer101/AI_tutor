import { Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from '@/features/landing/LandingPage'
import { AppLayout } from '@/components/layout/AppLayout'
import { LibraryPage } from '@/features/library/LibraryPage'
import { NotebookView } from '@/features/notebook/NotebookView'
import { TopicSession } from '@/features/session/TopicSession'
import { ReviewPage } from '@/features/review/ReviewPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<LibraryPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="notebook/:notebookId" element={<NotebookView />} />
        <Route path="notebook/:notebookId/topic/:topicId" element={<TopicSession />} />
        <Route path="review" element={<ReviewPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
