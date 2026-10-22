import { BarChart3, CalendarRange, CreditCard, Download, UserSquare2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ErrorState from '@/components/common/ErrorState'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { TableSkeleton } from '@/components/common/Skeleton'
import PageHeader from '@/components/layout/PageHeader'
import { reportService } from '@/services'
import { getErrorMessage } from '@/services/api'
import { formatCurrency, formatDate } from '@/utils/format'

const tabColumns = {
  payments: [
    { key: 'payment_number', label: 'Payment #' },
    { key: 'member', label: 'Member' },
    { key: 'plan', label: 'Plan' },
    { key: 'amount', label: 'Amount' },
    { key: 'method', label: 'Method' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Date' },
  ],
  members: [
    { key: 'member_code', label: 'Code' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'plan', label: 'Plan' },
    { key: 'status', label: 'Status' },
    { key: 'joined', label: 'Joined' },
  ],
  attendance: [
    { key: 'member', label: 'Member' },
    { key: 'member_code', label: 'Code' },
    { key: 'date', label: 'Date' },
    { key: 'check_in', label: 'Check-in' },
    { key: 'check_out', label: 'Check-out' },
    { key: 'status', label: 'Status' },
  ],
}

export default function ReportsPage() {
  const [from, setFrom] = useState(firstOfMonth())
  const [to, setTo] = useState(today())
  const [activeTab, setActiveTab] = useState('payments')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { from, to }
      const res =
        activeTab === 'payments'
          ? await reportService.payments(params)
          : activeTab === 'members'
            ? await reportService.members(params)
            : await reportService.attendance(params)
      setData(res.data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [from, to, activeTab])

  useEffect(() => { load() }, [load])

  const exportCsv = () => {
    const cols = tabColumns[activeTab]
    if (!data?.rows?.length) {
      toast.error('Nothing to export')
      return
    }
    const csv = [
      cols.map((c) => `"${c.label}"`).join(','),
      ...data.rows.map((row) => cols.map((c) => `"${String(row[c.key] ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gym-${activeTab}-report-${from}-to-${to}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export downloaded')
  }

  return (
    <div>
      <PageHeader title="Reports" subtitle="Revenue, membership, and attendance analytics.">
        <button className="btn-secondary" onClick={exportCsv} disabled={loading}>
          <Download className="h-4.5 w-4.5" /> Export CSV
        </button>
      </PageHeader>

      <div className="card mb-6 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <label className="label">From</label>
            <input type="date" className="input !w-auto" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">To</label>
            <input type="date" className="input !w-auto" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="flex gap-1 sm:ml-auto">
            {[
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'members', label: 'Members', icon: UserSquare2 },
              { id: 'attendance', label: 'Attendance', icon: CalendarRange },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === t.id ? 'bg-primary text-white' : 'bg-slate-100 text-secondary-text hover:text-main-text'
                }`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card p-5"><LoadingSpinner /></div>
            <div className="card p-5"><LoadingSpinner /></div>
            <div className="card p-5"><LoadingSpinner /></div>
          </div>
          <div className="card"><TableSkeleton rows={6} cols={5} /></div>
        </div>
      ) : data ? (
        <>
          {data.summary && (
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              {Object.entries(data.summary).map(([key, value]) => (
                <div key={key} className="card flex items-center gap-4 p-5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-light-green text-primary">
                    <BarChart3 className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-sm capitalize text-secondary-text">{key.replace(/_/g, ' ')}</p>
                    <p className="text-xl font-bold text-main-text">
                      {typeof value === 'number' && key.includes('revenue') ? formatCurrency(value) : typeof value === 'number' ? value.toLocaleString() : String(value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-color">
                <thead className="bg-slate-50">
                  <tr>
                    {tabColumns[activeTab].map((col) => (
                      <th key={col.key} className="table-th">{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {data.rows.length === 0 ? (
                    <tr>
                      <td className="table-td py-10 text-center text-secondary-text">No data for the selected period.</td>
                    </tr>
                  ) : (
                    data.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        {tabColumns[activeTab].map((col) => (
                          <td key={col.key} className="table-td">
                            {col.key === 'amount'
                              ? formatCurrency(row[col.key])
                              : col.key === 'date' || col.key === 'joined'
                                ? formatDate(row[col.key])
                                : String(row[col.key] ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function firstOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
