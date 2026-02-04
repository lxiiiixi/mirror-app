import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { images } from "@mirror/assets";
import { useNavigate } from "react-router-dom";
import { useInfiniteWorkList } from "../hooks/useInfiniteWorkList";
import { resolveImageUrl } from "@mirror/utils";
import {
    Notice,
    ProductCard,
    ProductCardCarousel,
    ProjectTabs,
    Spinner,
    TokenItemCard,
    type ProductData,
    type ProjectTabItem,
} from "../ui";
import { HomeBanner } from "../components";
import { getWorkTypeByValue, goToWorkDetail, isTokenWork } from "../utils/work";

const splitCreators = (author: string) =>
    author
        .split(/[/|、,，]/g)
        .map(name => name.trim())
        .filter(Boolean);

function Home() {
    const { t } = useTranslation();
    const [activeProject, setActiveProject] = useState(0);
    const navigate = useNavigate();

    const { items, isLoading, isLoadingMore, setScrollElement, refresh } = useInfiniteWorkList({
        pageSize: 12,
        autoLoad: false,
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        refresh();
    }, [refresh]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const scrollTarget = document.querySelector("main.content") as HTMLElement | null;
        const canScroll = scrollTarget && scrollTarget.scrollHeight > scrollTarget.clientHeight;
        setScrollElement(canScroll ? scrollTarget : window);
        return () => {
            setScrollElement(null);
        };
    }, [items.length, setScrollElement]);

    const tabs = useMemo<ProjectTabItem[]>(
        () => [
            {
                label: "RWA",
                iconSrc: images.home.tokenTab2,
                key: "rwa",
            },
            {
                label: t("works.tokenFilter.metaToken"),
                iconSrc: images.home.tokenTab1,
                key: "token",
            },
        ],
        [t],
    );

    const tokenItems = useMemo(() => items.filter(isTokenWork), [items]);

    const tokenCards = useMemo(() => {
        return tokenItems.map(work => {
            const name = work.name || "";
            const coverUrl = resolveImageUrl(work.cover_url || "");
            const shareCount = Number(work.share_count ?? 0) || 0;
            const progressPercent = Math.min(100, Math.max(0, (shareCount * 500) / 20000));
            const balanceLeft = Math.max(0, 20000 - shareCount * 5);
            const showTokenBorder = true;
            // (work).show_token_border ||

            return {
                id: work.id,
                name,
                coverUrl,
                shareCount,
                progressPercent,
                progressText: `${t("tokenItemCard.progress")} ${progressPercent.toFixed(3)}%`,
                balanceText: `${t("tokenItemCard.balance")} ${balanceLeft}`,
                showTokenBorder,
                rawType: work.type,
            };
        });
    }, [t, tokenItems]);

    const handleNavigateToDetail = (id: number | string, rawType?: number) => {
        goToWorkDetail(navigate, id, rawType);
    };

    const products = useMemo<Array<ProductData & { rawType?: number }>>(() => {
        return items.map(work => {
            const rawWorkType =
                (work as { work_type?: number | string }).work_type ??
                (work as { type?: number | string }).type ??
                4;
            const workTypeValue =
                typeof rawWorkType === "string" ? Number(rawWorkType) : rawWorkType;
            const coverUrl = resolveImageUrl(
                (work as { cover?: string }).cover ||
                    (work as { cover_url?: string }).cover_url ||
                    "",
            );
            const name =
                (work as { work_name?: string }).work_name ||
                (work as { name?: string }).name ||
                "";
            const description =
                (work as { work_description?: string }).work_description ||
                (work as { description?: string }).description ||
                "";
            const shareCount =
                (work as { share_count?: number }).share_count ||
                (work as { shareCount?: number }).shareCount;
            const isShared =
                (work as { is_shared?: boolean }).is_shared ??
                (work as { isShared?: boolean }).isShared ??
                false;
            const names = (work as { names?: string[] }).names;
            const author = (work as { author?: string }).author ?? "";
            const creatorName =
                (work as { creator_name?: string }).creator_name ||
                (work as { work_creator_name?: string }).work_creator_name ||
                "";
            const creators =
                Array.isArray(names) && names.length > 0
                    ? names.filter(Boolean).slice(0, 3)
                    : creatorName
                      ? splitCreators(creatorName).slice(0, 3)
                      : author
                        ? splitCreators(author).slice(0, 3)
                        : [];

            const shareLink = "";

            return {
                id: work.id,
                name,
                coverUrl,
                type: getWorkTypeByValue(workTypeValue)?.type ?? "comic",
                shareCount,
                isShared,
                creators,
                description,
                rawType: workTypeValue,
                shareLink,
            };
        });
    }, [items]);

    return (
        <div className="">
            <Notice message={t("notice.defaultMessage")} />
            <HomeBanner autoplay={true} interval={4000} />
            {/* 在这里加一个 Tab 组件，用于切换 RWA 和 Token ，内容都从 work 列表中筛选出来 */}
            <div className="mt-[15px]">
                <ProjectTabs
                    tabs={tabs}
                    activeIndex={activeProject}
                    onTabChange={index => setActiveProject(index)}
                />
            </div>
            <div className="mt-[6px] pb-[60px]">
                {isLoading && products.length === 0 && tokenCards.length === 0 ? (
                    <div className="flex justify-center py-[30px]">
                        <Spinner size="large" />
                    </div>
                ) : null}

                {activeProject === 0 && products.length === 0 && !isLoading ? (
                    <div className="text-center text-[12px] text-[#999] py-[30px]">
                        {t("ticket.empty")}
                    </div>
                ) : null}

                {activeProject === 1 && tokenCards.length === 0 && !isLoading ? (
                    <div className="text-center text-[12px] text-[#999] py-[30px]">
                        {t("ticket.empty")}
                    </div>
                ) : null}

                {activeProject === 0 && products.length > 0 ? (
                    <div className="grid grid-cols-3 gap-x-[7px] gap-y-[12px] justify-items-center">
                        {products.map((product, index) => {
                            const shouldShowCarousel = index % 6 === 0;
                            const carouselProducts = products.slice(index, index + 6);
                            return (
                                <div key={`${product.id}-${index}`} className="contents">
                                    {shouldShowCarousel ? (
                                        <div className="col-span-3 w-full mb-[4px]">
                                            <ProductCardCarousel
                                                products={carouselProducts}
                                                autoplay={true}
                                                autoplayInterval={5000}
                                            />
                                        </div>
                                    ) : null}
                                    <ProductCard product={product} />
                                </div>
                            );
                        })}
                    </div>
                ) : null}

                {activeProject === 1 && tokenCards.length > 0 ? (
                    <div className="flex flex-col gap-[15px]">
                        {tokenCards.map(token => (
                            <TokenItemCard
                                key={`${token.id}`}
                                data={{
                                    name: token.name,
                                    coverUrl: token.coverUrl,
                                    shareCount: token.shareCount,
                                    showTokenBorder: token.showTokenBorder,
                                    progressPercent: token.progressPercent,
                                    progressText: token.progressText,
                                    balanceText: token.balanceText,
                                }}
                                labels={{ person: t("tokenItemCard.person") }}
                                actionText={t("tokenItemCard.checkIn")}
                                onCardClick={() => handleNavigateToDetail(token.id, token.rawType)}
                                onAction={() => handleNavigateToDetail(token.id, token.rawType)}
                            />
                        ))}
                    </div>
                ) : null}

                {isLoadingMore ? (
                    <div className="flex justify-center py-[20px]">
                        <Spinner size="medium" />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default Home;
