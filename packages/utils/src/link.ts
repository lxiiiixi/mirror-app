export const shareToX = (text: string, isShare: boolean = true) => {
    const shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
    if (isShare) {
        window.open(shareUrl, "_blank");
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
 * @example: https://mirror.fan/work/detail/361?invite_code=00000X
 */
export const getInviteLink = (workId: number, inviteCode: string) => {
    return `${window.location.origin}/works/detail?id=${workId}&invite_code=${inviteCode}`;
};

/**
 *@description 用于在首页列表点击作品左上角按钮生成分享邀请链接的文本内容
 *@example: https://mirror.fan/works/detail?id=439&type=9&invite_uid=463559014261824
 */
export const getXForwardLink = (workId: number, userId: string, workType: number) => {
    return `${window.location.origin}/works/detail?id=${workId}&type=${workType}&invite_uid=${userId}`;
};
