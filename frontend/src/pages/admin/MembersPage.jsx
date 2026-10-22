import { Plus, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'
import DeleteMemberDialog from '@/components/members/DeleteMemberDialog'
import MemberDetails from '@/components/members/MemberDetails'
import MemberFilters from '@/components/members/MemberFilters'
import MemberForm from '@/components/members/MemberForm'
import MemberTable from '@/components/members/MemberTable'
import ErrorState from '@/components/common/ErrorState'
import { useDebounce } from '@/hooks/useDebounce'
import { memberService, planService } from '@/services'
import { getErrorMessage } from '@/services/api'

export default function MembersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [members, setMembers] = useState([])
  const [plans, setPlans] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const search = useDebounce(searchInput, 400)

  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    plan: 'all',
    sort: 'newest',
    page: 1,
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        search: search || undefined,
        status: filters.status,
        plan: filters.plan,
        sort: filters.sort,
        page: filters.page,
        per_page: 10,
      }
      const res = await memberService.list(params)
      setMembers(res.data.data)
      setMeta(res.data.meta)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [search, filters])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    planService
      .list({ status: 'all', per_page: 100 })
      .then((res) => setPlans(res.data.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const next = {}
    if (search) next.search = search
    if (filters.status !== 'all') next.status = filters.status
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filters.status])

  const onFilterChange = (patch) => {
    setFilters((f) => ({ ...f, ...patch, page: 1 }))
  }

  const handleSaved = () => {
    load()
    setSelected(null)
  }

  return (
    <div>
      <PageHeader title="Members" subtitle="Manage your gym members, plans, and status.">
        <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true) }}>
          <Plus className="h-4.5 w-4.5" /> Add Member
        </button>
      </PageHeader>

      <div className="card mb-6 p-4">
        <MemberFilters
          filters={filters}
          onFilterChange={onFilterChange}
          plans={plans}
          searchInput={searchInput}
          onSearchChange={(value) => {
            setSearchInput(value)
            setFilters((f) => ({ ...f, page: 1 }))
          }}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="card overflow-hidden xl:col-span-2">
          {error && members.length === 0 ? (
            <ErrorState message={error} onRetry={load} />
          ) : (
            <MemberTable
              members={members}
              loading={loading}
              meta={meta}
              selectedId={selected?.id}
              onSelect={setSelected}
              onView={(m) => setSelected(m)}
              onEdit={(m) => { setEditing(m); setFormOpen(true) }}
              onDelete={(m) => setDeleting(m)}
              onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            />
          )}
        </div>

        <div>
          <MemberDetails member={selected} />
        </div>
      </div>

      <MemberForm
        open={formOpen}
        member={editing}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      <DeleteMemberDialog
        member={deleting}
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onDeleted={() => {
          setSelected(null)
          load()
        }}
      />
    </div>
  )
}
