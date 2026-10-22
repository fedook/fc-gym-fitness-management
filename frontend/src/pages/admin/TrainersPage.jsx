import { Pencil, Plus, Search, Trash2, UserSquare2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Modal from '@/components/common/Modal'
import Pagination from '@/components/common/Pagination'
import { TableSkeleton } from '@/components/common/Skeleton'
import StatusBadge from '@/components/common/StatusBadge'
import PageHeader from '@/components/layout/PageHeader'
import { useDebounce } from '@/hooks/useDebounce'
import { trainerService } from '@/services'
import { getErrorMessage } from '@/services/api'
import { getInitials } from '@/utils/format'

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  specialization: '',
  availability: '',
  bio: '',
  status: 'active',
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([])
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
      const res = await trainerService.list({ search: search || undefined, status, page, per_page: 10 })
      setTrainers(res.data.data)
      setMeta(res.data.meta)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [search, status, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search, status])

  const openForm = (trainer = null) => {
    setEditing(trainer)
    setForm(
      trainer
        ? {
            first_name: trainer.first_name,
            last_name: trainer.last_name,
            email: trainer.email,
            phone: trainer.phone || '',
            specialization: trainer.specialization || '',
            availability: trainer.availability || '',
            bio: trainer.bio || '',
            status: trainer.status,
          }
        : initialForm,
    )
    setFormOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await trainerService.update(editing.id, form)
        toast.success('Trainer updated')
      } else {
        await trainerService.create(form)
        toast.success('Trainer created')
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
      const res = await trainerService.delete(deleting.id)
      toast.success(res.data.message || 'Trainer deleted')
      setDeleting(null)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader title="Trainers" subtitle="Manage trainer profiles and availability.">
        <button className="btn-primary" onClick={() => openForm()}>
          <Plus className="h-4.5 w-4.5" /> Add Trainer
        </button>
      </PageHeader>

      <div className="card mb-6 flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-secondary-text" />
          <input className="input !pl-11" placeholder="Search trainers..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        </div>
        <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : trainers.length === 0 ? (
          <EmptyState icon={UserSquare2} title="No trainers found" description="Add your first trainer to get started." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-color">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="table-th">Trainer</th>
                    <th className="table-th">Specialization</th>
                    <th className="table-th">Availability</th>
                    <th className="table-th">Appointments</th>
                    <th className="table-th">Status</th>
                    <th className="table-th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {trainers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-light-green text-xs font-bold text-primary">
                            {getInitials(t.full_name)}
                          </span>
                          <div>
                            <p className="font-medium">{t.full_name}</p>
                            <p className="text-xs text-secondary-text">{t.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td">{t.specialization || '—'}</td>
                      <td className="table-td text-xs">{t.availability || '—'}</td>
                      <td className="table-td">{t.appointments_count ?? 0}</td>
                      <td className="table-td"><StatusBadge status={t.status} /></td>
                      <td className="table-td">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openForm(t)} className="rounded-lg p-2 text-secondary-text hover:bg-amber-50 hover:text-amber-600" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleting(t)} className="rounded-lg p-2 text-secondary-text hover:bg-red-50 hover:text-red-600" title="Delete / deactivate">
                            <Trash2 className="h-4 w-4" />
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

      <Modal open={formOpen} title={editing ? 'Edit Trainer' : 'Add Trainer'} onClose={() => setFormOpen(false)}>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">First Name *</label>
            <input className="input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Last Name *</label>
            <input className="input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Specialization</label>
            <input className="input" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Strength & Conditioning" />
          </div>
          <div>
            <label className="label">Availability</label>
            <input className="input" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} placeholder="e.g. Mon-Fri 6AM-2PM" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Bio</label>
            <textarea className="input" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-end justify-end gap-3 sm:col-span-2">
            <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <LoadingSpinner size="sm" /> : null}
              {saving ? 'Saving...' : editing ? 'Update Trainer' : 'Create Trainer'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete / Deactivate Trainer"
        message={
          deleting?.appointments_count
            ? `${deleting?.full_name} has appointment history and will be deactivated instead of deleted. Continue?`
            : `Permanently delete ${deleting?.full_name}?`
        }
        confirmLabel="Confirm"
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
