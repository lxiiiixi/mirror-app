import { images } from "@mirror/assets";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface NewsItem {
    content: string;
    time: string;
}

const DISCOVER_PIC_KEYS = ["d1", "d2", "d3"] as const;
const DISCOVER_PIC_KEYS_CN = ["d1Cn", "d2Cn", "d3Cn"] as const;

export function Discover() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const newsList = useMemo(() => {
        const raw = t("newsData", { returnObjects: true });
        const timeList = ["2025.06.30", "2025.03.26", "2024.06.23"];
        return Array.isArray(raw)
            ? raw.map((item, index) => {
                  return {
                      content: item.content,
                      time: timeList[index],
                  };
              })
            : [];
    }, [t]);

    const discoverPicByIndex = useMemo(() => {
        const isZh = i18n.language.startsWith("zh");
        const keys = isZh ? DISCOVER_PIC_KEYS_CN : DISCOVER_PIC_KEYS;
        return (index: number) => {
            const key = keys[index];
            return key ? images.discover[key] : undefined;
        };
    }, [i18n.language]);

    return (
        <div className="discover">
            {newsList.map((item, index) => (
                <div key={`discover-${index}`} className="news-item">
                    <div className="user-item">
                        <div className="user-avatar">
                            <img src={images.discover.userHead} alt="" />
                        </div>
                        <div className="user-name">Mirror</div>
                        <img className="auth-icon" src={images.discover.auth} alt="" />
                    </div>

                    <button type="button" className="news-pic" onClick={() => navigate("/vip")}>
                        <img src={discoverPicByIndex(index)} alt="" />
                    </button>

                    <div className="news-content">{item.content}</div>
                    <div className="news-time">{item.time}</div>
                </div>
            ))}

            <style jsx>{`
                .discover {
                    padding: 16px;
                    font-family: Rubik, sans-serif;
                    font-size: 12px;
                    color: #ffffff;
                }

                .news-item {
                    margin-bottom: 16px;
                }

                .user-item {
                    display: flex;
                    align-items: center;
                }

                .user-avatar {
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    overflow: hidden;
                    margin-right: 8px;
                }

                .user-avatar img {
                    width: 100%;
                    height: 100%;
                }

                .user-name {
                    font-size: 14px;
                    font-weight: 500;
                    margin-right: 8px;
                }

                .auth-icon {
                    width: 15px;
                    height: 15px;
                }

                .news-pic {
                    width: 100%;
                    margin-top: 12px;
                    padding: 0;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                }

                .news-pic img {
                    width: 100%;
                    border-radius: 10px;
                    display: block;
                }

                .news-content {
                    margin-top: 12px;
                    font-size: 13px;
                    line-height: 1.5;
                }

                .news-time {
                    font-size: 11px;
                    color: #999999;
                }
            `}</style>
        </div>
    );
}
