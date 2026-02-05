import { useMemo } from "react";
import { images } from "@mirror/assets";

export interface ExternalLinkItem {
    link_id: number | string;
    link_url: string;
    link_type: string;
}

export interface ExternalLinkProps {
    links?: ExternalLinkItem[];
}

const normalizeType = (value: string) => value.trim().toLowerCase();

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
                const key = normalizeType(item.link_type);
                const icon = typeIconMap[key];
                return icon
                    ? {
                          ...item,
                          icon,
                      }
                    : null;
            })
            .filter(Boolean) as Array<ExternalLinkItem & { icon: string }>;
    }, [links]);

    if (mapped.length === 0) return null;

    console.log(mapped);

    return (
        <div className="flex justify-end gap-[6px] rounded-full bg-black/50 backdrop-blur-sm p-1 px-2">
            {mapped.map(item => (
                <div
                    key={item.link_id}
                    className="h-[18px] w-[18px]"
                    onClick={() => window.open(item.link_url, "_blank", "noopener,noreferrer")}
                >
                    <img className="h-full w-full" src={item.icon} alt="" />
                </div>
            ))}
        </div>
    );
}
