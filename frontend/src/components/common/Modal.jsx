import { X } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'

export default function Modal({ open, title, onClose, children, size = 'md' }) {
  if (!open) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} max-h-[90vh] overflow-y-auto card shadow-xl`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-color bg-white px-6 py-4">
          <h3 className="text-lg font-semibold text-main-text">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-secondary-text transition-colors hover:bg-slate-100 hover:text-main-text"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function ModalLoading() {
  return (
    <div className="flex justify-center py-10">
      <LoadingSpinner />
    </div>
  )
}
