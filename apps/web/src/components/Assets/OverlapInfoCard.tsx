import { useTranslation } from "react-i18next";
import { images } from "@mirror/assets";
import { displayNumber } from "@mirror/utils";
import { LinearDivideHorizontal, LinearDivideVertical, UserInfo } from "./component";
import { UserAssetItem } from "@mirror/api";

export interface OverlapInfoCardProps {
    /** 总资产数值（已格式化） */
    totalFormatted: string;
    /** 刷新回调 */
    onRefresh: () => void;
    /** 资产数据 */
    assets: UserAssetItem[];
    walletAddress: string;
    email: string;
    onCopyAddress: () => void;
}

// 对应 assets 接口返回列表中的 name 字段
enum AssetName {
    ENT = "ENT",
    USDT = "USDT",
    ART = "ART",
    TICKET = "TICKET",
}

/**
 * 重叠双卡：下层为较小的渐变总资产卡，上层为磨砂玻璃卡，玻璃卡覆盖一部分下层。
 */
export function OverlapInfoCard({
    totalFormatted,
    onRefresh,
    assets,
    walletAddress,
    email,
    onCopyAddress,
}: OverlapInfoCardProps) {
    const { t } = useTranslation();

    return (
        <div className="relative">
            {/* 下层：较小的渐变卡（总资产 + 刷新） */}
            <div className="px-4">
                <div className="rounded-2xl bg-linear-to-br from-[#ad7eff] via-[#7a39fd] to-[#7c1af3] px-5 pt-5 pb-24">
                    <div className="text-[15px] font-semibold text-white/95">
                        {t("account.balanceTotal", { d: "USDT" })}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-2xl font-semibold tracking-wide sm:text-3xl">
                            {totalFormatted}
                        </span>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-md border border-white/30 bg-white/20 px-2 py-1 text-[12px] font-semibold text-white"
                            onClick={onRefresh}
                        >
                            <span>{t("account.refresh")}</span>
                            <img src={images.account.refresh} alt="" className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>
            {/* 上层：磨砂玻璃卡，负 margin 叠在下层之上 */}
            <div className="-mt-20 rounded-2xl border border-white/30 bg-linear-to-b from-white/5 to-white/10 p-4 backdrop-blur-2xl">
                {/* 四块：横线 + 竖线在中间交叉，分成左上 ENT、右上 RWA token、左下 ticket、右下 RWA ticket */}
                <div className="grid grid-cols-[1fr_auto_1fr] grid-rows-3 gap-x-4 gap-y-1">
                    {/* 左上 */}
                    <div className="flex items-start gap-2">
                        <img src={images.account.ent} alt="" className="mt-0.5 h-6 w-6 shrink-0" />
                        <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-white/90">
                                {t("account.ent")}
                            </div>
                            <div className="text-[15px] font-medium text-white">
                                {displayNumber(
                                    assets.find(item => item.name === AssetName.ENT)?.balance ?? 0,
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-start-2 row-start-1 flex w-px items-stretch">
                        <LinearDivideVertical />
                    </div>
                    {/* 右上 */}
                    <div className="col-start-3 row-start-1 flex items-start gap-2">
                        <img
                            src={images.account.usdtIcon}
                            alt=""
                            className="mt-0.5 h-6 w-6 shrink-0"
                        />
                        <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-white/90">
                                {t("account.rwa_token")}
                            </div>
                            <div className="text-[15px] font-medium text-white">
                                {displayNumber(
                                    assets.find(item => item.name === AssetName.USDT)?.balance ?? 0,
                                )}
                            </div>
                        </div>
                    </div>
                    {/* 中间横线：占满整行 */}
                    <div className="col-span-3 col-start-1 row-start-2">
                        <LinearDivideHorizontal />
                    </div>
                    {/* 左下 */}
                    <div className="row-start-3 flex items-start gap-2">
                        <img
                            src={images.account.todayIcon}
                            alt=""
                            className="mt-0.5 h-6 w-6 shrink-0"
                        />
                        <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-white/90">
                                {t("account.ticket")}
                            </div>
                            <div className="text-[15px] font-medium text-[#32f4dd]">
                                {displayNumber(
                                    assets.find(item => item.name === AssetName.ART)?.balance ?? 0,
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-start-2 row-start-3 flex w-px items-stretch">
                        <LinearDivideVertical />
                    </div>
                    {/* 右下 */}
                    <div className="col-start-3 row-start-3 flex items-start gap-2">
                        <img src={images.account.art} alt="" className="mt-0.5 h-6 w-6 shrink-0" />
                        <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-white/90">
                                {t("account.rwa_ticket")}
                            </div>
                            <div className="text-[15px] font-medium text-white">
                                {displayNumber(
                                    assets.find(item => item.name === AssetName.TICKET)?.balance ??
                                        0,
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <UserInfo
                    walletAddress={walletAddress}
                    email={email}
                    handleCopyAddress={onCopyAddress}
                />
            </div>
        </div>
    );
}
