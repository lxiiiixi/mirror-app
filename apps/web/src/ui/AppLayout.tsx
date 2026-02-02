import { images } from "@mirror/assets";
import {
    type HTMLAttributes,
    type ReactNode,
    type UIEvent,
    forwardRef,
    useEffect,
    useRef,
    useState,
} from "react";

export interface AppLayoutFooterItem {
    label: ReactNode;
    icon: string;
    activeIcon?: string;
    position?: "left" | "center" | "right";
    key?: string | number;
    onClick?: () => void;
}

export interface AppLayoutProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    showWalletBar?: boolean;
    showPageNav?: boolean;
    scrollShadow?: boolean;
    pageTitle?: ReactNode;
    headerRight?: ReactNode;
    languageLabel?: ReactNode;
    assetsLabel?: ReactNode;
    loginLabel?: ReactNode;
    isLoggedIn?: boolean;
    langIconSrc?: string;
    logoSrc?: string;
    onLanguageClick?: () => void;
    onLogoClick?: () => void;
    onWalletClick?: () => void;
    onBack?: () => void;
    footerItems?: AppLayoutFooterItem[];
    activeFooterIndex?: number;
    showFooter?: boolean;
}

const HEADER_HEIGHT = 55;
const FOOTER_HEIGHT = 86;

export const AppLayout = forwardRef<HTMLDivElement, AppLayoutProps>(
    (
        {
            children,
            showWalletBar = true,
            showPageNav = false,
            scrollShadow = true,
            pageTitle,
            headerRight,
            languageLabel = "Language",
            assetsLabel = "Assets",
            loginLabel = "Login",
            isLoggedIn = false,
            langIconSrc,
            onLanguageClick,
            onLogoClick,
            onWalletClick,
            onBack,
            footerItems = [],
            activeFooterIndex = 0,
            showFooter = true,
            className = "",
            ...props
        },
        ref,
    ) => {
        const shouldShowHeader = showWalletBar || showPageNav;
        const shouldShowFooter = showFooter && footerItems.length > 0;
        const footerBackground = images.nav.footBarBg;
        const contentPaddingTop = shouldShowHeader ? HEADER_HEIGHT : 0;
        const contentPaddingBottom = shouldShowFooter ? FOOTER_HEIGHT : 0;
        const [headerOffset, setHeaderOffset] = useState(0);
        const [isScrolled, setIsScrolled] = useState(false);
        const contentRef = useRef<HTMLElement | null>(null);
        const lastScrollTop = useRef(0);
        const headerOffsetRef = useRef(0);
        const rafId = useRef<number | null>(null);

        const getScrollTop = () => {
            const target = contentRef.current;
            if (target && target.scrollHeight > target.clientHeight) {
                return target.scrollTop;
            }
            return window.scrollY || document.documentElement.scrollTop || 0;
        };

        const updateScrollState = () => {
            const currentScrollTop = getScrollTop();

            // Background only shows when not at top
            const nextScrolled = currentScrollTop > 0;
            setIsScrolled(nextScrolled);

            // At top: reset header
            if (currentScrollTop <= 0) {
                headerOffsetRef.current = 0;
                setHeaderOffset(0);
                lastScrollTop.current = 0;
                return;
            }

            const delta = currentScrollTop - lastScrollTop.current;

            // Scrolling up (finger up, content down) - hide header
            if (delta > 0) {
                const newOffset = Math.min(HEADER_HEIGHT, headerOffsetRef.current + delta);
                headerOffsetRef.current = newOffset;
                setHeaderOffset(newOffset);
            }
            // Scrolling down (finger down, content up) - show header
            else if (delta < 0) {
                const newOffset = Math.max(0, headerOffsetRef.current + delta);
                headerOffsetRef.current = newOffset;
                setHeaderOffset(newOffset);
            }

            lastScrollTop.current = currentScrollTop;
        };

        const handleScroll = () => {
            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
            }
            rafId.current = requestAnimationFrame(() => {
                updateScrollState();
            });
        };

        const handleContentScroll = (_event: UIEvent<HTMLElement>) => {
            handleScroll();
        };

        useEffect(() => {
            window.addEventListener("scroll", handleScroll, { passive: true });
            return () => {
                window.removeEventListener("scroll", handleScroll);
                if (rafId.current) {
                    cancelAnimationFrame(rafId.current);
                }
            };
        }, []);

        return (
            <div ref={ref} className={`app-layout ${className}`} {...props}>
                {shouldShowHeader ? (
                    <div className={`header ${shouldShowHeader ? "is-show" : ""}`}>
                        <div
                            className={`wrapper ${
                                scrollShadow && isScrolled ? "scroll-shadow" : ""
                            } ${headerOffset >= HEADER_HEIGHT ? "is-hidden" : ""}`}
                            style={{
                                transform: `translateY(-${headerOffset}px)`,
                            }}
                        >
                            {showWalletBar ? (
                                <>
                                    <button
                                        className="header-item text-[12px]"
                                        type="button"
                                        onClick={onLanguageClick}
                                    >
                                        {langIconSrc ? (
                                            <img
                                                className="lang-icon"
                                                src={langIconSrc || "/placeholder.svg"}
                                                alt=""
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <svg
                                                className="lang-icon"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                            </svg>
                                        )}
                                        <span className="lang text-[12px]">{languageLabel}</span>
                                    </button>

                                    <div className="nav-item-logo">
                                        <button
                                            className="logo"
                                            type="button"
                                            onClick={onLogoClick}
                                            aria-label="Home"
                                        >
                                            <img src={images.logo} alt="logo" aria-hidden="true" />
                                        </button>
                                    </div>

                                    <button
                                        className="header-item text-[12px] connector"
                                        type="button"
                                        onClick={onWalletClick}
                                    >
                                        <span
                                            className={`connect-btn ${isLoggedIn ? "assets" : ""}`}
                                        >
                                            <span className="text text-[12px]">
                                                {isLoggedIn ? assetsLabel : loginLabel}
                                            </span>
                                        </span>
                                    </button>
                                </>
                            ) : null}

                            {showPageNav ? (
                                <>
                                    <button
                                        className="page-back"
                                        type="button"
                                        onClick={onBack}
                                        aria-label="Back"
                                    >
                                        <img src={images.works.backBtn} alt="" aria-hidden="true" />
                                    </button>
                                    <div className="page-title text-[16px]">{pageTitle}</div>
                                    <div className="header-right">{headerRight}</div>
                                </>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                <main
                    className="content"
                    ref={contentRef}
                    onScroll={handleContentScroll}
                    style={{
                        paddingTop: `${contentPaddingTop}px`,
                        paddingBottom: `${contentPaddingBottom}px`,
                        paddingLeft: "15px",
                        paddingRight: "15px",
                    }}
                >
                    {children}
                </main>

                {shouldShowFooter ? (
                    <footer
                        className="footer-nav"
                        style={{
                            backgroundImage: `url(${footerBackground})`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                            backgroundSize: "100% 100%",
                        }}
                    >
                        {footerItems.map((item, index) => {
                            const isActive = index === activeFooterIndex;
                            const positionClass = item.position ? `${item.position}-nav` : "";
                            const iconSrc = isActive ? item.activeIcon || item.icon : item.icon;
                            return (
                                <button
                                    key={item.key ?? index}
                                    type="button"
                                    className={`nav-item ${positionClass} ${isActive ? "active" : ""}`}
                                    onClick={item.onClick}
                                >
                                    <span className="pr-icon">
                                        <img
                                            className="nav-icon"
                                            src={iconSrc || "/placeholder.svg"}
                                            alt=""
                                            aria-hidden="true"
                                        />
                                    </span>
                                        <span className="pr-text">
                                            <span className="nav-text text-[12px]">{item.label}</span>
                                        </span>
                                </button>
                            );
                        })}
                    </footer>
                ) : null}

                <style jsx>{`
                    .app-layout {
                        position: relative;
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                    }

                    .content {
                        width: 100vw;
                        flex: 1;
                        min-height: 0;
                        overflow-y: auto;
                    }

                    .header {
                        position: relative;
                        color: #fff;
                        z-index: 99;
                    }

                    .wrapper {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        z-index: 999;
                        padding: 0 15px;
                        height: ${HEADER_HEIGHT}px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        transition:
                            transform 0.15s ease-out,
                            background-color 0.2s ease;
                        will-change: transform, background-color;
                        background: transparent;
                    }

                    .wrapper.scroll-shadow {
                        background: rgb(18 9 44 / 90%);
                    }

                    .wrapper.is-hidden {
                        pointer-events: none;
                    }

                    .header-item {
                        width: 90px;
                        height: 27px;
                        border-radius: 4px;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 500;
                        padding: 0;
                        border: none;
                        background: transparent;
                        color: inherit;
                        cursor: pointer;
                    }

                    .header-item .connect-btn {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: var(--color-primary);
                        border-radius: 4px;
                    }

                    .header-item .connect-btn.assets {
                        background: var(--gradient-primary);
                    }

                    .nav-item-logo {
                        flex-grow: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .logo {
                        cursor: pointer;
                        width: 119px;
                        height: 31px;
                        border: none;
                        background: transparent;
                        padding: 0;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .logo img {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                        display: block;
                    }

                    .logo-text {
                        font-weight: 700;
                        color: #fff;
                        letter-spacing: 2px;
                    }

                    .lang-icon {
                        width: 16px;
                        height: 16px;
                        margin-right: 5px;
                    }

                    .lang {
                        font-weight: 700;
                    }

                    .connector .text {
                        font-weight: 700;
                        line-height: 16px;
                        text-align: left;
                        display: -webkit-box;
                        -webkit-box-orient: vertical;
                        -webkit-line-clamp: 1;
                        overflow: hidden;
                    }

                    .page-back {
                        z-index: 10;
                        width: 20px;
                        height: 20px;
                        background: transparent;
                        border: none;
                        padding: 0;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .page-back img {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                        display: block;
                    }

                    .page-title {
                        flex: 1;
                        text-align: center;
                        font-weight: 700;
                        color: #fff;
                    }

                    .header-right {
                        position: absolute;
                        right: 10px;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                    }

                    .footer-nav {
                        display: flex;
                        justify-content: space-around;
                        align-items: center;
                        width: 265px;
                        height: ${FOOTER_HEIGHT}px;
                        position: fixed;
                        z-index: 90;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        margin: 0 auto;
                        border: none;
                    }

                    .footer-nav .nav-item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        flex: 1;
                        background: transparent;
                        border: none;
                    }

                    .pr-icon {
                        position: relative;
                        width: 72px;
                        height: 45px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }

                    .pr-text {
                        position: relative;
                        width: 72px;
                        height: 15px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }

                    .footer-nav .nav-icon {
                        margin-top: 13px;
                        width: 25px;
                        height: 25px;
                    }

                    .footer-nav .nav-text {
                        color: rgba(252, 252, 252, 1);
                    }

                    .footer-nav .nav-item.active .nav-icon {
                        margin-top: 15px;
                        width: 44px;
                        height: 44px;
                    }

                    .footer-nav .nav-item.active .nav-text {
                        color: rgba(255, 38, 150, 1);
                    }

                    .footer-nav .left-nav {
                        margin-left: 20px;
                    }

                    .footer-nav .right-nav {
                        margin-right: 20px;
                    }

                    .footer-nav .center-nav .nav-icon {
                        margin-top: -2px;
                        width: 43px;
                        height: 43px;
                    }

                    .footer-nav .center-nav.active .nav-icon {
                        margin-top: -2px;
                        width: 62px;
                        height: 62px;
                    }
                `}</style>
            </div>
        );
    },
);

AppLayout.displayName = "AppLayout";
