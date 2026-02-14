import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { images } from "@mirror/assets";
import type { UserLevelProgressItem } from "@mirror/api";
import { formatEnt } from "@mirror/utils";
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
                pending_rewards: formatEnt(rewardData?.rewards_info?.pending_rewards),
                total_base_mining_reward: formatEnt(
                    rewardData?.rewards_info?.total_cycle_rewards?.base_mining_reward,
                ),
                total_invite_reward: formatEnt(
                    rewardData?.rewards_info?.total_cycle_rewards?.invite_reward,
                ),
                total_level_bonus_reward: formatEnt(
                    rewardData?.rewards_info?.total_cycle_rewards?.level_bonus_reward,
                ),
                total_total_reward: formatEnt(
                    rewardData?.rewards_info?.total_cycle_rewards?.total_reward,
                ),
                today_base_mining_reward: formatEnt(
                    rewardData?.rewards_info?.today_cycle_rewards?.base_mining_reward,
                ), // 今日固定收益
                today_invite_reward: formatEnt(
                    rewardData?.rewards_info?.today_cycle_rewards?.invite_reward,
                ),
                today_level_bonus_reward: formatEnt(
                    rewardData?.rewards_info?.today_cycle_rewards?.level_bonus_reward,
                ),
                today_total_reward: formatEnt(
                    rewardData?.rewards_info?.today_cycle_rewards?.total_reward,
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

    const gradientText =
        "bg-[linear-gradient(0deg,#b546ff_0.96%,#ea82ff_100%)] bg-clip-text text-transparent";

    return (
        <div className="flex flex-col gap-5 text-white">
            {/* 矿机介绍 */}
            <div className="relative flex items-center gap-4 overflow-visible pl-[106px] h-[114px] mt-5 rounded-[14px] p-5 transparent-linear-bg">
                <div className="absolute left-0 bottom-0 h-[134px] w-[96px] shrink-0 overflow-hidden rounded-xl">
                    <img
                        src={images.account.channel}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                    {/* <div className="absolute bottom-0 left-0 w-full text-center text-[12px] font-bold bg-white/25">
                        {t("miningMy.introduction")}
                    </div> */}
                    <div className="hero-icon absolute top-0 right-0 flex h-[26px] w-[26px] items-center justify-center rounded-bl-xl bg-white/45">
                        <img src={images.account.ent} alt="" className="h-4 w-4" />
                    </div>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                    <div>
                        <span className={`text-[16px] font-bold ${gradientText}`}>
                            VIP {vipLevel}
                        </span>{" "}
                        <span className={`text-[12px] ${gradientText}`}>({purchasedNodes}x)</span>
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
                    <div className="mt-2 flex items-end justify-between gap-4">
                        <span className="text-[12px] text-white font-semibold">
                            {t("miningMy.clubVip")}
                        </span>
                        <Button
                            variant="primary"
                            size="x-small"
                            onClick={() => navigate("./purchase")}
                            style={{ borderRadius: "999px", padding: "3px 12px" }}
                        >
                            {t("miningMy.buyVip")}
                        </Button>
                    </div>
                </div>
            </div>

            {/* 矿机数据 */}
            <div className="flex flex-col gap-2.5">
                <div className="text-[18px] font-bold">{t("miningMy.dataDetails")}</div>
                <div
                    className="rounded-xl border border-white/10 bg-[rgba(153,153,153,0.12)] bg-top-right bg-no-repeat p-3 bg-size-[30%]"
                    style={{ backgroundImage: `url(${images.vip.giftBg})` }}
                >
                    <div className="flex flex-col gap-2">
                        {[
                            { label: t("vipMining.numberOfVips"), value: vipLevel },
                            { label: t("miningMy.purchasedNode"), value: purchasedNodes },
                            {
                                label: t("miningMy.fixedHashrate"),
                                value: `1500A × ${purchasedNodes}`,
                            },
                            { label: t("miningMy.accelerateRelease"), value: "35%" },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex gap-1.5 text-[14px]">
                                <span>{label}</span>
                                <strong className="text-[16px]">{value}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 今日挖矿数据 */}
            <div className="flex flex-col gap-2.5">
                <div className="text-[18px] font-bold">{t("miningMy.todaysMiningData")}</div>
                <div className="rounded-xl border transparent-linear-bg border-[#9DFEF2]/20">
                    <div className=" p-3">
                        <div className="flex items-center gap-3">
                            <img src={images.account.ent2} alt="" className="h-12 w-12" />
                            <div>
                                <div className="text-[16px] font-bold">
                                    {rewards.today_base_mining_reward} ENT
                                </div>
                                <div className={`text-[12px] font-semibold ${gradientText}`}>
                                    {purchasedNodes}X SPEEDUP
                                </div>
                                <div className="text-[12px] text-white/65">
                                    {t("miningMy.todaysTip")}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-[#E0D0FA]/20 p-2.5">
                        <div className="grid grid-cols-2 grid-rows-2 [&>div:nth-child(2n)]:border-r-0 [&>div:nth-child(n+3)]:border-b-0">
                            {[
                                {
                                    value: `${rewards.today_invite_reward} ENT`,
                                    label: t("miningMy.directEarnings"),
                                },
                                {
                                    value: `${rewards.today_level_bonus_reward} ENT`,
                                    label: t("miningMy.dividendEarnings"),
                                },
                                {
                                    value: t("vipMining.comingSoon"),
                                    label: t("miningMy.destructionEarnings"),
                                },
                                {
                                    value: `${rewards.today_total_reward} ENT`,
                                    label: t("miningMy.totalMined"),
                                },
                            ].map(({ value, label }) => (
                                <div
                                    key={label}
                                    className="flex min-h-[72px] flex-col items-center justify-center border-r border-b border-white/18 p-3 text-center"
                                >
                                    <div className="text-[16px] font-bold">{value}</div>
                                    <div className="text-[12px] text-white/65">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="text-[12px] leading-normal text-white/65">
                    {t("miningMy.releaseInfo")}
                </div>
            </div>

            {loading ? <div className="text-[12px] text-white/60">...</div> : null}
        </div>
    );
}
