import { useTranslation } from 'react-i18next'
import { Modal } from '../ui'
import { useLoginModalStore } from '../store/useLoginModalStore'

export interface LoginModalProps {
  onWalletLogin?: () => void
  onEmailLogin?: () => void
}

/**
 * LoginModal component
 * Uses global Zustand state
 */
export function LoginModal({ onWalletLogin, onEmailLogin }: LoginModalProps) {
  const { t } = useTranslation()
  const { open, closeModal } = useLoginModalStore()

  const handleWalletLogin = () => {
    onWalletLogin?.()
    closeModal()
  }

  const handleEmailLogin = () => {
    onEmailLogin?.()
    closeModal()
  }

  return (
    <Modal
      open={open}
      title={t('loginModal.title')}
      onClose={closeModal}
    >
      <div className="login-modal">
        <button
          type="button"
          className="login-option"
          onClick={handleWalletLogin}
        >
          {t('loginModal.wallet')}
        </button>
        <button
          type="button"
          className="login-option"
          onClick={handleEmailLogin}
        >
          {t('loginModal.email')}
        </button>
      </div>

      <style jsx>{`
        .login-modal {
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding: 8px 0 12px;
        }

        :global(.login-modal-panel) {
          backdrop-filter: blur(35px);
          box-shadow: 0 0 5px 10px #00000040;
          border: 2px solid #727272;
        }

        .login-option {
          height: 48px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 0.2px;
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }

        .login-option:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.85);
          background: rgba(255, 255, 255, 0.12);
        }
      `}</style>
    </Modal>
  )
}
