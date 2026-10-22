import {
  CalendarCheck,
  CreditCard,
  Dumbbell,
  FileBarChart,
  LayoutDashboard,
  Settings,
  Tag,
  Users,
  UserSquare2,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/members', label: 'Members', icon: Users },
  { to: '/admin/plans', label: 'Plans', icon: Tag },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/admin/trainers', label: 'Trainers', icon: UserSquare2 },
  { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

const memberLinks = [
  { to: '/member/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/member/profile', label: 'My Profile', icon: Users },
]

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const links = user?.role === 'member' ? memberLinks : adminLinks

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-border-color px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Dumbbell className="h-5 w-5 text-white" />
          </span>
          <span className="text-sm font-extrabold text-primary-dark">GYM FITNESS</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-secondary-text hover:bg-slate-100 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-secondary-text hover:bg-pale-green hover:text-primary'
              }`
            }
          >
            <link.icon className="h-5 w-5 shrink-0" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border-color p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-light-green text-sm font-bold text-primary">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-main-text">{user?.name}</p>
            <p className="text-xs capitalize text-secondary-text">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border-color bg-white transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </aside>
    </>
  )
}
