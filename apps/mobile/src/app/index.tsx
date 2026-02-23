import { images } from "@mirror/assets";
import { goToWorkDetail } from "@mirror/utils";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MainTabsLayout } from "../layouts/MainTabsLayout";
import { HomeBanner, HomeNotice, ProductCard, ProductCardCarousel, type ProductData } from "../components";
import { useTranslation } from "react-i18next";
import { ProjectTabs, type ProjectTabItem } from "../ui";

export default function HomeRoutePage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [activeProject, setActiveProject] = useState(0);

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

    const products = useMemo<ProductData[]>(
        () => [
            {
                id: 1001,
                name: "Mirror Night",
                coverUrl: images.discover.d1,
                type: "movie",
                shareCount: 31,
                creators: ["J.Kim", "N.Lee"],
                description:
                    "A cyber-noir story set in a floating city, where memory can be traded.",
            },
            {
                id: 1002,
                name: "Blue Origin",
                coverUrl: images.discover.d2,
                type: "tv",
                shareCount: 56,
                creators: ["M.Gray", "A.North"],
                description: "An episodic sci-fi drama following a team exploring unstable dimensions.",
            },
            {
                id: 1003,
                name: "Twin Echo",
                coverUrl: images.discover.d3,
                type: "comic",
                shareCount: 14,
                creators: ["S.Han"],
                description: "Two parallel timelines collide, forcing one artist to choose a reality.",
            },
            {
                id: 1004,
                name: "Fireline",
                coverUrl: images.discover.d1Cn,
                type: "playlet",
                shareCount: 89,
                creators: ["R.Wu", "I.Zhao"],
                description: "A short-form vertical drama with high-tension rescue missions.",
            },
            {
                id: 1005,
                name: "Moon Diary",
                coverUrl: images.discover.d2Cn,
                type: "novel",
                shareCount: 23,
                creators: ["K.Lin"],
                description: "A serialized journal from the first civilian colony on the moon.",
            },
            {
                id: 1006,
                name: "Pulse",
                coverUrl: images.discover.d3Cn,
                type: "music",
                shareCount: 77,
                creators: ["NOVA"],
                description: "An interactive music project blending synthwave with cinematic sound design.",
            },
        ],
        [],
    );

    const productSections = useMemo(() => {
        const sectionList: ProductData[][] = [];
        for (let i = 0; i < products.length; i += 6) {
            sectionList.push(products.slice(i, i + 6));
        }
        return sectionList;
    }, [products]);

    return (
        <MainTabsLayout activeFooterIndex={0}>
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

                {activeProject === 0 ? (
                    <View style={styles.productSectionList}>
                        {productSections.map((section, sectionIndex) => (
                            <View key={`section-${sectionIndex}`} style={styles.sectionBlock}>
                                <ProductCardCarousel
                                    products={section}
                                    autoplay
                                    autoplayInterval={5000}
                                    onProductPress={(product) =>
                                        goToWorkDetail(
                                            (path) => router.push(path as never),
                                            product.id,
                                            product.rawType,
                                        )
                                    }
                                />

                                <View style={styles.grid}>
                                    {section.map((product, index) => (
                                        <View
                                            key={`card-${product.id}-${index}`}
                                            style={styles.gridItem}
                                        >
                                            <ProductCard
                                                product={product}
                                                onPress={(item) =>
                                                    goToWorkDetail(
                                                        (path) => router.push(path as never),
                                                        item.id,
                                                        item.rawType,
                                                    )
                                                }
                                            />
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.placeholderWrap}>
                        <Text style={styles.placeholderText}>Token list coming soon</Text>
                    </View>
                )}
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
    grid: {
        width: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    gridItem: {
        width: "31.8%",
        marginBottom: 12,
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
});
