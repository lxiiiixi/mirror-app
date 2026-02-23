import type { WorkSummary } from "@mirror/api";
import { images } from "@mirror/assets";
import {
    getWorkTypeByValue,
    goToWorkDetail,
    isTokenWork,
    resolveImageUrl,
    resolveLocalizedText,
} from "@mirror/utils";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from "react-native";
import { artsApiClient } from "../api/artsClient";
import { MainTabsLayout } from "../layouts/MainTabsLayout";
import { HomeBanner, HomeNotice, ProductCard, ProductCardCarousel, type ProductData } from "../components";
import { useTranslation } from "react-i18next";
import { themeColors } from "../theme/colors";
import { ProjectTabs, type ProjectTabItem } from "../ui";

const PAGE_SIZE = 12;
const LOAD_MORE_THRESHOLD = 260;

type HomeProductData = ProductData & {
    isToken: boolean;
};

const getSeedFromId = (id: string | number) => {
    if (typeof id === "number") return Math.abs(id);
    return Array.from(String(id)).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
};

const getCardAspectRatio = (id: string | number) => {
    const seed = getSeedFromId(id) % 3;
    if (seed === 0) return 0.62;
    if (seed === 1) return 0.72;
    return 0.82;
};

const splitWaterfallColumns = <T extends { id: string | number; description?: string }>(items: T[]) => {
    const left: T[] = [];
    const right: T[] = [];
    let leftWeight = 0;
    let rightWeight = 0;

    items.forEach((item) => {
        const seedWeight = (getSeedFromId(item.id) % 5) * 0.08;
        const descWeight = Math.min((item.description?.length ?? 0) / 120, 0.22);
        const weight = 1 + seedWeight + descWeight;

        if (leftWeight <= rightWeight) {
            left.push(item);
            leftWeight += weight;
            return;
        }

        right.push(item);
        rightWeight += weight;
    });

    return { left, right };
};

export default function HomeRoutePage() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [activeProject, setActiveProject] = useState(0);
    const [workList, setWorkList] = useState<WorkSummary[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [lastFetchedCount, setLastFetchedCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [errorText, setErrorText] = useState("");
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const inFlightRef = useRef(false);
    const languageKey = i18n.resolvedLanguage ?? i18n.language ?? "en";

    const tabs = useMemo<ProjectTabItem[]>(
        () => [
            {
                key: "rwa",
                label: "RWA",
                iconSrc: images.home.tokenTab2,
            },
            {
                key: "token",
                label: t("works.tokenFilter.metaToken", { defaultValue: "Token" }),
                iconSrc: images.home.tokenTab1,
            },
        ],
        [t],
    );

    const fetchWorksPage = useCallback(
        async (targetPage: number, append: boolean) => {
            if (inFlightRef.current) return;

            inFlightRef.current = true;
            if (append) {
                setIsLoadingMore(true);
            } else {
                setIsLoading(true);
            }

            try {
                const response = await artsApiClient.work.list({
                    page: targetPage,
                    page_size: PAGE_SIZE,
                });
                const payload = response.data;
                const list = Array.isArray(payload.list) ? payload.list : [];

                setWorkList((prev) => {
                    if (!append) return list;

                    const merged = [...prev, ...list];
                    const uniqueMap = new Map<number, WorkSummary>();
                    merged.forEach((item) => {
                        if (!uniqueMap.has(item.id)) {
                            uniqueMap.set(item.id, item);
                        }
                    });
                    return Array.from(uniqueMap.values());
                });
                setPage(targetPage);
                setTotal(Number(payload.total ?? 0) || 0);
                setLastFetchedCount(list.length);
                setErrorText("");
            } catch (error) {
                console.error("[HomeRoutePage] work.list failed", error);
                setErrorText(
                    t("common.requestFailed", {
                        defaultValue: "Load failed. Please try again.",
                    }),
                );
            } finally {
                inFlightRef.current = false;
                setIsLoading(false);
                setIsLoadingMore(false);
                setHasLoadedOnce(true);
            }
        },
        [t],
    );

    useEffect(() => {
        setWorkList([]);
        setPage(1);
        setTotal(0);
        setLastFetchedCount(0);
        setErrorText("");
        setHasLoadedOnce(false);
        void fetchWorksPage(1, false);
    }, [fetchWorksPage, languageKey]);

    const hasMore = useMemo(() => {
        if (!hasLoadedOnce) return true;
        if (total > 0) return workList.length < total;
        return lastFetchedCount === PAGE_SIZE;
    }, [hasLoadedOnce, lastFetchedCount, total, workList.length]);

    const products = useMemo<HomeProductData[]>(
        () =>
            workList.map((work) => {
                const rawType = Number(work.type ?? 4) || 4;
                const name = resolveLocalizedText(work.name, languageKey) || "";
                const creatorRaw = resolveLocalizedText(work.creator_name, languageKey) || "";
                const description = resolveLocalizedText(work.description, languageKey) || "";
                const coverRaw = resolveLocalizedText(work.cover_url, languageKey) || "";
                const creators = creatorRaw
                    .split(/[/|、,，]/g)
                    .map((item) => item.trim())
                    .filter(Boolean)
                    .slice(0, 3);

                return {
                    id: work.id,
                    name: name || `#${work.id}`,
                    coverUrl: resolveImageUrl(coverRaw) || images.empty,
                    type: getWorkTypeByValue(rawType)?.type ?? "comic",
                    shareCount: Number(work.share_count ?? 0) || 0,
                    creators,
                    description,
                    isShared: Boolean(work.is_shared),
                    rawType,
                    isToken: isTokenWork(work),
                };
            }),
        [languageKey, workList],
    );

    const displayProducts = useMemo(() => {
        if (activeProject === 1) {
            return products.filter((item) => item.isToken);
        }
        return products;
    }, [activeProject, products]);

    const productSections = useMemo(() => {
        const sectionList: HomeProductData[][] = [];
        for (let i = 0; i < displayProducts.length; i += 6) {
            sectionList.push(displayProducts.slice(i, i + 6));
        }
        return sectionList;
    }, [displayProducts]);

    const navigateToDetail = useCallback(
        (id: string | number, rawType?: number) => {
            goToWorkDetail((path) => router.push(path as never), id, rawType);
        },
        [router],
    );

    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (isLoading || isLoadingMore || !hasMore) {
                return;
            }

            const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
            const isNearBottom =
                contentOffset.y + layoutMeasurement.height >=
                contentSize.height - LOAD_MORE_THRESHOLD;

            if (!isNearBottom) {
                return;
            }

            void fetchWorksPage(page + 1, true);
        },
        [fetchWorksPage, hasMore, isLoading, isLoadingMore, page],
    );

    return (
        <MainTabsLayout
            activeFooterIndex={0}
            onScroll={handleScroll}
            scrollEventThrottle={16}
        >
            <View style={styles.content}>
                <HomeNotice
                    message={t("notice.defaultMessage", {
                        defaultValue:
                            "Blessed with good luck, tickets come at your fingertips! Good luck to you!",
                    })}
                />
                <HomeBanner autoplay interval={4000} />
                <ProjectTabs
                    tabs={tabs}
                    activeIndex={activeProject}
                    onTabChange={(index) => setActiveProject(index)}
                />

                {isLoading && displayProducts.length === 0 ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color={themeColors.primary} />
                    </View>
                ) : null}

                {!isLoading && displayProducts.length === 0 ? (
                    <View style={styles.placeholderWrap}>
                        <Text style={styles.placeholderText}>
                            {errorText ||
                                t("ticket.empty", {
                                    defaultValue: "No items yet.",
                                })}
                        </Text>
                    </View>
                ) : null}

                {displayProducts.length > 0 ? (
                    <View style={styles.productSectionList}>
                        {productSections.map((section, sectionIndex) => (
                            <View key={`section-${sectionIndex}`} style={styles.sectionBlock}>
                                <ProductCardCarousel
                                    products={section}
                                    autoplay
                                    autoplayInterval={5000}
                                    onProductPress={(product) => navigateToDetail(product.id, product.rawType)}
                                />

                                {(() => {
                                    const columns = splitWaterfallColumns(section);
                                    return (
                                        <View style={styles.waterfallRow}>
                                            <View style={styles.waterfallCol}>
                                                {columns.left.map((product, index) => (
                                                    <View
                                                        key={`card-left-${product.id}-${index}`}
                                                        style={styles.waterfallItem}
                                                    >
                                                        <ProductCard
                                                            product={product}
                                                            style={{
                                                                aspectRatio: getCardAspectRatio(
                                                                    product.id,
                                                                ),
                                                            }}
                                                            onPress={(item) =>
                                                                navigateToDetail(
                                                                    item.id,
                                                                    item.rawType,
                                                                )
                                                            }
                                                        />
                                                    </View>
                                                ))}
                                            </View>
                                            <View style={styles.waterfallCol}>
                                                {columns.right.map((product, index) => (
                                                    <View
                                                        key={`card-right-${product.id}-${index}`}
                                                        style={styles.waterfallItem}
                                                    >
                                                        <ProductCard
                                                            product={product}
                                                            style={{
                                                                aspectRatio: getCardAspectRatio(
                                                                    product.id,
                                                                ),
                                                            }}
                                                            onPress={(item) =>
                                                                navigateToDetail(
                                                                    item.id,
                                                                    item.rawType,
                                                                )
                                                            }
                                                        />
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    );
                                })()}
                            </View>
                        ))}
                    </View>
                ) : null}

                {isLoadingMore ? (
                    <View style={styles.loadMoreWrap}>
                        <ActivityIndicator size="small" color={themeColors.primary} />
                    </View>
                ) : null}
            </View>
        </MainTabsLayout>
    );
}

const styles = StyleSheet.create({
    content: {
        gap: 12,
    },
    productSectionList: {
        gap: 14,
        paddingBottom: 8,
    },
    sectionBlock: {
        gap: 10,
    },
    waterfallRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    waterfallCol: {
        width: "49%",
    },
    waterfallItem: {
        width: "100%",
        marginBottom: 12,
    },
    loadingWrap: {
        minHeight: 220,
        alignItems: "center",
        justifyContent: "center",
    },
    placeholderWrap: {
        minHeight: 120,
        alignItems: "center",
        justifyContent: "center",
    },
    placeholderText: {
        color: "rgba(255,255,255,0.76)",
        fontSize: 13,
    },
    loadMoreWrap: {
        paddingVertical: 14,
        alignItems: "center",
    },
});
