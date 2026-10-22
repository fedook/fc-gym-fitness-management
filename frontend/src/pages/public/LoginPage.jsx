import { zodResolver } from '@hookform/resolvers/zod'
import { Dumbbell, Eye, EyeOff, Lock, LogIn, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useAuth } from '@/context/AuthContext'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const { user, loading: authLoading, login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  if (!authLoading && user) {
    return <Navigate to={user.role === 'member' ? '/member/dashboard' : '/admin/dashboard'} replace />
  }

  const onSubmit = async (values) => {
    setSubmitting(true)
    const result = await login(values.email, values.password)
    setSubmitting(false)

    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`)
      navigate(result.user.role === 'member' ? '/member/dashboard' : '/admin/dashboard')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-main-bg">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <header className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <Dumbbell className="h-5 w-5 text-white" />
            </span>
            <span className="text-sm font-extrabold text-primary-dark">
              GYM FITNESS MANAGEMENT SYSTEM
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {[
              { href: '/', label: 'Home' },
              { href: '/#features', label: 'Features' },
              { href: '/#pricing', label: 'Pricing' },
              { href: '/#contact', label: 'Contact' },
            ].map((l) => (
              <a key={l.label} href={l.href} className="rounded-lg px-3 py-2 text-secondary-text hover:bg-pale-green hover:text-primary">
                {l.label}
              </a>
            ))}
          </nav>
        </header>

        <main className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-md">
            <div className="card overflow-hidden shadow-lg">
              <div className="bg-gradient-to-br from-primary-dark via-primary to-secondary px-8 py-10 text-center">
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
                  <Dumbbell className="h-10 w-10 text-white" />
                </span>
                <h1 className="mt-5 text-2xl font-bold text-white">Welcome Back!</h1>
                <p className="mt-1 text-sm text-green-100">Sign in to your account</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-8">
                <div>
                  <label htmlFor="email" className="label">Email / Username</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-secondary-text" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="input !pl-11"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="label !mb-0">Password</label>
                    <Link to="/forgot-password" className="text-xs font-medium text-primary hover:text-secondary">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative mt-1.5">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-secondary-text" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="input !pl-11 !pr-11"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
                </div>

                <button type="submit" className="btn-primary w-full !py-3" disabled={submitting}>
                  {submitting ? <LoadingSpinner size="sm" /> : <LogIn className="h-4.5 w-4.5" />}
                  {submitting ? 'Signing in...' : 'Login'}
                </button>

                <p className="text-center text-sm text-secondary-text">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-semibold text-primary hover:text-secondary">
                    Create Account
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </main>

        <footer className="flex flex-wrap items-center justify-center gap-6 border-t border-border-color py-6 text-sm text-secondary-text">
          <a href="/" className="hover:text-primary">Home</a>
          <a href="/#features" className="hover:text-primary">Features</a>
          <a href="/#pricing" className="hover:text-primary">Pricing</a>
          <a href="/#contact" className="hover:text-primary">Contact</a>
        </footer>
      </div>
    </div>
  )
}
