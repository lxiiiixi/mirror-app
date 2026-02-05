import { useCallback, useEffect, useRef, useState } from "react";
import { images } from "@mirror/assets";
import { useNavigate } from "react-router-dom";
import { TokenAvatar } from "../Common/TokenAvatar";
import { resolveImageUrl, shareToX } from "@mirror/utils";
import { useTranslation } from "react-i18next";
import { Button } from "../../ui";
import { artsApiClient } from "../../api/artsClient";
import { useAuth } from "../../hooks/useAuth";
import { InvitationListModal } from "./Modals";
import { useLoginModalStore } from "../../store/useLoginModalStore";
import { Check } from "lucide-react";
import { WorkDetailResponseData, WorkExternalLinkItem } from "@mirror/api";
import { ExternalLink } from "./ExternalLink";

export function WorkDetailLayout({
    children,
    workId,
}: {
    children: React.ReactNode;
    workId: number;
}) {
    return (
        <div className="min-h-screen bg-[#030620] text-white w-dvw">
            <WorkDetailHeader workId={workId} />
            {children}
        </div>
    );
}

/** 页面顶部导航：返回 + 标题 */
export function WorkDetailHeader({ workId }: { workId: number }) {
    const navigate = useNavigate();
    const [externalLinks, setExternalLinks] = useState<Array<WorkExternalLinkItem>>([]);

    useEffect(() => {
        if (!workId || Number.isNaN(workId)) return;
        let isActive = true;
        artsApiClient.work
            .getExternalLinks({ work_id: workId })
            .then(response => {
                if (!isActive) return;
                setExternalLinks(response.data?.links ?? []);
                console.log(response.data);
            })
            .catch(() => {
                if (!isActive) return;
                setExternalLinks([]);
            });
        return () => {
            isActive = false;
        };
    }, [workId]);

    return (
        <header className="absolute top-0 left-0 right-0 z-20 flex h-[50px] items-center justify-between px-[20px]">
            <button type="button" className={`w-[18px]`} onClick={() => navigate(-1)}>
                <img
                    src={images.works.backBtn}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-contain"
                />
            </button>
            <div className="">
                <ExternalLink
                    links={externalLinks.map(item => ({
                        link_id: item.id,
                        link_url: item.link_url,
                        link_type: String(item.link_type),
                    }))}
                />
            </div>
        </header>
    );
}

/* 签到按钮 */
export function WorkDetailCheckInButton({
    onClick,
    text,
    disabled = false,
    checked = false,
}: {
    onClick: () => void;
    text: string;
    disabled?: boolean;
    checked?: boolean;
}) {
    const backgroundStyle = checked ? "linear-gradient(90deg, #0cb8bc, #2f54ba)" : undefined;
    return (
        <div className="flex justify-center">
            <button
                type="button"
                className={`rounded-full px-4 py-1.5 text-[16px] font-semibold text-white ${
                    checked ? "" : "bg-linear-to-r from-[#f063cd] to-[#424afb]"
                } ${disabled ? "cursor-not-allowed" : ""}`}
                style={backgroundStyle ? { backgroundImage: backgroundStyle } : undefined}
                onClick={onClick}
                disabled={disabled}
            >
                {text}
            </button>
        </div>
    );
}

/** 头部大图 + 圆形头像 + 作品标题 */
export function WorkDetailHero({
    workId,
    workData,
    onCheckInSuccess,
}: {
    workId: number;
    workData: WorkDetailResponseData;
    /** 签到成功后调用，用于刷新作品详情（如 signed_in、积分等） */
    onCheckInSuccess?: () => void;
}) {
    const { t } = useTranslation();
    const { isLoggedIn } = useAuth();
    const openLoginModal = useLoginModalStore(state => state.openModal);
    const [isChecked, setIsChecked] = useState(Boolean(workData.signed_in));
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log(workData.signed_in);

    const handleCheckIn = useCallback(() => {
        if (isChecked || isSubmitting) return;
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }
        if (!workId || Number.isNaN(workId)) return;
        setIsSubmitting(true);
        artsApiClient.work
            .signIn({ work_id: workId })
            .then(() => {
                setIsChecked(true);
                onCheckInSuccess?.();
            })
            .catch(error => {
                console.error("[WorkDetailHero] signIn failed", error);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }, [isChecked, isSubmitting, isLoggedIn, openLoginModal, workId, onCheckInSuccess]);

    const checkInText = isChecked
        ? t("productShare.checked", { defaultValue: "Checked" })
        : t("workDetail.checkIn", { defaultValue: "Check in +5" });

    return (
        <section className="relative h-[310px] overflow-hidden">
            {workData.work_cover_url ? (
                <img
                    src={resolveImageUrl(workData.work_cover_url)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
            ) : (
                <div className="absolute inset-0 bg-[#030620]" />
            )}
            <div
                className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#030620]"
                style={{
                    backgroundImage: "linear-gradient(180deg, transparent 60%, #030620 100%)",
                }}
            />
            <div className="absolute top-0 left-0 right-0 flex flex-col items-center h-[80%] gap-3 mt-4">
                <div className="h-4" />
                <TokenAvatar
                    src={workData.token_cover_url ?? ""}
                    showTokenBorder={workData.show_token_border}
                    size={130}
                    imageSize={110}
                />
                <h2 className="text-2xl font-bold leading-none text-white text-center">
                    {/* 默认取作品英文名字前三个首字母，作品名字不足三个英文单词取最大，作品积分名字在作品代币名字后面加“s” */}
                    {workData.token_name + "s" || "—"}
                </h2>
                <WorkDetailCheckInButton
                    onClick={handleCheckIn}
                    text={checkInText}
                    disabled={isChecked || isSubmitting}
                    checked={isChecked}
                />
            </div>
        </section>
    );
}

/** 空投统计 + 邀请码/链接 + 操作按钮 */
export function WorkDetailAirdrop({
    workId,
    workData,
}: {
    workId: number;
    workData: WorkDetailResponseData;
}) {
    const { t, i18n } = useTranslation();
    const { isLoggedIn, token } = useAuth();
    const [inviteCode, setInviteCode] = useState("");
    const [inviteUrl, setInviteUrl] = useState("");
    const [showInvitationListModal, setShowInvitationListModal] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const copyTimerRef = useRef<number | null>(null);
    const openLoginModal = useLoginModalStore(state => state.openModal);
    const navigate = useNavigate();

    const [countdown, setCountdown] = useState("00:00:00");
    const [airdropInfo, setAirdropInfo] = useState<{
        total_amount: number;
        claimed_amount: number;
        available_amount: number;
    } | null>(null);

    useEffect(() => {
        setInviteCode("");
        setInviteUrl("");
    }, [workId]);

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                window.clearTimeout(copyTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!workId) return;
        if (Number.isNaN(workId)) return;
        if (!isLoggedIn) return;
        let isActive = true;
        artsApiClient.work
            .generateInviteCode({ work_id: workId })
            .then(response => {
                if (!isActive) return;
                const data = response.data;
                const nextCode = String(data?.invite_code ?? "");
                const nextUrl = String(data?.invite_url ?? "");
                if (nextCode) {
                    setInviteCode(nextCode);
                }
                if (nextUrl) {
                    setInviteUrl(nextUrl);
                }
            })
            .catch(error => {
                console.error("[WorkDetailAirdrop] generateInviteCode failed", error);
            });

        return () => {
            isActive = false;
        };
    }, [isLoggedIn, workId]);

    useEffect(() => {
        if (!workId || !isLoggedIn) {
            setAirdropInfo(null);
            return;
        }
        let isActive = true;
        artsApiClient.work
            .getAirdropInfo({ work_id: workId })
            .then(res => {
                if (!isActive) return;
                setAirdropInfo({
                    total_amount: res.data?.total_amount ?? 0,
                    claimed_amount: res.data?.claimed_amount ?? 0,
                    available_amount: res.data?.available_amount ?? 0,
                });
            })
            .catch(() => {
                if (!isActive) return;
                setAirdropInfo(null);
            });
        return () => {
            isActive = false;
        };
    }, [workId, isLoggedIn, token]);

    const copyLink = () => {
        const link = inviteUrl;
        if (!link) return;
        const language = i18n.resolvedLanguage ?? i18n.language ?? "en";
        const isZh = language.startsWith("zh");
        const isZhHant =
            isZh &&
            (language.includes("Hant") || language.includes("HK") || language.includes("TW"));
        const workLabel = isZh ? "作品" : "Work";
        const codeLabel = isZh ? (isZhHant ? "邀請碼" : "邀请码") : "Invite Code";
        const linkLabel = isZh ? (isZhHant ? "邀請連結" : "邀请链接") : "Invite Link";
        const nameSegment = workData.work_name
            ? isZh
                ? `《${workData.work_name}》`
                : `"${workData.work_name}" `
            : isZh
              ? `《${workLabel}》`
              : `${workLabel} `;
        const colon = isZh ? "：" : ": ";
        const text = `${nameSegment}${codeLabel}${colon}${inviteCode} ${linkLabel}${colon}${link}`;
        void navigator.clipboard.writeText(text);
        setIsCopied(true);
        if (copyTimerRef.current) {
            window.clearTimeout(copyTimerRef.current);
        }
        copyTimerRef.current = window.setTimeout(() => {
            setIsCopied(false);
        }, 3000);
    };

    const handleShareX = useCallback(() => {
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }
        const link = inviteUrl;
        if (!link) return;
        shareToX(link, workData.work_name);
    }, [inviteUrl, workData.work_name, isLoggedIn, openLoginModal]);

    const handleShowInvitationListModal = useCallback(() => {
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }
        setShowInvitationListModal(true);
    }, [isLoggedIn, openLoginModal]);

    const handleGoToPointsMall = useCallback(() => {
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }
        const query = workId ? `?work_id=${encodeURIComponent(String(workId))}` : "";
        navigate(`/points-redemption${query}`);
    }, [isLoggedIn, openLoginModal, navigate, workId]);

    const visits = workData.number_of_participants ?? 0;
    const totalAmount = airdropInfo?.total_amount ?? 0;
    const claimedAmount = airdropInfo?.claimed_amount ?? 0;
    const progressPercent =
        totalAmount > 0 ? Math.min(100, Math.round((claimedAmount / totalAmount) * 100)) : 0;
    const airdropAmountFormatted =
        totalAmount >= 1000 ? `${(totalAmount / 1000).toFixed(0)}k` : totalAmount.toLocaleString();

    useEffect(() => {
        const premiereTime = workData.premiere_time;
        if (!premiereTime || typeof premiereTime !== "string") {
            setCountdown("00:00:00");
            return;
        }
        const endTime = (() => {
            const trimmed = premiereTime.trim();
            const parts = trimmed.split(/[/-]/);
            if (parts.length >= 3) {
                const y = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10) - 1;
                const d = parseInt(parts[2], 10);
                if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
                    return new Date(y, m, d, 0, 0, 0, 0).getTime();
                }
            }
            const fallback = new Date(trimmed).getTime();
            return Number.isNaN(fallback) ? 0 : fallback;
        })();
        if (!endTime) {
            setCountdown("00:00:00");
            return;
        }
        const tick = () => {
            const now = Date.now();
            const remain = Math.max(0, Math.floor((endTime - now) / 1000));
            const h = Math.floor(remain / 3600);
            const m = Math.floor((remain % 3600) / 60);
            const s = remain % 60;
            setCountdown([h, m, s].map(v => String(v).padStart(2, "0")).join(":"));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [workData.premiere_time]);

    console.log("[WorkDetailAirdrop] countdown", countdown);

    return (
        <section className="px-6">
            {/* 倒计时 */}
            <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-1 rounded-[20px]">
                    {countdown.split(":").map((part, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-center text-[18px] font-bold text-white gap-1"
                        >
                            <div className="bg-linear-to-b from-[#060320] to-[#860d68] px-[16px] py-[8px] rounded-lg border border-[#E358FF]">
                                {part}{" "}
                            </div>
                            {i < 2 ? ":" : ""}
                        </div>
                    ))}
                </div>
            </div>

            <div className="my-4 space-y-1">
                <div className="flex flex-row items-center justify-between text-[14px] font-medium leading-tight text-white">
                    <span>
                        {t("workDetail.airdropAmount", { defaultValue: "Airdrop Amount" })}:{" "}
                        {airdropAmountFormatted}
                    </span>
                    <span>
                        {t("workDetail.visits", { defaultValue: "There have been" })}:{" "}
                        {visits.toLocaleString()}
                    </span>
                </div>
                <div className="relative h-5 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                        className="absolute inset-y-0 left-0 rounded-full border border-transparent"
                        style={{
                            width: `${progressPercent}%`,
                            background: "linear-gradient(90deg, #ec62ce 0%, #484bfa 100%)",
                        }}
                    />
                    <div className="relative flex h-full items-center justify-center">
                        <span className="text-[12px] font-normal text-white">
                            {t("workDetail.progress", { defaultValue: "Progress" })}:{" "}
                            {progressPercent}%
                        </span>
                    </div>
                </div>
            </div>

            {/* 邀请码 + 邀请链接 */}
            {isLoggedIn && (
                <div className="mb-6 rounded-lg bg-[#40063f] px-4 py-2 text-[14px] font-semibold text-white">
                    <div className="flex items-center gap-2">
                        <span className="">
                            {t("workDetail.invitationCode", { defaultValue: "Invitation Code" })}:{" "}
                            {inviteCode}
                        </span>
                        <span className="h-[34px] w-px bg-white" />
                        <span className="flex-1 truncate ">
                            {t("workDetail.invitationLink", { defaultValue: "Invitation Link" })}:{" "}
                            {inviteUrl}
                        </span>
                        <button
                            type="button"
                            className="flex w-4 shrink-0 items-center justify-center cursor-pointer"
                            onClick={copyLink}
                            aria-label={isCopied ? "Copied" : "Copy link"}
                        >
                            {isCopied ? (
                                <Check className="h-6 w-6 text-white" />
                            ) : (
                                <img src={images.icons.copyIcon} alt="" className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* 三个操作按钮 */}
            <div id="work_detail_airdrop_buttons" className="flex justify-between gap-2">
                <Button
                    variant="primary"
                    size="medium"
                    fullWidth
                    onClick={handleShareX}
                    className="text-[14px]! text-nowrap"
                >
                    {t("workDetail.shareOnX", { defaultValue: "Share on X" })}
                </Button>
                <Button
                    variant="primary"
                    size="medium"
                    fullWidth
                    onClick={handleShowInvitationListModal}
                    className="text-[14px]! text-nowrap"
                >
                    {workData.signed_in === true && workData.my_invite_count
                        ? workData.my_invite_count
                        : 0}{" "}
                    {t("workDetail.invited", { defaultValue: "Invited" })}
                </Button>
                <Button
                    size="medium"
                    fullWidth
                    onClick={handleGoToPointsMall}
                    className="text-[14px]! text-nowrap"
                >
                    {t("workDetail.pointsMall", { defaultValue: "Points Mall" })}
                </Button>
            </div>
            <InvitationListModal
                workId={workId}
                open={showInvitationListModal}
                onClose={() => setShowInvitationListModal(false)}
            />
        </section>
    );
}
