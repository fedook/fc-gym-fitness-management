import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
        <AlertTriangle className="h-7 w-7 text-red-500" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-main-text">Unable to load data</h3>
      <p className="mt-1 max-w-sm text-sm text-secondary-text">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary mt-4">
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  )
}
