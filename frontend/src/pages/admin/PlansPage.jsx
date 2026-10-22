import { Archive, Pencil, Plus, Search, Tag, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Modal from '@/components/common/Modal'
import Pagination from '@/components/common/Pagination'
import { CardSkeleton, TableSkeleton } from '@/components/common/Skeleton'
import StatusBadge from '@/components/common/StatusBadge'
import PageHeader from '@/components/layout/PageHeader'
import { useDebounce } from '@/hooks/useDebounce'
import { planService } from '@/services'
import { getErrorMessage } from '@/services/api'
import { formatCurrency } from '@/utils/format'

const typeLabels = { weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', annual: 'Annual' }

const initialForm = { name: '', description: '', type: 'monthly', duration_days: 30, price: '', benefits: '', status: 'active' }

export default function PlansPage() {
  const [plans, setPlans] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 400)
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await planService.list({ search: search || undefined, status, page, per_page: 10 })
      setPlans(res.data.data)
      setMeta(res.data.meta)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [search, status, page])

  useEffect(() => { load() }, [load])

  useEffect(() => { setPage(1) }, [search, status])

  const openForm = (plan = null) => {
    setEditing(plan)
    setForm(
      plan
        ? {
            name: plan.name,
            description: plan.description || '',
            type: plan.type,
            duration_days: plan.duration_days,
            price: plan.price,
            benefits: (plan.benefits || []).join('\n'),
            status: plan.status,
          }
        : initialForm,
    )
    setFormOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        duration_days: Number(form.duration_days),
        price: Number(form.price),
        benefits: form.benefits.split('\n').map((b) => b.trim()).filter(Boolean),
      }
      if (editing) {
        await planService.update(editing.id, payload)
        toast.success('Plan updated')
      } else {
        await planService.create(payload)
        toast.success('Plan created')
      }
      setFormOpen(false)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    try {
      const res = await planService.delete(deleting.id)
      toast.success(res.data.message || 'Plan deleted')
      setDeleting(null)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader title="Membership Plans" subtitle="Create and manage gym membership plans.">
        <button className="btn-primary" onClick={() => openForm()}>
          <Plus className="h-4.5 w-4.5" /> Add Plan
        </button>
      </PageHeader>

      <div className="card mb-6 flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-secondary-text" />
          <input className="input !pl-11" placeholder="Search plans..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        </div>
        <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : plans.length === 0 ? (
          <EmptyState icon={Tag} title="No plans found" description="Create your first membership plan." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-color">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="table-th">Plan</th>
                    <th className="table-th">Type</th>
                    <th className="table-th">Duration</th>
                    <th className="table-th">Price</th>
                    <th className="table-th">Members</th>
                    <th className="table-th">Status</th>
                    <th className="table-th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50">
                      <td className="table-td">
                        <p className="font-medium text-main-text">{plan.name}</p>
                        <p className="max-w-xs truncate text-xs text-secondary-text">{plan.description}</p>
                      </td>
                      <td className="table-td">{typeLabels[plan.type]}</td>
                      <td className="table-td">{plan.duration_days} days</td>
                      <td className="table-td font-semibold">{formatCurrency(plan.price)}</td>
                      <td className="table-td">{plan.memberships_count ?? 0}</td>
                      <td className="table-td"><StatusBadge status={plan.status} /></td>
                      <td className="table-td">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openForm(plan)} className="rounded-lg p-2 text-secondary-text hover:bg-amber-50 hover:text-amber-600" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleting(plan)} className="rounded-lg p-2 text-secondary-text hover:bg-red-50 hover:text-red-600" title={plan.status === 'active' ? 'Archive' : 'Delete'}>
                            {plan.status === 'active' ? <Archive className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={meta} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal open={formOpen} title={editing ? 'Edit Plan' : 'Add Plan'} onClose={() => setFormOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Plan Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Type *</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {Object.entries(typeLabels).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Duration (days) *</label>
              <input type="number" min="1" className="input" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} required />
            </div>
            <div>
              <label className="label">Price *</label>
              <input type="number" min="0" step="0.01" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="label">Benefits (one per line)</label>
            <textarea className="input" rows={4} value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} placeholder={'Gym floor access\nGroup classes'} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <LoadingSpinner size="sm" /> : null}
              {saving ? 'Saving...' : editing ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleting?.status === 'active' ? 'Archive Plan' : 'Delete Plan'}
        message={
          deleting?.status === 'active'
            ? `"${deleting?.name}" has active members and will be archived instead of deleted. Continue?`
            : `Permanently delete "${deleting?.name}"?`
        }
        confirmLabel={deleting?.status === 'active' ? 'Archive' : 'Delete'}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
