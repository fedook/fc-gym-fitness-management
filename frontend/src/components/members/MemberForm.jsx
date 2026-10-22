import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Modal from '@/components/common/Modal'
import { memberService, planService } from '@/services'
import { getErrorMessage } from '@/services/api'

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  date_of_birth: '',
  gender: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  status: 'pending',
  plan_id: '',
  membership_start_date: '',
}

export default function MemberForm({ open, member, onClose, onSaved }) {
  const [form, setForm] = useState(initialForm)
  const [plans, setPlans] = useState([])
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      planService
        .list({ status: 'active', per_page: 100 })
        .then((res) => setPlans(res.data.data))
        .catch(() => setPlans([]))

      if (member) {
        setForm({
          first_name: member.first_name || '',
          last_name: member.last_name || '',
          email: member.email || '',
          phone: member.phone || '',
          address: member.address || '',
          date_of_birth: member.date_of_birth || '',
          gender: member.gender || '',
          emergency_contact_name: member.emergency_contact_name || '',
          emergency_contact_phone: member.emergency_contact_phone || '',
          status: member.status || 'pending',
          plan_id: '',
          membership_start_date: '',
        })
      } else {
        setForm({ ...initialForm, membership_start_date: new Date().toISOString().slice(0, 10) })
      }
      setErrors({})
    }
  }, [open, member])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.first_name.trim()) errs.first_name = 'First name is required'
    if (!form.last_name.trim()) errs.last_name = 'Last name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (form.plan_id && !form.membership_start_date) errs.membership_start_date = 'Start date is required with a plan'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const payload = {
        ...form,
        plan_id: form.plan_id || null,
        membership_start_date: form.membership_start_date || null,
      }

      if (member) {
        await memberService.update(member.id, payload)
        toast.success('Member updated successfully')
      } else {
        await memberService.create(payload)
        toast.success('Member created successfully')
      }
      onSaved()
      onClose()
    } catch (error) {
      const message = getErrorMessage(error)
      toast.error(message)
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const fieldErrors = {}
        Object.entries(error.response.data.errors).forEach(([key, msgs]) => {
          fieldErrors[key] = msgs[0]
        })
        setErrors(fieldErrors)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} title={member ? 'Edit Member' : 'Add New Member'} onClose={onClose} size="lg">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">First Name *</label>
          <input className="input" value={form.first_name} onChange={set('first_name')} />
          {errors.first_name && <p className="mt-1 text-xs text-red-600">{errors.first_name}</p>}
        </div>
        <div>
          <label className="label">Last Name *</label>
          <input className="input" value={form.last_name} onChange={set('last_name')} />
          {errors.last_name && <p className="mt-1 text-xs text-red-600">{errors.last_name}</p>}
        </div>
        <div>
          <label className="label">Email *</label>
          <input type="email" className="input" value={form.email} onChange={set('email')} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={set('phone')} placeholder="+63 9XX XXX XXXX" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Address</label>
          <input className="input" value={form.address} onChange={set('address')} />
        </div>
        <div>
          <label className="label">Date of Birth</label>
          <input type="date" className="input" value={form.date_of_birth} onChange={set('date_of_birth')} />
        </div>
        <div>
          <label className="label">Gender</label>
          <select className="input" value={form.gender} onChange={set('gender')}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">Emergency Contact Name</label>
          <input className="input" value={form.emergency_contact_name} onChange={set('emergency_contact_name')} />
        </div>
        <div>
          <label className="label">Emergency Contact Phone</label>
          <input className="input" value={form.emergency_contact_phone} onChange={set('emergency_contact_phone')} />
        </div>

        <div className="sm:col-span-2 rounded-xl border border-dashed border-primary/40 bg-pale-green p-4">
          <p className="text-sm font-semibold text-primary">Membership {member ? '(optional renewal)' : ''}</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Plan</label>
              <select className="input" value={form.plan_id} onChange={set('plan_id')}>
                <option value="">No plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — ₱{plan.price}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" value={form.membership_start_date} onChange={set('membership_start_date')} />
              {errors.membership_start_date && <p className="mt-1 text-xs text-red-600">{errors.membership_start_date}</p>}
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={set('status')}>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        <div className="sm:col-span-2 mt-2 flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <LoadingSpinner size="sm" /> : null}
            {saving ? 'Saving...' : member ? 'Update Member' : 'Create Member'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
