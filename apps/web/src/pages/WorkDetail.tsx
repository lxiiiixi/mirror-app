import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { images } from "@mirror/assets";
import { artsApiClient } from "../api/artsClient";
import { Spinner } from "../ui";
import { MediaItem, parseMediaType, resolveImageUrl } from "@mirror/utils";
import {
    CheckInModal,
    Directory,
    ProductCover,
    WorkDetailAirdrop,
    WorkDetailContent,
    WorkDetailHero,
    WorkDetailLayout,
    WorkDetailProductionTeam,
} from "../components/WorkDetail";
import { WorkDetailResponseData } from "@mirror/api";
import { useAuth } from "../hooks/useAuth";

export default function WorkDetail() {
    const { t, i18n } = useTranslation();
    const { token } = useAuth();
    const [searchParams] = useSearchParams();
    const workId = Number(searchParams.get("id") ?? "");
    const queryType = Number(searchParams.get("type") ?? "");
    const languageKey = i18n.resolvedLanguage ?? i18n.language ?? "en";

    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [data, setData] = useState<WorkDetailResponseData | null>(null);
    const [chapterContent, setChapterContent] = useState<string | string[] | null>("");
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [chapterLoading, setChapterLoading] = useState(false);
    const dataRef = useRef<WorkDetailResponseData | null>(null);

    const [showCheckInModal, setShowCheckInModal] = useState(false);

    useEffect(() => {
        document.body.classList.add("work-detail-page");
        return () => {
            document.body.classList.remove("work-detail-page");
        };
    }, []);

    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    const handleRefreshAfterCheckIn = useCallback(() => {
        if (!workId || Number.isNaN(workId)) return;
        artsApiClient.work
            .detail({ work_id: workId })
            .then(response => {
                setData(response.data);
                setStatus("success");
            })
            .catch(() => {
                setStatus("error");
            });
    }, [workId]);

    useEffect(() => {
        if (!workId || Number.isNaN(workId)) {
            setData(null);
            setStatus("error");
            return;
        }

        const hadData = Boolean(dataRef.current);
        let isMounted = true;
        if (!hadData) {
            setStatus("loading");
        }

        artsApiClient.work
            .detail({ work_id: workId })
            .then(response => {
                if (!isMounted) return;
                setData(response.data);
                setStatus("success");
            })
            .catch(() => {
                if (!isMounted) return;
                if (!hadData) {
                    setStatus("error");
                }
            });

        return () => {
            isMounted = false;
        };
    }, [languageKey, workId]);

    const lastTokenRef = useRef<string | null>(null);
    useEffect(() => {
        if (!workId || Number.isNaN(workId)) return;
        const currentToken = token ?? null;
        const prevToken = lastTokenRef.current;
        lastTokenRef.current = currentToken;
        if (!prevToken && currentToken) {
            let isMounted = true;
            artsApiClient.work
                .detail({ work_id: workId })
                .then(response => {
                    if (!isMounted) return;
                    setData(response.data);
                    setStatus("success");
                })
                .catch(() => {
                    if (!isMounted) return;
                });
            return () => {
                isMounted = false;
            };
        }
    }, [token, workId]);

    if (status === "loading") {
        return (
            <WorkDetailLayout workId={workId}>
                <div className="flex justify-center py-20">
                    <Spinner size="large" />
                </div>
            </WorkDetailLayout>
        );
    }

    if (status === "error") {
        return (
            <WorkDetailLayout workId={workId}>
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
        <WorkDetailLayout workId={workId}>
            {/* 头部大图 + 圆形头像 + 标题 */}
            <div className="relative z-10">
                <WorkDetailHero
                    workId={workId}
                    workData={data}
                    onCheckInSuccess={handleRefreshAfterCheckIn}
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
