import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import AdminLayout from '@/components/layout/AdminLayout'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import HomePage from '@/pages/public/HomePage'
import LoginPage from '@/pages/public/LoginPage'
import RegisterPage from '@/pages/public/RegisterPage'
import ForgotPasswordPage from '@/pages/public/ForgotPasswordPage'
import DashboardPage from '@/pages/admin/DashboardPage'
import MembersPage from '@/pages/admin/MembersPage'
import MemberProfilePage from '@/pages/admin/MemberProfilePage'
import PlansPage from '@/pages/admin/PlansPage'
import PaymentsPage from '@/pages/admin/PaymentsPage'
import AttendancePage from '@/pages/admin/AttendancePage'
import TrainersPage from '@/pages/admin/TrainersPage'
import ReportsPage from '@/pages/admin/ReportsPage'
import SettingsPage from '@/pages/admin/SettingsPage'
import MemberDashboardPage from '@/pages/member/MemberDashboardPage'
import MemberAccountPage from '@/pages/member/MemberAccountPage'
import NotFoundPage from '@/pages/NotFoundPage'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'member' ? '/member/dashboard' : '/admin/dashboard'} replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin', 'staff', 'trainer']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route
          path="members"
          element={
            <ProtectedRoute roles={['admin', 'staff']}>
              <MembersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="members/:id"
          element={
            <ProtectedRoute roles={['admin', 'staff']}>
              <MemberProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="plans"
          element={
            <ProtectedRoute roles={['admin', 'staff']}>
              <PlansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payments"
          element={
            <ProtectedRoute roles={['admin', 'staff']}>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route path="attendance" element={<AttendancePage />} />
        <Route
          path="trainers"
          element={
            <ProtectedRoute roles={['admin', 'staff']}>
              <TrainersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute roles={['admin', 'staff']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute roles={['admin']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/member"
        element={
          <ProtectedRoute roles={['member']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/member/dashboard" replace />} />
        <Route path="dashboard" element={<MemberDashboardPage />} />
        <Route path="profile" element={<MemberAccountPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
