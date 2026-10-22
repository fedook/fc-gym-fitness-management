import { LayoutDashboard, Menu, User } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const topLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/members', label: 'Members' },
  { to: '/admin/plans', label: 'Plans' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/reports', label: 'Reports' },
]

export default function TopNavbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-border-color bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-secondary-text hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </span>
            <span className="hidden text-sm font-extrabold tracking-tight text-primary-dark sm:block">
              GYM FITNESS MANAGEMENT SYSTEM
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {topLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-secondary-text transition-colors hover:bg-pale-green hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-slate-100"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium text-main-text">{user?.name}</span>
              <span className="block text-xs capitalize text-secondary-text">{user?.role}</span>
            </span>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border-color bg-white py-1.5 shadow-lg">
                <Link
                  to={user?.role === 'member' ? '/member/profile' : '/admin/settings'}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-main-text hover:bg-pale-green hover:text-primary"
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    logout()
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
