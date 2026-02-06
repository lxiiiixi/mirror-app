export const shareToX = (link: string, workName: string, customText?: string) => {
    if (!customText && !link) return;
    const titleSegment = workName ? `《${workName}》 ` : "";
    const defaultText = `Exciting news! Enjoy ${titleSegment}Airdrop by Daily Check event and Share Invite Links. ${link}`;
    const text = customText ?? defaultText;
    const shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank");
};

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

export const getInviteLink = (workId: number, inviteCode: string) => {
    return `${window.location.origin}/work/${workId}?invite_code=${inviteCode}`;
};
