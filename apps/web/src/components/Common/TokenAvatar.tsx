import { HTMLAttributes } from "react";
import { images } from "@mirror/assets";
import { resolveImageUrl } from "@mirror/utils";

/** 与 postcss-pxtorem rootValue 一致，用于把设计稿 px 转为 rem，使头像随根字号 (html font-size) 缩放 */
const REM_BASE = 16;

export interface TokenAvatarProps extends HTMLAttributes<HTMLDivElement> {
    src: string;
    showTokenBorder: boolean;
    alt?: string;
    /** 设计稿尺寸（px），会转换为 rem 以随根字号缩放 */
    size?: number;
    imageSize?: number;
}

export function TokenAvatar({
    src,
    alt = "token",
    showTokenBorder,
    size = 80,
    imageSize,
    className = "",
    ...props
}: TokenAvatarProps) {
    const resolvedShowTokenBorder =
        showTokenBorder === undefined || showTokenBorder === null ? true : Boolean(showTokenBorder);
    const resolvedImageSize = imageSize ?? Math.round(size * 0.8125);
    const styleVars: Record<string, string> = {
        "--token-avatar-size": `${size / REM_BASE}rem`,
        "--token-avatar-image-size": `${resolvedImageSize / REM_BASE}rem`,
    };

    return (
        <div
            className={`token-avatar ${resolvedShowTokenBorder ? "" : "no-border"} ${className}`.trim()}
            style={styleVars}
            {...props}
        >
            <img className="cover-img" src={resolveImageUrl(src ?? "")} alt={alt} />
            <style jsx>{`
                .token-avatar {
                    margin: 0 auto;
                    display: flex;
                    width: var(--token-avatar-size);
                    height: var(--token-avatar-size);
                    background: url(${images.works.avatarBorder}) no-repeat center / contain;
                }

                .token-avatar.no-border {
                    background: none;
                    width: auto;
                    height: auto;
                }

                .token-avatar.no-border .cover-img {
                    width: auto;
                    height: auto;
                    max-width: var(--token-avatar-size);
                    max-height: var(--token-avatar-size);
                    border: none;
                    object-fit: contain;
                }

                .cover-img {
                    margin: auto;
                    width: var(--token-avatar-image-size);
                    height: var(--token-avatar-image-size);
                    border: 1px solid rgba(153, 153, 153, 1);
                    border-radius: 50%;
                    object-fit: cover;
                }
            `}</style>
        </div>
    );
}
