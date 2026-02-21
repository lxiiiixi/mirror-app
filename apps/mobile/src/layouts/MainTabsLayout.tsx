import { ROUTE_PATHS, type AppRoutePath } from "@mirror/routes";
import { useRouter } from "expo-router";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGE_ORDER } from "../i18n";
import { AppLayout } from "../ui";

interface MainTabsLayoutProps {
  children: ReactNode;
  activeFooterIndex: 0 | 1 | 2;
}

export function MainTabsLayout({ children, activeFooterIndex }: MainTabsLayoutProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const navigate = (path: AppRoutePath) => {
    router.push(path);
  };

  const switchLanguage = () => {
    const currentIndex = LANGUAGE_ORDER.indexOf(
      i18n.language as (typeof LANGUAGE_ORDER)[number],
    );
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % LANGUAGE_ORDER.length;
    void i18n.changeLanguage(LANGUAGE_ORDER[nextIndex]);
  };

  return (
    <AppLayout
      showWalletBar
      showFooter
      activeFooterIndex={activeFooterIndex}
      onLogoPress={() => navigate(ROUTE_PATHS.home)}
      onWalletPress={() => navigate(ROUTE_PATHS.assets)}
      onLanguagePress={switchLanguage}
      loginLabel={t("header.login", { defaultValue: "Login" })}
      assetsLabel={t("header.assets", { defaultValue: "Assets" })}
      footerItems={[
        {
          key: "home",
          label: t("footer.entertainFI", { defaultValue: "EntertainFI" }),
          icon: "●",
          activeIcon: "●",
          onPress: () => navigate(ROUTE_PATHS.home),
        },
        {
          key: "vip",
          label: t("footer.home", { defaultValue: "VIP" }),
          icon: "●",
          activeIcon: "●",
          onPress: () => navigate(ROUTE_PATHS.vip),
        },
        {
          key: "promotion",
          label: t("footer.kol", { defaultValue: "Promotion" }),
          icon: "●",
          activeIcon: "●",
          onPress: () => navigate(ROUTE_PATHS.promotion),
        },
      ]}
    >
      {children}
    </AppLayout>
  );
}
