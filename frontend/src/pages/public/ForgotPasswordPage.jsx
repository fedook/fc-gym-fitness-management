import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Dumbbell, Mail, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { getErrorMessage } from '@/services/api'
import { authService } from '@/services'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (values) => {
    setSubmitting(true)
    try {
      await authService.forgotPassword(values.email)
      setSent(true)
      toast.success('Password reset link sent!')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-main-bg px-4">
      <div className="w-full max-w-md">
        <Link to="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-secondary-text hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Link>

        <div className="card overflow-hidden shadow-lg">
          <div className="bg-gradient-to-br from-primary-dark via-primary to-secondary px-8 py-10 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <Dumbbell className="h-8 w-8 text-white" />
            </span>
            <h1 className="mt-4 text-2xl font-bold text-white">Forgot Password?</h1>
            <p className="mt-1 text-sm text-green-100">We'll email you a reset link</p>
          </div>

          {sent ? (
            <div className="p-8 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-light-green">
                <MailCheck className="h-7 w-7 text-primary" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-main-text">Check your inbox</h2>
              <p className="mt-2 text-sm text-secondary-text">
                If an account exists for that email, a password reset link has been sent.
              </p>
              <Link to="/login" className="btn-primary mt-6">Return to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-8">
              <div>
                <label htmlFor="email" className="label">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-secondary-text" />
                  <input id="email" type="email" placeholder="you@example.com" className="input !pl-11" {...register('email')} />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <button type="submit" className="btn-primary w-full !py-3" disabled={submitting}>
                {submitting ? <LoadingSpinner size="sm" /> : <Mail className="h-4.5 w-4.5" />}
                {submitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
