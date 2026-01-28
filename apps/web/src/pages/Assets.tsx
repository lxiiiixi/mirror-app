import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { artsApiClient } from '../api/artsClient'
import { images } from '@mirror/assets'
import { useAuth } from '../hooks/useAuth'
import { useLoginModalStore } from '../store/useLoginModalStore'
import { useAlertStore } from '../store/useAlertStore'
import { Spinner } from '../ui'

interface AssetState {
  ent_balance?: string | number
  usdt_balance?: string | number
  token_balance?: string | number
  nft_count?: number
}

const formatNumber = (value?: string | number, maximumFractionDigits = 4) => {
  if (value === undefined || value === null || value === '') return '0'
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return String(value)
  return numberValue.toLocaleString(undefined, {
    maximumFractionDigits,
  })
}

const formatAddress = (address?: string) => {
  if (!address) return ''
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function Assets() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const openLoginModal = useLoginModalStore((state) => state.openModal)
  const showAlert = useAlertStore((state) => state.show)

  const [assets, setAssets] = useState<AssetState>({})
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const refreshAssets = useCallback(async () => {
    if (!isLoggedIn) return

    setLoading(true)
    try {
      const [assetResponse, walletResponse] = await Promise.all([
        artsApiClient.user.getAsset(),
        artsApiClient.user.getWallets(),
      ])

      setAssets(assetResponse.data ?? {})

      const wallets = walletResponse.data?.wallets ?? []
      const primary = wallets.find((wallet) => wallet.is_primary) ?? wallets[0]
      setWalletAddress(primary?.wallet_address ?? '')
      setEmail(walletResponse.data?.bound_email ?? '')
    } catch (error) {
      console.error('[Assets] fetch failed', error)
      showAlert({ message: t('assets.loadFailed'), variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn, showAlert, t])

  useEffect(() => {
    void refreshAssets()
  }, [refreshAssets])

  const total = useMemo(() => {
    const ent = Number(assets.ent_balance ?? 0)
    const usdt = Number(assets.usdt_balance ?? 0)
    const token = Number(assets.token_balance ?? 0)
    const sum = ent + usdt + token
    return Number.isFinite(sum) ? sum : 0
  }, [assets.ent_balance, assets.usdt_balance, assets.token_balance])

  const handleCopyAddress = async () => {
    if (!walletAddress) return
    try {
      await navigator.clipboard.writeText(walletAddress)
      showAlert({ message: t('account.copySu'), variant: 'success' })
    } catch (error) {
      console.error('[Assets] copy failed', error)
      showAlert({ message: t('account.copyFailed'), variant: 'error' })
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="assets-page">
        <div className="login-content">
          <div className="login-title">{t('account.login')}</div>
          <button type="button" className="login-button" onClick={openLoginModal}>
            <img className="wallet-icon" src={images.account.phantomIcon} alt="" />
            <span className="wallet-name">Wallet / Email</span>
          </button>
        </div>
        <style jsx>{`
          .assets-page {
            min-height: 100vh;
            padding: 20px;
          }

          .login-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 60px;
            gap: 28px;
          }

          .login-title {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(90deg, #00f2ff 0%, #5773ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .login-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            width: min(320px, 100%);
            height: 64px;
            border-radius: 999px;
            background: rgba(153, 153, 153, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #fff;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            backdrop-filter: blur(20px);
          }

          .wallet-icon {
            width: 26px;
            height: 26px;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="assets-page">
      <div className="content">
        <div className="top-user">
          <div className="top-total">{t('account.balanceTotal', { d: 'USDT' })}</div>
          <div className="top-total-view">
            <div className="top-total-left">{formatNumber(total, 2)}</div>
            <button type="button" className="top-total-right" onClick={refreshAssets}>
              <span>{t('account.refresh')}</span>
              <img src={images.account.refresh} alt="" />
            </button>
          </div>
        </div>

        <div className="mid">
          <div className="mid-item">
            <div className="mid-left">
              <img src={images.account.entertainer} alt="" />
              <div className="mid-value">
                <span>{t('account.ent')}</span>
                <strong>{formatNumber(assets.ent_balance)}</strong>
              </div>
            </div>
            <div className="mid-line" />
            <div className="mid-left">
              <img src={images.account.usdtIcon} alt="" />
              <div className="mid-value">
                <span>{t('account.rwa_token')}</span>
                <strong>{formatNumber(assets.usdt_balance)}</strong>
              </div>
            </div>
          </div>

          <div className="mid-line1" />

          <div className="mid-item">
            <div className="mid-left">
              <img src={images.account.todayIcon} alt="" />
              <div className="mid-value">
                <span>{t('account.ticket')}</span>
                <strong>{formatNumber(assets.nft_count ?? 0)}</strong>
              </div>
            </div>
            <div className="mid-line" />
            <div className="mid-left">
              <img src={images.account.art} alt="" />
              <div className="mid-value">
                <span>{t('account.rwa_ticket')}</span>
                <strong>{formatNumber(assets.token_balance)}</strong>
              </div>
            </div>
          </div>

          {walletAddress ? <div className="mid-line1" /> : null}
          {walletAddress ? (
            <div className="mid-item">
              <div className="address-view">
                <span>{t('account.address')}</span>
                <strong>{formatAddress(walletAddress)}</strong>
              </div>
              <button type="button" className="copy" onClick={handleCopyAddress}>
                <span>{t('account.copy')}</span>
                <img src={images.account.copyIcon} alt="" />
              </button>
            </div>
          ) : null}

          {email ? <div className="mid-line1" /> : null}
          {email ? (
            <div className="mid-item">
              <div className="address-view">
                <span>{t('emailLogin.email')}</span>
                <strong>{email}</strong>
              </div>
            </div>
          ) : null}
        </div>

        <div className="item-row">
          <div className="item clickable" onClick={() => navigate('/account/token')}>
            <span>{t('account.token')}</span>
            <img src={images.account.right} alt="" />
          </div>
          <div className="item">
            <span>{t('account.bill')}</span>
            <img src={images.account.right} alt="" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <Spinner size="large" />
        </div>
      ) : null}

      <style jsx>{`
        .assets-page {
          min-height: 100vh;
          padding: 20px;
          color: #fff;
        }

        .content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .top-user {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .top-total {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }

        .top-total-view {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .top-total-left {
          font-size: 26px;
          font-weight: 700;
        }

        .top-total-right {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          border: none;
          background: transparent;
          color: #fff;
          cursor: pointer;
        }

        .top-total-right img {
          width: 16px;
          height: 16px;
        }

        .mid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(153, 153, 153, 0.08);
          border-radius: 18px;
          padding: 16px;
        }

        .mid-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .mid-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .mid-left img {
          width: 28px;
          height: 28px;
        }

        .mid-value {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mid-value span {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .mid-value strong {
          font-size: 16px;
        }

        .mid-line {
          width: 1px;
          height: 32px;
          background: rgba(255, 255, 255, 0.2);
        }

        .mid-line1 {
          height: 1px;
          width: 100%;
          background: rgba(255, 255, 255, 0.15);
        }

        .address-view {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .address-view span {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .address-view strong {
          font-size: 14px;
        }

        .copy {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: none;
          background: transparent;
          color: #fff;
          font-size: 12px;
          cursor: pointer;
        }

        .copy img {
          width: 16px;
          height: 16px;
        }

        .item-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .item.clickable {
          cursor: pointer;
        }

        .item img {
          width: 16px;
          height: 16px;
        }

        .loading {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.25);
          z-index: 40;
        }
      `}</style>
    </div>
  )
}

export default Assets
