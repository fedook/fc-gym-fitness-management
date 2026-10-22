import { Dumbbell, User } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/#features', label: 'Features' },
  { to: '/#pricing', label: 'Pricing' },
  { to: '/#contact', label: 'Contact' },
]

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-color bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Dumbbell className="h-5 w-5 text-white" />
          </span>
          <span className="text-sm font-extrabold tracking-tight text-primary-dark sm:text-base">
            GYM FITNESS <span className="text-secondary">MANAGEMENT SYSTEM</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.to}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-secondary-text transition-colors hover:bg-pale-green hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <NavLink
            to="/login"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-color text-secondary-text transition-colors hover:border-primary hover:text-primary"
            aria-label="Account"
            title="Sign in"
          >
            <User className="h-4.5 w-4.5" />
          </NavLink>
          <Link to="/login" className="btn-primary hidden sm:inline-flex">
            Sign In
          </Link>
        </div>
      </div>
    </header>
  )
}
