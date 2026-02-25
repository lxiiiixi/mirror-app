import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { images } from "@mirror/assets";
import { formatAmount, formatDate, formatEnt, formatShortAddress } from "@mirror/utils";
import { artsApiClient } from "../../api/artsClient";
import { useAuth } from "../../hooks/useAuth";
import { useAlertStore } from "../../store/useAlertStore";

type RewardsState = {
    total_base_mining_reward: number;
    total_invite_reward: number;
    total_level_bonus_reward: number;
    total_total_reward: number;
};

type InviteRecord = {
    invite_id?: number;
    invited_uid?: string | number;
    reward?: string | number;
    create_time?: string;
    level?: number;
    address?: string;
    total_amount?: string | number;
    time?: string;
    sub_invites?: InviteRecord[];
};

/** 邀请列表内地址展示：前3位 + *** + 后4位 */
const formatAddress = (address?: string | number) => formatShortAddress(address, 3, 4, "***");

const INVITE_LEVEL_IMAGES = [
    images.mining.inviteLevel1,
    images.mining.inviteLevel2,
    images.mining.inviteLevel3,
    images.mining.inviteLevel4,
    images.mining.inviteLevel5,
] as const;

/** 根据层级 (1–5) 取对应等级图标，超出范围取首尾 */
function getInviteLevelImage(level: number): string {
    const index = Math.min(4, Math.max(0, level - 1));
    return INVITE_LEVEL_IMAGES[index];
}

const InviteTreeItem = ({ item, depth = 0 }: { item: InviteRecord; depth?: number }) => {
    const [open, setOpen] = useState(false);
    const hasChildren = Array.isArray(item.sub_invites) && item.sub_invites.length > 0;
    const level = item.level ?? depth + 1;
    const address = item.address ?? item.invited_uid ?? "";
    const reward = item.total_amount ?? item.reward ?? 0;
    const time = item.time ?? item.create_time ?? "";

    // 根级根据是否有子节点选箭头；后续子 item 统一用下箭头
    const arrowIcon =
        depth > 0
            ? images.mining.inviteArrowUp
            : hasChildren
              ? images.mining.inviteArrowUp
              : images.mining.inviteArrowDown;

    return (
        <>
            <div className="rounded-[10px] border border-white/30  p-3 transparent-linear-bg">
                <div
                    className="flex w-full cursor-pointer items-center justify-between gap-3 border-none bg-transparent p-0 text-left text-inherit"
                    onClick={() => hasChildren && setOpen(prev => !prev)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                        if (hasChildren && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            setOpen(prev => !prev);
                        }
                    }}
                >
                    <div className="flex min-w-0 flex-1 gap-2">
                        <img className="h-6 w-6 shrink-0" src={arrowIcon} alt="" />
                        <div className="flex min-w-0 flex-col gap-0.5">
                            <div className="flex items-center">
                                <img
                                    className="h-5 w-5 shrink-0 object-contain"
                                    src={getInviteLevelImage(level)}
                                    alt={`VIP${level}`}
                                />
                            </div>
                            <div className="flex min-w-0 items-center gap-1.5">
                                <img
                                    className="h-3.5 w-3.5 shrink-0"
                                    src={images.network.sol}
                                    alt="SOL"
                                />
                                <div className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] text-white/90">
                                    {formatAddress(address)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="shrink-0 text-right">
                        <div className="text-[14px] font-bold">+ {formatAmount(reward)} U</div>
                        <div className="text-[11px] text-white/55">{formatDate(time)}</div>
                    </div>
                </div>
                {open && hasChildren ? (
                    <div className="mt-2 flex flex-col gap-2 pt-2 pl-4">
                        {item.sub_invites?.map((child, index) => (
                            <InviteTreeItem
                                key={`${item.invite_id ?? "child"}-${index}`}
                                item={child}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                ) : null}
            </div>
        </>
    );
};

export function VipNode() {
    const { t } = useTranslation();
    const { isLoggedIn } = useAuth();
    const showAlert = useAlertStore(state => state.show);

    const [inviteNum, setInviteNum] = useState({
        direct_invites: "0/0",
        indirect_invites: "0/0",
    });
    const [inviteList, setInviteList] = useState<InviteRecord[]>([]);
    const [rewards, setRewards] = useState<RewardsState>({
        total_base_mining_reward: 0,
        total_invite_reward: 0,
        total_level_bonus_reward: 0,
        total_total_reward: 0,
    });

    const fetchData = useCallback(async () => {
        if (!isLoggedIn) {
            setInviteList([]);
            return;
        }

        try {
            const [levelResponse, inviteResponse, rewardsResponse] = await Promise.all([
                artsApiClient.user.getLevelProgress(),
                artsApiClient.node.getInviteRecords(),
                artsApiClient.node.mining.getRewards(),
            ]);

            const levelData = levelResponse.data;
            setInviteNum({
                direct_invites: String(levelData?.direct_invites ?? "0/0"),
                indirect_invites: String(levelData?.indirect_invites ?? "0/0"),
            });

            const inviteData = inviteResponse.data;
            const rawList = inviteData.level_list;
            setInviteList(rawList);

            const rewardData = rewardsResponse.data;
            const rewardsInfo = rewardData?.rewards_info ?? rewardData ?? {};
            const totalData = rewardsInfo?.total_cycle_rewards ?? {};
            setRewards({
                total_base_mining_reward: formatEnt(totalData?.base_mining_reward),
                total_invite_reward: formatEnt(totalData?.invite_reward),
                total_level_bonus_reward: formatEnt(totalData?.level_bonus_reward),
                total_total_reward: formatEnt(totalData?.total_reward),
            });
        } catch (error) {
            console.error("[VipNode] load data failed", error);
            showAlert({ message: t("assets.loadFailed"), variant: "error" });
        }
    }, [isLoggedIn, showAlert, t]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    const hasInvites = useMemo(() => inviteList.length > 0, [inviteList.length]);

    return (
        <div className="flex flex-col gap-5 text-white">
            <h3 className="text-[18px] font-bold text-center">
                {t("totalRevenue.entTotalRevenue")}
                <span className=""> {rewards.total_total_reward} ENT </span>
            </h3>
            <div className="rounded-[14px] border border-white/30 p-[18px] transparent-linear-bg">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <div className="text-[14px] font-bold">
                            {rewards.total_base_mining_reward} ENT
                        </div>
                        <div className="text-[12px] text-white/60">
                            {t("totalRevenue.dailyRevenue")}
                        </div>
                    </div>
                    <div>
                        <div className="text-[14px] font-bold">
                            {rewards.total_level_bonus_reward} ENT
                        </div>
                        <div className="text-[12px] text-white/60">
                            {t("totalRevenue.teamRevenue")}
                        </div>
                    </div>
                    <div>
                        <div className="text-[14px] font-bold">{0} ENT</div>
                        <div className="text-[12px] text-white/60">
                            {t("totalRevenue.destructionRevenue")}
                        </div>
                    </div>
                    <div>
                        <div className="text-[14px] font-bold">
                            {rewards.total_invite_reward} ENT
                        </div>
                        <div className="text-[12px] text-white/60">
                            {t("totalRevenue.directSalesRevenue")}
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-center">
                    <img
                        className="w-[20px] h-[20px] inline-block -mt-1"
                        src={images.mining.invite}
                        alt=""
                    />
                    <span className="ml-2 text-[18px] font-bold">{t("miningInvites.invites")}</span>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[14px] text-white/60">
                            {t("miningInvites.level1")}
                        </span>
                        <span className="text-[14px] text-white">{inviteNum.direct_invites}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[14px] text-white/60">
                            {t("miningInvites.level2")}
                        </span>
                        <span className="text-[14px] text-white">{inviteNum.indirect_invites}</span>
                    </div>
                </div>
            </div>
            <div>
                {hasInvites ? (
                    <div className="flex flex-col gap-3">
                        {inviteList.map((item, index) => (
                            <InviteTreeItem
                                key={`${item.invite_id ?? "invite"}-${index}`}
                                item={item}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-[12px] text-white/60">{t("ticket.empty")}</div>
                )}
            </div>
        </div>
    );
}
