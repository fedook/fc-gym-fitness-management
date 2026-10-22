import { Calendar, Clock, CreditCard, History } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorState from '@/components/common/ErrorState'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StatusBadge from '@/components/common/StatusBadge'
import PageHeader from '@/components/layout/PageHeader'
import { portalService } from '@/services'
import { getErrorMessage } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency, formatDate, formatDateTime, getInitials } from '@/utils/format'

export default function MemberDashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [memberships, setMemberships] = useState([])
  const [payments, setPayments] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      portalService.profile(),
      portalService.memberships(),
      portalService.payments({ per_page: 5 }),
      portalService.attendance({ per_page: 5 }),
    ])
      .then(([p, m, pay, att]) => {
        setProfile(p.data.data)
        setMemberships(m.data.data)
        setPayments(pay.data.data)
        setAttendance(att.data.data)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>
  if (error) return <ErrorState message={error} />

  const member = profile
  const current = member?.current_membership || member?.latest_membership
  const plan = current?.plan

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name || 'Member'}!`}
        subtitle="Here is an overview of your membership."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Calendar} label="Current Plan" value={plan?.name || 'No Plan'} accent />
        <StatCard icon={Clock} label="Expires On" value={formatDate(current?.end_date)} />
        <StatCard icon={CreditCard} label="Total Payments" value={payments.length ? formatCurrency(payments[0].amount) : '—'} />
        <StatCard icon={History} label="Visits This Month" value={attendance.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="border-b border-border-color px-5 py-4">
            <h3 className="font-semibold">Membership History</h3>
          </div>
          {memberships.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-secondary-text">No memberships yet.</p>
          ) : (
            <ul className="divide-y divide-border-color">
              {memberships.slice(0, 5).map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium">{m.plan?.name || m.plan_name || '—'}</p>
                    <p className="text-xs text-secondary-text">
                      {formatDate(m.start_date)} — {formatDate(m.end_date)}
                    </p>
                  </div>
                  <StatusBadge status={m.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-border-color px-5 py-4">
            <h3 className="font-semibold">Recent Visits</h3>
          </div>
          {attendance.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-secondary-text">No visits recorded yet.</p>
          ) : (
            <ul className="divide-y divide-border-color">
              {attendance.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium">{formatDate(a.date)}</p>
                    <p className="text-xs text-secondary-text">
                      In: {a.check_in ? formatDateTime(a.check_in) : '—'} · Out: {a.check_out ? formatDateTime(a.check_out) : '—'}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {current && (
        <div className="card mt-6 flex flex-col items-start justify-between gap-4 bg-gradient-to-br from-primary to-secondary p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white">
              {getInitials(member?.full_name || user?.name)}
            </span>
            <div>
              <p className="text-sm text-white/80">Current membership</p>
              <p className="text-lg font-bold text-white">{plan?.name} · {formatCurrency(current.amount)}</p>
            </div>
          </div>
          <Link to="/member/profile" className="btn-secondary">View Full Profile</Link>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className={`card flex items-center gap-4 ${accent ? 'bg-pale-green' : ''}`}>
      <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent ? 'bg-primary text-white' : 'bg-light-green text-primary'}`}>
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-secondary-text">{label}</p>
        <p className="truncate text-lg font-bold text-main-text">{value}</p>
      </div>
    </div>
  )
}
