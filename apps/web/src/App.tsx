import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import useMediaQuery from "./hooks/useMediaQuery";
import { AppLayout } from "./ui";
import { images } from "@mirror/assets";
import { AlertHost, LegalRestrictionHost, LoginModal } from "./components";
import { useLoginModalStore } from "./store/useLoginModalStore";
import { artsApiClient } from "./api/artsClient";
import { useRegionLanguage } from "@mirror/hooks";
import { useAuth } from "./hooks/useAuth";
import { useWallet } from "./hooks/useWallet";
import { matchRoute, getLayoutConfig, routeConfigs, type RouteContext } from "./utils/routes";
import { envConfigs } from "@mirror/utils";

function App() {
    const { t, i18n } = useTranslation();
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const navigate = useNavigate();
    const location = useLocation();
    const openLoginModal = useLoginModalStore(state => state.openModal);
    const { isLoggedIn, loginMethod, isEmailLogin } = useAuth();
    const { openWallet, address: reownWalletAddress } = useWallet();

    console.log("[App] Login States", {
        isLoggedIn,
        isEmailLogin,
        loginMethod,
        reownWalletAddress,
    });

    console.log("[App] Env Configs", envConfigs);

    // 匹配当前路由配置
    const currentRoute = useMemo(() => matchRoute(location.pathname), [location.pathname]);

    // 创建路由上下文
    const routeContext: RouteContext = useMemo(
        () => ({
            t,
            navigate: path => {
                if (typeof path === "number") {
                    navigate(path);
                } else {
                    navigate(path);
                }
            },
            isLoggedIn,
            footerItems: [
                {
                    label: t("footer.entertainFI"),
                    icon: images.nav.footHome,
                    activeIcon: images.nav.footHomeOn,
                    position: "left" as const,
                    onClick: () => navigate("/"),
                },
                {
                    label: t("footer.home"),
                    icon: images.nav.footProfile,
                    activeIcon: images.nav.footProfileOn,
                    position: "center" as const,
                    onClick: () => navigate("/vip"),
                },
                {
                    label: t("footer.kol"),
                    icon: images.nav.footDiscover,
                    activeIcon: images.nav.footDiscoverOn,
                    position: "right" as const,
                    onClick: () => navigate("/promotion"),
                },
            ],
        }),
        [t, navigate, isLoggedIn],
    );

    // 获取布局配置
    const layoutConfig = useMemo(
        () => getLayoutConfig(currentRoute, routeContext),
        [currentRoute, routeContext],
    );

    // 桌面端自动重定向到白皮书网站
    useEffect(() => {
        if (isDesktop) {
            window.location.href = "https://whitepaper.mirror.fan/";
        }
    }, [isDesktop]);

    useEffect(() => {
        document.documentElement.lang = i18n.resolvedLanguage ?? i18n.language ?? "en";
    }, [i18n.resolvedLanguage, i18n.language]);

    useRegionLanguage({
        api: artsApiClient.user,
        isEnabled: !isDesktop,
        onResolve: language => {
            void i18n.changeLanguage(language);
        },
    });

    const handleLanguageToggle = () => {
        const currentLanguage = i18n.resolvedLanguage ?? i18n.language ?? "en";
        const normalizedCurrent = currentLanguage.toLowerCase();
        const availableLanguages = ["en", "zh-HK", "zh-CN"];
        const currentIndex = availableLanguages.findIndex(
            lang => lang.toLowerCase() === normalizedCurrent,
        );
        const nextLanguage = availableLanguages[(currentIndex + 1) % availableLanguages.length];
        console.log(
            `[Change_Language] currentLanguage: ${currentLanguage}, nextLanguage: ${nextLanguage}`,
        );
        localStorage.setItem("user-lang", nextLanguage);
        void i18n.changeLanguage(nextLanguage);
    };
    const handleEmailLogin = () => navigate("/account/email");
    const handleWalletLogin = () => {
        openWallet();
    };
    const handleWalletClick = () => {
        if (isLoggedIn) {
            navigate("/assets");
            return;
        }
        openLoginModal();
    };

    // 如果是桌面端，先不渲染任何内容（等待重定向）
    if (isDesktop) {
        return null;
    }

    // 如果没有匹配到路由配置，使用默认配置
    if (!currentRoute) {
        return null;
    }

    const shouldShowLoginModal = currentRoute.showLoginModal ?? false;
    const shouldShowAlertHost = currentRoute.showAlertHost ?? true;

    // 如果布局类型为 none，直接渲染组件，不使用 AppLayout
    if (layoutConfig?.type === "none") {
        return (
            <>
                <Routes>
                    {routeConfigs.map(config => (
                        <Route
                            key={config.path}
                            element={<config.component />}
                            path={config.path}
                        />
                    ))}
                </Routes>
                {shouldShowLoginModal && (
                    <LoginModal onEmailLogin={handleEmailLogin} onWalletLogin={handleWalletLogin} />
                )}
                {shouldShowAlertHost && <AlertHost />}
                <LegalRestrictionHost />
            </>
        );
    }

    // 使用 AppLayout 的页面
    const showWalletBar = layoutConfig?.type === "walletBar";
    const showPageNav = layoutConfig?.type === "pageNav";

    return (
        <AppLayout
            showWalletBar={showWalletBar}
            showPageNav={showPageNav}
            languageLabel={t("header.language")}
            assetsLabel={t("header.assets")}
            loginLabel={t("header.login")}
            isLoggedIn={isLoggedIn}
            pageTitle={layoutConfig?.pageTitle}
            headerRight={layoutConfig?.headerRight ? <layoutConfig.headerRight /> : undefined}
            onBack={showPageNav ? () => navigate(-1) : undefined}
            onLanguageClick={handleLanguageToggle}
            onLogoClick={() => navigate("/")}
            onWalletClick={handleWalletClick}
            footerItems={routeContext.footerItems}
            activeFooterIndex={layoutConfig?.activeFooterIndex ?? 0}
            showFooter={layoutConfig?.showFooter ?? false}
        >
            <Routes>
                {routeConfigs.map(config => (
                    <Route key={config.path} element={<config.component />} path={config.path} />
                ))}
            </Routes>
            {shouldShowLoginModal && (
                <LoginModal onEmailLogin={handleEmailLogin} onWalletLogin={handleWalletLogin} />
            )}
            {shouldShowAlertHost && <AlertHost />}
            <LegalRestrictionHost />
        </AppLayout>
    );
}

export default App;
