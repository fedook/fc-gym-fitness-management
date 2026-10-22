import { Calendar, CreditCard, History, Lock, Mail, MapPin, Pencil, Phone, User, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Modal from '@/components/common/Modal'
import StatusBadge from '@/components/common/StatusBadge'
import PageHeader from '@/components/layout/PageHeader'
import { portalService, settingsService } from '@/services'
import { getErrorMessage } from '@/services/api'
import { formatCurrency, formatDate, formatDateTime, getInitials } from '@/utils/format'

export default function MemberAccountPage() {
  const [profile, setProfile] = useState(null)
  const [memberships, setMemberships] = useState([])
  const [payments, setPayments] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('overview')
  const [tabLoading, setTabLoading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadProfile = () => {
    setLoading(true)
    setError(null)
    portalService
      .profile()
      .then((res) => setProfile(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (tab === 'overview') return
    setTabLoading(true)
    const loaders = {
      memberships: () => portalService.memberships().then((r) => setMemberships(r.data.data)),
      payments: () => portalService.payments({ per_page: 20 }).then((r) => setPayments(r.data.data)),
      attendance: () => portalService.attendance({ per_page: 20 }).then((r) => setAttendance(r.data.data)),
    }
    loaders[tab]()
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setTabLoading(false))
  }, [tab])

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>
  if (error) return <ErrorState message={error} onRetry={loadProfile} />
  if (!profile) return null

  const current = profile.current_membership || profile.latest_membership
  const plan = current?.plan

  const openEdit = () => {
    setEditForm({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      phone: profile.phone || '',
      address: profile.address || '',
      gender: profile.gender || '',
      date_of_birth: profile.date_of_birth ? profile.date_of_birth.slice(0, 10) : '',
      emergency_contact_name: profile.emergency_contact_name || '',
      emergency_contact_phone: profile.emergency_contact_phone || '',
    })
    setEditOpen(true)
  }

  const submitEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await portalService.updateProfile(editForm)
      setProfile(res.data.data)
      toast.success('Profile updated')
      setEditOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Your membership details and history.">
        <button className="btn-primary" onClick={openEdit}>
          <Pencil className="h-4.5 w-4.5" /> Edit Profile
        </button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card h-fit overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-secondary px-6 py-8 text-center">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white">
              {getInitials(profile.full_name)}
            </span>
            <h2 className="mt-3 text-lg font-bold text-white">{profile.full_name}</h2>
            <p className="mt-1 text-sm text-white/80">{profile.member_code}</p>
            <div className="mt-3 flex justify-center">
              <StatusBadge status={profile.status} />
            </div>
          </div>
          <dl className="divide-y divide-border-color text-sm">
            {[
              { icon: Phone, label: 'Phone', value: profile.phone },
              { icon: Mail, label: 'Email', value: profile.email },
              { icon: MapPin, label: 'Address', value: profile.address },
              { icon: User, label: 'Gender', value: profile.gender },
              { icon: Calendar, label: 'Date of Birth', value: formatDate(profile.date_of_birth) },
              { icon: Users, label: 'Emergency Contact', value: profile.emergency_contact_name ? `${profile.emergency_contact_name} · ${profile.emergency_contact_phone || '—'}` : null },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-3 px-6 py-3">
                <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-text" />
                <div className="min-w-0">
                  <dt className="text-xs text-secondary-text">{row.label}</dt>
                  <dd className="font-medium">{row.value || '—'}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="flex overflow-x-auto border-b border-border-color">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'memberships', label: 'Memberships' },
                { id: 'payments', label: 'Payments' },
                { id: 'attendance', label: 'Attendance' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`whitespace-nowrap border-b-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                    tab === t.id ? 'border-primary text-primary' : 'border-transparent text-secondary-text hover:text-main-text'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {tabLoading ? (
                <div className="flex justify-center py-10"><LoadingSpinner /></div>
              ) : tab === 'overview' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoCard label="Current Plan" value={plan?.name || 'No plan'} accent />
                  <InfoCard label="Expiration Date" value={formatDate(current?.end_date)} />
                  <InfoCard label="Membership Status" value={current?.status || '—'} />
                  <InfoCard label="Member Since" value={formatDate(profile.created_at)} />
                </div>
              ) : tab === 'memberships' ? (
                memberships.length === 0 ? (
                  <EmptyState icon={History} title="No memberships" description="Your membership history will appear here." />
                ) : (
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
                        {memberships.map((row) => (
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
              ) : tab === 'payments' ? (
                payments.length === 0 ? (
                  <EmptyState icon={CreditCard} title="No payments" description="Your payment history will appear here." />
                ) : (
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
                        {payments.map((row) => (
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
              ) : attendance.length === 0 ? (
                <EmptyState icon={Calendar} title="No attendance records" description="Your visits will appear here." />
              ) : (
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
                      {attendance.map((row) => (
                        <tr key={row.id}>
                          <td className="table-td">{formatDate(row.date)}</td>
                          <td className="table-td">{row.check_in ? formatDateTime(row.check_in) : '—'}</td>
                          <td className="table-td">{row.check_out ? formatDateTime(row.check_out) : '—'}</td>
                          <td className="table-td"><StatusBadge status={row.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <PasswordCard />
        </div>
      </div>

      <Modal open={editOpen} title="Edit Profile" onClose={() => setEditOpen(false)}>
        {editForm && (
          <form onSubmit={submitEdit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">First Name *</label>
              <input className="input" value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input className="input" value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input" value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input type="date" className="input" value={editForm.date_of_birth} onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <input className="input" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
            </div>
            <div>
              <label className="label">Emergency Contact Name</label>
              <input className="input" value={editForm.emergency_contact_name} onChange={(e) => setEditForm({ ...editForm, emergency_contact_name: e.target.value })} />
            </div>
            <div>
              <label className="label">Emergency Contact Phone</label>
              <input className="input" value={editForm.emergency_contact_phone} onChange={(e) => setEditForm({ ...editForm, emergency_contact_phone: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-2 sm:col-span-2">
              <button type="button" className="btn-secondary" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <LoadingSpinner size="sm" /> : <Pencil className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

function InfoCard({ label, value, accent }) {
  return (
    <div className={`rounded-xl border border-border-color p-5 ${accent ? 'bg-pale-green' : 'bg-slate-50'}`}>
      <p className="text-sm font-medium text-secondary-text">{label}</p>
      <p className={`mt-1 text-lg font-bold ${accent ? 'text-primary' : 'text-main-text'}`}>{value}</p>
    </div>
  )
}

function PasswordCard() {
  const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await settingsService.updateProfile(form)
      toast.success('Password changed')
      setForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="card mt-6 space-y-4">
      <h3 className="flex items-center gap-2 text-base font-semibold">
        <Lock className="h-4.5 w-4.5 text-primary" /> Change Password
      </h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Current Password *</label>
          <input type="password" className="input" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} required />
        </div>
        <div>
          <label className="label">New Password *</label>
          <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
        </div>
        <div>
          <label className="label">Confirm Password *</label>
          <input type="password" className="input" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} required minLength={8} />
        </div>
      </div>
      <button className="btn-secondary" disabled={saving}>
        {saving ? <LoadingSpinner size="sm" /> : <Lock className="h-4 w-4" />} Change Password
      </button>
    </form>
  )
}
