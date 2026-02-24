import type {
    CreativeTeamMembersItem,
    WorkDetailResponseData,
    WorkExternalLinkItem,
    WorkLinkListItem,
} from "@mirror/api";
import { isWorkDetailAfterSignIn } from "@mirror/api";
import { images } from "@mirror/assets";
import { ROUTE_PATHS } from "@mirror/routes";
import {
    getWorkNameInitials,
    isChapterEnabledWorkType,
    isTrailersStillsEnabledWorkType,
    parseMediaType,
    resolveImageUrl,
    resolveLocalizedText,
} from "@mirror/utils";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react-native";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { artsApiClient } from "../../api/artsClient";
import { GlassPanel } from "../../components/product/Common";
import { useAuth } from "../../hooks/useAuth";
import { useLoginModal } from "../../hooks/useLoginModal";
import { themeColors } from "../../theme/colors";
import { AppLayout, AutoImage } from "../../ui";
import { toImageSource } from "../../utils/imageSource";

type WorkDetailSearchParams = {
    id?: string | string[];
    type?: string | string[];
};

type LoadStatus = "idle" | "loading" | "success" | "error";
type WorkDetailTab = "chapters" | "trailersStills";
type ContentLanguage = "zh" | "en" | "zh_hant";

type TrailerCardItem = {
    id: string;
    title: string;
    videoUrl: string;
    coverUrl: string;
    durationSeconds: number;
};

type AirdropSummary = {
    total_amount: number;
    claimed_amount: number;
    available_amount: number;
};

type DirectoryItem = {
    key: string;
    type: "page" | "expand";
    page: number;
    label: string;
    locked: boolean;
};

const CONTENT_LANGUAGE_ORDER: ContentLanguage[] = ["zh", "en", "zh_hant"];

const CONTENT_LANGUAGE_SELECT_LABELS: Record<ContentLanguage, string> = {
    zh: "中文简体",
    en: "English",
    zh_hant: "中文繁体",
};

const EXTERNAL_LINK_ICON_MAP: Record<string, string | number> = {
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
    discord: images.works.dcLogo,
    dc: images.works.dcLogo,
    "6": images.works.dcLogo,
};

const DIRECTORY_PREVIEW_COUNT = 16;
const DESCRIPTION_FLOAT_PREVIEW_LENGTH = 180;

type ExpoLinearGradientModule = {
    LinearGradient?: React.ComponentType<{
        colors: string[];
        locations?: number[];
        start?: { x: number; y: number };
        end?: { x: number; y: number };
        style?: object;
    }>;
};

const HERO_LINEAR_GRADIENT_COMPONENT = (() => {
    try {
        const module = require("expo-linear-gradient") as ExpoLinearGradientModule;
        return module.LinearGradient ?? null;
    } catch {
        return null;
    }
})();

function normalizeQueryValue(value?: string | string[]) {
    if (Array.isArray(value)) {
        return (value[0] ?? "").trim();
    }
    return (value ?? "").trim();
}

function i18nToContentLanguage(input: string | undefined): ContentLanguage {
    const normalized = (input ?? "").toLowerCase().replace(/-/g, "");
    if (normalized === "zh" || normalized === "zhcn") return "zh";
    if (normalized === "zhhk" || normalized === "zhtw" || normalized === "zhhant") {
        return "zh_hant";
    }
    return "en";
}

function contentLanguageToI18n(value: ContentLanguage): string {
    if (value === "zh") return "zh-CN";
    if (value === "zh_hant") return "zh-HK";
    return "en";
}

function getAvailableContentLanguages(data: WorkDetailResponseData | null): ContentLanguage[] {
    if (!data) return [...CONTENT_LANGUAGE_ORDER];

    const hasText = (value: unknown) => typeof value === "string" && value.trim() !== "";
    const fields = [
        data.work_name,
        data.work_cover_url,
        data.work_creator_name,
        data.work_description,
    ] as Array<Record<string, unknown> | string | null | undefined>;

    const languageSet = new Set<ContentLanguage>();
    fields.forEach(field => {
        if (!field || typeof field !== "object") {
            return;
        }
        CONTENT_LANGUAGE_ORDER.forEach(language => {
            if (hasText(field[language])) {
                languageSet.add(language);
            }
        });
    });

    const available = CONTENT_LANGUAGE_ORDER.filter(language => languageSet.has(language));
    return available.length > 0 ? available : [...CONTENT_LANGUAGE_ORDER];
}

function formatInviteShareText({
    workName,
    inviteCode,
    inviteUrl,
}: {
    workName: string;
    inviteCode: string;
    inviteUrl: string;
}) {
    const title = workName
        ? `《${workName}》 invites you to join the Web3 entertainment revolution`
        : "Join the Web3 entertainment revolution";

    const codeLine = inviteCode ? `Invite Code: ${inviteCode}` : "";
    const linkLine = inviteUrl ? `Invite Link: ${inviteUrl}` : "";

    return [title, codeLine, linkLine].filter(Boolean).join("\n");
}

function isLikelyImageUrl(value: string) {
    const normalized = value.trim();
    if (!normalized) return false;
    if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(normalized)) return true;
    if (/^(https?:)?\/\//i.test(normalized) && !/\s/.test(normalized)) return true;
    return false;
}

function WorkDetailExternalLinks({
    links,
    onPress,
}: {
    links: WorkExternalLinkItem[];
    onPress: (url: string) => void;
}) {
    const mappedLinks = useMemo(
        () =>
            links
                .map(link => {
                    const key = String(link.link_type).toLowerCase();
                    const icon = EXTERNAL_LINK_ICON_MAP[key];
                    return icon
                        ? {
                              id: String(link.id),
                              icon,
                              url: link.link_url,
                          }
                        : null;
                })
                .filter(Boolean) as Array<{ id: string; icon: string | number; url: string }>,
        [links],
    );

    if (mappedLinks.length === 0) {
        return null;
    }

    return (
        <View style={styles.externalLinkWrap}>
            {mappedLinks.map(item => (
                <Pressable
                    key={item.id}
                    style={styles.externalLinkButton}
                    onPress={() => onPress(item.url)}
                >
                    <Image
                        source={toImageSource(item.icon)}
                        style={styles.externalLinkIcon}
                        resizeMode="contain"
                    />
                </Pressable>
            ))}
        </View>
    );
}

function WorkDetailHeroGradient() {
    if (!HERO_LINEAR_GRADIENT_COMPONENT) {
        return <View style={styles.heroGradientFallback} pointerEvents="none" />;
    }

    const LinearGradientComponent = HERO_LINEAR_GRADIENT_COMPONENT;
    return (
        <LinearGradientComponent
            colors={["#030620", "rgba(13, 25, 134, 0.1)"]}
            locations={[0.1, 0.8]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={styles.heroGradient}
        />
    );
}

function splitDescriptionForFloatView(description: string) {
    const normalized = description.trim();
    if (!normalized) {
        return { preview: "", remain: "" };
    }

    if (normalized.length <= DESCRIPTION_FLOAT_PREVIEW_LENGTH) {
        return { preview: normalized, remain: "" };
    }

    const segment = normalized.slice(0, DESCRIPTION_FLOAT_PREVIEW_LENGTH);
    const lastSpace = segment.lastIndexOf(" ");
    const splitAt = lastSpace > 0 ? lastSpace : DESCRIPTION_FLOAT_PREVIEW_LENGTH;

    return {
        preview: normalized.slice(0, splitAt).trimEnd(),
        remain: normalized.slice(splitAt).trimStart(),
    };
}

function WorkDetailContentLanguageSelect({
    value,
    availableLanguages,
    onChange,
}: {
    value: ContentLanguage;
    availableLanguages: ContentLanguage[];
    onChange: (value: ContentLanguage) => void;
}) {
    const [open, setOpen] = useState(false);
    const options = useMemo(
        () =>
            availableLanguages.map(option => ({
                value: option,
                label: CONTENT_LANGUAGE_SELECT_LABELS[option],
            })),
        [availableLanguages],
    );
    const selectedLabel = options.find(option => option.value === value)?.label ?? "中文简体";

    useEffect(() => {
        setOpen(false);
    }, [value]);

    return (
        <View style={styles.contentLangSelectWrap}>
            <Pressable
                onPress={() => setOpen(prev => !prev)}
                style={styles.contentLangTrigger}
                accessibilityRole="button"
                accessibilityLabel="Select content language"
                accessibilityState={{ expanded: open }}
            >
                <Text style={styles.contentLangTriggerText}>{selectedLabel}</Text>
                <ChevronDown
                    size={12}
                    color="#ffffff"
                    strokeWidth={2.4}
                    style={open ? styles.contentLangTriggerArrowOpen : undefined}
                />
            </Pressable>

            {open ? (
                <View style={styles.contentLangDropdown}>
                    {options.map(option => {
                        const selected = option.value === value;
                        return (
                            <Pressable
                                key={option.value}
                                onPress={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                }}
                            >
                                {({ pressed }) => (
                                    <View
                                        style={[
                                            styles.contentLangOption,
                                            selected && styles.contentLangOptionSelected,
                                            pressed && styles.contentLangOptionPressed,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.contentLangOptionText,
                                                selected && styles.contentLangOptionTextSelected,
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                        {selected ? (
                                            <View style={styles.contentLangSelectedIconWrap}>
                                                <Text style={styles.contentLangSelectedIconText}>
                                                    ✓
                                                </Text>
                                            </View>
                                        ) : null}
                                    </View>
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            ) : null}
        </View>
    );
}

function WorkDetailDirectory({
    total,
    unlocked,
    active,
    onPressPage,
}: {
    total: number;
    unlocked: number;
    active: number;
    onPressPage: (page: number, locked: boolean) => void;
}) {
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        setShowAll(false);
    }, [total]);

    const items = useMemo<DirectoryItem[]>(() => {
        if (!total || total <= 1) {
            return [];
        }

        const shouldShowAll = showAll || total <= DIRECTORY_PREVIEW_COUNT;
        if (shouldShowAll) {
            return Array.from({ length: total }, (_, index) => {
                const page = index + 1;
                return {
                    key: `page-${page}`,
                    type: "page",
                    page,
                    label: String(page),
                    locked: page > unlocked,
                };
            });
        }

        return Array.from({ length: DIRECTORY_PREVIEW_COUNT }, (_, index) => {
            const page = index + 1;
            if (page === DIRECTORY_PREVIEW_COUNT) {
                return {
                    key: "expand",
                    type: "expand",
                    page,
                    label: "...",
                    locked: false,
                };
            }

            return {
                key: `preview-${page}`,
                type: "page",
                page,
                label: String(page),
                locked: page > unlocked,
            };
        });
    }, [showAll, total, unlocked]);

    if (items.length === 0) {
        return null;
    }

    return (
        <View style={styles.directoryGrid}>
            {items.map(item => {
                const isActive = item.page === active && item.type === "page";
                return (
                    <Pressable
                        key={item.key}
                        style={[styles.directoryItem, isActive && styles.directoryItemActive]}
                        onPress={() => {
                            if (item.type === "expand") {
                                setShowAll(true);
                                return;
                            }
                            onPressPage(item.page, item.locked);
                        }}
                    >
                        {item.locked ? (
                            <Image
                                source={toImageSource(images.works.lock)}
                                style={styles.directoryLock}
                                resizeMode="contain"
                            />
                        ) : null}
                        <Text style={styles.directoryText}>{item.label}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

export default function WorksDetailPage() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const params = useLocalSearchParams<WorkDetailSearchParams>();
    const { isLoggedIn, token } = useAuth();
    const { openModal } = useLoginModal();

    const defaultContentLanguage = i18nToContentLanguage(i18n.resolvedLanguage ?? i18n.language);
    const [contentLanguage, setContentLanguage] = useState<ContentLanguage>(defaultContentLanguage);

    const [status, setStatus] = useState<LoadStatus>("idle");
    const [errorText, setErrorText] = useState("");
    const [workData, setWorkData] = useState<WorkDetailResponseData | null>(null);

    const [externalLinks, setExternalLinks] = useState<WorkExternalLinkItem[]>([]);
    const [inviteCode, setInviteCode] = useState("");
    const [inviteUrl, setInviteUrl] = useState("");
    const [isCopySuccess, setIsCopySuccess] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [airdropInfo, setAirdropInfo] = useState<AirdropSummary | null>(null);

    const [activeTab, setActiveTab] = useState<WorkDetailTab>("chapters");
    const [activeChapter, setActiveChapter] = useState(1);
    const [chapterLoading, setChapterLoading] = useState(false);
    const [chapterText, setChapterText] = useState("");
    const [chapterImages, setChapterImages] = useState<string[]>([]);
    const [chapterMediaLinks, setChapterMediaLinks] = useState<
        Array<{ kind: string; url: string }>
    >([]);

    const [trailersLoading, setTrailersLoading] = useState(false);
    const [trailers, setTrailers] = useState<TrailerCardItem[]>([]);
    const [stills, setStills] = useState<string[]>([]);

    const [showCountdown, setShowCountdown] = useState(false);
    const [airdropStartText, setAirdropStartText] = useState("");
    const [countdownParts, setCountdownParts] = useState<[string, string, string, string]>([
        "00",
        "00",
        "00",
        "00",
    ]);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);

    const shareResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const workId = useMemo(() => Number(normalizeQueryValue(params.id)), [params.id]);
    const queryType = useMemo(() => Number(normalizeQueryValue(params.type)), [params.type]);
    const isValidWorkId = Number.isFinite(workId) && workId > 0;

    const languageKey = i18n.resolvedLanguage ?? i18n.language ?? "en";

    const availableLanguages = useMemo(() => getAvailableContentLanguages(workData), [workData]);

    useEffect(() => {
        if (!availableLanguages.includes(contentLanguage)) {
            setContentLanguage(availableLanguages[0] ?? "en");
        }
    }, [availableLanguages, contentLanguage]);

    const detailWorkType = Number(workData?.work_type ?? queryType ?? 0) || 0;
    const showChaptersTab = isChapterEnabledWorkType(detailWorkType);
    const showTrailersTab = isTrailersStillsEnabledWorkType(detailWorkType);

    const tabKeys = useMemo<WorkDetailTab[]>(() => {
        const list: WorkDetailTab[] = [];
        if (showChaptersTab) list.push("chapters");
        if (showTrailersTab) list.push("trailersStills");
        return list;
    }, [showChaptersTab, showTrailersTab]);

    useEffect(() => {
        if (!tabKeys.includes(activeTab)) {
            setActiveTab(tabKeys[0] ?? "chapters");
        }
    }, [activeTab, tabKeys]);

    const resolvedCoverUrl = useMemo(() => {
        const language = contentLanguageToI18n(contentLanguage);
        return resolveImageUrl(resolveLocalizedText(workData?.work_cover_url, language));
    }, [contentLanguage, workData?.work_cover_url]);

    const resolvedWorkName = useMemo(() => {
        const language = contentLanguageToI18n(contentLanguage);
        return resolveLocalizedText(workData?.work_name, language);
    }, [contentLanguage, workData?.work_name]);

    const resolvedCreatorName = useMemo(() => {
        const language = contentLanguageToI18n(contentLanguage);
        return resolveLocalizedText(workData?.work_creator_name, language);
    }, [contentLanguage, workData?.work_creator_name]);

    const resolvedDescription = useMemo(() => {
        const language = contentLanguageToI18n(contentLanguage);
        return resolveLocalizedText(workData?.work_description, language);
    }, [contentLanguage, workData?.work_description]);
    const expandedDescriptionParts = useMemo(
        () => splitDescriptionForFloatView(resolvedDescription),
        [resolvedDescription],
    );

    useEffect(() => {
        setDescriptionExpanded(false);
    }, [
        contentLanguage,
        resolvedDescription,
        resolvedCoverUrl,
        resolvedCreatorName,
        resolvedWorkName,
    ]);

    const heroCoverUrl = useMemo(
        () => resolveImageUrl(resolveLocalizedText(workData?.work_cover_url, languageKey)),
        [languageKey, workData?.work_cover_url],
    );

    const tokenAvatarUrl = useMemo(() => {
        const tokenCover = resolveImageUrl(workData?.token_cover_url ?? "");
        if (tokenCover) return tokenCover;
        return heroCoverUrl;
    }, [heroCoverUrl, workData?.token_cover_url]);

    const tokenTitle = useMemo(() => {
        const initials = getWorkNameInitials(resolveLocalizedText(workData?.work_name, "en"));
        if (!initials) {
            return (workData?.token_name || "Token").trim() || "Token";
        }
        return `${initials}s`;
    }, [workData?.token_name, workData?.work_name]);

    const signedInToday = Boolean(
        workData && isWorkDetailAfterSignIn(workData) && workData.signed_in,
    );

    const fetchWorkDetail = useCallback(
        async (silent = false) => {
            if (!isValidWorkId) {
                setStatus("error");
                setErrorText(
                    t("workDetail.invalidId", {
                        defaultValue: "Invalid work id",
                    }),
                );
                return;
            }

            if (!silent) {
                setStatus("loading");
            }

            try {
                const response = await artsApiClient.work.detail({ work_id: workId });
                setWorkData(response.data);
                setStatus("success");
                setErrorText("");
            } catch (error) {
                console.error("[WorkDetail] work.detail failed", error);
                setStatus("error");
                setErrorText(
                    t("common.requestFailed", {
                        defaultValue: "Load failed. Please try again.",
                    }),
                );
            }
        },
        [isValidWorkId, t, workId],
    );

    useEffect(() => {
        void fetchWorkDetail(false);
    }, [fetchWorkDetail, token]);

    useEffect(() => {
        if (!isValidWorkId) {
            setExternalLinks([]);
            return;
        }

        let active = true;
        void artsApiClient.work
            .getExternalLinks({ work_id: workId })
            .then(response => {
                if (!active) return;
                setExternalLinks(response.data ?? []);
            })
            .catch(error => {
                console.error("[WorkDetail] external links failed", error);
                if (!active) return;
                setExternalLinks([]);
            });

        return () => {
            active = false;
        };
    }, [isValidWorkId, workId]);

    const fetchAirdropAndInviteData = useCallback(async () => {
        if (!isValidWorkId || !isLoggedIn) {
            setInviteCode("");
            setInviteUrl("");
            setAirdropInfo(null);
            return;
        }

        const [inviteResult, airdropResult] = await Promise.allSettled([
            artsApiClient.work.generateInviteCode({ work_id: workId }),
            artsApiClient.work.getAirdropInfo({ work_id: workId }),
        ]);

        if (inviteResult.status === "fulfilled") {
            const payload = inviteResult.value.data;
            setInviteCode(String(payload?.invite_code ?? ""));
            setInviteUrl(String(payload?.invite_url ?? ""));
        } else {
            console.error("[WorkDetail] generateInviteCode failed", inviteResult.reason);
            const signedInDetail = workData && isWorkDetailAfterSignIn(workData) ? workData : null;
            if (signedInDetail) {
                setInviteCode(String(signedInDetail.my_invite_code ?? ""));
                setInviteUrl(String(signedInDetail.my_invite_url ?? ""));
            }
        }

        if (airdropResult.status === "fulfilled") {
            const payload = airdropResult.value.data;
            setAirdropInfo({
                total_amount: Number(payload?.total_amount ?? 0),
                claimed_amount: Number(payload?.claimed_amount ?? 0),
                available_amount: Number(payload?.available_amount ?? 0),
            });
        } else {
            console.error("[WorkDetail] getAirdropInfo failed", airdropResult.reason);
            setAirdropInfo(null);
        }
    }, [isLoggedIn, isValidWorkId, workData, workId]);

    useEffect(() => {
        void fetchAirdropAndInviteData();
    }, [fetchAirdropAndInviteData, token]);

    useEffect(() => {
        if (!workData?.airdrop_start_time) {
            setShowCountdown(false);
            setAirdropStartText("");
            setCountdownParts(["00", "00", "00", "00"]);
            return;
        }

        const targetTime = Date.parse(workData.airdrop_start_time);
        if (!Number.isFinite(targetTime) || targetTime <= Date.now()) {
            setShowCountdown(false);
            setAirdropStartText("");
            setCountdownParts(["00", "00", "00", "00"]);
            return;
        }

        const startDate = new Date(targetTime);
        const month = String(startDate.getMonth() + 1);
        const day = String(startDate.getDate());
        const hour = String(startDate.getHours()).padStart(2, "0");
        const minute = String(startDate.getMinutes()).padStart(2, "0");

        setAirdropStartText(
            t("workDetail.airdropStartsAt", {
                month,
                day,
                hour,
                minute,
                defaultValue: `Airdrop starts at ${month}/${day} ${hour}:${minute}`,
            }),
        );

        const tick = () => {
            const now = Date.now();
            const remainSeconds = Math.max(0, Math.floor((targetTime - now) / 1000));
            if (remainSeconds <= 0) {
                setShowCountdown(false);
                return;
            }

            setShowCountdown(true);
            const days = Math.floor(remainSeconds / 86400);
            const hours = Math.floor((remainSeconds % 86400) / 3600);
            const minutes = Math.floor((remainSeconds % 3600) / 60);
            const seconds = remainSeconds % 60;
            setCountdownParts(
                [days, hours, minutes, seconds].map(part => String(part).padStart(2, "0")) as [
                    string,
                    string,
                    string,
                    string,
                ],
            );
        };

        tick();
        const timer = setInterval(tick, 1000);
        return () => {
            clearInterval(timer);
        };
    }, [t, workData?.airdrop_start_time]);

    useEffect(() => {
        return () => {
            if (shareResetTimerRef.current) {
                clearTimeout(shareResetTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (activeTab !== "chapters" || !isValidWorkId || !showChaptersTab || !workData) {
            return;
        }

        let active = true;
        setChapterLoading(true);

        void artsApiClient.work
            .getChapter({
                work_id: workId,
                chapter_id: activeChapter,
            })
            .then(response => {
                if (!active) return;

                const contentRaw = String(response.data?.Content ?? "").trim();
                if (!contentRaw) {
                    setChapterText("");
                    setChapterImages([]);
                    setChapterMediaLinks([]);
                    return;
                }

                const parsedMedia = parseMediaType(contentRaw);
                const imageMedia = parsedMedia
                    .filter(item => item.kind === "image")
                    .map(item => resolveImageUrl(item.url))
                    .filter(Boolean);

                const externalMedia = parsedMedia
                    .filter(item => item.kind !== "image")
                    .map(item => ({ kind: item.kind, url: resolveImageUrl(item.url) }))
                    .filter(item => item.url);

                if (imageMedia.length > 0 || externalMedia.length > 0) {
                    setChapterImages(imageMedia);
                    setChapterMediaLinks(externalMedia);
                    setChapterText("");
                    return;
                }

                const parts = contentRaw
                    .split(",")
                    .map(part => part.trim())
                    .filter(Boolean);
                const imageParts = parts
                    .filter(isLikelyImageUrl)
                    .map(part => resolveImageUrl(part));

                if (imageParts.length > 0 && imageParts.length === parts.length) {
                    setChapterImages(imageParts);
                    setChapterMediaLinks([]);
                    setChapterText("");
                    return;
                }

                setChapterText(contentRaw);
                setChapterImages([]);
                setChapterMediaLinks([]);
            })
            .catch(error => {
                console.error("[WorkDetail] getChapter failed", error);
                if (!active) return;
                setChapterText("");
                setChapterImages([]);
                setChapterMediaLinks([]);
            })
            .finally(() => {
                if (!active) return;
                setChapterLoading(false);
            });

        return () => {
            active = false;
        };
    }, [activeChapter, activeTab, isValidWorkId, showChaptersTab, workData, workId]);

    useEffect(() => {
        if (activeTab !== "trailersStills" || !isValidWorkId || !showTrailersTab) {
            return;
        }

        let active = true;
        setTrailersLoading(true);

        void artsApiClient.work
            .getLinkList({ work_id: workId })
            .then(response => {
                if (!active) return;

                const list = response.data ?? [];
                const trailerList: TrailerCardItem[] = [];
                const stillList: string[] = [];
                const stillSet = new Set<string>();

                list.forEach((item: WorkLinkListItem) => {
                    const trailerUrl = resolveImageUrl(item.video_url);
                    if (trailerUrl) {
                        trailerList.push({
                            id: String(item.id ?? trailerUrl),
                            title: item.title || "",
                            videoUrl: trailerUrl,
                            coverUrl: resolveImageUrl(item.cover_url),
                            durationSeconds: Number(item.duration_seconds ?? 0),
                        });
                    }

                    const fromContent = String(item.content ?? "")
                        .split(",")
                        .map(part => part.trim())
                        .filter(part => /^https?:\/\//i.test(part))
                        .map(part => resolveImageUrl(part));

                    const stillCandidates = [...fromContent];
                    const coverUrl = resolveImageUrl(item.cover_url);
                    if (coverUrl) {
                        stillCandidates.push(coverUrl);
                    }

                    stillCandidates.forEach(url => {
                        if (!url || stillSet.has(url)) return;
                        stillSet.add(url);
                        stillList.push(url);
                    });
                });

                setTrailers(trailerList);
                setStills(stillList);
            })
            .catch(error => {
                console.error("[WorkDetail] getLinkList failed", error);
                if (!active) return;
                setTrailers([]);
                setStills([]);
            })
            .finally(() => {
                if (!active) return;
                setTrailersLoading(false);
            });

        return () => {
            active = false;
        };
    }, [activeTab, isValidWorkId, showTrailersTab, workId]);

    const openExternalUrl = useCallback(async (url: string) => {
        const normalizedUrl = resolveImageUrl(url);
        if (!normalizedUrl) {
            return;
        }

        try {
            await Linking.openURL(normalizedUrl);
        } catch (error) {
            console.error("[WorkDetail] open url failed", error);
            Alert.alert("Error", "Unable to open link");
        }
    }, []);

    const handleBack = useCallback(() => {
        if (router.canGoBack()) {
            router.back();
            return;
        }
        router.replace(ROUTE_PATHS.home);
    }, [router]);

    const handleCheckIn = useCallback(async () => {
        if (!isValidWorkId || isSigningIn) return;

        if (!isLoggedIn) {
            openModal();
            return;
        }

        if (signedInToday) {
            Alert.alert(
                t("productShare.checked", { defaultValue: "Checked" }),
                t("workDetail.signedToday", {
                    defaultValue: "You have already checked in today.",
                }),
            );
            return;
        }

        setIsSigningIn(true);
        try {
            await artsApiClient.work.signIn({ work_id: workId });
            Alert.alert(
                t("common.success", { defaultValue: "Success" }),
                t("workDetail.checkInSuccess", {
                    defaultValue: "Checked in successfully.",
                }),
            );
            await Promise.all([fetchWorkDetail(true), fetchAirdropAndInviteData()]);
        } catch (error) {
            console.error("[WorkDetail] signIn failed", error);
            Alert.alert(
                t("common.error", { defaultValue: "Error" }),
                t("workDetail.checkInFailed", {
                    defaultValue: "Check in failed, please try again.",
                }),
            );
        } finally {
            setIsSigningIn(false);
        }
    }, [
        fetchAirdropAndInviteData,
        fetchWorkDetail,
        isLoggedIn,
        isSigningIn,
        isValidWorkId,
        openModal,
        signedInToday,
        t,
        workId,
    ]);

    const currentInviteCode =
        inviteCode ||
        (workData && isWorkDetailAfterSignIn(workData)
            ? String(workData.my_invite_code ?? "")
            : "");

    const currentInviteUrl =
        inviteUrl ||
        (workData && isWorkDetailAfterSignIn(workData) ? String(workData.my_invite_url ?? "") : "");

    const inviteCount =
        workData && isWorkDetailAfterSignIn(workData) ? Number(workData.my_invite_count ?? 0) : 0;

    const handleCopyInvite = useCallback(async () => {
        if (!currentInviteUrl) {
            Alert.alert(
                t("common.error", { defaultValue: "Error" }),
                t("workDetail.noInviteLink", {
                    defaultValue: "Invitation link is not available yet",
                }),
            );
            return;
        }

        const shareText = formatInviteShareText({
            workName: resolvedWorkName,
            inviteCode: currentInviteCode,
            inviteUrl: currentInviteUrl,
        });

        try {
            if (
                typeof navigator !== "undefined" &&
                navigator.clipboard &&
                typeof navigator.clipboard.writeText === "function"
            ) {
                await navigator.clipboard.writeText(shareText);
            } else {
                await Share.share({ message: shareText });
            }
            setIsCopySuccess(true);
            if (shareResetTimerRef.current) {
                clearTimeout(shareResetTimerRef.current);
            }
            shareResetTimerRef.current = setTimeout(() => {
                setIsCopySuccess(false);
            }, 2200);
        } catch (error) {
            console.error("[WorkDetail] copy invite failed", error);
            Alert.alert(
                t("common.error", { defaultValue: "Error" }),
                t("workDetail.copyFailed", {
                    defaultValue: "Copy failed. Please try again.",
                }),
            );
        }
    }, [currentInviteCode, currentInviteUrl, resolvedWorkName, t]);

    const handleShareInvite = useCallback(async () => {
        if (!isLoggedIn) {
            openModal();
            return;
        }

        if (!currentInviteUrl || isSharing || !isValidWorkId) {
            return;
        }

        setIsSharing(true);
        try {
            const shareText = formatInviteShareText({
                workName: resolvedWorkName,
                inviteCode: currentInviteCode,
                inviteUrl: currentInviteUrl,
            });

            await Share.share({ message: shareText });
            await artsApiClient.work.share({ work_id: workId });
            await fetchWorkDetail(true);
        } catch (error) {
            console.error("[WorkDetail] share failed", error);
            Alert.alert(
                t("common.error", { defaultValue: "Error" }),
                t("workDetail.shareFailed", {
                    defaultValue: "Share failed. Please try again.",
                }),
            );
        } finally {
            setIsSharing(false);
        }
    }, [
        currentInviteCode,
        currentInviteUrl,
        fetchWorkDetail,
        isLoggedIn,
        isSharing,
        isValidWorkId,
        openModal,
        resolvedWorkName,
        t,
        workId,
    ]);

    const handleOpenInvited = useCallback(() => {
        if (!isLoggedIn) {
            openModal();
            return;
        }

        Alert.alert(t("workDetail.invited", { defaultValue: "Invited" }), `${inviteCount}`);
    }, [inviteCount, isLoggedIn, openModal, t]);

    const handleOpenPointsMall = useCallback(() => {
        if (!isLoggedIn) {
            openModal();
            return;
        }

        router.push(
            `${ROUTE_PATHS.pointsRedemption}?work_id=${encodeURIComponent(String(workId))}` as never,
        );
    }, [isLoggedIn, openModal, router, workId]);

    const handlePressDirectoryPage = useCallback(
        (page: number, locked: boolean) => {
            if (locked) {
                Alert.alert(
                    t("workDetail.lockedChapter", { defaultValue: "Locked chapter" }),
                    t("workDetail.lockedChapterHint", {
                        defaultValue: "This chapter is not unlocked yet.",
                    }),
                );
                return;
            }
            setActiveChapter(page);
        },
        [t],
    );

    const progressPercent = useMemo(() => {
        const total = Number(airdropInfo?.total_amount ?? 0);
        const claimed = Number(airdropInfo?.claimed_amount ?? 0);
        if (total <= 0) return 0;
        return Math.max(0, Math.min(100, Math.round((claimed / total) * 100)));
    }, [airdropInfo?.claimed_amount, airdropInfo?.total_amount]);

    if (status === "loading" || status === "idle") {
        return (
            <AppLayout showWalletBar={false} showFooter={false} autoHideHeaderOnScroll={false}>
                <View style={styles.standaloneTopBar}>
                    <Pressable style={styles.heroBackButton} onPress={handleBack}>
                        <Image
                            source={toImageSource(images.works.backBtn)}
                            style={styles.heroBackIcon}
                            resizeMode="contain"
                        />
                    </Pressable>
                </View>
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={themeColors.primary} />
                </View>
            </AppLayout>
        );
    }

    if (status === "error" || !workData) {
        return (
            <AppLayout showWalletBar={false} showFooter={false} autoHideHeaderOnScroll={false}>
                <View style={styles.standaloneTopBar}>
                    <Pressable style={styles.heroBackButton} onPress={handleBack}>
                        <Image
                            source={toImageSource(images.works.backBtn)}
                            style={styles.heroBackIcon}
                            resizeMode="contain"
                        />
                    </Pressable>
                </View>
                <View style={styles.errorWrap}>
                    <Text style={styles.errorText}>{errorText || t("ticket.empty")}</Text>
                </View>
            </AppLayout>
        );
    }

    const displayBalancePrefix =
        isWorkDetailAfterSignIn(workData) && workData.ever_signed_in
            ? `${Number(workData.token_balance ?? 0)} `
            : "";

    return (
        <AppLayout showWalletBar={false} showFooter={false} autoHideHeaderOnScroll={false}>
            <View style={styles.heroSection}>
                {heroCoverUrl ? (
                    <Image
                        source={toImageSource(heroCoverUrl)}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.heroFallback} />
                )}
                <WorkDetailHeroGradient />
                <View style={styles.heroTopBar}>
                    <Pressable style={styles.heroBackButton} onPress={handleBack}>
                        <Image
                            source={toImageSource(images.works.backBtn)}
                            style={styles.heroBackIcon}
                            resizeMode="contain"
                        />
                    </Pressable>
                    <WorkDetailExternalLinks links={externalLinks} onPress={openExternalUrl} />
                </View>

                <View style={styles.heroContent}>
                    <View style={styles.tokenAvatarWrap}>
                        {tokenAvatarUrl ? (
                            <Image
                                source={toImageSource(tokenAvatarUrl)}
                                style={styles.tokenAvatar}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.tokenAvatarFallback} />
                        )}
                    </View>

                    <Text style={styles.tokenTitle}>
                        {displayBalancePrefix}
                        {tokenTitle}
                    </Text>

                    <Pressable
                        style={[styles.checkInButton, signedInToday && styles.checkInButtonActive]}
                        onPress={() => void handleCheckIn()}
                        disabled={isSigningIn}
                    >
                        <Text style={styles.checkInButtonText}>
                            {isSigningIn
                                ? t("common.loading", { defaultValue: "Loading..." })
                                : signedInToday
                                  ? t("productShare.checked", { defaultValue: "Checked" })
                                  : t("workDetail.checkIn", { defaultValue: "Check in +5" })}
                        </Text>
                    </Pressable>
                </View>
            </View>

            <View style={styles.airdropSection}>
                {showCountdown ? (
                    <View style={styles.countdownWrap}>
                        <View style={styles.countdownRow}>
                            {countdownParts.map((part, index) => (
                                <View key={`countdown-${index}`} style={styles.countdownCellWrap}>
                                    <View style={styles.countdownCell}>
                                        <Text style={styles.countdownCellText}>{part}</Text>
                                    </View>
                                    {index < countdownParts.length - 1 ? (
                                        <Text style={styles.countdownColon}>:</Text>
                                    ) : null}
                                </View>
                            ))}
                        </View>
                        {airdropStartText ? (
                            <Text style={styles.countdownHint}>{airdropStartText}</Text>
                        ) : null}
                    </View>
                ) : null}

                <View style={styles.progressHeader}>
                    <Text style={styles.progressHeaderText}>
                        {t("workDetail.airdropAmount", { defaultValue: "Airdrop Amount" })}:{" "}
                        {Number(airdropInfo?.total_amount ?? 0).toLocaleString()}
                    </Text>
                    <Text style={styles.progressHeaderText}>
                        {t("workDetail.visits", { defaultValue: "There have been" })}:{" "}
                        {Number(workData.number_of_participants ?? 0).toLocaleString()}
                    </Text>
                </View>

                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                    <Text style={styles.progressLabel}>
                        {t("workDetail.progress", { defaultValue: "Progress" })}: {progressPercent}%
                    </Text>
                </View>

                <GlassPanel style={styles.invitePanel}>
                    {isLoggedIn ? (
                        <>
                            <Text style={styles.inviteLine}>
                                {t("workDetail.invitationCode", {
                                    defaultValue: "Invitation Code",
                                })}
                                : {currentInviteCode || "--"}
                            </Text>
                            <View style={styles.inviteDivider} />
                            <View style={styles.inviteLinkRow}>
                                <Text numberOfLines={1} style={styles.inviteLineFlex}>
                                    {t("workDetail.invitationLink", {
                                        defaultValue: "Invitation Link",
                                    })}
                                    : {currentInviteUrl || "--"}
                                </Text>
                                <Pressable
                                    style={styles.copyButton}
                                    onPress={() => void handleCopyInvite()}
                                >
                                    <Text style={styles.copyButtonText}>
                                        {isCopySuccess
                                            ? t("common.success", { defaultValue: "Copied" })
                                            : t("account.copy", { defaultValue: "Copy" })}
                                    </Text>
                                </Pressable>
                            </View>
                        </>
                    ) : (
                        <Pressable onPress={openModal}>
                            <Text style={styles.loginHintText}>
                                {t("workDetail.loginToShowInviteLink", {
                                    defaultValue: "Log in to view invitation link",
                                })}
                            </Text>
                        </Pressable>
                    )}
                </GlassPanel>

                <View style={styles.actionRow}>
                    <Pressable
                        style={[styles.actionButton, styles.actionButtonPrimary]}
                        onPress={() => void handleShareInvite()}
                        disabled={isSharing}
                    >
                        <Text style={styles.actionButtonText}>
                            {isSharing
                                ? t("common.loading", { defaultValue: "Loading..." })
                                : t("workDetail.shareOnX", { defaultValue: "Share on X" })}
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.actionButton, styles.actionButtonPrimary]}
                        onPress={handleOpenInvited}
                    >
                        <Text style={styles.actionButtonText}>
                            {inviteCount} {t("workDetail.invited", { defaultValue: "Invited" })}
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.actionButton, styles.actionButtonPrimary]}
                        onPress={handleOpenPointsMall}
                    >
                        <Text style={styles.actionButtonText}>
                            {t("workDetail.pointsMall", { defaultValue: "Points Mall" })}
                        </Text>
                    </Pressable>
                </View>
            </View>

            <View style={styles.productInfoCard}>
                <View style={styles.productLangSelectRow}>
                    <WorkDetailContentLanguageSelect
                        value={contentLanguage}
                        availableLanguages={availableLanguages}
                        onChange={setContentLanguage}
                    />
                </View>

                {!descriptionExpanded ? (
                    <View style={styles.productInfoRow}>
                        <View style={styles.productCoverWrap}>
                            {resolvedCoverUrl ? (
                                <Image
                                    source={toImageSource(resolvedCoverUrl)}
                                    style={styles.productCover}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.productCoverFallback} />
                            )}
                        </View>

                        <View style={styles.productTextCard}>
                            <Text numberOfLines={1} style={styles.productTitle}>
                                {resolvedWorkName || "-"}
                            </Text>
                            <Text numberOfLines={1} style={styles.productAuthor}>
                                {resolvedCreatorName || "-"}
                            </Text>
                            <Pressable onPress={() => setDescriptionExpanded(true)}>
                                <Text numberOfLines={7} style={styles.productDescription}>
                                    {resolvedDescription || "-"}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                ) : (
                    <View style={styles.productExpandedWrap}>
                        <View style={styles.productFloatImageWrap}>
                            {resolvedCoverUrl ? (
                                <Image
                                    source={toImageSource(resolvedCoverUrl)}
                                    style={styles.productCover}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.productCoverFallback} />
                            )}
                        </View>
                        <View style={styles.productExpandedTextCard}>
                            <Text style={styles.productExpandedTitle}>
                                {resolvedWorkName || "-"}
                            </Text>
                            <Text style={styles.productExpandedAuthor}>
                                {resolvedCreatorName || "-"}
                            </Text>
                            <Pressable onPress={() => setDescriptionExpanded(false)}>
                                <Text style={styles.productExpandedDescTop}>
                                    {expandedDescriptionParts.preview || "-"}
                                </Text>
                                {expandedDescriptionParts.remain ? (
                                    <Text style={styles.productExpandedDescBottom}>
                                        {expandedDescriptionParts.remain}
                                    </Text>
                                ) : null}
                            </Pressable>
                        </View>
                    </View>
                )}
            </View>

            {Array.isArray(workData.creative_team_members) &&
            workData.creative_team_members.length > 0 ? (
                <View style={styles.teamSection}>
                    <Text style={styles.sectionTitle}>
                        {t("workDetail.productionTeam", { defaultValue: "Production Team" })}
                    </Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.teamRowContent}
                        style={styles.teamRowScroll}
                    >
                        {workData.creative_team_members.map(
                            (member: CreativeTeamMembersItem, index) => {
                                const memberName =
                                    resolveLocalizedText(member.name, languageKey) || "-";
                                const memberRole =
                                    resolveLocalizedText(member.role, languageKey) || "-";
                                const memberAvatar = resolveImageUrl(member.avatar_url || "");

                                return (
                                    <View key={`${memberName}-${index}`} style={styles.teamItem}>
                                        <View style={styles.teamAvatarWrap}>
                                            {memberAvatar ? (
                                                <Image
                                                    source={toImageSource(memberAvatar)}
                                                    style={styles.teamAvatar}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View style={styles.teamAvatarFallback} />
                                            )}
                                        </View>
                                        <Text numberOfLines={1} style={styles.teamName}>
                                            {memberName}
                                        </Text>
                                        <Text numberOfLines={1} style={styles.teamRole}>
                                            {memberRole}
                                        </Text>
                                    </View>
                                );
                            },
                        )}
                    </ScrollView>
                </View>
            ) : null}

            {tabKeys.length > 0 ? (
                <View style={styles.contentSection}>
                    <View style={styles.tabRow}>
                        {tabKeys.map(tab => {
                            const selected = tab === activeTab;
                            return (
                                <Pressable
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    style={styles.tabPressable}
                                >
                                    <Text
                                        style={[styles.tabLabel, selected && styles.tabLabelActive]}
                                    >
                                        {tab === "chapters"
                                            ? t("workDetail.chapters", { defaultValue: "Chapters" })
                                            : t("workDetail.trailersStills", {
                                                  defaultValue: "Trailers & Stills",
                                              })}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {activeTab === "chapters" ? (
                        <>
                            <WorkDetailDirectory
                                total={Number(workData.work_total_chapter ?? 0)}
                                unlocked={Number(workData.unlocked_chapter_count ?? 0)}
                                active={activeChapter}
                                onPressPage={handlePressDirectoryPage}
                            />

                            {chapterLoading ? (
                                <View style={styles.blockLoadingWrap}>
                                    <ActivityIndicator size="small" color={themeColors.primary} />
                                </View>
                            ) : null}

                            {chapterImages.length > 0 ? (
                                <View style={styles.chapterImagesWrap}>
                                    {chapterImages.map((url, index) => (
                                        <View
                                            key={`${url}-${index}`}
                                            style={styles.chapterImageItem}
                                        >
                                            <AutoImage source={toImageSource(url)} />
                                        </View>
                                    ))}
                                </View>
                            ) : null}

                            {chapterText ? (
                                <Text style={styles.chapterText}>{chapterText}</Text>
                            ) : null}

                            {chapterMediaLinks.length > 0 ? (
                                <View style={styles.chapterMediaWrap}>
                                    {chapterMediaLinks.map((item, index) => (
                                        <Pressable
                                            key={`${item.kind}-${index}`}
                                            style={styles.chapterMediaButton}
                                            onPress={() => void openExternalUrl(item.url)}
                                        >
                                            <Text style={styles.chapterMediaButtonText}>
                                                {t("workDetail.openMedia", {
                                                    defaultValue: "Open {{type}}",
                                                    type: item.kind,
                                                })}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ) : null}

                            {!chapterLoading &&
                            chapterImages.length === 0 &&
                            !chapterText &&
                            chapterMediaLinks.length === 0 ? (
                                <Text style={styles.emptyText}>
                                    {t("ticket.empty", { defaultValue: "No content" })}
                                </Text>
                            ) : null}
                        </>
                    ) : null}

                    {activeTab === "trailersStills" ? (
                        <>
                            {trailersLoading ? (
                                <View style={styles.blockLoadingWrap}>
                                    <ActivityIndicator size="small" color={themeColors.primary} />
                                </View>
                            ) : null}

                            {!trailersLoading && trailers.length > 0 ? (
                                <View style={styles.trailerList}>
                                    {trailers.map(item => (
                                        <GlassPanel key={item.id} style={styles.trailerCard}>
                                            {item.coverUrl ? (
                                                <View style={styles.trailerCoverWrap}>
                                                    <AutoImage
                                                        source={toImageSource(item.coverUrl)}
                                                    />
                                                </View>
                                            ) : null}

                                            <View style={styles.trailerInfoRow}>
                                                <Text numberOfLines={1} style={styles.trailerTitle}>
                                                    {item.title ||
                                                        t("workDetail.trailer", {
                                                            defaultValue: "Trailer",
                                                        })}
                                                </Text>
                                                <Text style={styles.trailerDuration}>
                                                    {item.durationSeconds > 0
                                                        ? `${item.durationSeconds}s`
                                                        : t("workDetail.durationUnknown", {
                                                              defaultValue: "Unknown",
                                                          })}
                                                </Text>
                                            </View>

                                            <Pressable
                                                style={styles.trailerOpenButton}
                                                onPress={() => void openExternalUrl(item.videoUrl)}
                                            >
                                                <Text style={styles.trailerOpenButtonText}>
                                                    {t("workDetail.watchTrailer", {
                                                        defaultValue: "Open trailer",
                                                    })}
                                                </Text>
                                            </Pressable>
                                        </GlassPanel>
                                    ))}
                                </View>
                            ) : null}

                            {!trailersLoading && stills.length > 0 ? (
                                <View style={styles.stillsWrap}>
                                    {stills.map((url, index) => (
                                        <View key={`${url}-${index}`} style={styles.stillItem}>
                                            <AutoImage source={toImageSource(url)} />
                                        </View>
                                    ))}
                                </View>
                            ) : null}

                            {!trailersLoading && trailers.length === 0 && stills.length === 0 ? (
                                <Text style={styles.emptyText}>
                                    {t("workDetail.trailersEmpty", {
                                        defaultValue: "No media yet",
                                    })}
                                </Text>
                            ) : null}
                        </>
                    ) : null}
                </View>
            ) : null}
        </AppLayout>
    );
}

const styles = StyleSheet.create({
    // 无 hero 场景的顶部操作行
    standaloneTopBar: {
        minHeight: 36,
        justifyContent: "center",
    },
    // 加载状态容器
    loadingWrap: {
        minHeight: 280,
        alignItems: "center",
        justifyContent: "center",
    },
    // 错误状态容器
    errorWrap: {
        minHeight: 280,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    // 错误文案
    errorText: {
        color: "#c0c1c7",
        fontSize: 16,
        textAlign: "center",
    },

    // 头部外部链接容器
    externalLinkWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderRadius: 16,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    // 头部外部链接按钮
    externalLinkButton: {
        width: 16,
        height: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    // 头部外部链接图标
    externalLinkIcon: {
        width: 16,
        height: 16,
    },

    // 顶部 hero 区
    heroSection: {
        marginHorizontal: -15,
        marginTop: -10,
        height: 310,
        overflow: "hidden",
        position: "relative",
    },
    // hero 背景图
    heroImage: {
        ...StyleSheet.absoluteFillObject,
        width: "100%",
        height: "100%",
    },
    // hero 兜底背景
    heroFallback: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#030620",
    },
    // hero 渐变遮罩
    heroGradient: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: -2,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.08)",
    },
    // hero 渐变遮罩降级背景
    heroGradientFallback: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: -2,
        backgroundColor: "rgba(3,6,32,0.5)",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.08)",
    },
    // hero 顶部导航层（返回 + 社交图标）
    heroTopBar: {
        position: "absolute",
        top: 12,
        left: 16,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 20,
    },
    // hero 返回按钮
    heroBackButton: {
        width: 32,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    // hero 返回图标
    heroBackIcon: {
        width: 20,
        height: 20,
    },
    // hero 内容容器
    heroContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 28,
        gap: 10,
    },
    // token 头像外层
    tokenAvatarWrap: {
        width: 130,
        height: 130,
        borderRadius: 65,
        padding: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.4)",
        backgroundColor: "rgba(0,0,0,0.32)",
        alignItems: "center",
        justifyContent: "center",
    },
    // token 头像
    tokenAvatar: {
        width: 112,
        height: 112,
        borderRadius: 56,
    },
    // token 头像兜底
    tokenAvatarFallback: {
        width: 112,
        height: 112,
        borderRadius: 56,
        backgroundColor: "rgba(255,255,255,0.22)",
    },
    // hero 标题
    tokenTitle: {
        color: "#ffffff",
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
    },
    // 签到按钮
    checkInButton: {
        minHeight: 36,
        paddingHorizontal: 16,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: themeColors.primary,
    },
    // 签到按钮激活态
    checkInButtonActive: {
        backgroundColor: "#1da2b4",
    },
    // 签到按钮文字
    checkInButtonText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "700",
    },

    // 空投区容器
    airdropSection: {
        marginTop: -20,
        gap: 10,
    },
    // 倒计时容器
    countdownWrap: {
        alignItems: "center",
        gap: 6,
    },
    // 倒计时行
    countdownRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    // 倒计时单元外层
    countdownCellWrap: {
        flexDirection: "row",
        alignItems: "center",
    },
    // 倒计时单元
    countdownCell: {
        minWidth: 54,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E358FF",
        backgroundColor: "rgba(24, 8, 48, 0.9)",
        alignItems: "center",
    },
    // 倒计时单元数字
    countdownCellText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "700",
    },
    // 倒计时冒号
    countdownColon: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "700",
        marginHorizontal: 5,
    },
    // 倒计时提示文案
    countdownHint: {
        color: "rgba(255,255,255,0.72)",
        fontSize: 12,
    },
    // 进度信息头部
    progressHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },
    // 进度信息文案
    progressHeaderText: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "500",
    },
    // 进度条轨道
    progressTrack: {
        position: "relative",
        height: 22,
        borderRadius: 999,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.22)",
        justifyContent: "center",
        alignItems: "center",
    },
    // 进度条填充
    progressFill: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: "#df3cae",
    },
    // 进度文案
    progressLabel: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "500",
        zIndex: 1,
    },

    // 邀请信息面板
    invitePanel: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
        backgroundColor: "rgba(84, 7, 80, 0.62)",
        borderColor: "rgba(255,255,255,0.2)",
    },
    // 邀请信息单行文字
    inviteLine: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "600",
    },
    // 邀请信息分割线
    inviteDivider: {
        width: "100%",
        height: 1,
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    // 邀请链接行
    inviteLinkRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    // 邀请链接文案
    inviteLineFlex: {
        flex: 1,
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "500",
    },
    // 复制按钮
    copyButton: {
        minWidth: 52,
        height: 28,
        paddingHorizontal: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.5)",
        alignItems: "center",
        justifyContent: "center",
    },
    // 复制按钮文案
    copyButtonText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "700",
    },
    // 未登录提示文案
    loginHintText: {
        color: "#ffffff",
        fontSize: 14,
        textAlign: "center",
        fontWeight: "600",
    },

    // 空投操作按钮行
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    // 空投操作按钮
    actionButton: {
        flex: 1,
        minHeight: 34,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.45)",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    // 空投主按钮
    actionButtonPrimary: {
        borderColor: "transparent",
        backgroundColor: themeColors.primary,
    },
    // 空投操作按钮文案
    actionButtonText: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "700",
    },

    // 作品信息卡片
    productInfoCard: {
        position: "relative",
    },
    // 作品语言选择行
    productLangSelectRow: {
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 10,
    },
    // 作品语言选择器容器
    contentLangSelectWrap: {
        position: "relative",
        minWidth: 90,
        zIndex: 30,
    },
    // 作品语言触发按钮
    contentLangTrigger: {
        height: 24,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.72)",
        paddingHorizontal: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        backgroundColor: "rgba(255,255,255,0.05)",
    },
    // 作品语言触发按钮文案
    contentLangTriggerText: {
        color: "#ffffff",
        fontSize: 11,
        fontWeight: "600",
    },
    // 作品语言触发箭头展开态
    contentLangTriggerArrowOpen: {
        transform: [{ rotate: "180deg" }],
    },
    // 作品语言下拉面板
    contentLangDropdown: {
        position: "absolute",
        top: "100%",
        right: 0,
        marginTop: 3,
        minWidth: 94,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        backgroundColor: "rgba(40, 38, 70, 0.98)",
        paddingVertical: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.32,
        shadowRadius: 16,
        elevation: 10,
    },
    // 作品语言下拉选项
    contentLangOption: {
        width: "100%",
        minHeight: 30,
        paddingHorizontal: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
    },
    // 作品语言下拉选项选中态
    contentLangOptionSelected: {
        backgroundColor: "rgba(255,255,255,0.15)",
    },
    // 作品语言下拉选项按压态
    contentLangOptionPressed: {
        backgroundColor: "rgba(255,255,255,0.15)",
    },
    // 作品语言下拉选项文案
    contentLangOptionText: {
        color: "#ffffff",
        fontSize: 11,
        fontWeight: "500",
    },
    // 作品语言下拉选项文案选中态
    contentLangOptionTextSelected: {
        fontWeight: "700",
    },
    // 作品语言下拉选中图标容器
    contentLangSelectedIconWrap: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.75)",
        alignItems: "center",
        justifyContent: "center",
    },
    // 作品语言下拉选中图标文字
    contentLangSelectedIconText: {
        color: "#ffffff",
        fontSize: 9,
        fontWeight: "700",
        lineHeight: 10,
    },

    // 作品信息行
    productInfoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    // 作品封面容器
    productCoverWrap: {
        width: 120,
        minWidth: 120,
        borderRadius: 6,
        overflow: "hidden",
    },
    // 作品封面
    productCover: {
        width: "100%",
        aspectRatio: 3 / 4,
        backgroundColor: "#f5f5f5",
    },
    // 作品封面兜底
    productCoverFallback: {
        width: "100%",
        aspectRatio: 3 / 4,
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    // 作品文字内容容器
    productTextCard: {
        flex: 1,
        gap: 6,
    },
    // 作品标题
    productTitle: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
        lineHeight: 22,
        paddingRight: 75,
    },
    // 作品作者
    productAuthor: {
        color: "rgba(255,255,255,0.70)",
        fontSize: 12,
        lineHeight: 16,
    },
    // 作品简介
    productDescription: {
        color: "rgba(255,255,255,0.70)",
        fontSize: 12,
        lineHeight: 16,
    },
    // 展开态内容容器
    productExpandedWrap: {
        position: "relative",
        minHeight: 190,
    },
    // 展开态浮动封面容器
    productFloatImageWrap: {
        position: "absolute",
        left: 0,
        top: 0,
        width: 120,
        borderRadius: 6,
        overflow: "hidden",
    },
    // 展开态文案卡片
    productExpandedTextCard: {
        gap: 6,
    },
    // 展开态标题（环绕在图片右侧）
    productExpandedTitle: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
        lineHeight: 22,
        paddingRight: 75,
        paddingBottom: 6,
        marginLeft: 132,
    },
    // 展开态作者（环绕在图片右侧）
    productExpandedAuthor: {
        color: "rgba(255,255,255,0.70)",
        fontSize: 12,
        lineHeight: 16,
        paddingBottom: 6,
        marginLeft: 132,
    },
    // 展开态描述上半部分（环绕在图片右侧）
    productExpandedDescTop: {
        color: "rgba(255,255,255,0.70)",
        fontSize: 12,
        lineHeight: 16,
        marginLeft: 132,
    },
    // 展开态描述下半部分（全宽，在图片下方）
    productExpandedDescBottom: {
        color: "rgba(255,255,255,0.70)",
        fontSize: 12,
        lineHeight: 16,
        marginTop: 20,
    },

    // 制作团队区容器
    teamSection: {
        gap: 10,
    },
    // 通用模块标题
    sectionTitle: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "700",
    },
    // 制作团队横向滚动
    teamRowScroll: {
        marginHorizontal: -4,
    },
    teamRowContent: {
        flexDirection: "row",
        gap: 8,
        paddingRight: 16,
        paddingBottom: 8,
    },
    // 制作团队单项
    teamItem: {
        width: 72,
        alignItems: "center",
        gap: 4,
    },
    // 制作团队头像容器
    teamAvatarWrap: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: "hidden",
        backgroundColor: "#d9d9d9",
    },
    // 制作团队头像
    teamAvatar: {
        width: "100%",
        height: "100%",
    },
    // 制作团队头像兜底
    teamAvatarFallback: {
        width: "100%",
        height: "100%",
        backgroundColor: "#a5a5a5",
    },
    // 制作团队成员名称
    teamName: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
        width: "100%",
    },
    // 制作团队成员角色
    teamRole: {
        color: "#aeb1ce",
        fontSize: 12,
        textAlign: "center",
        width: "100%",
    },

    // 内容区容器
    contentSection: {
        gap: 12,
        paddingBottom: 14,
    },
    // 内容标签行（无背景无边框，与 web Details 一致）
    tabRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    tabPressable: {
        paddingVertical: 4,
    },
    // 内容标签文案
    tabLabel: {
        color: "#AEB1CE",
        fontSize: 18,
        fontWeight: "600",
    },
    // 内容标签文案激活态
    tabLabelActive: {
        color: "#ffffff",
    },

    // 目录网格
    directoryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    // 目录单元
    directoryItem: {
        width: 36,
        height: 36,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: "#606170",
        backgroundColor: "#060820",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    // 目录单元激活态
    directoryItemActive: {
        borderColor: "transparent",
        backgroundColor: themeColors.primary,
    },
    // 目录锁图标
    directoryLock: {
        width: 8,
        height: 8,
        position: "absolute",
        top: 4,
        right: 4,
    },
    // 目录文字
    directoryText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },

    // 内容块加载态容器
    blockLoadingWrap: {
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    // 章节图片列表容器
    chapterImagesWrap: {
        gap: 10,
    },
    // 章节单张图片容器
    chapterImageItem: {
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    // 章节正文文本
    chapterText: {
        color: "#aeb2ce",
        fontSize: 15,
        lineHeight: 22,
    },
    // 章节媒体链接列表
    chapterMediaWrap: {
        gap: 8,
    },
    // 章节媒体链接按钮
    chapterMediaButton: {
        minHeight: 38,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.35)",
        alignItems: "center",
        justifyContent: "center",
    },
    // 章节媒体链接按钮文案
    chapterMediaButtonText: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "600",
    },

    // 预告列表容器
    trailerList: {
        gap: 10,
    },
    // 预告卡片
    trailerCard: {
        borderRadius: 10,
        padding: 10,
        gap: 8,
        backgroundColor: "rgba(21, 18, 60, 0.65)",
        borderColor: "rgba(255,255,255,0.2)",
    },
    // 预告封面容器
    trailerCoverWrap: {
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    // 预告信息行
    trailerInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    // 预告标题
    trailerTitle: {
        flex: 1,
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
    // 预告时长
    trailerDuration: {
        color: "rgba(255,255,255,0.64)",
        fontSize: 12,
    },
    // 预告打开按钮
    trailerOpenButton: {
        minHeight: 34,
        borderRadius: 8,
        backgroundColor: themeColors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    // 预告打开按钮文案
    trailerOpenButtonText: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "700",
    },

    // 剧照列表容器
    stillsWrap: {
        gap: 10,
    },
    // 剧照单项容器
    stillItem: {
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.08)",
    },

    // 空数据文案
    emptyText: {
        color: "rgba(255,255,255,0.64)",
        fontSize: 14,
        textAlign: "center",
        paddingVertical: 14,
    },
});
