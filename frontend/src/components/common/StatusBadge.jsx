import { statusColor } from '@/utils/format'

export default function StatusBadge({ status }) {
  if (!status) return null
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor(status)}`}
    >
      {status.replace('_', ' ')}
    </span>
  )
}
