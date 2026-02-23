import { ROUTE_PATHS, getRouteByKey } from "@mirror/routes";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MainTabsLayout } from "../../layouts/MainTabsLayout";
import { ProjectTabs, type ProjectTabItem } from "../../ui";
import { useTranslation } from "react-i18next";

export default function VipPage() {
  const { t } = useTranslation();
  const route = getRouteByKey("vip");
  const [activeProject, setActiveProject] = useState(0);

  const tabs = useMemo<ProjectTabItem[]>(
    () => [
      { key: "vip", label: t("projectTabs.vip", { defaultValue: "VIP" }) },
      { key: "mining", label: t("projectTabs.myMining", { defaultValue: "My Mining" }) },
      { key: "node", label: t("projectTabs.node", { defaultValue: "Node" }) },
    ],
    [t],
  );

  return (
    <MainTabsLayout activeFooterIndex={1}>
      <ProjectTabs
        tabs={tabs}
        activeIndex={activeProject}
        onTabChange={(index) => setActiveProject(index)}
      />

      <View style={styles.card}>
        <Text style={styles.badge}>VIP</Text>
        <Text style={styles.title}>{route.title ?? "VIP"}</Text>
        <Text style={styles.path}>Path: {ROUTE_PATHS.vip}</Text>
        {activeProject === 0 ? (
          <Text style={styles.description}>VIP About section (placeholder)</Text>
        ) : null}
        {activeProject === 1 ? (
          <Text style={styles.description}>My Mining section (placeholder)</Text>
        ) : null}
        {activeProject === 2 ? (
          <Text style={styles.description}>Node section (placeholder)</Text>
        ) : null}
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
