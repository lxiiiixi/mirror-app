import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Notice, ProjectTabs } from "../ui";
import { VipAbout, VipMining, VipNode } from "../components";

function Vip() {
    const { t } = useTranslation();
    const [activeProject, setActiveProject] = useState(0);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const shouldShowMining = window.localStorage.getItem("su");
        if (shouldShowMining) {
            setActiveProject(1);
            window.localStorage.removeItem("su");
        }
    }, []);

    const tabs = useMemo(
        () => [
            { label: t("projectTabs.vip") },
            { label: t("projectTabs.myMining") },
            { label: t("projectTabs.node") },
        ],
        [t],
    );

    return (
        <div className="vip-page text-[14px]">
            <Notice message={t("notice.defaultMessage")} />
            <ProjectTabs
                tabs={tabs}
                activeIndex={activeProject}
                onTabChange={index => setActiveProject(index)}
            />

            {activeProject === 0 ? <VipAbout /> : null}
            {activeProject === 1 ? <VipMining /> : null}
            {activeProject === 2 ? <VipNode /> : null}
        </div>
    );
}

export default Vip;
