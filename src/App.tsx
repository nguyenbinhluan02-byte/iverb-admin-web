import { Navigate, Route, Routes } from 'react-router'
import { RequireAdmin } from '@/auth/RequireAdmin'
import { AppLayout } from '@/components/AppLayout'
import { ComingSoon } from '@/pages/ComingSoon'
import { LoginPage } from '@/pages/LoginPage'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAdmin />}>
        <Route element={<AppLayout />}>
          <Route
            path="/today"
            element={<ComingSoon kicker="Live now" title="Today" task="TASK-005" />}
          />
          <Route
            path="/schedule"
            element={<ComingSoon kicker="Next 14 days" title="Schedule" task="TASK-004" />}
          />
          <Route
            path="/library"
            element={<ComingSoon kicker="Questions" title="Library" task="TASK-002" />}
          />
          <Route
            path="/questions/new"
            element={<ComingSoon kicker="Add to schedule" title="New question" task="TASK-003" />}
          />
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
