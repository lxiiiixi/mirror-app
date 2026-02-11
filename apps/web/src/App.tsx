import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import useMediaQuery from "./hooks/useMediaQuery";
import { useSafeBack } from "./hooks/useSafeBack";
import { usePersistInviteParams } from "./hooks/usePersistInviteParams";
import { useTrackPromoClick } from "./hooks/useTrackPromoClick";
import { AppLayout } from "./ui";
import { images } from "@mirror/assets";
import { AlertHost, LegalRestrictionHost } from "./components";
import { LoginModal } from "./components/Modals";
import { useLoginModalStore } from "./store/useLoginModalStore";
import { artsApiClient } from "./api/artsClient";
import { useRegionLanguage } from "@mirror/hooks";
import { useAuth } from "./hooks/useAuth";
import { useWallet } from "./hooks/useWallet";
import { matchRoute, getLayoutConfig, routeConfigs, type RouteContext } from "./utils/routes";
import { envConfigs } from "@mirror/utils";
import { useUserWalletsStore } from "./store/useUserWalletsStore";
import {
    STORAGE_KEYS,
    getStorageItem,
    removeStorageItem,
    setStorageItem,
} from "./utils/localStorage";

function App() {
    const { t, i18n } = useTranslation();
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const navigate = useNavigate();
    const location = useLocation();
    const openLoginModal = useLoginModalStore(state => state.openModal);
    const { token, isLoggedIn, loginMethod, isEmailLogin, hydrated } = useAuth();
    const { openWallet, address: reownWalletAddress } = useWallet();
    const handleSafeBack = useSafeBack();
    const setWallets = useUserWalletsStore(state => state.setWallets);
    const setWalletsLoading = useUserWalletsStore(state => state.setLoading);
    const clearWallets = useUserWalletsStore(state => state.clear);

    useTrackPromoClick();
    usePersistInviteParams();

    console.log("[App] Login States", {
        isLoggedIn,
        isEmailLogin,
        token,
        loginMethod,
        reownWalletAddress,
    });

    console.log("[App] Env Configs", envConfigs);

    const urlLanguage = useMemo(() => {
        if (typeof window === "undefined") return null;
        const params = new URLSearchParams(location.search);
        const raw = params.get("lang");
        if (!raw) return null;
        const normalized = raw.trim().toLowerCase();
        if (normalized === "en") return "en";
        if (normalized === "zh" || normalized === "zh-cn") return "zh-CN";
        if (normalized === "zh-hk" || normalized === "zh-tw") return "zh-HK";
        return null;
    }, [location.search]);

    const storedLanguage = getStorageItem(STORAGE_KEYS.userLang);
    const whitepaperUrl = "https://whitepaper.mirror.fan/";

    const fromWhitepaperParam = useMemo(() => {
        if (typeof window === "undefined") return false;
        const params = new URLSearchParams(location.search);
        return params.get("from_whitepaper") === "true";
    }, [location.search]);

    const shouldSkipWhitepaperRedirect = useMemo(() => {
        if (fromWhitepaperParam) return true;
        if (typeof window === "undefined") return false;
        return getStorageItem(STORAGE_KEYS.skipWhitepaperRedirect) === "true";
    }, [fromWhitepaperParam]);

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

    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(location.search);
        const param = params.get("from_whitepaper");
        if (param === "true") {
            setStorageItem(STORAGE_KEYS.skipWhitepaperRedirect, "true");
        } else if (param === "false") {
            removeStorageItem(STORAGE_KEYS.skipWhitepaperRedirect);
        }
    }, [location.search]);

    // 桌面端默认重定向到白皮书网站（除非明确从白皮书返回）
    useEffect(() => {
        if (!isDesktop) return;
        if (shouldSkipWhitepaperRedirect) return;
        window.location.href = whitepaperUrl;
    }, [isDesktop, shouldSkipWhitepaperRedirect, whitepaperUrl]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (isDesktop && shouldSkipWhitepaperRedirect) {
            document.body.classList.add("desktop-frame");
        } else {
            document.body.classList.remove("desktop-frame");
        }
    }, [isDesktop, shouldSkipWhitepaperRedirect]);

    useEffect(() => {
        document.documentElement.lang = i18n.resolvedLanguage ?? i18n.language ?? "en";
    }, [i18n.resolvedLanguage, i18n.language]);

    useEffect(() => {
        if (!urlLanguage) return;
        const currentLanguage = i18n.resolvedLanguage ?? i18n.language ?? "en";
        setStorageItem(STORAGE_KEYS.userLang, urlLanguage);
        if (currentLanguage.toLowerCase() === urlLanguage.toLowerCase()) return;
        void i18n.changeLanguage(urlLanguage);
    }, [i18n, urlLanguage]);

    useRegionLanguage({
        api: artsApiClient.user,
        isEnabled: !isDesktop && !urlLanguage && !storedLanguage,
        onResolve: language => {
            void i18n.changeLanguage(language);
        },
    });

    useEffect(() => {
        if (!hydrated) return;
        if (!isLoggedIn || !token) {
            clearWallets();
            return;
        }
        let isActive = true;
        setWalletsLoading(true);
        artsApiClient.user
            .getWallets()
            .then(response => {
                if (!isActive) return;
                setWallets(response.data);
            })
            .catch(error => {
                if (!isActive) return;
                console.error("[App] getWallets failed", error);
                setWallets(null);
            })
            .finally(() => {
                if (!isActive) return;
                setWalletsLoading(false);
            });
        return () => {
            isActive = false;
        };
    }, [clearWallets, hydrated, isLoggedIn, setWallets, setWalletsLoading, token]);

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
        setStorageItem(STORAGE_KEYS.userLang, nextLanguage);
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
    if (isDesktop && !shouldSkipWhitepaperRedirect) {
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
            routeKey={location.pathname}
            preserveScrollKeys="/"
            showWalletBar={showWalletBar}
            showPageNav={showPageNav}
            languageLabel={t("header.language")}
            assetsLabel={t("header.assets")}
            loginLabel={t("header.login")}
            isLoggedIn={isLoggedIn}
            pageTitle={layoutConfig?.pageTitle}
            headerRight={layoutConfig?.headerRight ? <layoutConfig.headerRight /> : undefined}
            onBack={showPageNav ? handleSafeBack : undefined}
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
