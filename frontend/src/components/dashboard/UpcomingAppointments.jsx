import { CalendarClock, CalendarDays } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import { Skeleton } from '@/components/common/Skeleton'
import StatusBadge from '@/components/common/StatusBadge'
import { dashboardService } from '@/services'
import { getErrorMessage } from '@/services/api'
import { formatDateTime } from '@/utils/format'

export default function UpcomingAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await dashboardService.upcomingAppointments()
      setAppointments(res.data.data ?? res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-border-color px-5 py-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-main-text">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-light-green">
            <CalendarClock className="h-4 w-4 text-primary" />
          </span>
          Upcoming Appointments
        </h2>
        <Link to="/admin/attendance" className="text-sm font-medium text-primary hover:text-secondary">
          View All
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No upcoming appointments"
          description="Scheduled training sessions will appear here."
        />
      ) : (
        <ul className="divide-y divide-border-color">
          {appointments.map((appt) => (
            <li key={appt.id} className="flex items-start gap-3 px-5 py-3.5">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                <CalendarDays className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-main-text">{appt.title}</p>
                <p className="text-xs text-secondary-text">
                  {appt.member?.full_name}
                  {appt.trainer ? ` · with ${appt.trainer.full_name}` : ''}
                </p>
                <p className="mt-0.5 text-xs font-medium text-primary">{formatDateTime(appt.scheduled_at)}</p>
              </div>
              <StatusBadge status={appt.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
