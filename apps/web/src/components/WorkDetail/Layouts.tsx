import { useCallback, useEffect, useRef, useState } from "react";
import { images } from "@mirror/assets";
import { useNavigate } from "react-router-dom";
import { useSafeBack } from "../../hooks/useSafeBack";
import { TokenAvatar } from "../Common/TokenAvatar";
import {
    buildInviteShareText,
    getInviteLink,
    resolveImageUrl,
    resolveLocalizedText,
    shareToX,
} from "@mirror/utils";
import { useTranslation } from "react-i18next";
import { Button } from "../../ui";
import { artsApiClient } from "../../api/artsClient";
import { useAuth } from "../../hooks/useAuth";
import { InvitationListModal } from "../Modals";
import { useLoginModalStore } from "../../store/useLoginModalStore";
import { Check, Copy } from "lucide-react";
import { WorkDetailResponseData, WorkExternalLinkItem, isWorkDetailAfterSignIn } from "@mirror/api";
import { ExternalLink } from "./ExternalLink";
import { getWorkNameInitials } from "../../utils/work";

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
    const handleSafeBack = useSafeBack();
    const [externalLinks, setExternalLinks] = useState<Array<WorkExternalLinkItem>>([]);

    useEffect(() => {
        if (!workId || Number.isNaN(workId)) return;
        let isActive = true;
        artsApiClient.work
            .getExternalLinks({ work_id: workId })
            .then(response => {
                if (!isActive) return;
                setExternalLinks(response.data ?? []);
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
            <button type="button" className={`w-[18px]`} onClick={handleSafeBack}>
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
                } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
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
    const { t, i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? "en";
    const { isLoggedIn } = useAuth();
    const openLoginModal = useLoginModalStore(state => state.openModal);
    const [isChecked, setIsChecked] = useState(Boolean(workData.signed_in));
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsChecked(Boolean(workData.signed_in));
    }, [workData.signed_in]);

    const handleCheckIn = useCallback(() => {
        console.log("[WorkDetailHero] handleCheckIn", {
            workId,
            isChecked,
            isSubmitting,
            isLoggedIn,
        });
        if (isSubmitting) return;
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }

        // 如果已经签到了 => 展示签到成功弹窗
        if (isChecked) {
            console.log("[WorkDetailHero] handleCheckIn: show check in success modal");
            onCheckInSuccess?.();
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
            {resolveLocalizedText(workData.work_cover_url, lang) ? (
                <img
                    src={resolveImageUrl(resolveLocalizedText(workData.work_cover_url, lang))}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
            ) : (
                <div className="absolute inset-0 bg-[#030620]" />
            )}

            <div
                id="work_detail_hero_gradient"
                className="absolute left-0 right-0 top-0"
                style={{
                    bottom: -2,
                    backgroundImage:
                        "linear-gradient(0deg, #030620 10%, rgba(13, 25, 134, 0.1) 80%)",
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
                    {/* 这个地方对数据的展示是：
                    如果用户没登陆（接口不返回 signed_in/ever_signed_in），不显示任何数字，也不展示 0；
                    如果这个用户从来没有对这个作品签到过（ever_signed_in 为 false），不显示任何数字，也不展示 0；
                    如果这个用户已经对这个作品签到过（ever_signed_in 为 true），展示 token_balance 的值； */}
                    {/* 只要当前请求是登录态，就会有用户相关字段；是否展示数字只看 ever_signed_in */}
                    {isWorkDetailAfterSignIn(workData) && workData.ever_signed_in
                        ? `${workData.token_balance} `
                        : ""}
                    {getWorkNameInitials(resolveLocalizedText(workData.work_name, "en")) + "s" ||
                        "—"}
                </h2>
                <WorkDetailCheckInButton
                    onClick={handleCheckIn}
                    text={checkInText}
                    disabled={isSubmitting}
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
    const lang = i18n.resolvedLanguage ?? i18n.language ?? "en";
    const { isLoggedIn, token } = useAuth();
    const [inviteCode, setInviteCode] = useState("");
    const [inviteUrl, setInviteUrl] = useState("");
    const [showInvitationListModal, setShowInvitationListModal] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const copyTimerRef = useRef<number | null>(null);
    const openLoginModal = useLoginModalStore(state => state.openModal);
    const navigate = useNavigate();

    const [countdownParts, setCountdownParts] = useState(["00", "00", "00", "00"]);
    const [airdropStartText, setAirdropStartText] = useState("");
    const [showCountdown, setShowCountdown] = useState(false);
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
                console.log("[WorkDetailAirdrop] generateInviteCode", data);
                const nextCode = String(data?.invite_code ?? "");
                const nextUrl = getInviteLink(workId, nextCode);
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
        const text = buildInviteShareText({
            t,
            workName: resolveLocalizedText(workData.work_name, lang),
            inviteCode,
            inviteUrl,
        });
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
        const text = buildInviteShareText({
            t,
            workName: resolveLocalizedText(workData.work_name, lang),
            inviteCode,
            inviteUrl,
        });
        shareToX(text, resolveLocalizedText(workData.work_name, "en"), true);
        if (workId && !Number.isNaN(workId)) {
            void artsApiClient.work
                .share({ work_id: workId })
                .catch(error => console.error("[WorkDetailAirdrop] share failed", error));
        }
    }, [inviteUrl, workData.work_name, isLoggedIn, openLoginModal, workId, t, lang, inviteCode]);

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
        const startTime = workData.airdrop_start_time;
        if (!startTime || typeof startTime !== "string") {
            setShowCountdown(false);
            setCountdownParts(["00", "00", "00", "00"]);
            setAirdropStartText("");
            return;
        }
        const targetTime = Date.parse(startTime);
        if (Number.isNaN(targetTime)) {
            setShowCountdown(false);
            setCountdownParts(["00", "00", "00", "00"]);
            setAirdropStartText("");
            return;
        }
        if (targetTime <= Date.now()) {
            setShowCountdown(false);
            setCountdownParts(["00", "00", "00", "00"]);
            setAirdropStartText("");
            return;
        }

        setShowCountdown(true);
        const startDate = new Date(targetTime);
        const month = String(startDate.getMonth() + 1);
        const day = String(startDate.getDate());
        const hour = String(startDate.getHours()).padStart(2, "0");
        const minute = String(startDate.getMinutes()).padStart(2, "0");
        setAirdropStartText(
            t("workDetail.airdropStartsAt", {
                month,
                day,
                hour,
                minute,
            }),
        );

        const tick = () => {
            const now = Date.now();
            const remainSeconds = Math.max(0, Math.floor((targetTime - now) / 1000));
            if (remainSeconds <= 0) {
                setShowCountdown(false);
            }
            const days = Math.floor(remainSeconds / 86400);
            const hours = Math.floor((remainSeconds % 86400) / 3600);
            const minutes = Math.floor((remainSeconds % 3600) / 60);
            const seconds = remainSeconds % 60;
            setCountdownParts([days, hours, minutes, seconds].map(v => String(v).padStart(2, "0")));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [t, workData.airdrop_start_time]);

    console.log(
        "[WorkDetailAirdrop] countdown",
        workData.airdrop_start_time,
        countdownParts.join(":"),
    );

    return (
        <section className="px-6">
            {/* 倒计时：仅当 airdrop_start_time 存在且未结束时展示 */}
            {!showCountdown && (
                <>
                    <div className="flex items-center justify-center gap-2">
                        <div className="flex items-center gap-1 rounded-[20px]">
                            {countdownParts.map((part, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-center text-[18px] font-bold text-white gap-1"
                                >
                                    <div className="bg-linear-to-b from-[#060320] to-[#860d68] px-[16px] py-[8px] rounded-lg border border-[#E358FF]">
                                        {part}{" "}
                                    </div>
                                    {i < countdownParts.length - 1 ? ":" : ""}
                                </div>
                            ))}
                        </div>
                    </div>
                    {airdropStartText ? (
                        <div className="mt-2 text-center text-xs text-white/70">
                            {airdropStartText}
                        </div>
                    ) : null}
                </>
            )}

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

            {/* 邀请码 + 邀请链接：已登录显示内容，未登录显示提示 */}
            <div className="mb-6 rounded-lg bg-[#40063f] px-4 py-2 text-[14px] font-semibold text-white">
                {isLoggedIn ? (
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
                                <Copy className="h-6 w-6 text-(--color-primary)" />
                            )}
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={openLoginModal}
                        className="block w-full text-center cursor-pointer hover:opacity-90 transition-opacity"
                    >
                        {t("workDetail.loginToShowInviteLink", {
                            defaultValue: "Log in to view invitation link",
                        })}
                    </button>
                )}
            </div>

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
                inviteCode={inviteCode}
                sign_in_time={
                    workData.signed_in === true ? (workData.sign_in_time ?? undefined) : undefined
                }
                hasTeam={workData.signed_in === true ? workData.has_team : false}
            />
        </section>
    );
}
