import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import { Skeleton } from '@/components/common/Skeleton'
import { dashboardService } from '@/services'
import { getErrorMessage } from '@/services/api'
import { formatCurrency } from '@/utils/format'
import { TrendingUp } from 'lucide-react'

const ranges = [
  { value: '6m', label: 'Last 6 months' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'year', label: 'Current year' },
]

export default function RevenueChart() {
  const [range, setRange] = useState('6m')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await dashboardService.revenue(range)
      setData(res.data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range])

  const hasData = data.some((d) => d.total > 0)

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-main-text">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-light-green">
              <TrendingUp className="h-4 w-4 text-primary" />
            </span>
            Revenue Trend
          </h2>
          <p className="mt-1 text-sm text-secondary-text">Monthly revenue over time</p>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="input !w-auto !py-2 text-sm"
          aria-label="Chart range"
        >
          {ranges.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="mt-5 h-72">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !hasData ? (
          <EmptyState title="No revenue data" description="Revenue will appear here once paid payments are recorded." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Revenue']}
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#16A34A"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#16A34A', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
