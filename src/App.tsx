import { Navigate, Route, Routes } from 'react-router'
import { RequireAdmin } from '@/auth/RequireAdmin'
import { AppLayout } from '@/components/AppLayout'
import { LibraryPage } from '@/features/library/LibraryPage'
import { NotificationsPage } from '@/features/notifications/NotificationsPage'
import { QuestionFormPage } from '@/features/question-form/QuestionFormPage'
import { TodayPage } from '@/features/today/TodayPage'
import { UsersPage } from '@/features/users/UsersPage'
import { ThisWeekPage } from '@/features/weeks/ThisWeekPage'
import { WeeksPage } from '@/features/weeks/WeeksPage'
import { WeekEditorPage } from '@/features/week-editor/WeekEditorPage'
import { ComingSoon } from '@/pages/ComingSoon'
import { LoginPage } from '@/pages/LoginPage'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAdmin />}>
        <Route element={<AppLayout />}>
          <Route path="/today" element={<TodayPage />} />
          <Route path="/week" element={<ThisWeekPage />} />
          <Route path="/weeks" element={<WeeksPage />} />
          <Route path="/weeks/:weekStart" element={<WeekEditorPage />} />
          {/* v1 Schedule → Weeks (design v3 §1) */}
          <Route path="/schedule" element={<Navigate to="/weeks" replace />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/questions/new" element={<QuestionFormPage />} />
          <Route path="/questions/:id/edit" element={<QuestionFormPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route
            path="/submissions"
            element={<ComingSoon kicker="From app users" title="Submissions" task="TASK-006" />}
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/week" replace />} />
    </Routes>
  )
}
