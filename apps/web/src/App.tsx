import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import useMediaQuery from './hooks/useMediaQuery'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import UIShowcase from './pages/UIShowcase'
import WorkDetail from './pages/WorkDetail'
import EmailLogin from './pages/EmailLogin'
import { AppLayout } from './ui'
import { images } from '@mirror/assets'
import { AlertHost, LoginModal } from './components'
import { useLoginModalStore } from './store/useLoginModalStore'
import { artsApiClient } from './api/artsClient'
import { useRegionLanguage } from '@mirror/hooks'
import { useAuth } from './hooks/useAuth'

function App() {
  const { t, i18n } = useTranslation()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const navigate = useNavigate()
  const location = useLocation()
  const openLoginModal = useLoginModalStore((state) => state.openModal)
  const isWorkDetail = location.pathname.startsWith('/works/detail')
  const { isLoggedIn } = useAuth()

  // 桌面端自动重定向到白皮书网站
  useEffect(() => {
    if (isDesktop) {
      window.location.href = 'https://whitepaper.mirror.fan/'
    }
  }, [isDesktop])

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage ?? i18n.language ?? 'en'
  }, [i18n.resolvedLanguage, i18n.language])

  useRegionLanguage({
    api: artsApiClient.user,
    isEnabled: !isDesktop,
    onResolve: (language) => {
      void i18n.changeLanguage(language)
    },
  })

  const handleLanguageToggle = () => {
    const currentLanguage = i18n.resolvedLanguage ?? i18n.language ?? 'en'
    const normalizedCurrent = currentLanguage.toLowerCase()
    const availableLanguages = ['en', 'zh-HK', 'zh-CN']
    const currentIndex = availableLanguages.findIndex(
      (lang) => lang.toLowerCase() === normalizedCurrent
    )
    const nextLanguage =
      availableLanguages[(currentIndex + 1) % availableLanguages.length]
    console.log(`[Change_Language] currentLanguage: ${currentLanguage}, nextLanguage: ${nextLanguage}`)
    localStorage.setItem('user-lang', nextLanguage)
    void i18n.changeLanguage(nextLanguage)
  }
  const activeFooterIndex = location.pathname.startsWith('/ui') ? 1 : 0
  const handleEmailLogin = () => navigate('/account/email')
  const footerItems = [
    {
      label: t('footer.entertainFI'),
      icon: images.nav.footHome,
      activeIcon: images.nav.footHomeOn,
      position: 'left' as const,
      onClick: () => navigate('/'),
    },
    {
      label: t('footer.home'),
      icon: images.nav.footProfile,
      activeIcon: images.nav.footProfileOn,
      position: 'center' as const,
      onClick: () => navigate('/ui'),
    },
    {
      label: t('footer.kol'),
      icon: images.nav.footDiscover,
      activeIcon: images.nav.footDiscoverOn,
      position: 'right' as const,
    },
  ]

  // 如果是桌面端，先不渲染任何内容（等待重定向）
  if (isDesktop) {
    return null
  }

  if (location.pathname.startsWith('/account/email')) {
    return (
      <>
        <Routes>
          <Route element={<EmailLogin />} path="/account/email" />
          <Route element={<NotFound />} path="*" />
        </Routes>
        <AlertHost />
      </>
    )
  }

  if (isWorkDetail) {
    return (
      <>
        <Routes>
          <Route element={<WorkDetail />} path="/works/detail" />
          <Route element={<NotFound />} path="*" />
        </Routes>
        <LoginModal onEmailLogin={handleEmailLogin} />
        <AlertHost />
      </>
    )
  }

  return (
    <AppLayout
      showWalletBar={true}
      showPageNav={false}
      languageLabel={t('header.language')}
      assetsLabel={t('header.assets')}
      loginLabel={t('header.login')}
      isLoggedIn={isLoggedIn}
      onLanguageClick={handleLanguageToggle}
      onLogoClick={() => navigate('/')}
      onWalletClick={openLoginModal}
      footerItems={footerItems}
      activeFooterIndex={activeFooterIndex}
      showFooter={true}
    >
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<UIShowcase />} path="/ui" />
        <Route element={<WorkDetail />} path="/works/detail" />
        <Route element={<EmailLogin />} path="/account/email" />
        <Route element={<NotFound />} path="*" />
      </Routes>
      <LoginModal onEmailLogin={handleEmailLogin} />
      <AlertHost />
    </AppLayout>
  )
}

export default App
