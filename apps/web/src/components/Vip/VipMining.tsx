import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { images } from "@mirror/assets";
import { artsApiClient } from "../../api/artsClient";
import { useAuth } from "../../hooks/useAuth";
import { useAlertStore } from "../../store/useAlertStore";
import { useNavigate } from "react-router-dom";

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

const formatReward = (reward?: string | number) => {
    const raw = Number(reward ?? 0);
    const value = Number.isFinite(raw) ? raw / 1000 : 0;
    return Math.round(value * 1000) / 1000;
};

export function VipMining() {
    const { t } = useTranslation();
    const { isLoggedIn } = useAuth();
    const showAlert = useAlertStore(state => state.show);

    const [vipLevel, setVipLevel] = useState(0);
    const [purchasedNodes, setPurchasedNodes] = useState(0);
    const [nextLevelInfo, setNextLevelInfo] = useState({
        invitesCurrent: 0,
        invitesRequired: 0,
        teamCurrent: 0,
        teamRequired: 0,
    });
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
            const currentLevel = levelData?.current_level ?? resolvedVipLevel ?? 0;
            const nextLevelRequire = levelData?.next_level_requirements ?? {};
            setNextLevelInfo({
                invitesCurrent:
                    Number(levelData?.v1_direct_count) ||
                    Number(levelData?.v2_direct_count) ||
                    Number(levelData?.v3_direct_count) ||
                    Number(levelData?.v4_direct_count) ||
                    0,
                invitesRequired: Number(nextLevelRequire?.personal_nodes) || 0,
                teamCurrent: Number(levelData?.user) || 0,
                teamRequired: Number(nextLevelRequire?.personal_nodes) || 0,
            });
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
                    <div className="hero-label">{t("miningMy.introduction")}</div>
                    <div className="hero-icon">
                        <img src={images.account.ent} alt="" />
                    </div>
                </div>
                <div className="hero-info">
                    <div className="hero-row">
                        <span className="hero-title">VIP {vipLevel}</span>
                        <span className="hero-sub">({purchasedNodes}x)</span>
                    </div>
                    <div className="hero-row">
                        <span className="hero-label-text">
                            {t("vipMining.validUsers")} {nextLevelInfo.teamCurrent}/
                            {nextLevelInfo.teamRequired}
                        </span>
                        <span className="hero-label-text">
                            {inviteNum.direct_invites} / {inviteNum.indirect_invites}
                        </span>
                    </div>
                    <div className="hero-row">
                        <span className="hero-label-text">{t("miningMy.clubVip")}</span>
                        <button
                            type="button"
                            className="hero-button"
                            onClick={() => navigate("./purchase")}
                        >
                            {t("miningMy.buyVip")}
                        </button>
                    </div>
                    <div className="hero-row">
                        <span className="hero-label-text">{t("vipMining.numberOfVips")}</span>
                        <span className="hero-value">{vipLevel}</span>
                    </div>
                </div>
            </div>

            <div className="section">
                <div className="section-title">{t("miningMy.dataDetails")}</div>
                <div className="card gift" style={{ backgroundImage: `url(${images.vip.giftBg})` }}>
                    <div className="gift-row">
                        <span>{t("miningMy.purchasedNode")}</span>
                        <strong>{purchasedNodes}</strong>
                    </div>
                    <div className="gift-row">
                        <span>{t("miningMy.fixedHashrate")}</span>
                        <strong>1500A × {purchasedNodes}</strong>
                    </div>
                    <div className="gift-row">
                        <span>{t("miningMy.accelerateRelease")}</span>
                        <strong>35%</strong>
                    </div>
                </div>
            </div>

            <div className="section">
                <div className="section-title">{t("miningMy.todaysMiningData")}</div>
                <div className="card stats">
                    <div className="stat-main">
                        <img src={images.account.ent2} alt="" />
                        <div>
                            <div className="stat-value">{rewards.today_base_mining_reward} ENT</div>
                            <div className="stat-hint">
                                {t("miningMy.acceleratedComputingPowerNote")}
                            </div>
                        </div>
                    </div>
                    <div className="stat-grid">
                        <div>
                            <div className="stat-value">{rewards.today_invite_reward} ENT</div>
                            <div className="stat-label">{t("miningMy.directEarnings")}</div>
                        </div>
                        <div>
                            <div className="stat-value">{rewards.today_level_bonus_reward} ENT</div>
                            <div className="stat-label">{t("miningMy.dividendEarnings")}</div>
                        </div>
                        <div>
                            <div className="stat-value">{t("vipMining.comingSoon")}</div>
                            <div className="stat-label">{t("miningMy.destructionEarnings")}</div>
                        </div>
                        <div>
                            <div className="stat-value">{rewards.today_total_reward} ENT</div>
                            <div className="stat-label">{t("miningMy.totalMined")}</div>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? <div className="loading">...</div> : null}

            <style jsx>{`
                .vip-mining {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    color: #fff;
                }

                .card {
                    background: rgba(153, 153, 153, 0.12);
                    border-radius: 16px;
                    padding: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .hero {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }

                .hero-image {
                    position: relative;
                    width: 120px;
                    height: 150px;
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
                    font-size: 12px;
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

                .hero-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                }

                .hero-title {
                    font-size: 20px;
                    font-weight: 700;
                    background: linear-gradient(0deg, #b546ff 0.96%, #ea82ff 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-sub {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.8);
                }

                .hero-label-text {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                }

                .hero-button {
                    border: none;
                    background: var(--color-primary);
                    color: #fff;
                    border-radius: 999px;
                    padding: 6px 12px;
                    font-size: 12px;
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
                    font-size: 14px;
                    font-weight: 700;
                }

                .gift {
                    background-size: cover;
                    background-position: right bottom;
                    background-repeat: no-repeat;
                }

                .gift-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 13px;
                }

                .stats {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .stat-main {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .stat-main img {
                    width: 48px;
                    height: 48px;
                }

                .stat-value {
                    font-size: 16px;
                    font-weight: 700;
                }

                .stat-hint {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.65);
                }

                .stat-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .stat-label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.65);
                }

                .loading {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.6);
                }
            `}</style>
        </div>
    );
}
