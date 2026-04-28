'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean
  title: string
  description: string
  onClose: () => void
}

export function ExplainModal({ open, title, description, onClose }: Props) {
  useEffect(() => {
    if (!open) {
      return
    }
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [open])

  if (!open) {
    return null
  }

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Explicação: ${title}`}
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-secondary-light/80 bg-white p-5 shadow-xl dark:border-secondary-dark dark:bg-[#1a1a1a]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-brand text-lg font-semibold text-neutral-900 dark:text-white">{title}</h3>
          <button
            type="button"
            className="rounded-lg border border-secondary-light/80 px-2 py-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:border-secondary-dark dark:text-neutral-300 dark:hover:text-white"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {description}
        </p>
      </div>
    </div>,
    document.body,
  )
}
