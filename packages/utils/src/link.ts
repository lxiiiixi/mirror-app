const isMobile = () =>
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

/**
 * 分享到 X/Twitter：
 * - 移动端：先尝试用 app scheme 调起 X/Twitter APP（不跳转当前窗口），若无 APP 则在新标签打开网页
 * - 桌面端：直接在新标签打开 x.com 发推页
 */
export const shareToX = (text: string, workName: string, isShare: boolean = true) => {
    const titleSegment = workName ? `《${workName}》 ` : "";
    // const text = `Exciting news! Enjoy ${titleSegment} Airdrop by Daily Check event and Share Invite Links. ${link}`;
    const shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;

    if (!isShare) return shareUrl;

    if (!isMobile()) {
        window.open(shareUrl, "_blank");
        return shareUrl;
    }

    // 移动端：先尝试调起 APP（twitter:///post?message= 或 x://），不导致当前窗口跳转
    const encodedText = encodeURIComponent(text);
    const appScheme =
        typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent)
            ? `intent://twitter.com/intent/tweet?text=${encodedText}#Intent;package=com.twitter.android;scheme=https;end;`
            : `twitter://post?message=${encodedText}`;

    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    const openWebFallback = () => {
        if (fallbackTimer != null) clearTimeout(fallbackTimer);
        window.open(shareUrl, "_blank");
    };

    const onVisibilityChange = () => {
        if (document.hidden && fallbackTimer != null) {
            clearTimeout(fallbackTimer);
            fallbackTimer = null;
            document.removeEventListener("visibilitychange", onVisibilityChange);
        }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    fallbackTimer = setTimeout(() => {
        fallbackTimer = null;
        document.removeEventListener("visibilitychange", onVisibilityChange);
        openWebFallback();
    }, 2000);

    try {
        window.location.href = appScheme;
    } catch {
        openWebFallback();
    }

    return shareUrl;
};

/**
 * 详情页面分享邀请链接复制的文本内容
 * @param param0
 * @returns
 */
export const buildInviteShareText = ({
    t,
    workName,
    inviteCode,
    inviteUrl,
}: {
    t: (key: string, options?: { [key: string]: string }) => string;
    workName: string;
    inviteCode: string;
    inviteUrl: string;
}) => {
    const title = workName
        ? t("workDetail.inviteShare.title", {
              name: workName,
              defaultValue: `《${workName}》 invites you to join the Web3 entertainment revolution`,
          })
        : t("workDetail.inviteShare.titleFallback", {
              defaultValue: "Join the Web3 entertainment revolution",
          });
    const codeLine = t("workDetail.inviteShare.code", {
        code: inviteCode,
        defaultValue: `Invite Code: ${inviteCode}`,
    });
    const linkLine = t("workDetail.inviteShare.link", {
        link: inviteUrl,
        defaultValue: `Invite Link: ${inviteUrl}`,
    });
    return [title, codeLine, linkLine].join("\n");
};

/**
 * 主要用于详情页面邀请链接的生成
 * @param workId
 * @param inviteCode
 * @returns
 * @example: https://mirror.fan/works/detail?id=361&invite_code=00000X
 */
export const getInviteLink = (workId: number, inviteCode: string) => {
    const params = new URLSearchParams({
        id: String(workId),
        invite_code: inviteCode,
    });
    return `${window.location.origin}/works/detail?${params.toString()}`;
};

/**
 *@description 用于在首页列表点击作品左上角按钮生成分享邀请链接的文本内容
 *@example: https://mirror.fan/works/detail?id=439&type=9&invite_code=00000X
 */
export const getXForwardLink = (workId: number, inviteCode: string, workType: number) => {
    return `${window.location.origin}/works/detail?id=${workId}&type=${workType}&invite_code=${inviteCode}`;
};
