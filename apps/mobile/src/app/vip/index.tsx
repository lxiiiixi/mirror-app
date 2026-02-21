import { ROUTE_PATHS, getRouteByKey } from "@mirror/routes";
import { StyleSheet, Text, View } from "react-native";
import { MainTabsLayout } from "../../layouts/MainTabsLayout";

export default function VipPage() {
  const route = getRouteByKey("vip");
  return (
    <MainTabsLayout activeFooterIndex={1}>
      <View style={styles.card}>
        <Text style={styles.badge}>VIP</Text>
        <Text style={styles.title}>{route.title ?? "VIP"}</Text>
        <Text style={styles.path}>Path: {ROUTE_PATHS.vip}</Text>
        <Text style={styles.description}>
          This page is now rendered inside the shared mobile AppLayout.
        </Text>
      </View>
    </MainTabsLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    padding: 14,
    gap: 10,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#ede9fe",
    color: "#6d28d9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    color: "#0f172a",
    fontSize: 26,
    fontWeight: "700",
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
