import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { images } from "@mirror/assets";
import { CoefficientTable } from "../../ui";
import { MIRROR_EXTERNAL_LINKS } from "@mirror/utils";

const vipRulesData = [
    { vip: "1", gift: "1", add: "0" },
    { vip: "2", gift: "3", add: "0" },
    { vip: "5", gift: "5", add: "0" },
    { vip: "10", gift: "10", add: "0" },
    { vip: "20", gift: "20", add: "2" },
    { vip: "30", gift: "30", add: "4" },
    { vip: "40", gift: "40", add: "5" },
    { vip: "50", gift: "50", add: "7" },
    { vip: "100", gift: "100", add: "15" },
];

export function VipAbout() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const openLink = (url: string) => {
        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <div>
            {/* 链接区域 */}
            <div className="flex justify-between items-center gap-12 flex-wrap mb-[10px]">
                <button
                    type="button"
                    className="inline-flex items-center gap-1 border-none bg-transparent cursor-pointer"
                    // onClick={() =>
                    //     openLink(
                    //         MIRROR_EXTERNAL_LINKS.whitePaper[
                    //             i18n.language as keyof typeof MIRROR_EXTERNAL_LINKS.whitePaper
                    //         ],
                    //     )
                    // }
                >
                    <img className="w-[18px]" src={images.vip.whitePaperIcon} alt="" />
                    <span className="font-bold text-[14px]">{t("vipAbout.whitePaper")}</span>
                </button>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="inline-flex h-[22px] min-w-0 items-center justify-center gap-[6px] rounded border-none px-2.5 py-1.5 text-white cursor-pointer [background:var(--gradient-primary)]"
                        onClick={() => openLink(MIRROR_EXTERNAL_LINKS.discord)}
                    >
                        <img className="w-[14px]" src={images.vip.discord} alt="Discord" />
                        <span>Discord</span>
                    </button>
                    <button
                        type="button"
                        className="inline-flex h-[22px] min-w-[80px] items-center justify-center gap-[6px] rounded border-none px-2.5 py-1.5 text-white cursor-pointer [background:var(--gradient-primary)]"
                        onClick={() => openLink(MIRROR_EXTERNAL_LINKS.twitter)}
                    >
                        <img className="w-[14px]" src={images.vip.x} alt="X" />
                    </button>
                </div>
            </div>

            {/* 卡片区域 */}
            <div className="rounded-[14px] border border-white/12 p-5 px-4 mb-[18px]">
                <h3 className="text-center text-[20px] font-bold mb-4">
                    {t("vipAbout.cardTitle")}
                </h3>
                <div className="flex flex-col gap-[8px] px-14">
                    {[
                        {
                            title: t("vipAbout.newbieWhite"),
                            desc: t("vipAbout.newbieWhiteDesc"),
                        },
                        {
                            title: t("vipAbout.potentialPlayers"),
                            desc: t("vipAbout.potentialPlayersDesc"),
                        },
                        {
                            title: t("vipAbout.trendsetters"),
                            desc: t("vipAbout.trendsettersDesc"),
                        },
                        {
                            title: t("vipAbout.industryKOC"),
                            desc: t("vipAbout.industryKOCDesc"),
                        },
                        {
                            title: t("vipAbout.topOGs"),
                            desc: t("vipAbout.topOGsDesc"),
                        },
                    ].map(item => (
                        <div key={item.title} className="text-center gap-1.5 leading-[1.2]">
                            <span className="text-[14px] font-semibold">{item.title}</span>{" "}
                            <span className="text-[14px] font-semibold text-white/80">
                                {item.desc}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 rounded-xl border border-[rgba(175,88,183,0.6)] p-4 pt-2 text-center bg-[linear-gradient(0deg,rgba(11,12,19,0),rgba(11,12,19,0)),linear-gradient(0deg,rgba(255,255,255,0.06),rgba(255,255,255,0.06))]">
                    <div className="mb-2.5 text-[20px] font-semibold bg-[linear-gradient(90deg,#9afff2_0%,#e7cbfb_50.96%,#9efdf2_100%)] bg-clip-text text-transparent">
                        {t("vipAbout.joinTitle")}
                    </div>
                    <button
                        type="button"
                        className="rounded-[6px] border-none bg-(--color-primary) px-6 py-1 font-semibold text-white cursor-pointer"
                        onClick={() => navigate("/vip/purchase")}
                    >
                        {t("vipAbout.payButton")}
                    </button>
                </div>
            </div>

            {/* 矿机区域 */}
            <div className="rounded-[14px] border border-white/12 p-5 px-4 text-center">
                <h3 className="text-center text-[20px] font-bold mb-2">
                    {t("vipAbout.giftedNodes")}
                </h3>
                <div className="mb-2 text-[13px] font-semibold text-white/90">
                    {t("vipAbout.totalMiningCapacity")}
                </div>
                <div className="mb-2 text-[27px] font-bold text-[#37FFC6]">6,000,000,000 ENT</div>
                <div className="mb-2 text-[14px] font-semibold text-white/90">
                    {t("vipAbout.currentLimit")}
                </div>
                <div className="my-4 flex justify-center">
                    <img src={images.logo} alt="" className="h-[50px]" />
                </div>
                <div className="my-5 flex flex-col gap-1.5 text-[14px] text-[#9996A9]">
                    <span>{t("vipAbout.dailyOutputPerNode")}</span>
                    <span>{t("vipAbout.acceleratedRelease")}</span>
                    <span>{t("vipAbout.oneVipGiftNode")}</span>
                    <span>{t("vipAbout.twentyVipGiftNodes")}</span>
                </div>
                <CoefficientTable
                    theadHeaders={[
                        t("vipAbout.tableHeaders.vips"),
                        t("vipAbout.tableHeaders.giftedNodes"),
                        t("vipAbout.tableHeaders.additionalNodes"),
                    ]}
                    theadHeaderKeys={["vip", "gift", "add"]}
                    data={vipRulesData}
                />
            </div>
        </div>
    );
}
