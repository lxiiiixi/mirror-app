import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'

export function AssetsLogoutButton() {
  const { t } = useTranslation()
  const { isLoggedIn, clearToken } = useAuth()

  if (!isLoggedIn) return null

  return (
    <button type="button" className="assets-logout-btn" onClick={clearToken}>
      {t('account.logout')}
      <style jsx>{`
        .assets-logout-btn {
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 999px;
          cursor: pointer;
        }
      `}</style>
    </button>
  )
}
