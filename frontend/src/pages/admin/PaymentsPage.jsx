import { CreditCard, Plus, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Modal from '@/components/common/Modal'
import Pagination from '@/components/common/Pagination'
import { TableSkeleton } from '@/components/common/Skeleton'
import StatusBadge from '@/components/common/StatusBadge'
import PageHeader from '@/components/layout/PageHeader'
import { useDebounce } from '@/hooks/useDebounce'
import { memberService, paymentService, planService } from '@/services'
import { getErrorMessage } from '@/services/api'
import { formatCurrency, formatDateTime } from '@/utils/format'

const initialForm = {
  member_id: '',
  membership_plan_id: '',
  amount: '',
  payment_method: 'cash',
  status: 'pending',
  reference_number: '',
  notes: '',
  create_membership: false,
  membership_start_date: '',
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 400)
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [members, setMembers] = useState([])
  const [plans, setPlans] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await paymentService.list({ search: search || undefined, status, page, per_page: 10 })
      setPayments(res.data.data)
      setMeta(res.data.meta)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [search, status, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search, status])

  const openForm = async () => {
    setForm({ ...initialForm, membership_start_date: new Date().toISOString().slice(0, 10) })
    setFormOpen(true)
    try {
      const [membersRes, plansRes] = await Promise.all([
        memberService.list({ per_page: 100, status: 'all' }),
        planService.list({ per_page: 100, status: 'active' }),
      ])
      setMembers(membersRes.data.data)
      setPlans(plansRes.data.data)
    } catch {
      toast.error('Failed to load form options')
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        member_id: Number(form.member_id),
        membership_plan_id: form.membership_plan_id ? Number(form.membership_plan_id) : null,
        amount: Number(form.amount),
        create_membership: form.create_membership,
        paid_at: form.status === 'paid' ? new Date().toISOString() : null,
      }
      await paymentService.create(payload)
      toast.success('Payment recorded')
      setFormOpen(false)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Payments" subtitle="Track and record membership payments.">
        <button className="btn-primary" onClick={openForm}>
          <Plus className="h-4.5 w-4.5" /> Record Payment
        </button>
      </PageHeader>

      <div className="card mb-6 flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-secondary-text" />
          <input className="input !pl-11" placeholder="Search payment #, reference, member..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        </div>
        <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : payments.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments found" description="Recorded payments will appear here." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-color">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="table-th">Payment #</th>
                    <th className="table-th">Member</th>
                    <th className="table-th">Plan</th>
                    <th className="table-th">Amount</th>
                    <th className="table-th">Method</th>
                    <th className="table-th">Date</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="table-td font-mono text-xs">{p.payment_number}</td>
                      <td className="table-td font-medium">{p.member?.full_name || '—'}</td>
                      <td className="table-td">{p.plan?.name || '—'}</td>
                      <td className="table-td font-semibold">{formatCurrency(p.amount)}</td>
                      <td className="table-td capitalize">{p.payment_method?.replace('_', ' ')}</td>
                      <td className="table-td text-xs">{formatDateTime(p.paid_at || p.created_at)}</td>
                      <td className="table-td"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={meta} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal open={formOpen} title="Record Payment" onClose={() => setFormOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Member *</label>
            <select className="input" value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })} required>
              <option value="">Select member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.full_name} ({m.member_code})</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Amount *</label>
              <input type="number" min="0" step="0.01" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div>
              <label className="label">Method *</label>
              <select className="input" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="e_wallet">E-Wallet</option>
              </select>
            </div>
            <div>
              <label className="label">Status *</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="label">Reference #</label>
              <input className="input" value={form.reference_number} onChange={(e) => setForm({ ...form, reference_number: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-primary/30 bg-pale-green p-3 text-sm font-medium text-primary">
            <input
              type="checkbox"
              checked={form.create_membership}
              onChange={(e) => setForm({ ...form, create_membership: e.target.checked })}
              className="h-4 w-4 accent-green-600"
            />
            Create / renew membership with this payment
          </label>

          {form.create_membership && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Plan *</label>
                <select className="input" value={form.membership_plan_id} onChange={(e) => setForm({ ...form, membership_plan_id: e.target.value })} required>
                  <option value="">Select plan</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Start Date *</label>
                <input type="date" className="input" value={form.membership_start_date} onChange={(e) => setForm({ ...form, membership_start_date: e.target.value })} required />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <LoadingSpinner size="sm" /> : null}
              {saving ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
