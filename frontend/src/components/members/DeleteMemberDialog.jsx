import { useState } from 'react'
import toast from 'react-hot-toast'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { memberService } from '@/services'
import { getErrorMessage } from '@/services/api'

export default function DeleteMemberDialog({ member, open, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false)

  const confirm = async () => {
    setLoading(true)
    try {
      await memberService.delete(member.id)
      toast.success('Member deleted successfully')
      onDeleted()
      onClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      title="Delete Member"
      message={`Are you sure you want to delete ${member?.full_name}? This action cannot be undone. Members with an active membership cannot be deleted.`}
      confirmLabel="Delete"
      loading={loading}
      onConfirm={confirm}
      onCancel={onClose}
    />
  )
}
