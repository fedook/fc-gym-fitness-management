import { Calendar, Mail, Phone, User, UserSquare2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/common/StatusBadge'
import { formatDate, getInitials } from '@/utils/format'

export default function MemberDetails({ member }) {
  if (!member) {
    return (
      <div className="card">
        <EmptyState
          icon={UserSquare2}
          title="Select a member"
          description="Click a row in the table to view member details here."
        />
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-secondary px-6 py-8 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white">
          {getInitials(member.full_name)}
        </span>
        <h3 className="mt-3 text-lg font-bold text-white">{member.full_name}</h3>
        <p className="mt-0.5 text-sm text-green-100">{member.member_code}</p>
        <div className="mt-3 flex justify-center">
          <StatusBadge status={member.status} />
        </div>
      </div>

      <dl className="divide-y divide-border-color">
        <div className="flex items-center gap-3 px-6 py-3.5">
          <Phone className="h-4.5 w-4.5 text-secondary-text" />
          <div>
            <dt className="text-xs text-secondary-text">Phone</dt>
            <dd className="text-sm font-medium text-main-text">{member.phone || '—'}</dd>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-3.5">
          <Mail className="h-4.5 w-4.5 text-secondary-text" />
          <div className="min-w-0">
            <dt className="text-xs text-secondary-text">Email</dt>
            <dd className="truncate text-sm font-medium text-main-text">{member.email}</dd>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-3.5">
          <User className="h-4.5 w-4.5 text-secondary-text" />
          <div>
            <dt className="text-xs text-secondary-text">Membership Plan</dt>
            <dd className="text-sm font-medium text-main-text">
              {member.current_membership?.plan?.name || member.latest_membership?.plan_name || 'No active plan'}
            </dd>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-3.5">
          <Calendar className="h-4.5 w-4.5 text-secondary-text" />
          <div>
            <dt className="text-xs text-secondary-text">Membership Expires</dt>
            <dd className="text-sm font-medium text-main-text">
              {formatDate(
                member.current_membership?.end_date || member.latest_membership?.end_date,
              )}
            </dd>
          </div>
        </div>
      </dl>

      <div className="border-t border-border-color p-4">
        <Link to={`/admin/members/${member.id}`} className="btn-primary w-full">
          View Full Profile
        </Link>
      </div>
    </div>
  )
}
