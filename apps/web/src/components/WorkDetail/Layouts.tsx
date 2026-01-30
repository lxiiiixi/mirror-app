import { images } from "@mirror/assets";
import { useNavigate } from "react-router-dom";
import { TokenAvatar } from "../Common/TokenAvatar";
import { resolveImageUrl } from "@mirror/utils";
import { useTranslation } from "react-i18next";
import { Button } from "../../ui";

export function WorkDetailLayout({
    children,
    pageTitle,
}: {
    children: React.ReactNode;
    pageTitle: string;
}) {
    return (
        <div className="min-h-screen bg-[#030620] text-white">
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
            <h1 className="flex-1 truncate text-center text-[18px] font-bold text-white">
                {title}
            </h1>
            <div className="h-[18px] w-[18px] shrink-0" aria-hidden />
        </header>
    );
}

/* 签到按钮 */
export function WorkDetailCheckInButton({ onClick, text }: { onClick: () => void; text: string }) {
    return (
        <div className="flex justify-center">
            <button
                type="button"
                className="rounded-full bg-linear-to-r from-[#f063cd] to-[#424afb] px-4 py-1.5 text-[16px] font-semibold text-white"
                onClick={onClick}
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
}: {
    coverUrl?: string;
    avatarUrl?: string;
    title?: string;
    showTokenBorder?: boolean;
}) {
    const { t } = useTranslation();
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
                <h2 className="text-2xl font-bold leading-none text-white">{title || "—"}</h2>
                <WorkDetailCheckInButton
                    onClick={() => {}}
                    text={t("workDetail.checkIn", { defaultValue: "Check in +5" })}
                />
            </div>
        </section>
    );
}

/** 空投统计 + 邀请码/链接 + 操作按钮 */
export function WorkDetailAirdrop({
    visits = 4561,
    progressPercent = 50,
    countdown = "71:56:51",
    airdropAmount = "1,324k",
    invitationCode = "00000N",
    invitationLink = "https://…",
    invitedCount = 0,
    onShareX,
    onPointsMall,
}: {
    visits?: number;
    progressPercent?: number;
    countdown?: string;
    airdropAmount?: string;
    invitationCode?: string;
    invitationLink?: string;
    invitedCount?: number;
    onShareX?: () => void;
    onPointsMall?: () => void;
}) {
    const { t } = useTranslation();
    const copyLink = () => {
        void navigator.clipboard.writeText(invitationLink);
    };

    // invite code 和 invite link 的显示内容通过接口 /work/generateInviteCode

    return (
        <section className="px-6 pb-6">
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
            <div className="mb-6 rounded-lg bg-[#40063f] px-4 py-2 text-[14px] font-semibold text-white">
                <div className="flex items-center gap-2">
                    <span className="">
                        {t("workDetail.invitationCode", { defaultValue: "Invitation Code" })}:{" "}
                        {invitationCode}
                    </span>
                    <span className="h-[34px] w-px bg-white" />
                    <span className="flex-1 truncate ">
                        {t("workDetail.invitationLink", { defaultValue: "Invitation Link" })}:{" "}
                        {invitationLink}
                    </span>
                    <button
                        type="button"
                        className="flex w-4 shrink-0 items-center justify-center"
                        onClick={copyLink}
                        aria-label="Copy link"
                    >
                        <img src={images.icons.copyIcon} alt="" className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* 三个操作按钮 */}
            <div className="flex justify-between gap-4">
                {/* <button
                    type="button"
                    className="flex-1 rounded-lg bg-[#eb1484] py-3 text-[22px] font-semibold text-white"
                    onClick={onShareX}
                >
                    {t("workDetail.shareOnX", { defaultValue: "Share on X" })}
                </button> */}
                <Button variant="primary" size="medium" fullWidth onClick={onShareX}>
                    {t("workDetail.shareOnX", { defaultValue: "Share on X" })}
                </Button>
                <Button variant="primary" size="medium" fullWidth onClick={onPointsMall}>
                    {invitedCount} {t("workDetail.invited", { defaultValue: "Invited" })}
                </Button>
                <Button size="medium" fullWidth onClick={onPointsMall}>
                    {t("workDetail.pointsMall", { defaultValue: "Points Mall" })}
                </Button>
            </div>
        </section>
    );
}
