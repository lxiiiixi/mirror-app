export const shareToX = (link: string, workName: string) => {
    if (!link) return;
    const titleSegment = workName ? `《${workName}》 ` : "";
    const text = `Exciting news! Enjoy ${titleSegment}Airdrop by Daily Check event and Share Invite Links. ${link}`;
    const shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank");
};
