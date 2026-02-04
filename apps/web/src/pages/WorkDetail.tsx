import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { images } from "@mirror/assets";
import { artsApiClient } from "../api/artsClient";
import { Spinner } from "../ui";
import { MediaItem, parseMediaType, resolveImageUrl } from "@mirror/utils";
import {
    CheckInModal,
    Directory,
    ExternalLink,
    ProductCover,
    WorkDetailAirdrop,
    WorkDetailContent,
    WorkDetailHero,
    WorkDetailLayout,
    WorkDetailProductionTeam,
} from "../components/WorkDetail";
import { WorkDetailResponseData } from "@mirror/api";

export default function WorkDetail() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const workId = Number(searchParams.get("id") ?? "");
    const queryType = Number(searchParams.get("type") ?? "");

    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [data, setData] = useState<WorkDetailResponseData | null>(null);
    const [chapterContent, setChapterContent] = useState<string | string[] | null>("");
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [chapterLoading, setChapterLoading] = useState(false);
    const [externalLinks, setExternalLinks] = useState<
        Array<{ link_id: number; link_url: string; link_type: string }>
    >([]);

    const [showCheckInModal, setShowCheckInModal] = useState(false);

    useEffect(() => {
        document.body.classList.add("work-detail-page");
        return () => {
            document.body.classList.remove("work-detail-page");
        };
    }, []);

    useEffect(() => {
        if (!workId || Number.isNaN(workId)) {
            setData(null);
            setStatus("error");
            return;
        }

        let isMounted = true;
        setStatus("loading");
        artsApiClient.work
            .detail({ work_id: workId })
            .then(response => {
                if (!isMounted) return;
                setData(response.data);
                setStatus("success");
            })
            .catch(() => {
                if (!isMounted) return;
                setStatus("error");
            });

        return () => {
            isMounted = false;
        };
    }, [workId]);

    useEffect(() => {
        if (!workId || Number.isNaN(workId)) return;
        artsApiClient.work
            .getExternalLinks({ work_id: workId })
            .then(response => {
                setExternalLinks(response.data?.links ?? []);
            })
            .catch(() => {
                setExternalLinks([]);
            });
    }, [workId]);

    const resolvedType = Number(data?.work_type ?? queryType ?? 0);
    const isMediaWork = useMemo(() => [1, 2, 5, 6, 7, 8, 9].includes(resolvedType), [resolvedType]);

    const pageTitle = data?.work_name ?? "";

    if (status === "loading") {
        return (
            <WorkDetailLayout pageTitle={pageTitle}>
                <div className="flex justify-center py-20">
                    <Spinner size="large" />
                </div>
            </WorkDetailLayout>
        );
    }

    if (status === "error") {
        return (
            <WorkDetailLayout pageTitle={t("ticket.empty", { defaultValue: "Detail" })}>
                <div className="px-4 py-20 text-center text-[20px] text-[#c0c1c7]">
                    {t("ticket.empty")}
                </div>
            </WorkDetailLayout>
        );
    }

    if (status !== "success" || !data) {
        return null;
    }

    return (
        <WorkDetailLayout pageTitle={pageTitle}>
            {/* 头部大图 + 圆形头像 + 标题 */}
            <div className="relative z-10">
                <WorkDetailHero
                    workId={workId}
                    workData={data}
                    // coverUrl={data.work_cover_url}
                    // avatarUrl={data.token_cover_url ?? data.work_cover_url}
                    // title={`${data.token_name}s`}
                    // showTokenBorder={Boolean(data.show_token_border)}
                    // signedIn={data.signed_in === true}
                />
            </div>
            {/* 空投/推广区块（有数据或占位展示） */}
            <div className="relative z-20 -mt-6">
                <WorkDetailAirdrop workId={workId} workData={data} />
            </div>
            <div className="p-6 space-y-6">
                {/* 作品信息卡片：封面 + 标题/作者/简介 */}
                <ProductCover
                    coverUrl={data.work_cover_url}
                    title={data.work_name}
                    author={data.work_creator_name}
                    description={data.work_description}
                />

                <ExternalLink links={externalLinks} />

                {/* 制作团队 */}
                {data.creative_team_members && data.creative_team_members.length > 0 && (
                    <WorkDetailProductionTeam members={data.creative_team_members} />
                )}

                {/* 章节内容 / 媒体 */}
                <WorkDetailContent
                    workId={workId}
                    work_type={data.work_type}
                    work_total_chapter={data.work_total_chapter}
                    unlocked_chapter_count={data.unlocked_chapter_count}
                />
            </div>

            <CheckInModal open={showCheckInModal} onClose={() => setShowCheckInModal(false)} />
        </WorkDetailLayout>
    );
}
