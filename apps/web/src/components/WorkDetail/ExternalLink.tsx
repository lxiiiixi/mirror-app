import { useMemo } from "react";
import { images } from "@mirror/assets";

export interface ExternalLinkItem {
    link_id: number | string;
    link_url: string;
    link_type: string;
}

export interface ExternalLinkProps {
    links: ExternalLinkItem[];
}

const typeIconMap: Record<string, string> = {
    twitter: images.works.twLogo,
    x: images.works.twLogo,
    "1": images.works.twLogo,

    youtube: images.works.youtubeLogo,
    "2": images.works.youtubeLogo,

    instagram: images.works.insLogo,
    "3": images.works.insLogo,

    facebook: images.works.fbLogo,
    "4": images.works.fbLogo,

    weibo: images.works.weiboLogo,
    "5": images.works.weiboLogo,

    dc: images.works.dcLogo,
    "6": images.works.dcLogo,
};

export function ExternalLink({ links = [] }: ExternalLinkProps) {
    const mapped = useMemo(() => {
        return links
            .map(item => {
                const key = String(item.link_type);
                const icon = typeIconMap[key];
                return icon
                    ? {
                          ...item,
                          icon,
                      }
                    : null;
            })
            .filter(Boolean);
    }, [links]);

    if (mapped.length === 0) return null;

    return (
        <div className="flex justify-end gap-[10px] rounded-full bg-black/50 backdrop-blur-sm p-1.5 px-3.5">
            {mapped.map(
                item =>
                    item && (
                        <div
                            key={item.link_id}
                            className="h-[16px] cursor-pointer"
                            onClick={() =>
                                window.open(item.link_url, "_blank", "noopener,noreferrer")
                            }
                        >
                            <img className="h-full w-full" src={item.icon} alt="" />
                        </div>
                    ),
            )}
        </div>
    );
}
