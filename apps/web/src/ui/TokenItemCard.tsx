import { CSSProperties, HTMLAttributes, ReactNode, forwardRef, MouseEvent } from "react";
import { images } from "@mirror/assets";
import { resolveImageUrl } from "@mirror/utils";
import { TokenAvatar } from "../components";

export interface TokenItemCardData {
    name: string;
    coverUrl: string;
    showTokenBorder: boolean;
    shareCount?: number;
    progressPercent?: number;
    progressText?: ReactNode;
    balanceText?: ReactNode;
}

export interface TokenItemCardLabels {
    person?: ReactNode;
}

export interface TokenItemCardProps extends HTMLAttributes<HTMLDivElement> {
    data: TokenItemCardData;
    labels?: TokenItemCardLabels;
    actionText?: ReactNode;
    onAction?: () => void;
    onCardClick?: () => void;
}

const defaultLabels: Required<TokenItemCardLabels> = {
    person: "Person:",
};

/**
 * TokenItemCard component
 * Mirrors TokenItemCard.vue layout
 */
export const TokenItemCard = forwardRef<HTMLDivElement, TokenItemCardProps>(
    ({ data, labels, actionText, onAction, onCardClick, className = "", ...props }, ref) => {
        const mergedLabels = { ...defaultLabels, ...labels };
        const shareCount = typeof data.shareCount === "number" ? data.shareCount : 0;

        const handleActionClick = (event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            if (onAction) {
                onAction();
            } else {
                onCardClick?.();
            }
        };

        const progressPercent = typeof data.progressPercent === "number" ? data.progressPercent : 0;

        return (
            <div
                ref={ref}
                className={`token-item-card text-[12px] ${className}`}
                onClick={onCardClick}
                style={{ "--token-progress": `${progressPercent}%` } as CSSProperties}
                {...props}
            >
                <div className="card-wrapper">
                    <div className="ticket-item-card__img-wrapper">
                        <TokenAvatar
                            src={resolveImageUrl(data.coverUrl)}
                            alt={data.name}
                            showTokenBorder={data.showTokenBorder}
                        />
                    </div>
                    <div className="ticket-item-card__content">
                        <div className="ticket-item-card__content-title">
                            <span className="name text-[16px]">{data.name}</span>
                        </div>

                        <div className="ticket-item-card__content-desc text-[12px]">
                            <div>
                                <span>{mergedLabels.person} </span>
                                <span className="value text-[13px]">{shareCount}</span>
                            </div>
                            {actionText ? (
                                <div className="btn-wrapper">
                                    <button
                                        type="button"
                                        className="buy-btn"
                                        onClick={handleActionClick}
                                    >
                                        <span className="text-[10px]">{actionText}</span>
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
                <div className="progress-wrapper">
                    <div className="progress-bar">
                        <span className="progress-fill" />
                    </div>
                    {(data.progressText || data.balanceText) && (
                        <div className="progress-info text-[10px]">
                            <div className="progress-text">{data.progressText}</div>
                            <div className="balance-text">{data.balanceText}</div>
                        </div>
                    )}
                </div>

                <style jsx>{`
                    .token-item-card {
                        font-family: var(--font-primary, "Rubik", sans-serif);
                        color: #ffffff;
                        min-height: 103px;
                        position: relative;
                        border-radius: 10px;
                        padding: 10px;
                        background: linear-gradient(
                            106deg,
                            rgba(255, 255, 255, 0.05) 22%,
                            rgba(255, 255, 255, 0.05) 36%,
                            rgba(255, 255, 255, 0.2) 97%
                        );
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        backdrop-filter: blur(50px);
                        box-shadow: inset 0 2px 2px 0 rgba(0, 0, 0, 0.25);
                    }

                    .card-wrapper {
                        display: flex;
                        gap: 10px;
                        box-sizing: border-box;
                        position: relative;
                    }

                    .ticket-item-card__img-wrapper {
                        width: 90px;
                        min-width: 90px;
                        position: relative;
                        border-radius: 4px;
                    }

                    .avatar-border {
                        margin: 0 auto 4px;
                        display: flex;
                        width: 80px;
                        height: 80px;
                        background: url(${images.works.avatarBorder}) no-repeat center / contain;
                    }

                    .cover-img {
                        margin: auto;
                        width: 65px;
                        height: 65px;
                        border: 1px solid rgba(153, 153, 153, 1);
                        border-radius: 50%;
                        object-fit: cover;
                    }

                    .ticket-item-card__content {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        position: relative;
                    }

                    .ticket-item-card__content-title {
                        display: flex;
                        justify-content: space-between;
                        font-weight: 600;
                        color: #ffffff;
                        margin-bottom: 6px;
                    }

                    .ticket-item-card__content-title .name {
                        line-height: 20px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        flex: 1;
                        display: block;
                        max-width: 225px;
                    }

                    .ticket-item-card__content-desc {
                        font-weight: 700;
                        color: #999999;
                        line-height: 18px;
                    }

                    .ticket-item-card__content-desc > div {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        margin-top: 2px;
                    }

                    .ticket-item-card__content-desc .value {
                        color: #ffffff;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                    }

                    .btn-wrapper {
                        position: absolute;
                        right: 0;
                        bottom: 0;
                    }

                    .buy-btn {
                        cursor: pointer;
                        display: flex;
                        justify-content: flex-end;
                        background: #eb1484;
                        border-radius: 4px;
                        border: none;
                        padding: 0;
                    }

                    .buy-btn > span {
                        padding: 0 10px;
                        height: 28px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        font-weight: 500;
                        color: #ffffff;
                    }

                    .progress-wrapper {
                        margin-top: 8px;
                    }

                    .progress-bar {
                        width: 100%;
                        height: 6px;
                        border-radius: 999px;
                        background: #4d4d4d;
                        overflow: hidden;
                    }

                    .progress-fill {
                        display: block;
                        height: 100%;
                        width: var(--token-progress, 0%);
                        background: linear-gradient(90deg, #05faea 0%, #7e00f5 100%);
                    }

                    .progress-info {
                        margin-top: 6px;
                        display: flex;
                        justify-content: space-between;
                        color: #999999;
                    }

                    .progress-text {
                        color: #0ee6ea;
                    }

                    .balance-text {
                        color: #999999;
                    }
                `}</style>
            </div>
        );
    },
);

TokenItemCard.displayName = "TokenItemCard";
