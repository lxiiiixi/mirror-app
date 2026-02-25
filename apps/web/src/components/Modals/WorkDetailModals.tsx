import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Modal } from "../../ui";
import { artsApiClient } from "../../api/artsClient";
import { type WorkFriendItem, type WorkTeamMemberItem } from "@mirror/api";
import { images } from "@mirror/assets";
import { useAlertStore } from "../../store/useAlertStore";
import { getInviteLink } from "@mirror/utils";

const getUserDisplayText = (item: WorkFriendItem) => {
    const email = item.email?.trim() ?? "";
    if (email) return email;
    const walletDisplay = item.wallet_display?.trim() ?? "";
    if (walletDisplay) return walletDisplay;
    return item.invite?.trim() ?? "";
};

const getTeamMemberDisplayText = (item: WorkTeamMemberItem) => {
    const email = item.email?.trim() ?? "";
    if (email) return email;
    const username = item.username?.trim() ?? "";
    if (username) return username;
    return item.wallet_display?.trim() ?? "";
};

const TeamMemberRow = ({
    item,
    handleRemind,
}: {
    item: WorkTeamMemberItem;
    handleRemind: () => void;
}) => {
    const { t } = useTranslation();
    const isDone = item.signed_in;

    return (
        <div className="grid grid-cols-3 items-center gap-2 py-1 text-[12px]">
            <span className="truncate text-left" title={item.email || item.wallet_display}>
                {getTeamMemberDisplayText(item)}
            </span>
            <span className="text-center">--</span>
            <span className="text-right text-[#37ffc6]">
                {isDone ? (
                    <span className="text-right text-[#37FFC6]">
                        {t("invitedListDialog.statusCompleted", { defaultValue: "Completed" })}
                    </span>
                ) : (
                    <button
                        type="button"
                        className="text-right text-[#37FFC6] cursor-pointer"
                        onClick={handleRemind}
                    >
                        {t("invitedListDialog.statusRemind", {
                            defaultValue: "Remind to Check-in",
                        })}
                    </button>
                )}
            </span>
        </div>
    );
};

/** 邀请列表弹窗：
 * - 组队区域：使用 work/detail 的 team_members
 * - 邀请列表区域：使用 work/friendsList
 */
export function InvitationListModal({
    open,
    onClose,
    workId,
    inviteCode,
    inviteUrl,
    hasTeam = false,
    teamMembers = [],
}: {
    open: boolean;
    onClose?: () => void;
    workId: number;
    inviteCode?: string;
    inviteUrl?: string;
    hasTeam?: boolean;
    teamMembers?: WorkTeamMemberItem[];
}) {
    const [list, setList] = useState<WorkFriendItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const { t } = useTranslation();
    const showAlert = useAlertStore(state => state.show);

    const fetchList = useCallback(() => {
        if (!workId || !open) return;
        setLoading(true);
        setError(false);
        artsApiClient.work
            .getFriendsList({ work_id: workId, page: 1, page_size: 50 })
            .then(res => {
                setList(res.data?.list ?? []);
            })
            .catch(() => {
                setError(true);
                setList([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [workId, open]);

    useEffect(() => {
        if (open && workId) fetchList();
    }, [open, workId, fetchList]);

    const effectiveTeamMembers = useMemo(
        () => (hasTeam ? teamMembers : []),
        [hasTeam, teamMembers],
    );

    const handleRemind = useCallback(() => {
        const link = inviteUrl || getInviteLink(workId, inviteCode ?? "");
        if (!link) return;
        navigator.clipboard
            .writeText(link)
            .then(() => {
                showAlert({
                    message: t("invitedListDialog.remindCopySuccess", {
                        defaultValue: "Check-in link copied",
                    }),
                    variant: "success",
                });
            })
            .catch(() => {
                showAlert({
                    message: t("invitedListDialog.remindCopyFailed", {
                        defaultValue: "Copy failed. Please try again.",
                    }),
                    variant: "error",
                });
            });
    }, [inviteCode, inviteUrl, showAlert, t, workId]);

    const title = t("works.invitedListDialog.title", { defaultValue: "Invitation List" });
    const userLabel = t("works.invitedListDialog.user", { defaultValue: "User" });
    const timeLabel = t("works.invitedListDialog.invitationTime", {
        defaultValue: "Invitation Time",
    });
    const checkInLabel = t("works.invitedListDialog.checkIn", { defaultValue: "Check-in" });
    const otherLabel = t("works.invitedListDialog.otherLabel", { defaultValue: "3-Person Team" });
    const loadingLabel = t("works.invitedListDialog.loading", { defaultValue: "Loading..." });
    const errorLabel = t("works.invitedListDialog.error", { defaultValue: "Failed to load list" });
    const emptyLabel = t("works.invitedListDialog.noData", { defaultValue: "No Team yet" });
    const statusCompletedLabel = t("works.invitedListDialog.statusCompleted", {
        defaultValue: "Completed",
    });
    const statusPendingLabel = t("works.invitedListDialog.statusPending", {
        defaultValue: "Pending",
    });
    const teamRewardLabel = t("works.invitedListDialog.teamReward", {
        defaultValue: "If all team members check in, each member gets 3 tokens",
    });

    return (
        <Modal
            open={open}
            onClose={onClose}
            closeOnBackdrop
            hideHeader
            borderVariant="gradient"
            panelClassName="min-w-[320px] max-w-[calc(100vw-32px)]"
            bodyClassName="p-0"
        >
            <h3 className="text-center text-[18px] font-bold mb-4">{title}</h3>
            <div className="">
                <div className="mb-2 grid grid-cols-3 items-center gap-2 text-[14px] font-medium text-white/90">
                    <span className="text-left">{userLabel}</span>
                    <span className="text-center text-nowrap">{timeLabel}</span>
                    <span className="text-right">{checkInLabel}</span>
                </div>

                {/* 组队区域：独立使用 work/detail 的 team_members */}
                <div className="rounded-lg bg-[#1b1d23] px-3 py-3">
                    <p className="mb-2 px-4 text-center text-[13px] font-medium">{otherLabel}</p>
                    {effectiveTeamMembers.length > 0 ? (
                        effectiveTeamMembers.map((item, index) => (
                            <TeamMemberRow
                                key={`team-${item.uid}-${item.wallet_display || item.email}-${index}`}
                                item={item}
                                handleRemind={handleRemind}
                            />
                        ))
                    ) : (
                        <p className="mt-2 px-4 text-center text-[12px] text-white/90">
                            {emptyLabel}
                        </p>
                    )}
                    {hasTeam && effectiveTeamMembers.length > 0 && (
                        <p className="mt-2 px-4 text-center text-[12px] text-white/90">
                            {teamRewardLabel}
                        </p>
                    )}
                </div>

                {/* 邀请列表区域：独立使用 work/friendsList */}
                <div className="mt-2">
                    {loading && (
                        <p className="py-6 text-center text-[13px] text-white/70">{loadingLabel}</p>
                    )}
                    {error && (
                        <p className="py-6 text-center text-[13px] text-red-400">{errorLabel}</p>
                    )}
                    {/* {!loading && !error && list.length === 0 && (
                        <p className="py-6 text-center text-[13px] text-white/70">{emptyLabel}</p>
                    )} */}
                    {!loading &&
                        !error &&
                        list.length > 0 &&
                        list.map((item, index) => (
                            <div
                                key={`all-${item.wallet_display}-${item.invitation_time}-${index}`}
                                className="grid grid-cols-3 items-center gap-2 py-1 text-[12px]"
                            >
                                <span
                                    className="truncate text-left"
                                    title={item.email || item.wallet_address || item.invite}
                                >
                                    {getUserDisplayText(item)}
                                </span>
                                <span className="text-center">{item.invitation_time}</span>
                                {/* <span className="text-right text-[#37FFC6]">
                                    {item.signed_in ? statusCompletedLabel : statusPendingLabel}
                                </span> */}
                            </div>
                        ))}
                </div>
            </div>
        </Modal>
    );
}

/** 按当前语言取签到成功标题图（en / zh-CN / zh-HK） */
function useCheckInSuccessHeadingSrc() {
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? "en";
    return useMemo(() => {
        if (lang === "zh-CN")
            return (
                <img
                    src={images.works.checkInSuccessHeadingZh}
                    alt=""
                    className="w-[50%] h-auto mx-auto"
                    aria-hidden
                />
            );
        if (lang === "zh-HK")
            return (
                <img
                    src={images.works.checkInSuccessHeadingHk}
                    alt=""
                    className="w-[50%] h-auto mx-auto"
                    aria-hidden
                />
            );
        return (
            <img
                src={images.works.checkInSuccessHeadingEn}
                alt=""
                className="w-[80%] h-auto mx-auto my-2 mb-6"
                aria-hidden
            />
        );
    }, [lang]);
}

const RowClass = "flex items-center justify-between text-[14px]";
/** 签到任务弹窗：成功图+多语言标题在 overlay 与 panel 之间，任务列表 + Got it；签到完成后由父组件打开 */
export function CheckInModal({
    open,
    onClose,
    tokenName = "LGN",
    hasTeam = false,
    teamProgress,
    inviteCount = 0,
    canShowTeamBtn = true,
    onTeamUp,
    onInvite,
}: {
    open: boolean;
    onClose?: () => void;
    tokenName?: string;
    hasTeam?: boolean;
    teamProgress?: string;
    inviteCount?: number;
    canShowTeamBtn?: boolean;
    onTeamUp?: () => void;
    onInvite?: () => void;
}) {
    const HeadingSrc = useCheckInSuccessHeadingSrc();
    const { t } = useTranslation();

    const parseTeamProgress = (value?: string) => {
        if (!value) return { done: 0, total: 3, remaining: 3 };
        const [doneRaw, totalRaw] = value.split("/");
        const done = Number.parseInt(doneRaw ?? "0", 10);
        const total = Number.parseInt(totalRaw ?? "3", 10) || 3;
        const remaining = Math.max(total - (Number.isNaN(done) ? 0 : done), 0);
        return { done: Number.isNaN(done) ? 0 : done, total, remaining };
    };

    const teamProgressInfo = useMemo(() => parseTeamProgress(teamProgress), [teamProgress]);
    const teamProgressLabel = useMemo(() => {
        if (teamProgressInfo.remaining <= 0) {
            return t("works.checkInModal.completed", { defaultValue: "Completed" });
        }
        return t("works.checkInModal.teamRemaining", {
            remaining: teamProgressInfo.remaining,
            total: teamProgressInfo.total,
            defaultValue: `${teamProgressInfo.remaining}/${teamProgressInfo.total} Remaining`,
        });
    }, [t, teamProgressInfo.remaining, teamProgressInfo.total]);

    const showTeamUp = !hasTeam && inviteCount < 3 && canShowTeamBtn;
    const teamUpLabel = t("works.checkInModal.goTeamUp", { defaultValue: "Go to Team Up" });
    const inviteLabel = t("works.checkInModal.goInvite", { defaultValue: "Go to Invite" });

    const handleTeamUp = () => {
        onTeamUp?.();
    };

    const handleInvite = () => {
        onInvite?.();
    };
    /* 跟 Modal 框内容本身对其，使 2/3 露出、1/3 被面板遮住 */
    const illustration = (
        <img
            src={images.works.checkInSuccess}
            className="w-full object-contain"
            // aria-hidden={false}
        />
    );

    return (
        <Modal
            open={open}
            onClose={onClose}
            closeOnBackdrop
            hideHeader
            borderVariant="gradient"
            panelClassName="min-w-[320px] max-w-[calc(100vw-32px)]"
            bodyClassName="px-4 py-4"
            illustration={illustration}
        >
            <div className="space-y-4">
                {HeadingSrc}
                <div className={RowClass}>
                    <span>
                        {t("works.checkInModal.dailyCheckIn", {
                            tokenName,
                            defaultValue: `Daily Check-in +5 ${tokenName}`,
                        })}
                    </span>
                    <span className="text-right">
                        {t("works.checkInModal.completed", { defaultValue: "Completed" })}
                    </span>
                </div>
                <div className={RowClass}>
                    <span>
                        {t("works.checkInModal.teamCheckIn", {
                            tokenName,
                            defaultValue: `3-Person Team Check-in +3 ${tokenName}`,
                        })}
                    </span>
                    {/* 如果当前用户还没有组队（也就是他的邀请人数少于3），就在右边显示“去组队”。如果用户组队了，则展示签到完成进度，也就是三个人中有几个人没完成。 */}
                    {showTeamUp ? (
                        <button
                            type="button"
                            onClick={handleTeamUp}
                            className="text-right text-[#d432f4] cursor-pointer"
                        >
                            {teamUpLabel}
                        </button>
                    ) : hasTeam ? (
                        <span className="text-right">{teamProgressLabel}</span>
                    ) : (
                        <span className="text-right text-white/70">
                            {t("works.checkInModal.notAvailable", { defaultValue: "—" })}
                        </span>
                    )}
                </div>
                <div className={RowClass}>
                    <span>
                        {t("works.checkInModal.inviteOne", {
                            tokenName,
                            defaultValue: `Invite One User +5 ${tokenName}`,
                        })}
                    </span>
                    <button
                        type="button"
                        onClick={handleInvite}
                        className="text-right text-[#d432f4] cursor-pointer"
                    >
                        {inviteLabel}
                    </button>
                </div>
                <div className="">
                    <Button
                        type="button"
                        className="w-full rounded-xl bg-[#eb1484] py-3 text-[15px] font-bold text-white cursor-pointer"
                        onClick={onClose}
                    >
                        {t("works.checkInModal.gotIt", { defaultValue: "Got it" })}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
