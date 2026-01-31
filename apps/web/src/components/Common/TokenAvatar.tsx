import { HTMLAttributes } from "react";
import { images } from "@mirror/assets";
import { resolveImageUrl } from "@mirror/utils";

export interface TokenAvatarProps extends HTMLAttributes<HTMLDivElement> {
    src: string;
    showTokenBorder: boolean;
    alt?: string;
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
        "--token-avatar-size": `${size}px`,
        "--token-avatar-image-size": `${resolvedImageSize}px`,
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
