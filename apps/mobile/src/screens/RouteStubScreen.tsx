import { type ReactNode } from "react";
import { useRouter } from "expo-router";
import { ROUTE_PATHS } from "@mirror/routes";
import { StyleSheet, Text, View } from "react-native";
import { AppLayout } from "../ui";

interface RouteStubScreenProps {
  title: string;
  path: string;
  children?: ReactNode;
}

export function RouteStubScreen({ title, path, children }: RouteStubScreenProps) {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTE_PATHS.home);
  };

  return (
    <AppLayout
      showWalletBar={false}
      showPageNav
      showFooter={false}
      pageTitle={title}
      onBackPress={handleBack}
    >
      <View style={styles.content}>
        <Text style={styles.badge}>MOBILE ROUTE PAGE</Text>
        <Text style={styles.path}>Path: {path}</Text>
        <Text style={styles.description}>
          This is a scaffold page generated from shared route config. Replace with real business UI.
        </Text>

        {children}
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 5,
    gap: 12,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#dcfce7",
    color: "#166534",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  path: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },
  description: {
    color: "#334155",
    fontSize: 15,
    lineHeight: 22,
  },
});
