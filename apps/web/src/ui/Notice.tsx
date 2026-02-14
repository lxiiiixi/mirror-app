import { HTMLAttributes, forwardRef } from "react";
import { images } from "@mirror/assets";

export interface NoticeProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * 公告消息内容
     */
    message: string;

    /**
     * 点击跳转按钮的回调
     */
    onJump?: () => void;

    /**
     * 跑马灯动画持续时间（秒），默认 15 秒
     */
    duration?: number;
}

/**
 * Notice 公告组件
 * 带跑马灯效果的公告通知条
 */
export const Notice = forwardRef<HTMLDivElement, NoticeProps>(
    ({ message, onJump, duration = 15, className = "", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`notice-container text-[14px] font-semibold py-1 px-4 ${className}`}
                {...props}
            >
                {/* 左侧喇叭图标 */}
                <img className="shrink-0 w-4 h-4 mr-2" src={images.home.notice} alt="Notice" />

                {/* 跑马灯容器 */}
                <div className="marquee-container">
                    <div
                        className="marquee-text"
                        style={{
                            animationDuration: `${duration}s`,
                        }}
                    >
                        {message}
                    </div>
                </div>

                {/* 右侧跳转按钮 */}
                {onJump && (
                    <img
                        className="icon icon-jump"
                        src={images.works.backBtn}
                        alt="Jump"
                        onClick={onJump}
                    />
                )}

                <style jsx>{`
                    .notice-container {
                        color: #fff;
                        background: rgba(126, 126, 126, 0.3);
                        border-radius: 20px;
                        /* padding: 6px 2px 6px 10px; */
                        display: flex;
                        align-items: center;
                        overflow: hidden;
                        box-sizing: border-box;
                        width: 100%;
                        height: 32px;
                        max-width: 100%;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                    }

                    .icon-jump {
                        margin-right: 0;
                        margin-left: 6px;
                        transform: rotate(180deg);
                        cursor: pointer;
                        transition: transform 0.3s ease;
                    }

                    .icon-jump:hover {
                        transform: rotate(180deg) scale(1.1);
                    }

                    .marquee-container {
                        flex: 1;
                        overflow: hidden;
                        white-space: nowrap;
                    }

                    .marquee-text {
                        display: inline-block;
                        white-space: nowrap;
                        animation: marquee linear infinite;
                        padding-left: 100%;
                    }

                    @keyframes marquee {
                        0% {
                            transform: translateX(0);
                        }
                        100% {
                            transform: translateX(-100%);
                        }
                    }
                `}</style>
            </div>
        );
    },
);

Notice.displayName = "Notice";
