import { images } from "@mirror/assets";
import { ROUTE_PATHS, type AppRoutePath } from "@mirror/routes";
import { usePathname, useRouter } from "expo-router";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSelect, type LanguageOption } from "../components";
import { useAuth } from "../hooks/useAuth";
import { useLoginModal } from "../hooks/useLoginModal";
import { AppLayout, type AppLayoutProps } from "../ui";

interface MainTabsLayoutProps extends Pick<AppLayoutProps, "onScroll" | "scrollEventThrottle"> {
  children: ReactNode;
  activeFooterIndex: 0 | 1 | 2;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "en", label: "English" },
  { value: "zh-HK", label: "繁體" },
  { value: "zh-CN", label: "简体" },
];

export function MainTabsLayout({
  children,
  activeFooterIndex,
  onScroll,
  scrollEventThrottle,
}: MainTabsLayoutProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const { openModal } = useLoginModal();
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language ?? "en";
  const currentLanguageValue =
    LANGUAGE_OPTIONS.find((option) => option.value.toLowerCase() === currentLanguage.toLowerCase())
      ?.value ?? "en";

  const navigate = (path: AppRoutePath) => {
    if (pathname === path) {
      return;
    }
    router.replace(path);
  };

  return (
    <AppLayout
      showWalletBar
      showFooter
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      activeFooterIndex={activeFooterIndex}
      onLogoPress={() => navigate(ROUTE_PATHS.home)}
      onWalletPress={() => {
        if (isLoggedIn) {
          navigate(ROUTE_PATHS.assets);
          return;
        }
        openModal();
      }}
      isLoggedIn={isLoggedIn}
      languageSelect={
        <LanguageSelect
          value={currentLanguageValue}
          options={LANGUAGE_OPTIONS}
          onChange={(next) => void i18n.changeLanguage(next)}
        />
      }
      loginLabel={t("header.login", { defaultValue: "Login" })}
      assetsLabel={t("header.assets", { defaultValue: "Assets" })}
      footerItems={[
        {
          key: "home",
          label: t("footer.entertainFI", { defaultValue: "EntertainFI" }),
          icon: images.nav.footHome,
          activeIcon: images.nav.footHomeOn,
          position: "left",
          onPress: () => navigate(ROUTE_PATHS.home),
        },
        {
          key: "vip",
          label: t("footer.home", { defaultValue: "VIP" }),
          icon: images.nav.footProfile,
          activeIcon: images.nav.footProfileOn,
          position: "center",
          onPress: () => navigate(ROUTE_PATHS.vip),
        },
        {
          key: "promotion",
          label: t("footer.kol", { defaultValue: "Promotion" }),
          icon: images.nav.footDiscover,
          activeIcon: images.nav.footDiscoverOn,
          position: "right",
          onPress: () => navigate(ROUTE_PATHS.promotion),
        },
      ]}
    >
      {children}
    </AppLayout>
  );
}
