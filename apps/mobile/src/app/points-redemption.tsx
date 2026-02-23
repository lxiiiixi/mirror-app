import { ROUTE_PATHS, getRouteByKey } from "@mirror/routes";
import { useMemo, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { RouteStubScreen } from "../screens/RouteStubScreen";
import { ProjectTabs, type ProjectTabItem } from "../ui";
import { useTranslation } from "react-i18next";

export default function PointsRedemptionPage() {
  const { t } = useTranslation();
  const route = getRouteByKey("pointsRedemption");
  const [activeTab, setActiveTab] = useState(0);
  const tabs = useMemo<ProjectTabItem[]>(
    () => [
      { key: "mall", label: t("pointsRedemption.tabs.mall", { defaultValue: "Points Mall" }) },
      { key: "my", label: t("pointsRedemption.tabs.my", { defaultValue: "My Redemptions" }) },
    ],
    [t],
  );

  return (
    <RouteStubScreen
      title={route.title ?? "Points Redemption"}
      path={ROUTE_PATHS.pointsRedemption}
    >
      <View style={styles.content}>
        <ProjectTabs tabs={tabs} activeIndex={activeTab} onTabChange={(index) => setActiveTab(index)} />
        {activeTab === 0 ? <Text style={styles.text}>Points Mall section (placeholder)</Text> : null}
        {activeTab === 1 ? <Text style={styles.text}>My Redemptions section (placeholder)</Text> : null}
      </View>
    </RouteStubScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
  },
  text: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 14,
  },
});
