import { type ComponentType, type ReactNode } from "react";
import { type TFunction } from "i18next";
import { images } from "@mirror/assets";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";
import UIShowcase from "../pages/UIShowcase";
import WorkDetail from "../pages/WorkDetail";
import EmailLogin from "../pages/EmailLogin";
import Assets from "../pages/Assets";
import Vip from "../pages/Vip";
import HoldToken from "../pages/HoldToken";
import { type AppLayoutFooterItem } from "../ui/AppLayout";

export type RouteLayoutType = "walletBar" | "pageNav" | "none";

export interface RouteLayoutConfig {
    type: RouteLayoutType;
    showFooter?: boolean;
    activeFooterIndex?: number;
    pageTitle?: string | ((t: TFunction) => string);
    backIconSrc?: string;
    headerRight?: ReactNode;
    showWalletBar?: boolean;
    showPageNav?: boolean;
}

export interface RouteConfig {
    path: string;
    component: ComponentType;
    layout?: RouteLayoutConfig;
    showLoginModal?: boolean;
    showAlertHost?: boolean;
    exact?: boolean; // 是否精确匹配路径
}

export interface RouteContext {
    t: TFunction;
    navigate: (path: string | number) => void;
    isLoggedIn: boolean;
    footerItems: AppLayoutFooterItem[];
}

// 路由配置列表
export const routeConfigs: RouteConfig[] = [
    {
        path: "/",
        component: Home,
        layout: {
            type: "walletBar",
            showFooter: true,
            activeFooterIndex: 0,
        },
        showLoginModal: true,
        showAlertHost: true,
    },
    {
        path: "/ui",
        component: UIShowcase,
        layout: {
            type: "walletBar",
            showFooter: true,
            activeFooterIndex: 1,
        },
        showLoginModal: true,
        showAlertHost: true,
    },
    {
        path: "/vip",
        component: Vip,
        layout: {
            type: "walletBar",
            showFooter: true,
            activeFooterIndex: 1,
        },
        showLoginModal: true,
        showAlertHost: true,
    },
    {
        path: "/assets",
        component: Assets,
        layout: {
            type: "pageNav",
            showFooter: false,
            pageTitle: (t) => t("assets.title"),
            backIconSrc: images.works.backBtn,
        },
        showLoginModal: true,
        showAlertHost: true,
    },
    {
        path: "/account/token",
        component: HoldToken,
        layout: {
            type: "pageNav",
            showFooter: false,
            pageTitle: (t) => t("hold_token.title"),
            backIconSrc: images.works.backBtn,
        },
        showLoginModal: true,
        showAlertHost: true,
    },
    {
        path: "/works/detail",
        component: WorkDetail,
        layout: {
            type: "none",
        },
        showLoginModal: true,
        showAlertHost: true,
    },
    {
        path: "/account/email",
        component: EmailLogin,
        layout: {
            type: "none",
        },
        showAlertHost: true,
    },
    {
        path: "*",
        component: NotFound,
        layout: {
            type: "walletBar",
            showFooter: true,
            activeFooterIndex: 0,
        },
        showLoginModal: true,
        showAlertHost: true,
    },
];

/**
 * 根据路径匹配路由配置
 * @param pathname 当前路径
 * @returns 匹配的路由配置，如果没有匹配则返回默认配置
 */
export function matchRoute(pathname: string): RouteConfig | null {
    // 先尝试精确匹配
    const exactMatch = routeConfigs.find(
        (config) => config.path === pathname && config.exact !== false,
    );
    if (exactMatch) {
        return exactMatch;
    }

    // 尝试前缀匹配（排除 exact 为 true 的）
    const prefixMatch = routeConfigs.find(
        (config) =>
            pathname.startsWith(config.path) &&
            config.exact !== true &&
            config.path !== "*",
    );
    if (prefixMatch) {
        return prefixMatch;
    }

    // 最后匹配通配符
    const wildcardMatch = routeConfigs.find((config) => config.path === "*");
    return wildcardMatch ?? null;
}

/**
 * 获取布局配置（已解析的配置，pageTitle 等已转换为最终值）
 */
export interface ResolvedLayoutConfig {
    type: RouteLayoutType;
    showFooter?: boolean;
    activeFooterIndex?: number;
    pageTitle?: ReactNode;
    backIconSrc?: string;
    headerRight?: ReactNode;
    showWalletBar?: boolean;
    showPageNav?: boolean;
}

/**
 * 获取布局配置
 */
export function getLayoutConfig(
    routeConfig: RouteConfig | null,
    context: RouteContext,
): ResolvedLayoutConfig | null {
    if (!routeConfig?.layout) {
        return null;
    }

    const layout = routeConfig.layout;
    
    // 解析 pageTitle（如果是函数）
    let resolvedPageTitle: ReactNode | undefined;
    if (layout.pageTitle === undefined) {
        resolvedPageTitle = undefined;
    } else if (typeof layout.pageTitle === "function") {
        resolvedPageTitle = layout.pageTitle(context.t);
    } else {
        resolvedPageTitle = layout.pageTitle;
    }

    const resolvedConfig: ResolvedLayoutConfig = {
        type: layout.type,
        showFooter: layout.showFooter,
        activeFooterIndex: layout.activeFooterIndex,
        pageTitle: resolvedPageTitle,
        backIconSrc: layout.backIconSrc,
        headerRight: layout.headerRight,
        showWalletBar: layout.showWalletBar,
        showPageNav: layout.showPageNav,
    };

    return resolvedConfig;
}
