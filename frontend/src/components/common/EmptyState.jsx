import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pale-green">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-main-text">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-secondary-text">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
