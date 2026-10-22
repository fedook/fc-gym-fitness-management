import { Search } from 'lucide-react'

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'expired', label: 'Expired' },
  { value: 'suspended', label: 'Suspended' },
]

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'expiration', label: 'Expiration Date' },
]

export default function MemberFilters({ filters, onFilterChange, plans, searchInput, onSearchChange }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-secondary-text" />
        <input
          type="search"
          placeholder="Search by name, ID, email, or phone..."
          className="input !pl-11"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search members"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <select
          className="input !w-auto"
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          aria-label="Filter by status"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          className="input !w-auto"
          value={filters.plan}
          onChange={(e) => onFilterChange({ plan: e.target.value })}
          aria-label="Filter by plan"
        >
          <option value="all">All Plans</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>{plan.name}</option>
          ))}
        </select>
        <select
          className="input !w-auto"
          value={filters.sort}
          onChange={(e) => onFilterChange({ sort: e.target.value })}
          aria-label="Sort by"
        >
          <option value="newest">Sort By</option>
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
