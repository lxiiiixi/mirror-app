export type RouteLayoutType = "walletBar" | "pageNav" | "none";

export const ROUTE_PATHS = {
  home: "/",
  vip: "/vip",
  vipPurchase: "/vip/purchase",
  promotion: "/promotion",
  pointsRedemption: "/points-redemption",
  assets: "/assets",
  accountToken: "/account/token",
  accountBilling: "/account/billing",
  worksDetail: "/works/detail",
  accountEmail: "/account/email",
  notFound: "*",
} as const;

export type AppRouteKey = keyof typeof ROUTE_PATHS;
export type AppRoutePath = (typeof ROUTE_PATHS)[AppRouteKey];

export interface SharedRouteConfig {
  key: AppRouteKey;
  path: AppRoutePath;
  layoutType: RouteLayoutType;
  title?: string;
  showFooter?: boolean;
  activeFooterIndex?: number;
  showLoginModal?: boolean;
  showAlertHost?: boolean;
  exact?: boolean;
}

export const SHARED_ROUTE_CONFIGS: SharedRouteConfig[] = [
  {
    key: "home",
    path: ROUTE_PATHS.home,
    layoutType: "walletBar",
    title: "Home",
    showFooter: true,
    activeFooterIndex: 0,
    showLoginModal: true,
    showAlertHost: true,
    exact: true,
  },
  {
    key: "vip",
    path: ROUTE_PATHS.vip,
    layoutType: "walletBar",
    title: "VIP",
    showFooter: true,
    activeFooterIndex: 1,
    showLoginModal: true,
    showAlertHost: true,
    exact: true,
  },
  {
    key: "vipPurchase",
    path: ROUTE_PATHS.vipPurchase,
    layoutType: "pageNav",
    title: "VIP Purchase",
    showLoginModal: true,
    showAlertHost: true,
    exact: true,
  },
  {
    key: "promotion",
    path: ROUTE_PATHS.promotion,
    layoutType: "walletBar",
    title: "Promotion",
    showFooter: true,
    activeFooterIndex: 2,
    showLoginModal: true,
    showAlertHost: true,
    exact: true,
  },
  {
    key: "pointsRedemption",
    path: ROUTE_PATHS.pointsRedemption,
    layoutType: "none",
    title: "Points Redemption",
    showLoginModal: true,
    showAlertHost: true,
    exact: true,
  },
  {
    key: "assets",
    path: ROUTE_PATHS.assets,
    layoutType: "pageNav",
    title: "Assets",
    showLoginModal: true,
    showAlertHost: true,
    exact: true,
  },
  {
    key: "accountToken",
    path: ROUTE_PATHS.accountToken,
    layoutType: "pageNav",
    title: "Hold Token",
    showLoginModal: true,
    showAlertHost: true,
    exact: true,
  },
  {
    key: "accountBilling",
    path: ROUTE_PATHS.accountBilling,
    layoutType: "pageNav",
    title: "Billing History",
    showLoginModal: true,
    showAlertHost: true,
    exact: true,
  },
  {
    key: "worksDetail",
    path: ROUTE_PATHS.worksDetail,
    layoutType: "none",
    title: "Work Detail",
    showLoginModal: true,
    showAlertHost: true,
    exact: true,
  },
  {
    key: "accountEmail",
    path: ROUTE_PATHS.accountEmail,
    layoutType: "none",
    title: "Email Login",
    showAlertHost: true,
    exact: true,
  },
  {
    key: "notFound",
    path: ROUTE_PATHS.notFound,
    layoutType: "walletBar",
    title: "Not Found",
    showFooter: true,
    activeFooterIndex: 0,
    showLoginModal: true,
    showAlertHost: true,
  },
];

export function getRouteByKey(key: AppRouteKey): SharedRouteConfig {
  return SHARED_ROUTE_CONFIGS.find((route) => route.key === key) ?? SHARED_ROUTE_CONFIGS[0];
}

export function matchSharedRoute(pathname: string): SharedRouteConfig | null {
  const exactMatch = SHARED_ROUTE_CONFIGS.find(
    (route) => route.path !== ROUTE_PATHS.notFound && route.path === pathname,
  );
  if (exactMatch) {
    return exactMatch;
  }

  const prefixCandidates = SHARED_ROUTE_CONFIGS.filter(
    (route) => route.path !== ROUTE_PATHS.notFound && route.path !== ROUTE_PATHS.home,
  ).sort((a, b) => b.path.length - a.path.length);

  const prefixMatch = prefixCandidates.find((route) => pathname.startsWith(route.path));
  if (prefixMatch) {
    return prefixMatch;
  }

  return SHARED_ROUTE_CONFIGS.find((route) => route.key === "notFound") ?? null;
}
