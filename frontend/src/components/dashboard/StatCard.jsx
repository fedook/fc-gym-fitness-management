import { TrendingDown, TrendingUp } from 'lucide-react'

export default function StatCard({ title, value, change, changeLabel = 'vs last month', icon: Icon, iconClass = 'bg-light-green text-primary', footer }) {
  const isPositive = change !== null && change !== undefined && change >= 0

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-text">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-main-text">{value}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon className="h-5.5 w-5.5" />
        </span>
      </div>
      {change !== null && change !== undefined ? (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-secondary" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`font-semibold ${isPositive ? 'text-secondary' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}
            {change}%
          </span>
          <span className="text-secondary-text">{changeLabel}</span>
        </div>
      ) : (
        <p className="mt-3 text-xs text-secondary-text">{changeLabel}</p>
      )}
      {footer}
    </div>
  )
}
