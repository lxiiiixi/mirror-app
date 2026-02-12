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

const InviteTreeItem = ({ item, depth = 0 }: { item: InviteRecord; depth?: number }) => {
    const [open, setOpen] = useState(false);
    const hasChildren = Array.isArray(item.sub_invites) && item.sub_invites.length > 0;
    const level = item.level ?? depth + 1;
    const address = item.address ?? item.invited_uid ?? "";
    const reward = item.total_amount ?? item.reward ?? 0;
    const time = item.time ?? item.create_time ?? "";

    return (
        <>
            <div className="invite-item">
                <div className="invite-row" onClick={() => hasChildren && setOpen(prev => !prev)}>
                    <div className="left">
                        {hasChildren ? (
                            <img
                                className="arrow"
                                src={
                                    open
                                        ? images.mining.inviteArrowDown
                                        : images.mining.inviteArrowRight
                                }
                                alt=""
                            />
                        ) : (
                            <span className="arrow placeholder" />
                        )}
                        <div className="info">
                            <div className="info-row1">
                                <div className="avatar text-[11px]">VIP{level}</div>
                            </div>
                            <div className="info-row2">
                                <img className="wallet-icon" src={images.network.sol} alt="SOL" />
                                <div className="address text-[12px]">{formatAddress(address)}</div>
                            </div>
                        </div>
                    </div>
                    <div className="right">
                        <div className="amount text-[12px]">+ {formatAmount(reward)} U</div>
                        <div className="time text-[11px]">{formatDate(time)}</div>
                    </div>
                </div>
                {open && hasChildren ? (
                    <div className="children">
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
            <style jsx>{`
                .invite-item {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 8px 12px;
                }

                .invite-row {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: transparent;
                    border: none;
                    color: inherit;
                    padding: 0;
                    cursor: pointer;
                    gap: 12px;
                    text-align: left;
                }

                .left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                    min-width: 0;
                }

                .arrow {
                    width: 16px;
                    height: 16px;
                    flex-shrink: 0;
                }

                .arrow.placeholder {
                    width: 16px;
                    height: 16px;
                    display: inline-block;
                    flex-shrink: 0;
                }

                .info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    min-width: 0;
                }

                .info-row1 {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .info-row2 {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    min-width: 0;
                }

                .wallet-icon {
                    width: 14px;
                    height: 14px;
                    flex-shrink: 0;
                }

                .avatar {
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.2);
                }

                .address {
                    color: rgba(255, 255, 255, 0.9);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .right {
                    text-align: right;
                    flex-shrink: 0;
                }

                .amount {
                    font-weight: 700;
                }

                .time {
                    color: rgba(255, 255, 255, 0.55);
                }

                .children {
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding-left: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
            `}</style>
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
        <div className="vip-node">
            <h3 className="text-[18px] font-bold text-center">
                {t("totalRevenue.entTotalRevenue")}
                <span className=""> {rewards.total_total_reward} ENT </span>
            </h3>
            <div className="card revenue">
                <div className="grid">
                    <div>
                        <div className="value text-[14px]">
                            {rewards.total_base_mining_reward} ENT
                        </div>
                        <div className="label text-[12px]">{t("totalRevenue.dailyRevenue")}</div>
                    </div>
                    <div>
                        <div className="value text-[14px]">
                            {rewards.total_level_bonus_reward} ENT
                        </div>
                        <div className="label text-[12px]">{t("totalRevenue.teamRevenue")}</div>
                    </div>
                    <div>
                        <div className="value text-[14px]">{0} ENT</div>
                        <div className="label text-[12px]">
                            {t("totalRevenue.destructionRevenue")}
                        </div>
                    </div>
                    <div>
                        <div className="value text-[14px]">{rewards.total_invite_reward} ENT</div>
                        <div className="label text-[12px]">
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
            <div className="card invite">
                {hasInvites ? (
                    <div className="invite-list">
                        {inviteList.map((item, index) => (
                            <InviteTreeItem
                                key={`${item.invite_id ?? "invite"}-${index}`}
                                item={item}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty text-[12px]">{t("ticket.empty")}</div>
                )}
            </div>

            <style jsx>{`
                .vip-node {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    color: #fff;
                }

                .card {
                    background: rgba(153, 153, 153, 0.12);
                    border-radius: 16px;
                    padding: 18px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .revenue h3 {
                    margin-bottom: 12px;
                }

                .grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .value {
                    font-weight: 700;
                }

                .label {
                    color: rgba(255, 255, 255, 0.6);
                }

                .empty {
                    color: rgba(255, 255, 255, 0.6);
                    text-align: center;
                }

                .invite-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
            `}</style>
        </div>
    );
}
