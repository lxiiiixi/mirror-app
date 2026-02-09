import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { images } from "@mirror/assets";
import { artsApiClient } from "../api/artsClient";
import { Spinner } from "../ui";
import {
    getInviteLink,
    MediaItem,
    parseMediaType,
    resolveImageUrl,
    resolveLocalizedText,
} from "@mirror/utils";
import {
    Directory,
    ProductCover,
    WorkDetailAirdrop,
    WorkDetailContent,
    WorkDetailHero,
    WorkDetailLayout,
    WorkDetailProductionTeam,
} from "../components/WorkDetail";
import {
    getAvailableContentLanguages,
    i18nLanguageToSelectValue,
    languageSelectValueToI18n,
} from "../components/WorkDetail/languageSelectUtils";
import { CheckInModal } from "../components/Modals";
import { WorkDetailResponseData } from "@mirror/api";
import { useAuth } from "../hooks/useAuth";
import { useAlertStore } from "../store/useAlertStore";
import { getWorkTypeByValue } from "../utils/work";

export default function WorkDetail() {
    const { t, i18n } = useTranslation();
    const { token } = useAuth();
    const [searchParams] = useSearchParams();
    const workId = Number(searchParams.get("id") ?? "");
    const queryType = Number(searchParams.get("type") ?? "");
    const languageKey = i18n.resolvedLanguage ?? i18n.language ?? "en";
    /** 作品内容展示语言（仅影响封面/标题/作者/简介），默认与当前全局语言一致，切换不修改全局 i18n */
    const [contentLang, setContentLang] = useState(() =>
        i18nLanguageToSelectValue(i18n.resolvedLanguage ?? i18n.language ?? "zh-CN"),
    );

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

    useEffect(() => {
        if (!data) return;
        const available = getAvailableContentLanguages(data);
        if (available.length > 0 && !available.includes(contentLang)) {
            setContentLang(available[0]);
        }
        // 仅在校正「数据加载后当前选中不在可用列表」时更新，不把 contentLang 列入 deps 避免切换语言时被重置
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const handleRefreshAfterCheckIn = useCallback(() => {
        if (!workId || Number.isNaN(workId)) return Promise.resolve();
        return artsApiClient.work
            .detail({ work_id: workId })
            .then(response => {
                setData(response.data);
                setStatus("success");
            })
            .catch(() => {
                setStatus("error");
            });
    }, [workId]);

    const showAlert = useAlertStore(s => s.show);

    const handleGoInvite = useCallback(() => {
        if (!data) return;
        if (!data.signed_in) return;
        // const link = data.my_invite_url;
        const link = getInviteLink(workId, data.my_invite_code);
        if (!link) return;
        navigator.clipboard
            .writeText(link)
            .then(() => {
                showAlert({
                    message: t("works.invitedListDialog.remindCopySuccess", {
                        defaultValue: "Copy the invitation link and invite your friends",
                    }),
                    variant: "success",
                });
            })
            .catch(() => {
                showAlert({
                    message: t("works.invitedListDialog.remindCopyFailed", {
                        defaultValue: "Copy failed. Please try again",
                    }),
                    variant: "error",
                });
            });
    }, [data, showAlert, t, workId]);

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
                    onCheckInSuccess={() => {
                        handleRefreshAfterCheckIn().finally(() => {
                            setShowCheckInModal(true);
                        });
                    }}
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
                    coverUrl={resolveImageUrl(
                        resolveLocalizedText(
                            data.work_cover_url,
                            languageSelectValueToI18n(contentLang),
                        ),
                    )}
                    title={resolveLocalizedText(
                        data.work_name,
                        languageSelectValueToI18n(contentLang),
                    )}
                    author={resolveLocalizedText(
                        data.work_creator_name,
                        languageSelectValueToI18n(contentLang),
                    )}
                    description={resolveLocalizedText(
                        data.work_description,
                        languageSelectValueToI18n(contentLang),
                    )}
                    contentLang={contentLang}
                    onContentLangChange={setContentLang}
                    availableLanguages={getAvailableContentLanguages(data)}
                    showPlayButton={
                        getWorkTypeByValue(data.work_type)?.isShowTrailersStills ?? false
                    }
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

            <CheckInModal
                open={showCheckInModal}
                onClose={() => setShowCheckInModal(false)}
                tokenName={data.token_name}
                hasTeam={data.signed_in === true ? data.has_team : false}
                teamProgress={data.signed_in === true ? data.team_sign_in_progress : undefined}
                inviteCount={data.signed_in === true ? data.my_invite_count : 0}
                canShowTeamBtn={data.signed_in === true ? data.can_show_team_btn : true}
                onTeamUp={handleGoInvite}
                onInvite={handleGoInvite}
            />
        </WorkDetailLayout>
    );
}
