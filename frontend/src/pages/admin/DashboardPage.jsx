import { AlertTriangle, CalendarCheck, DollarSign, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'
import { CardSkeleton } from '@/components/common/Skeleton'
import ErrorState from '@/components/common/ErrorState'
import RevenueChart from '@/components/dashboard/RevenueChart'
import RecentMembers from '@/components/dashboard/RecentMembers'
import StatCard from '@/components/dashboard/StatCard'
import UpcomingAppointments from '@/components/dashboard/UpcomingAppointments'
import { useAuth } from '@/context/AuthContext'
import { dashboardService } from '@/services'
import { formatCurrency, formatDate, getInitials } from '@/utils/format'
import { getErrorMessage } from '@/services/api'
import { AlertTriangle as WarnIcon } from 'lucide-react'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [expiring, setExpiring] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [summaryRes, expiringRes] = await Promise.all([
        dashboardService.summary(),
        dashboardService.expiringMemberships(),
      ])
      setSummary(summaryRes.data)
      setExpiring(expiringRes.data.data ?? expiringRes.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const roleLabel = user?.role === 'admin' ? 'Admin' : user?.role === 'staff' ? 'Staff' : 'Trainer'

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${roleLabel}!`}
        subtitle="Here's what's happening at your gym today."
      >
        <button onClick={load} className="btn-secondary">Refresh</button>
      </PageHeader>

      {error && !summary ? (
        <div className="card">
          <ErrorState message={error} onRetry={load} />
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {loading || !summary ? (
              Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  title="Total Members"
                  value={summary.total_members.toLocaleString()}
                  change={summary.total_members_change}
                  icon={Users}
                />
                <StatCard
                  title="Today's Check-ins"
                  value={summary.today_check_ins.toLocaleString()}
                  change={summary.today_check_ins_change}
                  changeLabel="vs last week"
                  icon={CalendarCheck}
                  iconClass="bg-sky-50 text-sky-600"
                />
                <StatCard
                  title="Monthly Revenue"
                  value={formatCurrency(summary.monthly_revenue)}
                  change={summary.monthly_revenue_change}
                  icon={DollarSign}
                  iconClass="bg-amber-50 text-amber-600"
                />
                <StatCard
                  title="Expiring Soon"
                  value={summary.expiring_soon.toLocaleString()}
                  changeLabel={
                    <Link
                      to="/admin/members?status=active"
                      className="inline-flex items-center gap-1 font-medium text-primary hover:text-secondary"
                    >
                      <WarnIcon className="h-3.5 w-3.5" /> View details
                    </Link>
                  }
                  icon={AlertTriangle}
                  iconClass="bg-red-50 text-red-500"
                />
              </>
            )}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <RevenueChart />
            </div>
            <div className="space-y-6">
              <div className="card">
                <div className="border-b border-border-color px-5 py-4">
                  <h2 className="text-base font-semibold text-main-text">Expiring Memberships</h2>
                  <p className="text-xs text-secondary-text">Next 30 days</p>
                </div>
                {loading ? (
                  <div className="space-y-3 p-5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-200" />
                    ))}
                  </div>
                ) : expiring.length === 0 ? (
                  <p className="p-5 text-sm text-secondary-text">No memberships expiring soon. 🎉</p>
                ) : (
                  <ul className="divide-y divide-border-color">
                    {expiring.slice(0, 5).map((item) => (
                      <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-light-green text-[11px] font-bold text-primary">
                          {getInitials(item.member_name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/admin/members/${item.member_id}`}
                            className="block truncate text-sm font-medium text-main-text hover:text-primary"
                          >
                            {item.member_name}
                          </Link>
                          <p className="text-xs text-secondary-text">
                            {item.plan_name} · ends {formatDate(item.end_date)}
                          </p>
                        </div>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          {item.days_left}d
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <UpcomingAppointments />
            </div>
          </div>

          <div className="mt-6">
            <RecentMembers />
          </div>
        </>
      )}
    </div>
  )
}
