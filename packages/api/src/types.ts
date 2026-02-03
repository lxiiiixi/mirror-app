export type ISODateTimeString = string;
export type DateString = string;
export type DecimalString = string;
export type Int64String = string;

export interface ApiResponse<T> {
    code: number;
    msg: string;
    data: T;
}

export interface ApiMessageData {
    message: string;
}

export type Currency = "USDT" | "ENT" | "TOKEN" | string;

export interface PaginationParams {
    page?: number;
    page_size?: number;
}

export interface PaginationResponse<T> {
    list: T[];
    total: number;
    page: number;
    page_size: number;
}

export interface OptionalPaginationResponse<T> {
    list: T[];
    total: number;
}

export interface SizePaginationResponse<T> {
    list: T[];
    total: number;
    page: number;
    size: number;
}

export interface LimitPaginationParams {
    page?: number;
    limit?: number;
}

export interface PageSizeParams {
    page?: number;
    page_size?: number;
}

export interface PageSizeResponse<T> {
    list: T[];
    total: number;
    page: number;
    page_size: number;
}

export interface PageSizeOptionalResponse<T> {
    list: T[];
    total: number;
}

export interface PaginationWithPageSize<T> {
    list: T[];
    total: number;
    page: number;
    page_size: number;
}

export interface PaginationWithSize<T> {
    list: T[];
    total: number;
    page: number;
    size: number;
}

// User module types
export interface UserSolanaWalletLoginRequest {
    wallet_address: string;
    chain_id: number;
    message: string;
    sign: string;
    login_type: "wallet";
    work_invite_code?: string;
    invite_uid_code?: string;
}

export interface UserSolanaWalletLoginResponseData {
    token: string;
}

export interface UserEmailLoginRequest {
    email: string;
    code: string;
    work_invite_code?: string;
    invite_uid_code?: string;
    work_id?: number;
    invite_uid?: Int64String;
}

export interface UserEmailLoginResponseData {
    token: string;
}

export interface UserSendEmailCodeRequest {
    email: string;
    type?: number;
}

export interface UserSendEmailCodeResponseData extends ApiMessageData {}

export interface UserBindEmailRequest {
    email: string;
    code: string;
}

export interface UserBindEmailResponseData extends ApiMessageData {}

export interface UserBindWalletRequest {
    wallet_address: string;
    signature: string;
}

export interface UserBindWalletResponseData extends ApiMessageData {}

export interface UserAssetResponseData {
    token_balance: DecimalString;
    ent_balance: DecimalString;
    usdt_balance: DecimalString;
    nft_count: number;
}

export interface UserVipLevelResponseData {
    direct_invites: number;
    indirect_invites: number;
    invitee_level_distribution: {
        direct_v0: number;
        direct_v1: number;
        direct_v2: number;
        direct_v3: number;
        direct_v4: number;
        direct_v5: number;
        indirect_v0: number;
        indirect_v1: number;
        indirect_v2: number;
        indirect_v3: number;
        indirect_v4: number;
        indirect_v5: number;
        v0: number;
        v1: number;
        v2: number;
        v3: number;
        v4: number;
        v5: number;
    };
    l1_count: number;
    l2_count: number;
    level_achieved_time: ISODateTimeString;
    level_name: string;
    level_progress: {
        current_level: number;
        next_level: number;
        next_level_name: string;
        nodes_progress: {
            completed: boolean;
            current: number;
            required: number;
        };
        nodes_required: number;
        personal_nodes: number;
    };
    personal_nodes: number;
    reward_rates: {
        direct_reward_rate: number;
        indirect_reward_rate: number;
        level_bonus_rate: number;
    };
    total_nodes_purchased: number;
    upgrade_requirements: {
        description: string;
        personal_nodes: number;
    };
    user_level: number;
}
export interface UserLevelProgressResponseData {
    current_level: number;
    direct_invites: string;
    indirect_invites: string;
    next_level: number;
    next_level_progress: {
        team_user_progress: {
            current: number;
            percentage: number;
            required: number;
        };
        // 如果当前用户不是会员，只会返回上面的字段
        // 如果已经是会员了，下面还会返回另一个字段，但是这里是动态的字段
        // 比如如果我当前是 vip2，那么对我来说这里会多返回一个
        // "v2_invites_progress": {
        //     "current": 0,
        //     "percentage": 0,
        //     "required": 2
        // }
    };
    next_level_requirements: {
        description: string;
        personal_nodes: number;
    };
    user: number;
    v1_direct_count: number;
    v2_direct_count: number;
    v3_direct_count: number;
    v4_direct_count: number;
}

export type UserCheckLevelUpgradeResponseData =
    | {
          upgraded: true;
          new_level: number;
          message: string;
      }
    | {
          upgraded: false;
          current_level: number;
          message: string;
      };

export interface UserCommissionHistoryParams extends PaginationParams {}

export interface UserCommissionHistoryItem {
    id: number;
    amount: DecimalString;
    type: string;
    description: string;
    create_time: ISODateTimeString;
}

export interface UserCommissionHistoryResponseData {
    list: UserCommissionHistoryItem[];
    total: number;
    page: number;
    page_size: number;
}

export interface UserWalletRecord {
    id: number;
    uid: Int64String;
    chain_id: number;
    wallet_address: string;
    raw_wallet_address: string;
    is_primary: boolean;
}

export interface UserWalletsResponseData {
    wallets: UserWalletRecord[];
    total: number;
    bound_email?: string | null;
}

export interface UserRegionResponseData {
    country: string;
    country_name: string;
    region: string;
}

export interface UserWhitelistResponseData {
    is_invite: boolean;
    is_wallet_while: boolean;
}

export interface UserBindProfileRequest {
    username?: string;
    avatar?: string;
}

export interface UserBindProfileResponseData extends ApiMessageData {}

export interface UserNodeCountsResponseData {
    total_nodes: number;
    active_nodes: number;
    nodes_by_type: Record<string, number>;
}

// Work module types
export interface WorkListParams extends PaginationParams {
    work_type?: number;
    status?: string;
}

export interface WorkSummary {
    cover_url: string;
    creator_name: string;
    description: string;
    id: number;
    is_like: number;
    is_tread: number;
    like_count: number;
    name: string;
    share_count: number;
    token_cover_url: string;
    tread_count: number;
    type: number;
}

export interface WorkListResponseData {
    list: WorkSummary[];
    total: number;
}

export interface WorkDetailParams {
    work_id: number;
}

/** 作品详情接口公共字段（未签到 / 已签到都会返回） */
export interface WorkDetailBase {
    can_start_tge: number;
    creator_id: number;
    number_of_participants: number;
    premiere_time: string;
    share_count: number;
    show_token_border: boolean;
    token_border_type: number;
    token_cover_url: string;
    token_name: string;
    token_status: number;
    unlocked_chapter_count: number;
    work_cover_url: string;
    work_creator_name: string;
    work_description: string;
    work_name: string;
    work_total_chapter: number;
    work_type: number;

    /** 空投/推广相关（可选，后端未提供时用占位） */
    airdrop_visits?: number;
    airdrop_progress_percent?: number;
    airdrop_countdown?: string;
    airdrop_amount?: string;
    invitation_code?: string;
    invitation_link?: string;
    invited_count?: number;
    /** 制作团队（可选，已签到场景下也可用 creative_team_members） */
    production_team?: Array<{ name: string; role: string; avatar_url?: string }>;
    /** 预告/剧照视频 URL（可选） */
    trailer_video_url?: string;
}

/** 未完成签到时的返回：仅包含基础字段，无 signed_in 或 signed_in 为 false */
export interface WorkDetailBeforeSignIn extends WorkDetailBase {
    signed_in?: false;
}

/** 制作团队成员 */
export interface WorkDetailCreativeTeamMember {
    name: string;
    role: string;
    avatar_url?: string;
}

/** 完成签到后的返回：在基础字段上增加签到/邀请/团队等字段，signed_in 为 true */
export interface WorkDetailAfterSignIn extends WorkDetailBase {
    signed_in: true;
    can_show_team_btn: boolean;
    creative_team_block: unknown;
    creative_team_members: WorkDetailCreativeTeamMember[];
    ever_signed_in: boolean;
    invite_count: number;
    is_shared: boolean;
    is_tread: number;
    joined_community: boolean;
    like_count: number;
    my_invite_code: string;
    my_invite_count: number;
    my_invite_url: string;
    points_mall_url: string;
    team_sign_in_progress: string;
    team_sign_in_reward_claimed: boolean;
    token_balance: number;
    tread_count: number;
}

/**
 * 作品详情接口返回：根据是否完成签到返回不同结构。
 * 使用可辨识联合，通过 signed_in 区分：
 * - 未签到：WorkDetailBeforeSignIn（signed_in 缺失或 false）
 * - 已签到：WorkDetailAfterSignIn（signed_in === true）
 *
 * 使用示例：
 *   if (data.signed_in) {
 *     // data 被收窄为 WorkDetailAfterSignIn，可访问 my_invite_code、token_balance 等
 *   } else {
 *     // data 为 WorkDetailBeforeSignIn
 *   }
 */
export type WorkDetailResponseData = WorkDetailBeforeSignIn | WorkDetailAfterSignIn;

/** 类型守卫：判断是否为已签到状态的作品详情 */
export function isWorkDetailAfterSignIn(
    data: WorkDetailResponseData,
): data is WorkDetailAfterSignIn {
    return data.signed_in === true;
}

export interface WorkUploadRequest {
    works: Array<{
        work_name: string;
        work_type: number;
        work_introduction?: string;
    }>;
    company_name?: string;
    region?: string;
    email?: string;
    telephone?: string;
}

export interface WorkUploadResponseData extends ApiMessageData {}

export interface WorkStandardUploadRequest {
    work_name: string;
    work_type: number;
    work_introduction?: string;
}

export interface WorkStandardUploadResponseData {
    work_id: number;
    message: string;
}

export interface WorkUpdateRequest {
    work_id: number;
    work_name?: string;
    work_introduction?: string;
}

export interface WorkUpdateResponseData extends ApiMessageData {}

export interface WorkDeleteParams {
    work_id: number;
}

export interface WorkDeleteResponseData extends ApiMessageData {}

export interface WorkPurchaseRequest {
    work_id: number;
    chapterCount: number;
    currency?: Currency;
}

export type WorkPurchaseResponseData = Record<string, never>;

export interface WorkPaymentBalancesParams {
    work_id: number;
}

export interface WorkPaymentBalancesResponseData {
    token_balance: number;
    ent_balance: number;
    usdt_balance: DecimalString;
    usdt_available: DecimalString;
    chapter_price_token: number;
    chapter_price_ent: number;
}

export interface WorkChapterParams {
    work_id: number;
    chapter_id?: number;
}

export interface WorkChapterResponseData {
    // chapter_id: number;
    // content: string; // 图片或视频地址，多个地址用逗号分隔
    // content_type: number;
    // cover_url: string;
    // duration_seconds: number;
    // id: number;
    // parent_id: number;
    // title: string;
    // video_url: string;
    // create_time: string;
    // update_time: string;

    ID: number;
    ChapterId: number;
    ComicId: number;
    Title: string;
    Content: string; // 图片或视频地址，多个地址用逗号分隔
    CreateTime: string;
    UpdateTime: string;
}
export interface WorkActionRequest {
    work_id: number;
    action_type: "like" | "favorite" | "share" | string;
}

export interface WorkActionResponseData extends ApiMessageData {}

export interface WorkHotListParams extends PaginationParams {}

export interface WorkHotListResponseData {
    list: WorkSummary[];
    total: number;
    page: number;
    page_size: number;
}

export interface WorkFinishedListParams extends PaginationParams {}

export interface WorkFinishedListResponseData {
    list: WorkSummary[];
    total: number;
}

export interface WorkSignInRequest {
    work_id: number;
}

export interface WorkSignInResponseData {
    message: string;
    reward: number;
}

export interface WorkTotalParams {
    work_id: number;
}

export interface WorkTotalResponseData {
    view_count: number;
    like_count: number;
    favorite_count: number;
}

export interface WorkShareParams {
    work_id: number;
}

export interface WorkShareResponseData {
    share_url: string;
}

export interface WorkTokenInfoParams {
    work_id: number;
}

export interface WorkTokenInfoResponseData {
    token_name: string;
    token_symbol: string;
    total_supply: number;
}

export interface WorkActivityRewardsParams {
    work_id: number;
}

export interface WorkActivityRewardsResponseData {
    rewards: Array<Record<string, unknown>>;
}

export interface WorkWatchVideoRequest {
    work_id: number;
}

export interface WorkWatchVideoResponseData {
    message: string;
    reward: number;
}

export interface WorkStartIdoRequest {
    work_id: number;
    token_price: DecimalString;
    total_supply: number;
}

export interface WorkStartIdoResponseData {
    ido_id: number;
    message: string;
}

export interface WorkQueryIdoInfoRequest {
    work_id: number;
}

export interface WorkQueryIdoInfoResponseData {
    ido_id: number;
    work_id: number;
    token_price: DecimalString;
    total_supply: number;
    sold_amount: number;
    status: string;
}

export interface WorkCreateTokenRequest {
    work_id: number;
    token_name: string;
    token_symbol: string;
    total_supply: number;
}

export interface WorkCreateTokenResponseData {
    token_id: number;
    token_address: string;
    message: string;
}

export interface WorkTokenIdoListParams extends PaginationParams {}

export interface WorkTokenIdoListItem {
    ido_id: number;
    work_id: number;
    token_name: string;
    token_price: DecimalString;
    total_supply: number;
    sold_amount: number;
    status: string;
}

export interface WorkTokenIdoListResponseData {
    list: WorkTokenIdoListItem[];
    total: number;
    page: number;
    page_size: number;
}

export interface WorkBuyTokenRequest {
    ido_id: number;
    amount: number;
}

export interface WorkBuyTokenResponseData {
    order_id: string;
    token_amount: number;
    payment_amount: DecimalString;
    message: string;
}

export interface WorkAirdropInfoRequest {
    work_id: number;
}

export interface WorkAirdropInfoResponseData {
    airdrop_id: number;
    work_id: number;
    total_amount: number;
    claimed_amount: number;
    available_amount: number;
    status: string;
}

export interface WorkUnlockAirdropRequest {
    airdrop_id: number;
}

export interface WorkUnlockAirdropResponseData {
    amount: number;
    message: string;
}

export interface WorkUploadExternalLinkRequest {
    work_id: number;
    link_url: string;
    link_type: string;
}

export interface WorkUploadExternalLinkResponseData {
    link_id: number;
    message: string;
}

export interface WorkExternalLinkParams {
    work_id: number;
}

export interface WorkExternalLinkItem {
    link_id: number;
    link_url: string;
    link_type: string;
    create_time: ISODateTimeString;
}

export interface WorkExternalLinkResponseData {
    links: WorkExternalLinkItem[];
}

export interface WorkTrackPromoParams {
    promo_code?: string;
}

export interface WorkTrackPromoResponseData extends ApiMessageData {}

export interface WorkPromoStatsParams {
    promo_code?: string;
}

export interface WorkPromoStatsResponseData {
    promo_code: string;
    total_clicks: number;
    total_registrations: number;
    conversion_rate: number;
}

export interface WorkGenerateInviteCodeRequest {
    work_id: number;
}

export interface WorkInviteCodeWorkInfo {
    work_id: number;
    title: string;
    cover: string;
}

/**
 * @example
 * {
 *     "create_time": "2026-01-29T08:27:01+08:00",
 *     "invite_code": "000010",
 *     "invite_count": 0,
 *     "invite_url": "https://arts.mirror.fan/work/439?invite_code=000010",
 *     "status": 1,
 *     "uid": 1969194076459264,
 *     "work_id": 439,
 *     "work_info": {
 *         "cover": "https://testimage.mirror.fan/upload/lgn/lgn_poster1.jpeg",
 *         "title": "理工男 / SHOOT THE MOOM / 理工男",
 *         "work_id": 439
 *     }
 * }
 */
export interface WorkGenerateInviteCodeResponseData {
    uid: Int64String;
    work_id: number;
    invite_code: string;
    invite_url: string;
    invite_count: number;
    status: number;
    create_time: ISODateTimeString;
    work_info: WorkInviteCodeWorkInfo;
}

export interface WorkParseInviteCodeParams {
    code: string;
}

export interface WorkParseInviteInviterInfo {
    uid: Int64String;
    username: string;
    wallet_address: string;
}

export interface WorkParseInviteCodeResponseData {
    invite_code: string;
    work_id: number;
    invite_uid: Int64String;
    invite_count: number;
    create_time: ISODateTimeString;
    inviter_info: WorkParseInviteInviterInfo;
    work_info: WorkInviteCodeWorkInfo;
}

export interface WorkValidateInviteCodeParams {
    code: string;
}

export interface WorkValidateInviteCodeResponseData {
    valid: boolean;
    invite_code?: string;
    message?: string;
}

export interface WorkMyInviteCodesParams extends PaginationParams {}

export interface WorkMyInviteCodeItem {
    id: number;
    invite_code: string;
    work_id: number;
    work_title: string;
    work_cover: string;
    invite_count: number;
    status: number;
    create_time: ISODateTimeString;
}

export interface WorkMyInviteCodesResponseData {
    list: WorkMyInviteCodeItem[];
    total: number;
    page: number;
    size: number;
}

export interface WorkInviteStatsResponseData {
    total_codes: number;
    total_invites: number;
}

export interface WorkTopInvitersParams {
    work_id: number;
    limit?: number;
}

export interface WorkTopInviterItem {
    rank: number;
    uid: Int64String;
    username: string;
    invite_code: string;
    invite_count: number;
}

export interface WorkTopInvitersResponseData {
    work_id: number;
    top_inviters: WorkTopInviterItem[];
}

export interface WorkInviteCodesParams extends PaginationParams {
    work_id: number;
}

export interface WorkInviteCodeItem {
    invite_code: string;
    uid: Int64String;
    username: string;
    invite_count: number;
    create_time: ISODateTimeString;
}

export interface WorkInviteCodesResponseData {
    work_id: number;
    list: WorkInviteCodeItem[];
    total: number;
    page: number;
    size: number;
}

export interface WorkDisableInviteCodeRequest {
    invite_code: string;
}

export interface WorkDisableInviteCodeResponseData extends ApiMessageData {}

export interface WorkEnableInviteCodeRequest {
    invite_code: string;
}

export interface WorkEnableInviteCodeResponseData extends ApiMessageData {}

export interface WorkFinishListParams extends PaginationParams {}

export interface WorkFinishListResponseData {
    list: WorkSummary[];
    total: number;
}

export interface WorkDefaultTokenResponseData {
    token_name: string;
    token_symbol: string;
    token_address: string;
}

export interface WorkLinkListParams {
    work_id: number;
}

export interface WorkLinkListItem {
    link_id?: number;
    link_url?: string;
    link_type?: string;
    create_time?: ISODateTimeString;
    [key: string]: unknown;
}

export interface WorkLinkListResponseData {
    links: WorkLinkListItem[];
}

export interface WorkCommunityTaskRequest {
    work_id: number;
    task_type: string;
}

export interface WorkCommunityTaskResponseData {
    message: string;
    reward: number;
}

export interface WorkFriendsListParams extends PaginationParams {
    work_id: number;
}

/**
 * @example
 * {
 *     "invite": "friend@example.com",
 *     "invitation_time": "01/26/2026",
 *     "wallet_display": "FTj***bm63",
 *     "signed_in": true
 * }
 */
export interface WorkFriendItem {
    invite: string;
    invitation_time: string;
    wallet_display: string;
    signed_in: boolean;
}
export interface WorkFriendsListResponseData {
    list: WorkFriendItem[];
    total: number;
    page: number;
    page_size: number;
}

// File module types
export type UploadFile = File | Blob | { uri: string; name?: string; type?: string };

export interface FileUploadResponseData {
    url: string;
    filename: string;
}

// Node module types
export interface NodeInfoParams {
    node_id?: number;
}

export interface NodeInfoResponseData {
    price: number;
    node_total_num: number;
    power: number;
    node_remain_num: number;
    ent_issue_num: number;
    ent_release_num: number;
}

export interface NodeCurrentTierParams {
    id: number;
}

export interface NodeCurrentTierResponseData {
    node_id: number;
    current_tier_level: number;
    price: DecimalString;
    original_price: DecimalString;
    remaining_in_tier: number;
    total_in_tier: number;
    total_num: number;
}

export interface NodeTxInfoParams {
    signature: string;
}

export interface NodeTxInfoResponseData {
    signature: string;
    status: string;
    amount: DecimalString;
    create_time: ISODateTimeString;
}

export interface NodeQuoteRequest {
    node_id: number;
    num: number;
}

export interface NodeQuoteResponseData {
    quote_id: string;
    node_id: number;
    num: number;
    expected_raw_amount: number;
    expires_at: number;
}

export interface NodePurchaseRequest {
    node_id: number;
    quantity: number;
    payment_method: string;
}

/** POST /arts/node/send 请求体：客户端签名后的 USDT 交易 + 报价单 id */
export interface NodeSendRequest {
    signed_tx: string;
    quote_id: string;
    node_id: number;
    num: number;
}

export interface NodePurchaseResponseData {
    order_id: string;
    tx_signature: string;
    status: string;
}

export interface NodeTxListParams extends PaginationParams {}

export interface NodeTxListItem {
    tx_id: string;
    node_id: number;
    amount: DecimalString;
    status: string;
    create_time: ISODateTimeString;
}

export interface NodeTxListResponseData {
    list: NodeTxListItem[];
    total: number;
    page: number;
    page_size: number;
}

export interface NodePayResultParams {
    tx_id: string;
}

export interface NodePayResultResponseData {
    tx_id: string;
    status: string;
    amount: DecimalString;
    confirm_time: ISODateTimeString;
}

export interface NodePurchaseRecordsParams extends PaginationParams {}

export interface NodePurchaseRecordItem {
    record_id: number;
    node_id: number;
    quantity: number;
    amount: DecimalString;
    create_time: ISODateTimeString;
}

export interface NodePurchaseRecordsResponseData {
    list: NodePurchaseRecordItem[];
    total: number;
}

export interface NodeInviteInfoResponseData {
    total_invites: number;
    total_rewards: DecimalString;
    invite_code: string;
}

export interface NodeInviteRecordsParams extends PaginationParams {}

export interface NodeInviteRecordItem {
    address: string;
    time: ISODateTimeString;
    node_create_time: ISODateTimeString;
    is_valid: boolean;
    level: number;
    level_name: string;
    node_count: number;
    total_amount: DecimalString;
    sub_invites: NodeInviteRecordItem[];
    sub_count: number;
}

export interface NodeInviteRecordsResponseData {
    level_list: NodeInviteRecordItem[];
    first_level_count: number;
    second_level_total: number;
    total_invites: number;
    first_level_valid: number;
    second_level_valid: number;
    third_level_valid: number;
    total_valid_invites: number;
}
export interface NodeMiningRewardsParams {
    batch_id?: number;
}

export interface NodeMiningRewardItem {
    batch_id: number;
    cycle_id: number;
    reward_amount: DecimalString;
    status: string;
    claim_time: ISODateTimeString;
}

export interface CycleRewards {
    global_cycle_number: number;
    total_batches: number;
    total_settlements: number;
    base_mining_reward: number;
    level_bonus_reward: number;
    invite_reward: number;
    direct_invite_reward: number;
    indirect_invite_reward: number;
    total_reward: number;
    avg_reward_per_batch: number;
    avg_reward_per_node: number;
    settlement_time: ISODateTimeString;
}
export interface NodeMiningRewardsResponseData {
    data_source: string;
    processing_duration: number;
    request_time: ISODateTimeString;
    response_time: ISODateTimeString;
    rewards_info: {
        uid: number;
        node_count: number;
        current_global_cycle: number;
        cycle_start_time: ISODateTimeString;
        cycle_end_time: ISODateTimeString;
        latest_cycle_rewards: CycleRewards;
        today_cycle_rewards: CycleRewards;
        total_cycle_rewards: CycleRewards;
        pending_rewards: number;
        total_claimed: number;
        user_level: number;
        level_name: string;
        cycle_interval: number;
        daily_cycle_count: number;
        system_reward_info: {
            ecosystem_reward: number;
            mining_fee_reward: number;
            direct_invite_reward: number;
            indirect_invite_reward: number;
            v3_team_reward: number;
            v4_team_reward: number;
            v5_team_reward: number;
            node_owner_base_reward: number;
            total_system_reward: number;
        };
        batch_statistics: {
            active_batches: number;
            total_nodes: number;
            avg_nodes_per_batch: number;
            batch_ids: number[];
        };
    };
}
export interface NodeMiningClaimRequest {
    batch_id: number;
    cycle_id?: number;
}

export interface NodeMiningClaimResponseData {
    reward_amount: DecimalString;
    tx_signature: string;
    message: string;
}

export interface NodeMiningClaimHistoryParams extends PaginationParams {}

export interface NodeMiningClaimHistoryItem {
    claim_id: number;
    batch_id: number;
    cycle_id: number;
    reward_amount: DecimalString;
    claim_time: ISODateTimeString;
}

export interface NodeMiningClaimHistoryResponseData {
    list: NodeMiningClaimHistoryItem[];
    total: number;
    page: number;
    page_size: number;
}

export interface NodeMiningHistoryParams extends PaginationParams {}

export interface NodeMiningHistoryItem {
    mining_id: number;
    batch_id: number;
    node_id: number;
    mining_amount: DecimalString;
    mining_time: ISODateTimeString;
}

export interface NodeMiningHistoryResponseData {
    list: NodeMiningHistoryItem[];
    total: number;
}

export interface NodeMiningBatchResponseData {
    batches: Array<{
        batch_id: number;
        batch_name: string;
        start_time: ISODateTimeString;
        end_time: ISODateTimeString;
        status: string;
    }>;
}

export interface NodeMiningSchedulerResponseData {
    scheduler_status: string;
    last_run_time: ISODateTimeString;
    next_run_time: ISODateTimeString;
}

export interface NodeMiningCyclesParams {
    batch_id?: number;
}

export interface NodeMiningCyclesResponseData {
    cycles: Array<{
        cycle_id: number;
        batch_id: number;
        cycle_number: number;
        start_time: ISODateTimeString;
        end_time: ISODateTimeString;
    }>;
}

export interface NodeMiningBatchCyclesParams {
    id: number;
}

export interface NodeMiningBatchCyclesResponseData {
    batch_id: number;
    cycles: Array<{
        cycle_id: number;
        cycle_number: number;
        start_time: ISODateTimeString;
        end_time: ISODateTimeString;
        total_reward: DecimalString;
    }>;
}

// Deposit module types
export interface DepositAddressResponseData {
    address: string;
}

export interface DepositSubmitRequest {
    signed_tx: string;
}

export interface DepositSubmitResponseData {
    tx_signature: string;
    amount: number;
    status: string;
    message: string;
}

export interface DepositWithdrawRequest {
    amount: DecimalString;
    to_address: string;
    chain: string;
}

export interface DepositBalanceResponseData {
    uid: Int64String;
    balance: DecimalString;
    frozen_balance: DecimalString;
    total_income: DecimalString;
    total_expense: DecimalString;
    status: number;
}

export interface DepositHistoryParams extends LimitPaginationParams {}

export interface DepositHistoryItem {
    deposit_id: string;
    signature: string;
    amount: DecimalString;
    asset_type: string;
    status: string;
    from_address: string;
    to_address: string;
    create_time: ISODateTimeString;
    credit_time?: ISODateTimeString;
}

export interface DepositHistoryResponseData {
    list: DepositHistoryItem[];
    total: number;
}

export interface DepositStatsResponseData {
    total_deposits: number;
    total_amount: DecimalString;
    usdt_deposits: number;
    usdt_amount: DecimalString;
    ent_deposits: number;
    ent_amount: DecimalString;
}

export interface DepositWithdrawHistoryParams extends PaginationParams {}

export interface DepositWithdrawHistoryItem {
    withdraw_id: string;
    amount: DecimalString;
    to_address: string;
    status: string;
    create_time: ISODateTimeString;
    complete_time?: ISODateTimeString;
}

export interface DepositWithdrawHistoryResponseData {
    list: DepositWithdrawHistoryItem[];
    total: number;
    page: number;
    page_size: number;
}

export interface DepositWithdrawStatsResponseData {
    total_withdraws: number;
    total_amount: DecimalString;
    pending_amount: DecimalString;
    completed_amount: DecimalString;
}

export interface DepositWithdrawTxParams {
    tx_hash: string;
}

export interface DepositWithdrawTxResponseData {
    tx_hash: string;
    amount: DecimalString;
    to_address: string;
    status: string;
    create_time: ISODateTimeString;
    complete_time?: ISODateTimeString;
}

// Ticket module types
export interface TicketPurchaseRequest {
    ticket_id: number;
    quantity: number;
}

export interface TicketPurchaseResponseData {
    task_id: string;
    status: "pending" | "success" | "failed" | string;
}

export interface TicketAvailableParams extends PaginationParams {
    status?: string;
}

export interface TicketAvailableItem {
    ticket_id: number;
    ticket_name: string;
    price: DecimalString;
    remaining_quantity: number;
    total_quantity: number;
    status: string;
}

export interface TicketAvailableResponseData {
    list: TicketAvailableItem[];
    total: number;
    page: number;
    page_size: number;
}

export interface TicketDetailParams {
    ticket_id: number;
}

export interface TicketDetailResponseData {
    ticket_id: number;
    ticket_name: string;
    description: string;
    price: DecimalString;
    remaining_quantity: number;
    total_quantity: number;
    status: string;
    cover_url: string;
}

export interface TicketPurchaseResultParams {
    task_id: string;
}

export interface TicketInstanceSummary {
    instance_id: number;
    ticket_id: number;
    status: string;
    create_time: ISODateTimeString;
}

export interface TicketInstanceDetail extends TicketInstanceSummary {
    ticket_name: string;
    owner_uid: Int64String;
}

export interface TicketPurchaseResultResponseData {
    status: "pending" | "success" | "failed" | string;
    ticket_instances: TicketInstanceSummary[];
    message: string;
}

export interface TicketMyPurchasesParams extends PaginationParams {}

export interface TicketPurchaseHistoryItem {
    purchase_id: number;
    ticket_id: number;
    ticket_name: string;
    quantity: number;
    total_amount: DecimalString;
    purchase_time: ISODateTimeString;
}

export interface TicketMyPurchasesResponseData {
    list: TicketPurchaseHistoryItem[];
    total: number;
    page: number;
    page_size: number;
}

export interface TicketMyRecordResponseData {
    total_tickets: number;
    total_value: DecimalString;
    records: Array<Record<string, unknown>>;
}

export interface TicketMyHoldingsParams extends PaginationParams {
    ticket_id?: number;
}

export interface TicketHoldingItem {
    ticket_id: number;
    ticket_name: string;
    quantity: number;
    total_value: DecimalString;
}

export interface TicketMyHoldingsResponseData {
    list: TicketHoldingItem[];
    total: number;
    page: number;
    page_size: number;
}

export interface TicketMyInstancesParams {
    ticket_item_id: number;
}

export interface TicketMyInstancesResponseData {
    instances: TicketInstanceSummary[];
}

export interface TicketInstanceDetailParams {
    instance_id: number;
}

export interface TicketInstanceDetailResponseData extends TicketInstanceDetail {}

export interface TicketKlineParams {
    ticket_id: number;
    interval?: string;
    start_time?: string;
    end_time?: string;
}

export interface TicketKlineEntry {
    time: ISODateTimeString;
    open: DecimalString;
    high: DecimalString;
    low: DecimalString;
    close: DecimalString;
    volume: number;
}

export interface TicketKlineResponseData {
    ticket_id: number;
    interval: string;
    kline_data: TicketKlineEntry[];
}

export interface TicketStatsParams {
    ticket_id: number;
}

export interface TicketStatsResponseData {
    ticket_id: number;
    current_price: DecimalString;
    "24h_volume": number;
    "24h_change": DecimalString;
    total_volume: number;
    market_cap: DecimalString;
}

export interface TicketPriceChangeParams {
    ticket_id: number;
}

export interface TicketPriceChanges {
    "1h": DecimalString;
    "24h": DecimalString;
    "7d": DecimalString;
    "30d": DecimalString;
}

export interface TicketPriceChangeResponseData {
    ticket_id: number;
    price_changes: TicketPriceChanges;
}

export interface TicketMarketOverviewResponseData {
    total_tickets: number;
    total_volume: DecimalString;
    active_tickets: number;
    market_cap: DecimalString;
}

export interface TicketPresaleRegisterRequest {
    ticket_id: number;
    quantity: number;
}

export interface TicketPresaleRegisterResponseData {
    registration_id: number;
    message: string;
}

// Consignment module types
export interface ConsignmentCreateRequest {
    ticket_instance_id: number;
    price: DecimalString;
    currency: string;
}

export interface ConsignmentCreateResponseData {
    consignment_id: number;
    message: string;
}

export interface ConsignmentBatchCreateRequest {
    orders: ConsignmentCreateRequest[];
}

export interface ConsignmentBatchCreateResponseData {
    created_count: number;
    failed_count: number;
    consignment_ids: number[];
}

export interface ConsignmentCancelRequest {
    consignment_id: number;
}

export interface ConsignmentCancelResponseData extends ApiMessageData {}

export interface ConsignmentMarketParams extends PaginationParams {
    ticket_id?: number;
    sort_by?: string;
    order?: string;
}

export interface ConsignmentMarketItem {
    consignment_id: number;
    ticket_id: number;
    ticket_name: string;
    price: DecimalString;
    currency: string;
    seller_uid: Int64String;
    create_time: ISODateTimeString;
}

export interface ConsignmentMarketResponseData {
    list: ConsignmentMarketItem[];
    total: number;
    page: number;
    page_size: number;
}

export interface ConsignmentMarketStatsParams {
    ticket_id: number;
}

export interface ConsignmentMarketStatsResponseData {
    ticket_id: number;
    total_listings: number;
    lowest_price: DecimalString;
    highest_price: DecimalString;
    average_price: DecimalString;
    total_volume: DecimalString;
}

export interface ConsignmentPriceHistoryParams {
    ticket_id: number;
    days?: number;
}

export interface ConsignmentPriceHistoryItem {
    date: DateString;
    price: DecimalString;
    volume: number;
}

export interface ConsignmentPriceHistoryResponseData {
    ticket_id: number;
    price_history: ConsignmentPriceHistoryItem[];
}

export interface ConsignmentStatsAllResponseData {
    total_listings: number;
    total_volume: DecimalString;
    active_tickets: number;
}

export interface ConsignmentStatsParams {
    ticket_id: number;
}

export interface ConsignmentStatsResponseData {
    ticket_id: number;
    total_listings: number;
    total_sales: number;
    total_volume: DecimalString;
    average_price: DecimalString;
}

export interface ConsignmentMyOrdersParams extends PaginationParams {
    status?: string;
}

export interface ConsignmentMyOrderItem {
    consignment_id: number;
    ticket_id: number;
    ticket_name: string;
    price: DecimalString;
    currency: string;
    status: string;
    create_time: ISODateTimeString;
}

export interface ConsignmentMyOrdersResponseData {
    list: ConsignmentMyOrderItem[];
    total: number;
    page: number;
    page_size: number;
}

// Channel module types
export interface ChannelSubmitRequest {
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
    address?: string;
    description?: string;
}

export interface ChannelSubmitResponseData {
    application_id: number;
    message: string;
}

export interface ChannelInfoParams {
    channel_id?: number;
}

export interface ChannelInfoResponseData {
    channel_id: number;
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
    status: string;
}

// Health module types
export interface HealthQuickResponseData {
    status: string;
    timestamp: ISODateTimeString;
}

export interface HealthSummaryResponseData {
    status: string;
    database: string;
    redis: string;
    last_check: ISODateTimeString;
}

export interface HealthStatusResponseData {
    status: string;
    check_time: ISODateTimeString;
    details: {
        database: string;
        redis: string;
    };
}

export interface HealthMetricsResponseData {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    request_count: number;
    error_rate: number;
}

export interface HealthCheckResponseData {
    status: string;
    check_time: ISODateTimeString;
    details: {
        database: string;
        redis: string;
        disk: string;
    };
}

export interface HealthConsistencyResponseData {
    consistent: boolean;
    issues: unknown[];
    check_time: ISODateTimeString;
}

export interface HealthRecoveryResponseData {
    recovery_started: boolean;
    message: string;
}

export interface HealthAdminOperationRequest {
    operation: string;
    params: Record<string, unknown>;
}

export interface HealthAdminOperationResponseData extends ApiMessageData {}

// Admin module types
export interface AdminTicketCreateRequest {
    ticket_name: string;
    description: string;
    price: DecimalString;
    total_quantity: number;
    cover_url: string;
}

export interface AdminTicketCreateResponseData {
    ticket_id: number;
    message: string;
}

export interface AdminTicketUpdateStatusParams {
    id: number;
}

export interface AdminTicketUpdateStatusRequest {
    status: "active" | "inactive" | "sold_out" | string;
}

export interface AdminTicketUpdateStatusResponseData extends ApiMessageData {}

export interface AdminTicketListParams extends PaginationParams {
    status?: string;
}

export interface AdminTicketListItem {
    ticket_id: number;
    ticket_name: string;
    price: DecimalString;
    total_quantity: number;
    remaining_quantity: number;
    status: string;
}

export interface AdminTicketListResponseData {
    list: AdminTicketListItem[];
    total: number;
    page: number;
    page_size: number;
}

export interface AdminTicketDetailParams {
    id: number;
}

export interface AdminTicketDetailResponseData {
    ticket_id: number;
    ticket_name: string;
    description: string;
    price: DecimalString;
    total_quantity: number;
    remaining_quantity: number;
    status: string;
    create_time: ISODateTimeString;
}

export interface AdminTicketMarketOverviewResponseData {
    total_tickets: number;
    active_tickets: number;
    total_volume: DecimalString;
    total_sales: number;
    market_cap: DecimalString;
}

export interface AdminHoldingSnapshotParams extends PaginationParams {
    ticket_id?: number;
    date?: DateString;
}

export interface AdminHoldingSnapshotItem {
    snapshot_id: number;
    ticket_id: number;
    date: DateString;
    total_holders: number;
    total_quantity: number;
    create_time: ISODateTimeString;
}

export interface AdminHoldingSnapshotResponseData {
    list: AdminHoldingSnapshotItem[];
    total: number;
    page: number;
    page_size: number;
}

export interface AdminHoldingSnapshotExportParams {
    ticket_id?: number;
    date?: DateString;
}

export interface AdminHoldingRankingParams {
    ticket_id?: number;
    limit?: number;
}

export interface AdminHoldingRankingEntry {
    rank: number;
    uid: Int64String;
    username: string;
    quantity: number;
    percentage: number;
}

export interface AdminHoldingRankingResponseData {
    ranking: AdminHoldingRankingEntry[];
}

export interface AdminHoldingTrendsParams {
    ticket_id?: number;
    days?: number;
}

export interface AdminHoldingTrendEntry {
    date: DateString;
    total_holders: number;
    total_quantity: number;
}

export interface AdminHoldingTrendsResponseData {
    trends: AdminHoldingTrendEntry[];
}

export interface AdminHoldingStatsParams {
    ticket_id?: number;
}

export interface AdminHoldingStatsResponseData {
    total_holders: number;
    total_quantity: number;
    average_holding: number;
    top10_percentage: number;
}

export interface AdminTasksStatusResponseData {
    tasks: Array<{
        task_name: string;
        status: string;
        last_run: ISODateTimeString;
        next_run: ISODateTimeString;
    }>;
}

export interface AdminTasksRestartRequest {
    task_name: string;
}

export interface AdminTasksRestartResponseData extends ApiMessageData {}

export interface AdminTasksOverviewResponseData {
    total_tasks: number;
    running_tasks: number;
    stopped_tasks: number;
    failed_tasks: number;
}

export interface AdminKlineStatusResponseData {
    status: string;
    last_run: ISODateTimeString;
    processed_count: number;
    error_count: number;
}

export interface AdminPriceStatusResponseData {
    status: string;
    last_run: ISODateTimeString;
    updated_tickets: number;
}

export interface AdminSnapshotGenerateRequest {
    ticket_id?: number;
    date?: DateString;
}

export interface AdminSnapshotGenerateResponseData {
    snapshot_id: number;
    message: string;
}

export interface AdminSnapshotStatsResponseData {
    total_snapshots: number;
    last_snapshot_date: DateString;
    tickets_covered: number;
}

export interface AdminSnapshotRestartResponseData extends ApiMessageData {}
