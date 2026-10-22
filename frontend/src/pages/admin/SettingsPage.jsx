import { Building2, Lock, Save, UserCog, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Modal from '@/components/common/Modal'
import { TableSkeleton } from '@/components/common/Skeleton'
import StatusBadge from '@/components/common/StatusBadge'
import PageHeader from '@/components/layout/PageHeader'
import { settingsService } from '@/services'
import { getErrorMessage } from '@/services/api'
import { formatDate } from '@/utils/format'

const tabs = [
  { id: 'profile', label: 'My Profile', icon: UserRound },
  { id: 'gym', label: 'Gym Settings', icon: Building2 },
  { id: 'users', label: 'User Management', icon: UserCog },
]

export default function SettingsPage() {
  const { user: authUser } = useAuth()
  const [tab, setTab] = useState('profile')

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account, gym details, and staff users." />
      <div className="card overflow-hidden">
        <div className="flex overflow-x-auto border-b border-border-color">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-secondary-text hover:text-main-text'
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {tab === 'profile' ? (
            <ProfileTab user={authUser} />
          ) : tab === 'gym' ? (
            <GymTab />
          ) : (
            <UsersTab />
          )}
        </div>
      </div>
    </div>
  )
}

function ProfileTab({ user }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [passwords, setPasswords] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [saving, setSaving] = useState(false)

  const submitProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await settingsService.updateProfile(form)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const submitPassword = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await settingsService.updateProfile(passwords)
      toast.success('Password changed')
      setPasswords({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid max-w-3xl gap-8">
      <form onSubmit={submitProfile} className="space-y-4">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <UserRound className="h-4.5 w-4.5 text-primary" /> Profile Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
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
            <label className="label">Role</label>
            <input className="input capitalize" value={user?.role || ''} disabled />
          </div>
        </div>
        <button className="btn-primary" disabled={saving}>
          {saving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />} Save Changes
        </button>
      </form>

      <hr className="border-border-color" />

      <form onSubmit={submitPassword} className="space-y-4">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <Lock className="h-4.5 w-4.5 text-primary" /> Change Password
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Current Password *</label>
            <input type="password" className="input" value={passwords.current_password} onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })} required />
          </div>
          <div>
            <label className="label">New Password *</label>
            <input type="password" className="input" value={passwords.password} onChange={(e) => setPasswords({ ...passwords, password: e.target.value })} required minLength={8} />
          </div>
          <div>
            <label className="label">Confirm Password *</label>
            <input type="password" className="input" value={passwords.password_confirmation} onChange={(e) => setPasswords({ ...passwords, password_confirmation: e.target.value })} required minLength={8} />
          </div>
        </div>
        <button className="btn-secondary" disabled={saving}>
          {saving ? <LoadingSpinner size="sm" /> : <Lock className="h-4 w-4" />} Change Password
        </button>
      </form>
    </div>
  )
}

function GymTab() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    settingsService
      .get()
      .then((res) => setSettings(res.data.data ?? res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await settingsService.update(settings)
      toast.success('Gym settings saved')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <form onSubmit={submit} className="grid max-w-3xl gap-4 sm:grid-cols-2">
      {[
        { key: 'gym_name', label: 'Gym Name' },
        { key: 'address', label: 'Address' },
        { key: 'contact_phone', label: 'Phone' },
        { key: 'contact_email', label: 'Email' },
        { key: 'operating_hours', label: 'Operating Hours' },
        { key: 'currency', label: 'Currency Symbol' },
        { key: 'timezone', label: 'Timezone' },
      ].map((field) => (
        <div key={field.key}>
          <label className="label">{field.label}</label>
          <input
            className="input"
            value={settings[field.key] ?? ''}
            onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
          />
        </div>
      ))}
      <div className="sm:col-span-2">
        <label className="label">Footer Text</label>
        <textarea
          className="input"
          rows={2}
          value={settings.footer_text ?? ''}
          onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
          placeholder="Shown on public pages"
        />
      </div>
      <div className="sm:col-span-2">
        <button className="btn-primary" disabled={saving}>
          {saving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />} Save Settings
        </button>
      </div>
    </form>
  )
}

function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'staff', is_active: true })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await settingsService.users({ per_page: 50 })
      setUsers(res.data.data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openForm = (u = null) => {
    setEditing(u)
    setForm(
      u
        ? { name: u.name, email: u.email, password: '', phone: u.phone || '', role: u.role, is_active: u.is_active }
        : { name: '', email: '', password: '', phone: '', role: 'staff', is_active: true },
    )
    setFormOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form }
      if (editing && !payload.password) delete payload.password
      if (editing) {
        await settingsService.updateUser(editing.id, payload)
        toast.success('User updated')
      } else {
        await settingsService.createUser(payload)
        toast.success('User created')
      }
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
      <div className="mb-4 flex justify-end">
        <button className="btn-primary" onClick={() => openForm()}>Add User</button>
      </div>
      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-color">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-th">User</th>
                <th className="table-th">Role</th>
                <th className="table-th">Status</th>
                <th className="table-th">Last Login</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="table-td">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-secondary-text">{u.email}</p>
                  </td>
                  <td className="table-td capitalize">{u.role}</td>
                  <td className="table-td"><StatusBadge status={u.is_active ? 'active' : 'suspended'} /></td>
                  <td className="table-td text-xs">{u.last_login_at ? formatDate(u.last_login_at) : 'Never'}</td>
                  <td className="table-td text-right">
                    <button className="btn-secondary !px-3 !py-1.5 !text-xs" onClick={() => openForm(u)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={formOpen} title={editing ? 'Edit User' : 'Add User'} onClose={() => setFormOpen(false)}>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">{editing ? 'New Password (optional)' : 'Password *'}</label>
            <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} minLength={8} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Role *</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="trainer">Trainer</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 pb-3 text-sm font-medium">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-green-600" />
              Active
            </label>
          </div>
          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <LoadingSpinner size="sm" /> : null}
              {saving ? 'Saving...' : editing ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
