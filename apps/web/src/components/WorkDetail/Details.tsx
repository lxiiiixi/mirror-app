import { resolveImageUrl } from "@mirror/utils";
import { useTranslation } from "react-i18next";
import { getWorkTypeByValue } from "../../utils/work";
import { useState } from "react";

const headingClass = "mb-5 text-[18px] font-semibold text-white";

function Heading({ title }: { title: string }) {
    return <h3 className={headingClass}>{title}</h3>;
}

/** 制作团队：头像 + 姓名 + 角色 */
export function WorkDetailProductionTeam({
    members = [],
}: {
    members?: Array<{ name: string; role: string; avatar_url?: string }>;
}) {
    const { t } = useTranslation();
    const list =
        members.length > 0
            ? members
            : [
                  { name: "卞灼", role: "导演", avatar_url: "" },
                  { name: "李振平", role: "饰 谢树文", avatar_url: "" },
                  { name: "王娟", role: "饰 谢淑贞", avatar_url: "" },
                  { name: "李红梅", role: "饰 谢淑娟", avatar_url: "" },
                  { name: "卞灼", role: "导演", avatar_url: "" },
                  { name: "卞灼", role: "导演", avatar_url: "" },
                  { name: "卞灼", role: "导演", avatar_url: "" },
              ];

    return (
        <section id="production-team">
            <Heading title={t("workDetail.productionTeam", { defaultValue: "Production Team" })} />
            <div className="flex flex-wrap justify-start gap-x-4 gap-y-4">
                {list.map((person, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div className="mb-2 h-[60px] w-[60px] overflow-hidden rounded-full bg-[#d9d9d9]">
                            {person.avatar_url ? (
                                <img
                                    src={resolveImageUrl(person.avatar_url)}
                                    alt={person.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : null}
                        </div>
                        <p className="text-[14px] font-medium text-white">{person.name}</p>
                        <p className="text-[12px] text-[#aeb1ce]">{person.role}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function Tab({
    labels,
    activeIndex,
    onClick,
}: {
    labels: string[];
    activeIndex: number;
    onClick: () => void;
}) {
    return (
        <div className="flex">
            {labels.map((label, index) => (
                <h3
                    key={index}
                    className={`${headingClass} ${activeIndex === index ? "text-primary" : ""}`}
                    onClick={onClick}
                >
                    {label}
                </h3>
            ))}
        </div>
    );
}

function Chapters() {
    return (
        <div>
            <h3>Chapters</h3>
        </div>
    );
}

function TrailersAndStills() {
    return (
        <div>
            <h3>Trailers&Stills</h3>
        </div>
    );
}

/** 预告与剧照：视频占位或列表 */
export function WorkDetailContent({
    work_type,
    work_total_chapter,
}: {
    work_type: number;
    work_total_chapter: number;
}) {
    const [active, setActive] = useState(0);
    const workInfo = getWorkTypeByValue(work_type);
    if (!workInfo) return null;
    const isShowChapter = workInfo.isShowChapter;
    const isShowTrailersStills = workInfo.isShowTrailersStills;

    const lableList = [
        isShowChapter ? "Chapters" : "",
        isShowTrailersStills ? "Trailers&Stills" : "",
    ].filter(Boolean);

    return (
        <section id="work-detail-content">
            {/* 这里首先显示的是一个可以切换的 Tab，用于切换内容类型，目前支持：Chapters、Trailers&Stills */}
            {/* 如果这个作品只有章节的内容就展示章节，如果只有剧照就展示剧照 */}
            <Tab labels={lableList} activeIndex={active} onClick={() => {}} />
            {lableList[active] === "Chapters" && <Chapters />}
            {lableList[active] === "Trailers&Stills" && <TrailersAndStills />}
        </section>
    );
}
