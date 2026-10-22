import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import { Skeleton } from '@/components/common/Skeleton'
import StatusBadge from '@/components/common/StatusBadge'
import { dashboardService } from '@/services'
import { getErrorMessage } from '@/services/api'
import { formatDate, getInitials } from '@/utils/format'
import { Users } from 'lucide-react'

export default function RecentMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await dashboardService.recentMembers()
      setMembers(res.data.data ?? res.data)
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
            <Users className="h-4 w-4 text-primary" />
          </span>
          Recent Members
        </h2>
        <Link to="/admin/members" className="text-sm font-medium text-primary hover:text-secondary">
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
      ) : members.length === 0 ? (
        <EmptyState icon={Users} title="No members yet" description="New members will appear here." />
      ) : (
        <ul className="divide-y divide-border-color">
          {members.map((member) => (
            <li key={member.id}>
              <Link
                to={`/admin/members/${member.id}`}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-pale-green"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-light-green text-xs font-bold text-primary">
                  {getInitials(member.full_name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-main-text">{member.full_name}</p>
                  <p className="text-xs text-secondary-text">Joined {formatDate(member.created_at)}</p>
                </div>
                <StatusBadge status={member.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
