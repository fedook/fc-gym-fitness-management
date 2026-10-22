import { zodResolver } from '@hookform/resolvers/zod'
import { Dumbbell, Eye, EyeOff, Lock, Phone, User, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useAuth } from '@/context/AuthContext'

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

export default function RegisterPage() {
  const { user, loading: authLoading, register: registerUser } = useAuth()
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
    const result = await registerUser(values)
    setSubmitting(false)

    if (result.success) {
      toast.success('Account created successfully!')
      navigate('/member/dashboard')
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
            <span className="text-sm font-extrabold text-primary-dark">GYM FITNESS MANAGEMENT SYSTEM</span>
          </Link>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </header>

        <main className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-md">
            <div className="card overflow-hidden shadow-lg">
              <div className="bg-gradient-to-br from-primary-dark via-primary to-secondary px-8 py-10 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                  <UserPlus className="h-8 w-8 text-white" />
                </span>
                <h1 className="mt-4 text-2xl font-bold text-white">Create Account</h1>
                <p className="mt-1 text-sm text-green-100">Join the gym community today</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-8">
                <div>
                  <label htmlFor="name" className="label">Full Name</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-secondary-text" />
                    <input id="name" placeholder="Juan Dela Cruz" className="input !pl-11" {...register('name')} />
                  </div>
                  {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="label">Email</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-secondary-text" />
                    <input id="email" type="email" placeholder="you@example.com" className="input !pl-11" {...register('email')} />
                  </div>
                  {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="label">Phone (optional)</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-secondary-text" />
                    <input id="phone" placeholder="+63 9XX XXX XXXX" className="input !pl-11" {...register('phone')} />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="label">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-secondary-text" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      className="input !pl-11 !pr-11"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary"
                      aria-label="Toggle password"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
                </div>

                <div>
                  <label htmlFor="password_confirmation" className="label">Confirm Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-secondary-text" />
                    <input
                      id="password_confirmation"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat password"
                      className="input !pl-11"
                      {...register('password_confirmation')}
                    />
                  </div>
                  {errors.password_confirmation && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.password_confirmation.message}</p>
                  )}
                </div>

                <button type="submit" className="btn-primary w-full !py-3" disabled={submitting}>
                  {submitting ? <LoadingSpinner size="sm" /> : <UserPlus className="h-4.5 w-4.5" />}
                  {submitting ? 'Creating account...' : 'Create Account'}
                </button>

                <p className="text-center text-sm text-secondary-text">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-primary hover:text-secondary">Sign In</Link>
                </p>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
