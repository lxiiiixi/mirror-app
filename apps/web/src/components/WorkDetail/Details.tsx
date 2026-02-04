import { MediaItem, parseMediaType, resolveImageUrl } from "@mirror/utils";
import { useTranslation } from "react-i18next";
import { getWorkTypeByValue } from "../../utils/work";
import { useEffect, useState } from "react";
import { Directory } from "./Directory";
import { artsApiClient } from "../../api/artsClient";
import { Spinner } from "../../ui";
import { CreativeTeamMembersItem } from "@mirror/api";

function Heading({ title }: { title: string }) {
    return <h3 className="mb-5 text-[18px] font-semibold text-white">{title}</h3>;
}

/** 制作团队：头像 + 姓名 + 角色 */
export function WorkDetailProductionTeam({
    members = [],
}: {
    members?: CreativeTeamMembersItem[];
}) {
    const { t } = useTranslation();

    return (
        <section id="production-team">
            <Heading title={t("workDetail.productionTeam", { defaultValue: "Production Team" })} />
            <div className="flex flex-wrap justify-start gap-x-4 gap-y-4">
                {members.map((person, index) => (
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
    onClick: (index: number) => void;
}) {
    return (
        <div className="flex gap-2">
            {labels.map((label, index) => (
                <h3
                    key={index}
                    className={`mb-5 text-[18px] font-semibold ${activeIndex === index ? "text-white" : "text-[#AEB1CE] cursor-pointer"}`}
                    onClick={() => onClick(index)}
                >
                    {label}
                </h3>
            ))}
        </div>
    );
}

function MediaItems({ mediaItems }: { mediaItems: MediaItem[] }) {
    return (
        <div className="flex flex-col gap-3">
            {mediaItems.map((item, index) => {
                const url = resolveImageUrl(item.url);
                if (item.kind === "image") {
                    return (
                        <img key={`img-${index}`} src={url} alt="" className="w-full rounded-lg" />
                    );
                }
                if (item.kind === "audio") {
                    return (
                        <audio key={`audio-${index}`} controls className="w-full">
                            <source src={url} />
                        </audio>
                    );
                }
                if (item.kind === "embed") {
                    return (
                        <iframe
                            key={`embed-${index}`}
                            src={url}
                            className="aspect-video w-full rounded-lg"
                            allow="autoplay; encrypted-media"
                            title={`embed-${index}`}
                        />
                    );
                }
                return (
                    <video
                        key={`video-${index}`}
                        className="w-full rounded-lg"
                        src={url}
                        controls
                    />
                );
            })}
        </div>
    );
}

function Chapters({
    workId,
    work_total_chapter,
    unlocked_chapter_count,
    work_type,
}: {
    workId: number;
    work_total_chapter: number;
    unlocked_chapter_count: number;
    work_type: number;
}) {
    const [chapterContent, setChapterContent] = useState<string | string[] | null>("");
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [chapterLoading, setChapterLoading] = useState(false);

    const [activePage, setActivePage] = useState(1);

    useEffect(() => {
        if (!workId || Number.isNaN(workId)) return;
        setChapterLoading(true);

        artsApiClient.work
            .getChapter({ work_id: workId, chapter_id: activePage })
            .then(response => {
                const payload = response.data;
                const content = payload.Content ?? "";
                if (!content) return;

                const trimmed = content.trim();

                const parts = trimmed
                    .split(",")
                    .map(item => item.trim())
                    .filter(Boolean);

                const media: MediaItem[] = parseMediaType(content);

                if (media.length > 0) {
                    setMediaItems(media);
                    setChapterContent(null);
                    return;
                }

                if (work_type === 4) {
                    const images = parts.map(item => resolveImageUrl(item));
                    setChapterContent(images);
                    setMediaItems([]);
                    return;
                }

                setChapterContent(trimmed);
                setMediaItems([]);
            })
            .catch(() => {
                setChapterContent("");
                setMediaItems([]);
            })
            .finally(() => {
                setChapterLoading(false);
            });
    }, [activePage, work_type, workId]);

    console.log("[Chapters] state", {
        chapterContent,
        mediaItems,
    });

    return (
        <section>
            <Directory
                total={work_total_chapter}
                active={activePage}
                progress={unlocked_chapter_count}
                onChange={page => setActivePage(page)}
                onBuyChapter={page => setActivePage(page)}
            />
            <div className="mt-5" />
            {chapterLoading ? (
                <div className="flex justify-center py-8">
                    <Spinner size="medium" />
                </div>
            ) : null}
            {Array.isArray(chapterContent) ? (
                <div className="flex flex-col gap-3">
                    {chapterContent.map(item => (
                        <img key={item} src={item} alt="" className="w-full rounded-lg" />
                    ))}
                </div>
            ) : null}
            {typeof chapterContent === "string" && chapterContent ? (
                <div className="whitespace-pre-wrap text-[16px] leading-relaxed text-[#aeb2ce]">
                    {chapterContent}
                </div>
            ) : null}
            {chapterContent ? (
                <div className="whitespace-pre-wrap text-[16px] leading-relaxed text-[#aeb2ce]">
                    {chapterContent}
                </div>
            ) : null}
            <MediaItems mediaItems={mediaItems} />
        </section>
    );
}

function TrailersAndStills() {
    return <section>{/* 在这里展示视频/照片 */}</section>;
}

/** 预告与剧照：视频占位或列表 */
export function WorkDetailContent({
    workId,
    work_type,
    work_total_chapter,
    unlocked_chapter_count,
}: {
    workId: number;
    work_type: number;
    work_total_chapter: number;
    unlocked_chapter_count: number;
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
            <Tab labels={lableList} activeIndex={active} onClick={index => setActive(index)} />
            {lableList[active] === "Chapters" && (
                <Chapters
                    workId={workId}
                    work_total_chapter={work_total_chapter}
                    unlocked_chapter_count={unlocked_chapter_count}
                    work_type={work_type}
                />
            )}
            {lableList[active] === "Trailers&Stills" && <TrailersAndStills />}
        </section>
    );
}
