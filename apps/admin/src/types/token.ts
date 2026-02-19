export type TokenStatus = "草稿" | "预热" | "销售中" | "已结束";

export interface TokenRow {
    id: string;
    name: string;
    symbol: string;
    price: number;
    raised: number;
    progress: number;
    buyers: number;
    liquidity: number;
    checkins: number;
    teams: number;
    airdrop: number;
    updatedAt: string;
    status: TokenStatus;
}

export interface TokenDetailForm {
    tokenName: string;
    symbol: string;
    contractAddress: string;
    publishRangeStart: string;
    publishRangeEnd: string;
    saleRangeStart: string;
    saleRangeEnd: string;
    issueAmount: number;
    issuePrice: number;
    minPurchase: number;
    maxPurchase: number;
    liquidityRatio: number;
    referralRatio: number;
    teamRatio: number;
    giftPointRatio: number;
    coverImage: string;
    description: string;
}

export interface StatItem {
    label: string;
    value: string;
    trend: string;
}

export interface AirdropBatch {
    id: string;
    batchNo: string;
    amount: number;
    time: string;
    status: "待执行" | "执行中" | "已完成";
}

export type LanguageValue = "zh" | "en" | "jp";

export type WorkTypeValue = "movie" | "novel" | "shortDrama" | "music";

export interface GiftCard {
    id: string;
    title: string;
    points: number;
    stock: number;
    image: string;
    status: "上架" | "下架";
    requiredFields: {
        recipient: boolean;
        phone: boolean;
        address: boolean;
    };
}

export interface ContentModule {
    id: string;
    name: string;
    enabled: boolean;
    priority: number;
}
