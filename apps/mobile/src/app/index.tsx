import { images } from "@mirror/assets";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MainTabsLayout } from "../layouts/MainTabsLayout";
import { HomeBanner, HomeNotice } from "../components";
import { useTranslation } from "react-i18next";
import { ProjectTabs, type ProjectTabItem } from "../ui";

export default function HomeRoutePage() {
    const { t } = useTranslation();
    const [activeProject, setActiveProject] = useState(0);

    const tabs = useMemo<ProjectTabItem[]>(
        () => [
            {
                key: "rwa",
                label: "RWA",
                iconSrc: images.home.tokenTab2,
            },
            {
                key: "token",
                label: t("works.tokenFilter.metaToken", { defaultValue: "Token" }),
                iconSrc: images.home.tokenTab1,
            },
        ],
        [t],
    );

    return (
        <MainTabsLayout activeFooterIndex={0}>
            <View style={styles.content}>
                <HomeNotice
                    message={t("notice.defaultMessage", {
                        defaultValue:
                            "Blessed with good luck, tickets come at your fingertips! Good luck to you!",
                    })}
                />
                <HomeBanner autoplay interval={4000} />
                <ProjectTabs
                    tabs={tabs}
                    activeIndex={activeProject}
                    onTabChange={index => setActiveProject(index)}
                />
            </View>
        </MainTabsLayout>
    );
}

const styles = StyleSheet.create({
    content: {
        gap: 2,
    },
});
