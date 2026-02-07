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
        <div className="vip-about">
            <div className="links">
                <button
                    type="button"
                    className="white-paper text-[14px]"
                    onClick={() =>
                        openLink(
                            MIRROR_EXTERNAL_LINKS.whitePaper[
                                i18n.language as keyof typeof MIRROR_EXTERNAL_LINKS.whitePaper
                            ],
                        )
                    }
                >
                    <img src={images.vip.whitePaperIcon} alt="" />
                    <span>{t("vipAbout.whitePaper")}</span>
                </button>
                <div className="socials">
                    <button
                        type="button"
                        className="social-btn flex items-center gap-2"
                        onClick={() => openLink(MIRROR_EXTERNAL_LINKS.discord)}
                    >
                        <img className="w-[14px]" src={images.vip.discord} alt="Discord" />
                        <span>Discord</span>
                    </button>
                    <button
                        type="button"
                        className="social-btn"
                        onClick={() => openLink(MIRROR_EXTERNAL_LINKS.twitter)}
                    >
                        <img className="w-[12px]" src={images.vip.x} alt="X" />
                    </button>
                </div>
            </div>

            <div className="card">
                <h3 className="card-title text-[18px]">{t("vipAbout.cardTitle")}</h3>
                <div className="privileges">
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
                        <div key={item.title} className="privilege-item">
                            <span className="privilege-title text-[12px] font-bold">
                                {item.title}
                            </span>
                            <span className="privilege-desc text-[12px] font-semibold">
                                {item.desc}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="join">
                    <div className="join-title text-[20px]">{t("vipAbout.joinTitle")}</div>
                    <button
                        type="button"
                        className="join-button"
                        onClick={() => navigate("/vip/purchase")}
                    >
                        {t("vipAbout.payButton")}
                    </button>
                </div>
            </div>

            <div className="card gifted">
                <h3 className="card-title text-[18px]">{t("vipAbout.giftedNodes")}</h3>
                <div className="centered text-[13px]">{t("vipAbout.totalMiningCapacity")}</div>
                <div className="ent-amount text-[27px]">6,000,000,000 ENT</div>
                <div className="centered text-[13px]">{t("vipAbout.currentLimit")}</div>
                <div className="logo">
                    <img src={images.logo} alt="" className="h-[53px]" />
                </div>
                <div className="release text-[12px]">
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

            <style jsx>{`
                .vip-about {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .links {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .white-paper {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    border: none;
                    background: transparent;
                    color: #fff;
                    font-weight: 500;
                    cursor: pointer;
                }

                .white-paper img {
                    width: 20px;
                }

                .socials {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .social-btn {
                    height: 25px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    border: none;
                    cursor: pointer;
                    background: var(--gradient-primary);
                    border-radius: 8px;
                    color: #fff;
                    padding: 6px 10px;
                }

                .card {
                    background: var(--gradient-card);
                    border-radius: 16px;
                    padding: 20px 16px;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                }

                .card-title {
                    text-align: center;
                    font-weight: 700;
                    margin-bottom: 16px;
                }

                .privileges {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .privilege-item {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    line-height: 1.4;
                }

                .privilege-title {
                    font-weight: 600;
                }

                .privilege-desc {
                    color: rgba(255, 255, 255, 0.8);
                }

                .join {
                    margin-top: 16px;
                    border: 1px solid rgba(175, 88, 183, 0.6);
                    border-radius: 12px;
                    padding: 16px;
                    text-align: center;
                }

                .join-title {
                    font-weight: 600;
                    margin-bottom: 10px;
                    background: linear-gradient(90deg, #9afff2 0%, #e7cbfb 50.96%, #9efdf2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .join-button {
                    border: none;
                    background: var(--color-primary);
                    color: #fff;
                    padding: 8px 16px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .gifted {
                    text-align: center;
                }

                .centered {
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 8px;
                    font-weight: 600;
                }

                .ent-amount {
                    font-weight: 700;
                    color: #05faea;
                    margin-bottom: 8px;
                }

                .logo {
                    margin: 16px auto;
                    display: flex;
                    justify-content: center;
                }

                .release {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin: 16px 0 20px;
                    color: rgba(255, 255, 255, 0.7);
                }
            `}</style>
        </div>
    );
}
