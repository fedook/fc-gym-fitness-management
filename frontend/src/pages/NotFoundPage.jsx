import { Dumbbell, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-main-bg px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-light-green">
        <Dumbbell className="h-8 w-8 text-primary" />
      </span>
      <h1 className="mt-6 text-6xl font-extrabold text-primary">404</h1>
      <h2 className="mt-2 text-xl font-semibold text-main-text">Page Not Found</h2>
      <p className="mt-2 max-w-sm text-sm text-secondary-text">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary mt-6">
        <Home className="h-4 w-4" /> Back to Home
      </Link>
    </div>
  )
}
