import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { images } from "@mirror/assets";
import type { UserLevelProgressItem } from "@mirror/api";
import { formatReward } from "@mirror/utils";
import { artsApiClient } from "../../api/artsClient";
import { useAuth } from "../../hooks/useAuth";
import { useAlertStore } from "../../store/useAlertStore";
import { Button, Progress } from "../../ui";

type RewardsState = {
    pending_rewards: number;
    total_base_mining_reward: number;
    total_invite_reward: number;
    total_level_bonus_reward: number;
    total_total_reward: number;
    today_base_mining_reward: number;
    today_invite_reward: number;
    today_level_bonus_reward: number;
    today_total_reward: number;
};

/** 解析 "当前/总数" 格式字符串为 { current, max } */
const parseInviteProgress = (str: string): { current: number; max: number } => {
    const parts = String(str ?? "0/0")
        .split("/")
        .map(s => Number.parseInt(s, 10));
    const current = Number.isFinite(parts[0]) ? parts[0] : 0;
    const max = Number.isFinite(parts[1]) && parts[1] > 0 ? parts[1] : 1;
    return { current, max };
};

export function VipMining() {
    const { t } = useTranslation();
    const { isLoggedIn } = useAuth();
    const showAlert = useAlertStore(state => state.show);

    const [vipLevel, setVipLevel] = useState(0);
    const [purchasedNodes, setPurchasedNodes] = useState(0);
    /** 下一级进度：有效用户（team_user_progress）与直推进度（vN_invites_progress，仅 VIP 有） */
    const [teamProgress, setTeamProgress] = useState<UserLevelProgressItem>({
        current: 0,
        percentage: 0,
        required: 1,
    });
    const [invitesProgress, setInvitesProgress] = useState<UserLevelProgressItem | null>(null);
    const [inviteNum, setInviteNum] = useState({
        direct_invites: "0/0",
        indirect_invites: "0/0",
    });
    const [rewards, setRewards] = useState<RewardsState>({
        pending_rewards: 0,
        total_base_mining_reward: 0,
        total_invite_reward: 0,
        total_level_bonus_reward: 0,
        total_total_reward: 0,
        today_base_mining_reward: 0,
        today_invite_reward: 0,
        today_level_bonus_reward: 0,
        today_total_reward: 0,
    });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const fetchVipLevel = useCallback(async () => {
        if (!isLoggedIn) {
            setVipLevel(0);
            setPurchasedNodes(0);
            return;
        }

        setLoading(true);
        try {
            const [vipResponse, levelResponse, rewardsResponse] = await Promise.all([
                artsApiClient.user.getVipLevel(),
                artsApiClient.user.getLevelProgress(),
                artsApiClient.node.mining.getRewards(),
            ]);

            const vipData = vipResponse.data;
            const resolvedVipLevel = Number((vipData?.user_level as number | string) ?? 0);
            setVipLevel(Number.isFinite(resolvedVipLevel) ? resolvedVipLevel : 0);
            const resolvedNodes = Number((vipData?.personal_nodes as number | string) ?? 0);
            setPurchasedNodes(Number.isFinite(resolvedNodes) ? resolvedNodes : 0);

            const levelData = levelResponse.data;
            const progress = levelData?.next_level_progress;
            const team = progress?.team_user_progress ?? {
                current: 0,
                percentage: 0,
                required: 1,
            };
            setTeamProgress(team);

            const currentLevel = Number(levelData?.current_level ?? 0);
            type InvitesProgressKey =
                | "v1_invites_progress"
                | "v2_invites_progress"
                | "v3_invites_progress"
                | "v4_invites_progress";
            const invitesKey: InvitesProgressKey | null =
                currentLevel >= 1 && currentLevel <= 4
                    ? (`v${currentLevel}_invites_progress` as InvitesProgressKey)
                    : null;
            const invites = invitesKey && progress ? (progress[invitesKey] ?? null) : null;
            setInvitesProgress(invites ?? null);

            setInviteNum({
                direct_invites: String(levelData?.direct_invites ?? "0/0"),
                indirect_invites: String(levelData?.indirect_invites ?? "0/0"),
            });

            const rewardData = rewardsResponse.data;
            setRewards({
                pending_rewards: formatReward(rewardData?.rewards_info?.pending_rewards),
                total_base_mining_reward: formatReward(
                    rewardData?.rewards_info?.latest_cycle_rewards?.base_mining_reward,
                ),
                total_invite_reward: formatReward(
                    rewardData?.rewards_info?.latest_cycle_rewards?.invite_reward,
                ),
                total_level_bonus_reward: formatReward(
                    rewardData?.rewards_info?.latest_cycle_rewards?.level_bonus_reward,
                ),
                total_total_reward: formatReward(
                    rewardData?.rewards_info?.latest_cycle_rewards?.total_reward,
                ),
                today_base_mining_reward: formatReward(
                    rewardData?.rewards_info?.latest_cycle_rewards?.base_mining_reward,
                ),
                today_invite_reward: formatReward(
                    rewardData?.rewards_info?.latest_cycle_rewards?.invite_reward,
                ),
                today_level_bonus_reward: formatReward(
                    rewardData?.rewards_info?.latest_cycle_rewards?.level_bonus_reward,
                ),
                today_total_reward: formatReward(
                    rewardData?.rewards_info?.latest_cycle_rewards?.total_reward,
                ),
            });
        } catch (error) {
            console.error("[VipMining] load vip level failed", error);
            showAlert({ message: t("assets.loadFailed"), variant: "error" });
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, showAlert, t]);

    useEffect(() => {
        void fetchVipLevel();
    }, [fetchVipLevel]);

    return (
        <div className="vip-mining">
            <div className="card hero">
                <div className="hero-image">
                    <img src={images.account.channel} alt="" />
                    <div className="hero-label text-[12px]">{t("miningMy.introduction")}</div>
                    <div className="hero-icon">
                        <img src={images.account.ent} alt="" />
                    </div>
                </div>
                <div className="hero-info">
                    <div>
                        <span className="text-[16px] font-bold gradient-text">VIP {vipLevel}</span>{" "}
                        <span className="text-[12px] gradient-text">({purchasedNodes}x)</span>
                    </div>
                    {/* 第一个 Progress：升级所需有效用户数，对应 next_level_progress.team_user_progress */}
                    {invitesProgress && (
                        <Progress
                            label={""}
                            valueLabel={`${invitesProgress.current} / ${invitesProgress.required} VIP${vipLevel}`}
                            value={invitesProgress.current}
                            max={invitesProgress.required}
                            size="small"
                        />
                    )}
                    {/* 第二个 Progress：直推/间推进度，对应 vN_invites_progress（VIP 有），valueLabel 为直推/间推数量 */}
                    <Progress
                        label={t("vipMining.validUsers")}
                        // valueLabel={`${}`}
                        value={
                            teamProgress
                                ? teamProgress.current
                                : parseInviteProgress(inviteNum.direct_invites).current
                        }
                        max={
                            teamProgress
                                ? teamProgress.required
                                : parseInviteProgress(inviteNum.direct_invites).max
                        }
                        size="small"
                    />
                    <div className="flex justify-between items-center gap-4 mt">
                        <span className="text-[12px] text-white">{t("miningMy.clubVip")}</span>
                        <Button
                            variant="primary"
                            size="x-small"
                            onClick={() => navigate("./purchase")}
                            className=""
                        >
                            {t("miningMy.buyVip")}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="section">
                <div className="section-title text-[14px]">{t("miningMy.dataDetails")}</div>
                <div className="card gift" style={{ backgroundImage: `url(${images.vip.giftBg})` }}>
                    <div className="gift-row text-[13px]">
                        <span>{t("vipMining.numberOfVips")}</span>
                        <strong>{vipLevel}</strong>
                    </div>
                    <div className="gift-row text-[13px]">
                        <span>{t("miningMy.purchasedNode")}</span>
                        <strong>{purchasedNodes}</strong>
                    </div>
                    <div className="gift-row text-[13px]">
                        <span>{t("miningMy.fixedHashrate")}</span>
                        <strong>1500A × {purchasedNodes}</strong>
                    </div>
                    <div className="gift-row text-[13px]">
                        <span>{t("miningMy.accelerateRelease")}</span>
                        <strong>35%</strong>
                    </div>
                </div>
            </div>

            <div className="section">
                <div className="section-title text-[14px]">{t("miningMy.todaysMiningData")}</div>
                <div className="card stat-summary">
                    <div className="stat-main">
                        <img src={images.account.ent2} alt="" />
                        <div>
                            <div className="stat-value text-[16px]">
                                {rewards.today_base_mining_reward} ENT
                            </div>
                            <div className="stat-speedup text-[12px]">
                                {purchasedNodes}X SPEEDUP
                            </div>
                            <div className="stat-hint text-[12px]">{t("miningMy.todaysTip")}</div>
                        </div>
                    </div>
                </div>
                <div className="card stat-grid-card">
                    <div className="stat-grid">
                        <div>
                            <div className="stat-value text-[16px]">
                                {rewards.today_invite_reward} ENT
                            </div>
                            <div className="stat-label text-[12px]">
                                {t("miningMy.directEarnings")}
                            </div>
                        </div>
                        <div>
                            <div className="stat-value text-[16px]">
                                {rewards.today_level_bonus_reward} ENT
                            </div>
                            <div className="stat-label text-[12px]">
                                {t("miningMy.dividendEarnings")}
                            </div>
                        </div>
                        <div>
                            <div className="stat-value text-[16px]">
                                {t("vipMining.comingSoon")}
                            </div>
                            <div className="stat-label text-[12px]">
                                {t("miningMy.destructionEarnings")}
                            </div>
                        </div>
                        <div>
                            <div className="stat-value text-[16px]">
                                {rewards.today_total_reward} ENT
                            </div>
                            <div className="stat-label text-[12px]">{t("miningMy.totalMined")}</div>
                        </div>
                    </div>
                </div>
                <div className="section-release text-[12px]">{t("miningMy.releaseInfo")}</div>
            </div>

            {loading ? <div className="loading text-[12px]">...</div> : null}

            <style jsx>{`
                .vip-mining {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    color: #fff;
                }

                .card {
                    background: rgba(153, 153, 153, 0.12);
                    border-radius: 12px;
                    padding: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .hero {
                    position: relative;
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    overflow: visible;
                    padding-left: 106px;
                    margin-top: 10px;
                }

                .hero-image {
                    position: absolute;
                    left: 0px;
                    bottom: 0px;
                    width: 90px;
                    height: 124px;
                    border-radius: 12px;
                    overflow: hidden;
                    flex-shrink: 0;
                }

                .hero-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .hero-label {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    text-align: center;
                    font-weight: 700;
                    background: rgba(255, 255, 255, 0.25);
                }

                .hero-icon {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 26px;
                    height: 26px;
                    background: rgba(255, 255, 255, 0.45);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-bottom-left-radius: 12px;
                }

                .hero-icon img {
                    width: 16px;
                    height: 16px;
                }

                .hero-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .gradient-text {
                    background: linear-gradient(0deg, #b546ff 0.96%, #ea82ff 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-label-text {
                    color: rgba(255, 255, 255, 0.7);
                }

                .hero-button {
                    border: none;
                    background: var(--color-primary);
                    color: #fff;
                    border-radius: 999px;
                    padding: 6px 12px;
                    cursor: pointer;
                }

                .hero-value {
                    font-weight: 700;
                }

                .section {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .section-title {
                    font-weight: 700;
                }

                .gift {
                    background-size: contain;
                    background-position: right bottom;
                    background-repeat: no-repeat;
                }

                .gift-row {
                    display: flex;
                    gap: 6px;
                    margin-bottom: 8px;
                }

                .stat-summary .stat-main {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .stat-summary .stat-main img {
                    width: 48px;
                    height: 48px;
                }

                .stat-value {
                    font-weight: 700;
                }

                .stat-speedup {
                    font-weight: 600;
                    background: linear-gradient(0deg, #b546ff 0.96%, #ea82ff 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .stat-hint {
                    color: rgba(255, 255, 255, 0.65);
                }

                .stat-grid-card .stat-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    grid-template-rows: repeat(2, 1fr);
                }

                .stat-grid-card .stat-grid > div {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    min-height: 72px;
                    padding: 12px;
                    border-right: 1px solid rgba(255, 255, 255, 0.18);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.18);
                }

                .stat-grid-card .stat-grid > div:nth-child(2n) {
                    border-right: none;
                }

                .stat-grid-card .stat-grid > div:nth-child(n + 3) {
                    border-bottom: none;
                }

                .stat-label {
                    color: rgba(255, 255, 255, 0.65);
                }

                .section-release {
                    color: rgba(255, 255, 255, 0.65);
                    line-height: 1.5;
                }

                .loading {
                    color: rgba(255, 255, 255, 0.6);
                }
            `}</style>
        </div>
    );
}
