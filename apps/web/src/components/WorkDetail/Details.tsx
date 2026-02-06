import { MediaItem, parseMediaType, resolveImageUrl } from "@mirror/utils";
import { useTranslation } from "react-i18next";
import { getWorkTypeByValue } from "../../utils/work";
import { useEffect, useMemo, useState } from "react";
import { Directory } from "./Directory";
import { artsApiClient } from "../../api/artsClient";
import { Spinner } from "../../ui";
import type { CreativeTeamMembersItem, WorkLinkListItem } from "@mirror/api";

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
            <div className="flex flex-nowrap justify-start gap-2 overflow-x-auto pb-2">
                {members.map((person, index) => (
                    <div key={index} className="flex w-[70px] shrink-0 flex-col items-center">
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
                console.log("[MediaItems] item", url);
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

type TrailerItem = {
    id: string;
    title?: string;
    videoUrl: string;
    coverUrl?: string;
    duration?: number;
};

type StillItem = {
    id: string;
    title?: string;
    imageUrl: string;
};

function TrailersAndStills({ workId }: { workId: number }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [trailers, setTrailers] = useState<TrailerItem[]>([]);
    const [stills, setStills] = useState<StillItem[]>([]);
    const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        if (!workId || Number.isNaN(workId)) {
            setTrailers([]);
            setStills([]);
            return;
        }

        setLoading(true);

        artsApiClient.work
            .getLinkList({ work_id: workId })
            .then(response => {
                console.log("[TrailersAndStills] response", response.data);
                const list: WorkLinkListItem[] = response.data;
                const nextTrailers: TrailerItem[] = [];
                const nextStills: StillItem[] = [];

                list.forEach(item => {
                    const contentType = Number(item.content_type);
                    const videoUrl = item.video_url;
                    const coverUrl = item.cover_url;
                    const title = item.title;
                    const duration = item.duration_seconds;
                    const idValue = String(item.id ?? videoUrl ?? coverUrl ?? title ?? "");
                    const contentLinks = item.content.split(",");
                    contentLinks.forEach(link => {
                        if (link.startsWith("http")) {
                            nextStills.push({
                                id: idValue,
                                title,
                                imageUrl: link,
                            });
                        }
                    });

                    if (videoUrl) {
                        nextTrailers.push({
                            id: idValue,
                            title,
                            videoUrl,
                            coverUrl,
                            duration,
                        });
                    }

                    if (contentType === 2 || coverUrl) {
                        if (coverUrl) {
                            nextStills.push({
                                id: idValue,
                                title,
                                imageUrl: coverUrl,
                            });
                        }
                    }
                });

                setTrailers(nextTrailers);
                setStills(nextStills);
            })
            .catch(() => {
                setTrailers([]);
                setStills([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [workId]);

    const hasContent = useMemo(() => trailers.length > 0 || stills.length > 0, [trailers, stills]);

    if (loading) {
        return (
            <section>
                <div className="flex justify-center py-8">
                    <Spinner size="medium" />
                </div>
            </section>
        );
    }

    if (!hasContent) {
        return (
            <section>
                <div className="py-8 text-center text-sm text-white/60">
                    {t("workDetail.trailersEmpty")}
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            {trailers.length > 0 ? (
                <div className="space-y-3">
                    {trailers.map(item => (
                        <div key={item.id} className="space-y-2">
                            {item.title ? (
                                <p className="text-sm font-medium text-white/80">{item.title}</p>
                            ) : null}
                            <video
                                className="w-full rounded-lg"
                                src={item.videoUrl}
                                poster={item.coverUrl ? resolveImageUrl(item.coverUrl) : undefined}
                                controls
                            />
                            <div className="flex justify-between items-center">
                                {item.duration ? (
                                    <span className="text-xs text-white/50">{item.duration}s</span>
                                ) : (
                                    <span className="text-xs text-white/50">
                                        {t("workDetail.durationUnknown")}
                                    </span>
                                )}
                                {showMore ? null : (
                                    <span
                                        className="text-xs text-white/50 cursor-pointer"
                                        onClick={() => {
                                            setShowMore(true);
                                        }}
                                    >
                                        {t("workDetail.more")}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}
            {showMore && stills.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                    {stills.map(item => (
                        <img
                            key={item.id}
                            src={resolveImageUrl(item.imageUrl)}
                            alt=""
                            className="w-full rounded-lg object-cover"
                        />
                    ))}
                </div>
            ) : null}
        </section>
    );
}

type TabKey = "chapters" | "trailersStills";

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
    const { t } = useTranslation();
    const [active, setActive] = useState(0);
    const workInfo = getWorkTypeByValue(work_type);
    if (!workInfo) return null;
    const isShowChapter = workInfo.isShowChapter;
    const isShowTrailersStills = workInfo.isShowTrailersStills;

    const tabKeys = [
        isShowChapter ? ("chapters" as TabKey) : null,
        isShowTrailersStills ? ("trailersStills" as TabKey) : null,
    ].filter((k): k is TabKey => k != null);

    const labelList = tabKeys.map(key =>
        t(`workDetail.${key}`, {
            defaultValue: key === "chapters" ? "Chapters" : "Trailers & Stills",
        }),
    );

    return (
        <section id="work-detail-content">
            <Tab labels={labelList} activeIndex={active} onClick={index => setActive(index)} />
            {tabKeys[active] === "chapters" && (
                <Chapters
                    workId={workId}
                    work_total_chapter={work_total_chapter}
                    unlocked_chapter_count={unlocked_chapter_count}
                    work_type={work_type}
                />
            )}
            {tabKeys[active] === "trailersStills" && <TrailersAndStills workId={workId} />}
        </section>
    );
}
