import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    HomeNotice,
    VipAboutSection,
    VipMiningSection,
    VipNodeSection,
} from "../../components";
import { MainTabsLayout } from "../../layouts/MainTabsLayout";
import { ProjectTabs, type ProjectTabItem } from "../../ui";
import { STORAGE_KEYS, getStorageItem, removeStorageItem } from "../../utils/localStorage";

export default function VipPage() {
    const { t } = useTranslation();
    const [activeProject, setActiveProject] = useState(0);

    useEffect(() => {
        let active = true;

        void (async () => {
            const shouldShowMining = await getStorageItem(STORAGE_KEYS.vipMiningTab);
            if (!active) {
                return;
            }

            if (shouldShowMining) {
                setActiveProject(1);
                await removeStorageItem(STORAGE_KEYS.vipMiningTab);
            }
        })();

        return () => {
            active = false;
        };
    }, []);

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
            <HomeNotice
                message={t("notice.defaultMessage", {
                    defaultValue:
                        "Blessed with good luck, tickets come at your fingertips! Good luck to you!",
                })}
            />

            <ProjectTabs
                tabs={tabs}
                activeIndex={activeProject}
                onTabChange={index => setActiveProject(index)}
            />

            {activeProject === 0 ? <VipAboutSection /> : null}
            {activeProject === 1 ? <VipMiningSection /> : null}
            {activeProject === 2 ? <VipNodeSection /> : null}
        </MainTabsLayout>
    );
}
