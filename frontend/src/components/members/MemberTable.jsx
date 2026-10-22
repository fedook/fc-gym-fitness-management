import { Eye, Pencil, Trash2 } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'
import Pagination from '@/components/common/Pagination'
import StatusBadge from '@/components/common/StatusBadge'
import { TableSkeleton } from '@/components/common/Skeleton'
import { Users } from 'lucide-react'

export default function MemberTable({ members, loading, meta, selectedId, onSelect, onView, onEdit, onDelete, onPageChange }) {
  if (loading) {
    return <TableSkeleton rows={6} cols={5} />
  }

  if (!members || members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No members found"
        description="Try adjusting your search or filters, or add a new member."
      />
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-color">
          <thead className="bg-slate-50">
            <tr>
              <th className="table-th">ID</th>
              <th className="table-th">Name</th>
              <th className="table-th">Plan</th>
              <th className="table-th">Status</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {members.map((member) => (
              <tr
                key={member.id}
                onClick={() => onSelect(member)}
                className={`cursor-pointer transition-colors ${
                  selectedId === member.id ? 'bg-pale-green' : 'hover:bg-slate-50'
                }`}
              >
                <td className="table-td font-mono text-xs text-secondary-text">{member.member_code}</td>
                <td className="table-td">
                  <p className="font-medium text-main-text">{member.full_name}</p>
                  <p className="text-xs text-secondary-text">{member.email}</p>
                </td>
                <td className="table-td">
                  <span className="inline-flex items-center rounded-lg bg-light-green px-2.5 py-1 text-xs font-medium text-primary">
                    {member.current_membership?.plan?.name || member.latest_membership?.plan_name || 'No plan'}
                  </span>
                </td>
                <td className="table-td">
                  <StatusBadge status={member.status} />
                </td>
                <td className="table-td">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onView(member) }}
                      className="rounded-lg p-2 text-secondary-text transition-colors hover:bg-sky-50 hover:text-sky-600"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(member) }}
                      className="rounded-lg p-2 text-secondary-text transition-colors hover:bg-amber-50 hover:text-amber-600"
                      title="Edit member"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(member) }}
                      className="rounded-lg p-2 text-secondary-text transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Delete member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination meta={meta} onPageChange={onPageChange} />
    </div>
  )
}
