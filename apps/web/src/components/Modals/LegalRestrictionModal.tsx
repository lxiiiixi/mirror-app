import type { HTMLAttributes } from 'react'
import { Modal } from '../../ui'
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
  return (
    <Modal
      open={open}
      title={title}
      closeOnBackdrop={false}
      panelClassName={`max-w-[min(360px,92vw)] ${className}`.trim()}
      bodyClassName="px-5 py-4"
      actionsClassName="px-5 pb-5 pt-2 border-t-0"
      actions={
        <button type="button" className="legal-dialog-btn" onClick={onConfirm}>
          {confirmLabel}
        </button>
      }
    >
      <div className="legal-dialog-content" {...props}>
        {content}
      </div>
    </Modal>
  )
}
