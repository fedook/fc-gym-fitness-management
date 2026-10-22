import { Link } from 'react-router-dom'
import PublicFooter from '@/components/layout/PublicFooter'
import PublicHeader from '@/components/layout/PublicHeader'
import { BarChart3, CalendarCheck, CreditCard, Dumbbell, ShieldCheck, Users } from 'lucide-react'

const features = [
  { icon: Users, title: 'Member Management', text: 'Register, search, filter, and track every member with full profiles and membership history.' },
  { icon: CreditCard, title: 'Payments & Billing', text: 'Record payments, track revenue, and manage membership plans with accurate financial reports.' },
  { icon: CalendarCheck, title: 'Attendance Tracking', text: 'Check members in and out, monitor daily traffic, and review attendance history.' },
  { icon: BarChart3, title: 'Reports & Analytics', text: 'Visual dashboards, revenue trends, plan distribution, and CSV exportable reports.' },
  { icon: ShieldCheck, title: 'Role-Based Access', text: 'Secure Sanctum authentication with admin, staff, trainer, and member roles enforced on the API.' },
  { icon: Dumbbell, title: 'Trainer & Appointments', text: 'Manage trainer profiles and schedule training sessions with assigned trainers.' },
]

const plans = [
  { name: 'Weekly Pass', price: '₱350', period: '7 days', features: ['Gym floor access', 'Locker room'] },
  { name: 'Monthly Premium', price: '₱2,500', period: '30 days', popular: true, features: ['Gym floor access', 'Group classes', '2 PT sessions', 'Sauna'] },
  { name: 'Annual Elite', price: '₱11,000', period: '365 days', features: ['All premium perks', '12 PT sessions', 'Guest passes'] },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-main-bg">
      <PublicHeader />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-secondary">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 py-20 sm:px-6 lg:flex-row lg:px-8 lg:py-28">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-light-green">
              <Dumbbell className="h-4 w-4" /> Modern Gym Management
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Run Your Gym <br className="hidden sm:block" /> Like a Pro
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-green-100">
              Manage members, membership plans, payments, attendance, trainers, and reports —
              all from one clean, green, professional dashboard.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link to="/register" className="btn-primary !bg-white !text-primary hover:!bg-green-50 !px-6 !py-3">
                Create Account
              </Link>
              <Link to="/login" className="btn-secondary !border-white/30 !bg-white/10 !text-white hover:!bg-white/20 !px-6 !py-3">
                Sign In
              </Link>
            </div>
          </div>
          <div className="flex-1">
            <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
              {[
                { label: 'Active Members', value: '1,200+' },
                { label: 'Monthly Revenue', value: '₱150K+' },
                { label: 'Check-ins / Day', value: '80+' },
                { label: 'Trainers', value: '15+' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur">
                  <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-green-100">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-main-text">Everything You Need</h2>
          <p className="mx-auto mt-3 max-w-2xl text-secondary-text">
            A complete fitness management toolkit designed for gym owners, staff, trainers, and members.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="card p-6 transition-shadow hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-light-green">
                <feature.icon className="h-5.5 w-5.5 text-primary" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-main-text">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary-text">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-main-text">Membership Pricing</h2>
            <p className="mx-auto mt-3 max-w-2xl text-secondary-text">
              Flexible plans for every kind of member — weekly visitors to year-round athletes.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`card relative p-7 ${plan.popular ? 'border-2 border-primary shadow-md' : ''}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-main-text">{plan.name}</h3>
                <p className="mt-3">
                  <span className="text-4xl font-extrabold text-primary">{plan.price}</span>
                  <span className="text-sm text-secondary-text"> / {plan.period}</span>
                </p>
                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-secondary-text">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-secondary" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="btn-primary mt-8 w-full">
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
