export function formatCurrency(amount, currency = 'PHP') {
  const symbols = { PHP: '₱', USD: '$', EUR: '€', GBP: '£' }
  const symbol = symbols[currency] || currency + ' '
  return symbol + Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export function statusColor(status) {
  const map = {
    active: 'bg-green-100 text-green-700',
    paid: 'bg-green-100 text-green-700',
    present: 'bg-green-100 text-green-700',
    completed: 'bg-green-100 text-green-700',
    scheduled: 'bg-sky-100 text-sky-700',
    pending: 'bg-amber-100 text-amber-700',
    late: 'bg-amber-100 text-amber-700',
    expired: 'bg-red-100 text-red-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-600',
    suspended: 'bg-orange-100 text-orange-700',
    refunded: 'bg-sky-100 text-sky-700',
    inactive: 'bg-slate-100 text-slate-600',
    absent: 'bg-red-100 text-red-600',
  }
  return map[status] || 'bg-slate-100 text-slate-600'
}
