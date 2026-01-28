import type { HTMLAttributes } from 'react'
import './LegalRestrictionModal.css'

export interface LegalRestrictionModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean
  title: string
  content: string
  confirmLabel: string
  onConfirm: () => void
}

export function LegalRestrictionModal({
  open,
  title,
  content,
  confirmLabel,
  onConfirm,
  className = '',
  ...props
}: LegalRestrictionModalProps) {
  if (!open) return null

  return (
    <div className="legal-modal-overlay" role="presentation">
      <div
        className={`legal-modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        {...props}
      >
        <div className="legal-dialog-wrapper">
          <div className="legal-dialog-title">{title}</div>
          <div className="legal-dialog-content">{content}</div>
          <button type="button" className="legal-dialog-btn" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
