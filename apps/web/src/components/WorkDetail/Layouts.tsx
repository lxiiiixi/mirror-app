import { useCallback, useEffect, useRef, useState } from "react";
import { images } from "@mirror/assets";
import { useNavigate } from "react-router-dom";
import { TokenAvatar } from "../Common/TokenAvatar";
import { resolveImageUrl } from "@mirror/utils";
import { useTranslation } from "react-i18next";
import { Button } from "../../ui";
import { artsApiClient } from "../../api/artsClient";
import { useAuth } from "../../hooks/useAuth";
import { InvitationListModal } from "./Modals";
import { useLoginModalStore } from "../../store/useLoginModalStore";
import { Check } from "lucide-react";

export function WorkDetailLayout({
    children,
    pageTitle,
}: {
    children: React.ReactNode;
    pageTitle: string;
}) {
    return (
        <div className="min-h-screen bg-[#030620] text-white w-dvw">
            <WorkDetailHeader title={pageTitle} />
            {children}
        </div>
    );
}

/** 页面顶部导航：返回 + 标题 */
export function WorkDetailHeader({ title }: { title: string }) {
    const navigate = useNavigate();

    return (
        <header className="relative z-10 flex h-[50px] items-center border-b border-white/10 bg-[#030620] px-[20px] shadow-[0_4px_26px_rgba(169,22,227,0.25)]">
            <button type="button" className={`w-[18px]`} onClick={() => navigate(-1)}>
                <img
                    src={images.works.backBtn}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-contain"
                />
            </button>
            <h1 className="flex-1 truncate text-center text-[18px] font-bold text-white px-4 mt-[2px]">
                {title}
            </h1>
            <div className="h-[18px] w-[18px] shrink-0" aria-hidden />
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
    coverUrl,
    avatarUrl,
    title,
    showTokenBorder = true,
    workId,
    signedIn = false,
}: {
    coverUrl?: string;
    avatarUrl?: string;
    title?: string;
    showTokenBorder?: boolean;
    workId?: number;
    signedIn?: boolean;
}) {
    const { t, i18n } = useTranslation();
    const { isLoggedIn } = useAuth();
    const openLoginModal = useLoginModalStore(state => state.openModal);
    const [isChecked, setIsChecked] = useState(Boolean(signedIn));
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsChecked(Boolean(signedIn));
    }, [signedIn]);

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
            })
            .catch(error => {
                console.error("[WorkDetailHero] signIn failed", error);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }, [isChecked, isSubmitting, isLoggedIn, openLoginModal, workId]);

    const checkInText = isChecked
        ? t("productShare.checked", { defaultValue: "Checked" })
        : t("workDetail.checkIn", { defaultValue: "Check in +5" });

    return (
        <section className="relative h-[276px] overflow-hidden">
            {coverUrl ? (
                <img
                    src={resolveImageUrl(coverUrl)}
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
                <TokenAvatar
                    src={avatarUrl ?? ""}
                    showTokenBorder={showTokenBorder}
                    size={130}
                    imageSize={110}
                />
                <h2 className="text-2xl font-bold leading-none text-white text-center">
                    {title || "—"}
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
    workName,
    visits = 4561,
    progressPercent = 50,
    countdown = "71:56:51",
    airdropAmount = "1,324k",
    invitedCount = 0,
}: {
    workId?: number;
    workName?: string;
    visits?: number;
    progressPercent?: number;
    countdown?: string;
    airdropAmount?: string;
    invitedCount?: number;
}) {
    const { t, i18n } = useTranslation();
    const { isLoggedIn } = useAuth();
    const [inviteCode, setInviteCode] = useState("");
    const [inviteUrl, setInviteUrl] = useState("");
    const [showInvitationListModal, setShowInvitationListModal] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const copyTimerRef = useRef<number | null>(null);
    const openLoginModal = useLoginModalStore(state => state.openModal);
    const navigate = useNavigate();

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

    console.log("[WorkDetailAirdrop] States", {
        workId,
        workName,
        inviteCode,
        inviteUrl,
        visits,
        progressPercent,
        countdown,
        airdropAmount,
        invitedCount,
        showInvitationListModal,
    });

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
        const nameSegment = workName
            ? isZh
                ? `《${workName}》`
                : `"${workName}" `
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
        const titleSegment = workName ? `《${workName}》 ` : "";
        const text = `Exciting news! Enjoy ${titleSegment}Airdrop by Daily Check event and Share Invite Links. ${link}`;
        const shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
        window.open(shareUrl, "_blank");
    }, [inviteUrl, workName, isLoggedIn, openLoginModal]);

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
        navigate("/points-redemption");
    }, [isLoggedIn, openLoginModal, navigate]);

    return (
        <section>
            <div className="mb-5 flex justify-between items-center gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[18px] font-semibold text-white">
                        {t("workDetail.visits", { defaultValue: "There have been" })}:{" "}
                        {visits.toLocaleString()}
                    </p>
                    <p className="text-[18px] font-semibold text-white">
                        {t("workDetail.progress", { defaultValue: "Progress" })}: {progressPercent}%
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-[20px]">
                        {countdown.split(":").map((part, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-center text-[18px] font-bold text-white gap-1"
                            >
                                <div className="bg-linear-to-b from-[#060320] to-[#860d68] px-[8px] py-[10px] rounded-lg border border-[#E358FF]">
                                    {part}{" "}
                                </div>
                                {i < 2 ? ":" : ""}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 空投说明文案 */}
            <div className="mb-4 flex flex-col items-center gap-1 text-center text-[14px] text-[#c0c1c7]">
                <p className=" ">
                    {visits.toLocaleString()}{" "}
                    {t("workDetail.visitsLabel", { defaultValue: "visits" })}{" "}
                    {t("workDetail.airdropProgress", { defaultValue: "Airdrop Progress" })}:{" "}
                    {progressPercent}% (Note: Countdown ratio)
                </p>
                <p>
                    {t("workDetail.airdropAmount", { defaultValue: "Airdrop Amount" })}:{" "}
                    {airdropAmount}{" "}
                    {t("workDetail.airdropCountdown", { defaultValue: "Airdrop Countdown" })}:{" "}
                    {countdown}
                </p>
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
            <div className="flex justify-between gap-4">
                <Button variant="primary" size="medium" fullWidth onClick={handleShareX}>
                    {t("workDetail.shareOnX", { defaultValue: "Share on X" })}
                </Button>
                <Button
                    variant="primary"
                    size="medium"
                    fullWidth
                    onClick={handleShowInvitationListModal}
                >
                    {invitedCount} {t("workDetail.invited", { defaultValue: "Invited" })}
                </Button>
                <Button size="medium" fullWidth onClick={handleGoToPointsMall}>
                    {t("workDetail.pointsMall", { defaultValue: "Points Mall" })}
                </Button>
            </div>
            <InvitationListModal
                open={showInvitationListModal}
                onClose={() => setShowInvitationListModal(false)}
            />
        </section>
    );
}
