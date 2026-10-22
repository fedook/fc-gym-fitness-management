import { ArrowLeft, Calendar, CreditCard, History, Mail, MapPin, Phone, User, UserSquare2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Skeleton } from '@/components/common/Skeleton'
import StatusBadge from '@/components/common/StatusBadge'
import PageHeader from '@/components/layout/PageHeader'
import MemberForm from '@/components/members/MemberForm'
import { memberService } from '@/services'
import { getErrorMessage } from '@/services/api'
import { formatCurrency, formatDate, formatDateTime, getInitials } from '@/utils/format'

const tabs = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'memberships', label: 'Memberships', icon: History },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'attendance', label: 'Attendance', icon: Calendar },
]

export default function MemberProfilePage() {
  const { id } = useParams()
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('overview')
  const [memberships, setMemberships] = useState([])
  const [payments, setPayments] = useState([])
  const [attendance, setAttendance] = useState([])
  const [tabLoading, setTabLoading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [statusDialog, setStatusDialog] = useState(null)

  const loadMember = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await memberService.get(id)
      setMember(res.data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadMember()
  }, [loadMember])

  useEffect(() => {
    if (!member || tab === 'overview') return
    setTabLoading(true)
    const loaders = {
      memberships: () => memberService.memberships(id).then((r) => setMemberships(r.data.data ?? r.data)),
      payments: () => memberService.payments(id).then((r) => setPayments(r.data.data)),
      attendance: () => memberService.attendance(id).then((r) => setAttendance(r.data.data)),
    }
    loaders[tab]()
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setTabLoading(false))
  }, [tab, member, id])

  const changeStatus = async (status) => {
    try {
      await memberService.updateStatus(member.id, status)
      toast.success('Status updated')
      loadMember()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setStatusDialog(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80" />
          <Skeleton className="h-80 lg:col-span-2" />
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadMember} />
  }

  if (!member) return null

  return (
    <div>
      <Link to="/admin/members" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-secondary-text hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to Members
      </Link>

      <PageHeader title={member.full_name} subtitle={`Member ID: ${member.member_code}`}>
        <select
          className="input !w-auto"
          value={member.status}
          onChange={(e) => setStatusDialog(e.target.value)}
          aria-label="Change status"
        >
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="expired">Expired</option>
          <option value="suspended">Suspended</option>
        </select>
        <button className="btn-primary" onClick={() => setEditOpen(true)}>
          Edit Profile
        </button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card h-fit overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-secondary px-6 py-8 text-center">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white">
              {getInitials(member.full_name)}
            </span>
            <h2 className="mt-3 text-lg font-bold text-white">{member.full_name}</h2>
            <div className="mt-3 flex justify-center">
              <StatusBadge status={member.status} />
            </div>
          </div>
          <dl className="divide-y divide-border-color text-sm">
            {[
              { icon: Phone, label: 'Phone', value: member.phone },
              { icon: Mail, label: 'Email', value: member.email },
              { icon: MapPin, label: 'Address', value: member.address },
              { icon: User, label: 'Gender', value: member.gender },
              { icon: Calendar, label: 'Date of Birth', value: formatDate(member.date_of_birth) },
              { icon: UserSquare2, label: 'Emergency Contact', value: member.emergency_contact_name ? `${member.emergency_contact_name} · ${member.emergency_contact_phone || '—'}` : null },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-3 px-6 py-3">
                <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-text" />
                <div className="min-w-0">
                  <dt className="text-xs text-secondary-text">{row.label}</dt>
                  <dd className="font-medium text-main-text">{row.value || '—'}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="flex overflow-x-auto border-b border-border-color">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                    tab === t.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-secondary-text hover:text-main-text'
                  }`}
                >
                  <t.icon className="h-4 w-4" /> {t.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {tabLoading ? (
                <div className="flex justify-center py-10"><LoadingSpinner /></div>
              ) : tab === 'overview' ? (
                <OverviewTab member={member} />
              ) : tab === 'memberships' ? (
                <MembershipsTab rows={memberships} />
              ) : tab === 'payments' ? (
                <PaymentsTab rows={payments} />
              ) : (
                <AttendanceTab rows={attendance} />
              )}
            </div>
          </div>
        </div>
      </div>

      <MemberForm open={editOpen} member={member} onClose={() => setEditOpen(false)} onSaved={loadMember} />

      <ConfirmDialog
        open={Boolean(statusDialog)}
        title="Change Membership Status"
        message={`Change ${member.full_name}'s status to "${statusDialog}"?`}
        confirmLabel="Change Status"
        onConfirm={() => changeStatus(statusDialog)}
        onCancel={() => setStatusDialog(null)}
      />
    </div>
  )
}

function OverviewTab({ member }) {
  const current = member.current_membership || member.latest_membership
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-border-color bg-pale-green p-5">
        <p className="text-sm font-medium text-secondary-text">Current Plan</p>
        <p className="mt-1 text-lg font-bold text-primary">
          {current?.plan?.name || current?.plan_name || 'No plan'}
        </p>
      </div>
      <div className="rounded-xl border border-border-color bg-slate-50 p-5">
        <p className="text-sm font-medium text-secondary-text">Expiration Date</p>
        <p className="mt-1 text-lg font-bold text-main-text">{formatDate(current?.end_date)}</p>
      </div>
      <div className="rounded-xl border border-border-color bg-slate-50 p-5">
        <p className="text-sm font-medium text-secondary-text">Total Payments</p>
        <p className="mt-1 text-lg font-bold text-main-text">{member.payments_count ?? '—'}</p>
      </div>
      <div className="rounded-xl border border-border-color bg-slate-50 p-5">
        <p className="text-sm font-medium text-secondary-text">Member Since</p>
        <p className="mt-1 text-lg font-bold text-main-text">{formatDate(member.created_at)}</p>
      </div>
    </div>
  )
}

function MembershipsTab({ rows }) {
  if (!rows.length) {
    return <EmptyState icon={History} title="No memberships" description="Membership history will appear here." />
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border-color">
        <thead>
          <tr className="bg-slate-50">
            <th className="table-th">Plan</th>
            <th className="table-th">Start</th>
            <th className="table-th">End</th>
            <th className="table-th">Amount</th>
            <th className="table-th">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-color">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="table-td font-medium">{row.plan?.name || '—'}</td>
              <td className="table-td">{formatDate(row.start_date)}</td>
              <td className="table-td">{formatDate(row.end_date)}</td>
              <td className="table-td">{formatCurrency(row.amount)}</td>
              <td className="table-td"><StatusBadge status={row.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PaymentsTab({ rows }) {
  if (!rows.length) {
    return <EmptyState icon={CreditCard} title="No payments" description="Payment history will appear here." />
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border-color">
        <thead>
          <tr className="bg-slate-50">
            <th className="table-th">Payment #</th>
            <th className="table-th">Amount</th>
            <th className="table-th">Method</th>
            <th className="table-th">Date</th>
            <th className="table-th">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-color">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="table-td font-mono text-xs">{row.payment_number}</td>
              <td className="table-td font-medium">{formatCurrency(row.amount)}</td>
              <td className="table-td capitalize">{row.payment_method?.replace('_', ' ')}</td>
              <td className="table-td">{formatDateTime(row.paid_at || row.created_at)}</td>
              <td className="table-td"><StatusBadge status={row.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AttendanceTab({ rows }) {
  if (!rows.length) {
    return <EmptyState icon={Calendar} title="No attendance records" description="Check-ins will appear here." />
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border-color">
        <thead>
          <tr className="bg-slate-50">
            <th className="table-th">Date</th>
            <th className="table-th">Check-in</th>
            <th className="table-th">Check-out</th>
            <th className="table-th">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-color">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="table-td">{formatDate(row.date)}</td>
              <td className="table-td">{row.check_in ? new Date(row.check_in).toLocaleTimeString() : '—'}</td>
              <td className="table-td">{row.check_out ? new Date(row.check_out).toLocaleTimeString() : '—'}</td>
              <td className="table-td"><StatusBadge status={row.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
