import { Dumbbell } from 'lucide-react'

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'Contact', href: '/#contact' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', href: '/login' },
      { label: 'Create Account', href: '/register' },
      { label: 'Forgot Password', href: '/forgot-password' },
    ],
  },
]

export default function PublicFooter() {
  return (
    <footer id="contact" className="border-t border-border-color bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <Dumbbell className="h-5 w-5 text-white" />
              </span>
              <span className="text-sm font-extrabold text-primary-dark">
                GYM FITNESS MANAGEMENT SYSTEM
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-secondary-text">
              A complete gym management platform for tracking members, plans, payments,
              attendance, trainers, and reports — built for modern fitness businesses.
            </p>
            <p className="mt-4 text-sm text-secondary-text">
              123 Wellness Ave., Makati City · info@fitcoregym.test · +63 917 000 1111
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-main-text">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-secondary-text transition-colors hover:text-primary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-border-color pt-6 text-center text-xs text-secondary-text">
          © {new Date().getFullYear()} Gym Fitness Management System. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
