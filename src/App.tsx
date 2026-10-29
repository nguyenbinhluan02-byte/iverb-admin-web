import { Navigate, Route, Routes } from 'react-router'
import { RequireAdmin } from '@/auth/RequireAdmin'
import { AppLayout } from '@/components/AppLayout'
import { LibraryPage } from '@/features/library/LibraryPage'
import { QuestionFormPage } from '@/features/question-form/QuestionFormPage'
import { SchedulePage } from '@/features/schedule/SchedulePage'
import { TodayPage } from '@/features/today/TodayPage'
import { ComingSoon } from '@/pages/ComingSoon'
import { LoginPage } from '@/pages/LoginPage'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAdmin />}>
        <Route element={<AppLayout />}>
          <Route path="/today" element={<TodayPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/questions/new" element={<QuestionFormPage />} />
          <Route path="/questions/:id/edit" element={<QuestionFormPage />} />
          <Route
            path="/submissions"
            element={<ComingSoon kicker="From app users" title="Submissions" task="TASK-006" />}
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/today" replace />} />
    </Routes>
  )
}
