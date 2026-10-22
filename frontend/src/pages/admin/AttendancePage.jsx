import { CalendarCheck, LogIn, LogOut, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import Pagination from '@/components/common/Pagination'
import { TableSkeleton } from '@/components/common/Skeleton'
import StatusBadge from '@/components/common/StatusBadge'
import PageHeader from '@/components/layout/PageHeader'
import { useDebounce } from '@/hooks/useDebounce'
import { attendanceService, memberService } from '@/services'
import { getErrorMessage } from '@/services/api'
import { formatDate } from '@/utils/format'

export default function AttendancePage() {
  const [records, setRecords] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 400)
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [members, setMembers] = useState([])
  const [checkInMember, setCheckInMember] = useState('')
  const [processing, setProcessing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await attendanceService.list({
        search: search || undefined,
        date: date || undefined,
        status,
        page,
        per_page: 10,
      })
      setRecords(res.data.data)
      setMeta(res.data.meta)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [search, date, status, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search, date, status])

  useEffect(() => {
    memberService
      .list({ per_page: 100, status: 'active' })
      .then((res) => setMembers(res.data.data))
      .catch(() => {})
  }, [])

  const checkIn = async () => {
    if (!checkInMember) return
    setProcessing(true)
    try {
      const res = await attendanceService.checkIn(Number(checkInMember))
      toast.success(res.data.message)
      setCheckInMember('')
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  const checkOut = async (memberId) => {
    setProcessing(true)
    try {
      const res = await attendanceService.checkOut(memberId)
      toast.success(res.data.message)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  const canCheckOut = (record) => record.check_in && !record.check_out &&
    new Date(record.date).toDateString() === new Date().toDateString()

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Track daily member check-ins and check-outs." />

      <div className="card mb-6 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="label">Quick Check-in</label>
            <div className="flex gap-2">
              <select className="input" value={checkInMember} onChange={(e) => setCheckInMember(e.target.value)}>
                <option value="">Select member to check in...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name} ({m.member_code})</option>
                ))}
              </select>
              <button className="btn-primary shrink-0" onClick={checkIn} disabled={!checkInMember || processing}>
                <LogIn className="h-4 w-4" /> Check In
              </button>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-secondary-text" />
            <input className="input !pl-11" placeholder="Search member..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </div>
          <input type="date" className="input !w-auto" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Filter by date" />
          <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : records.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No attendance records" description="Check-ins will appear here." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-color">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="table-th">Member</th>
                    <th className="table-th">Date</th>
                    <th className="table-th">Check-in</th>
                    <th className="table-th">Check-out</th>
                    <th className="table-th">Status</th>
                    <th className="table-th text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="table-td">
                        <p className="font-medium">{r.member?.full_name || '—'}</p>
                        <p className="font-mono text-xs text-secondary-text">{r.member?.member_code}</p>
                      </td>
                      <td className="table-td">{formatDate(r.date)}</td>
                      <td className="table-td">{r.check_in ? new Date(r.check_in).toLocaleTimeString() : '—'}</td>
                      <td className="table-td">{r.check_out ? new Date(r.check_out).toLocaleTimeString() : '—'}</td>
                      <td className="table-td"><StatusBadge status={r.status} /></td>
                      <td className="table-td text-right">
                        {canCheckOut(r) && (
                          <button
                            className="btn-secondary !px-3 !py-1.5 !text-xs"
                            onClick={() => checkOut(r.member_id)}
                            disabled={processing}
                          >
                            <LogOut className="h-3.5 w-3.5" /> Check Out
                          </button>
                        )}
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
    </div>
  )
}
