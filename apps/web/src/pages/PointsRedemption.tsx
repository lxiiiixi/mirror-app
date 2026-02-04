import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { formatNumber } from "@mirror/utils";
import { WorkDetailLayout } from "../components/WorkDetail";
import { ProjectTabs, Spinner } from "../ui";
import {
    RedeemItemCard,
    type RedeemItemCardData,
} from "../components/PointsRedemption/RedeemItemCard";
import {
    MyRedemptionItemCard,
    type MyRedemptionItemCardData,
} from "../components/PointsRedemption/MyRedemptionItemCard";
import { ConfirmRedemptionModal } from "../components/PointsRedemption/ConfirmRedemptionModal";
import {
    GiftReceiptModal,
    type GiftReceiptField,
} from "../components/PointsRedemption/GiftReceiptModal";
import { artsApiClient } from "../api/artsClient";
import { useAuth } from "../hooks/useAuth";
import { useAlertStore } from "../store/useAlertStore";
import { useLoginModalStore } from "../store/useLoginModalStore";
import type { PointsProductItem } from "@mirror/api";

/** 积分商城 Tab 索引 */
const TAB_MALL = 0;
const TAB_MY_REDEMPTIONS = 1;

/** 占位图（无图时使用透明或占位） */
const PLACEHOLDER_IMAGE = "";

export default function PointsRedemption() {
    const [searchParams] = useSearchParams();
    const workIdParam = searchParams.get("work_id") ?? searchParams.get("workId");
    const workId = Number(workIdParam ?? "");
    const hasValidWorkId = Number.isFinite(workId) && workId > 0;

    const { isLoggedIn, hydrated } = useAuth();
    const showAlert = useAlertStore(state => state.show);
    const openLoginModal = useLoginModalStore(state => state.openModal);

    const [activeTab, setActiveTab] = useState(TAB_MALL);
    const [redeemablePoints, setRedeemablePoints] = useState<number | null>(null);
    const [pointsLoading, setPointsLoading] = useState(false);
    const [productsLoading, setProductsLoading] = useState(false);
    const [redeemLoading, setRedeemLoading] = useState(false);
    const [products, setProducts] = useState<PointsProductItem[]>([]);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [giftReceiptModalOpen, setGiftReceiptModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PointsProductItem | null>(null);

    const [recipientName, setRecipientName] = useState("");
    const [phone, setPhone] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");

    const tabs = useMemo(
        () => [
            { key: "mall", label: "积分商城" },
            { key: "my", label: "我的兑换" },
        ],
        [],
    );

    const mallItems = useMemo<RedeemItemCardData[]>(() => {
        return products.map(item => ({
            id: String(item.id),
            name: item.name,
            coverUrl: item.image_url || PLACEHOLDER_IMAGE,
            points: Number(item.points_price ?? 0) || 0,
        }));
    }, [products]);
    const productsById = useMemo(() => {
        return new Map(products.map(item => [String(item.id), item]));
    }, [products]);

    const handleRedeem = (item: PointsProductItem) => {
        if (!isLoggedIn) {
            openLoginModal();
            showAlert({ message: "Please login to redeem points.", variant: "info" });
            return;
        }
        if (pointsLoading) {
            showAlert({ message: "Loading points balance, please wait.", variant: "info" });
            return;
        }
        if (item.stock <= 0) {
            showAlert({ message: "This item is out of stock.", variant: "error" });
            return;
        }
        setSelectedItem(item);
        setConfirmModalOpen(true);
    };

    const handleConfirmRedeem = () => {
        if (!selectedItem) return;
        const currentBalance = Number(redeemablePoints ?? 0);
        const requiredPoints = Number(selectedItem.points_price ?? 0);
        const insufficient = currentBalance < requiredPoints;
        if (insufficient) {
            showAlert({ message: "Insufficient points.", variant: "error" });
            return;
        }
        if (selectedItem.stock <= 0) {
            showAlert({ message: "This item is out of stock.", variant: "error" });
            return;
        }
        setConfirmModalOpen(false);
        setGiftReceiptModalOpen(true);
    };

    const handleConfirmCancel = () => {
        setConfirmModalOpen(false);
        setSelectedItem(null);
    };

    const giftReceiptFields: GiftReceiptField[] = useMemo(
        () => [
            { label: "Enter Recipient Name", value: recipientName, onChange: setRecipientName },
            { label: "Enter Phone Number", value: phone, onChange: setPhone },
            { label: "Enter Shipping Address", value: shippingAddress, onChange: setShippingAddress },
        ],
        [recipientName, phone, shippingAddress],
    );

    const fetchBalance = useCallback(async () => {
        if (!hasValidWorkId) return;
        if (!isLoggedIn) {
            setRedeemablePoints(null);
            return;
        }
        setPointsLoading(true);
        try {
            const response = await artsApiClient.points.getBalance({ work_id: workId });
            const balance = Number(response.data?.points_balance ?? 0);
            setRedeemablePoints(Number.isFinite(balance) ? balance : 0);
        } catch (error) {
            console.error("[PointsRedemption] balance fetch failed", error);
            setRedeemablePoints(0);
            showAlert({ message: "Failed to load points balance.", variant: "error" });
        } finally {
            setPointsLoading(false);
        }
    }, [hasValidWorkId, isLoggedIn, showAlert, workId]);

    const fetchProducts = useCallback(async () => {
        if (!hasValidWorkId) return;
        setProductsLoading(true);
        try {
            const response = await artsApiClient.points.getProducts({
                work_id: workId,
                page: 1,
                page_size: 50,
                status: 1,
            });
            setProducts(response.data?.list ?? []);
        } catch (error) {
            console.error("[PointsRedemption] products fetch failed", error);
            setProducts([]);
            showAlert({ message: "Failed to load redemption items.", variant: "error" });
        } finally {
            setProductsLoading(false);
        }
    }, [hasValidWorkId, showAlert, workId]);

    const handleGiftRedeem = async () => {
        if (!selectedItem || redeemLoading) return;
        if (!hasValidWorkId) {
            showAlert({ message: "Missing work id for redemption.", variant: "error" });
            return;
        }
        if (!isLoggedIn) {
            openLoginModal();
            showAlert({ message: "Please login to redeem points.", variant: "info" });
            return;
        }
        const currentBalance = Number(redeemablePoints ?? 0);
        const requiredPoints = Number(selectedItem.points_price ?? 0);
        if (currentBalance < requiredPoints) {
            showAlert({ message: "Insufficient points.", variant: "error" });
            return;
        }
        if (selectedItem.stock <= 0) {
            showAlert({ message: "This item is out of stock.", variant: "error" });
            return;
        }

        setRedeemLoading(true);
        try {
            const payload = {
                work_id: workId,
                product_id: selectedItem.id,
                quantity: 1,
                receiver_name: recipientName.trim() || undefined,
                receiver_phone: phone.trim() || undefined,
                receiver_address: shippingAddress.trim() || undefined,
            };
            await artsApiClient.points.redeem(payload);
            showAlert({ message: "Redeemed successfully!", variant: "success" });
            setGiftReceiptModalOpen(false);
            setSelectedItem(null);
            setRecipientName("");
            setPhone("");
            setShippingAddress("");
            void fetchBalance();
            void fetchProducts();
        } catch (error) {
            console.error("[PointsRedemption] redeem failed", error);
            showAlert({ message: "Redeem failed. Please try again.", variant: "error" });
        } finally {
            setRedeemLoading(false);
        }
    };

    const handleFillLater = () => {
        setGiftReceiptModalOpen(false);
        setSelectedItem(null);
    };

    const myRedemptions: MyRedemptionItemCardData[] = [];

    const handleSave = (item: MyRedemptionItemCardData) => {
        // TODO: 保存/提交凭证等
        console.log("save", item);
    };

    useEffect(() => {
        if (!hasValidWorkId) {
            showAlert({ message: "Missing work id for points redemption.", variant: "error" });
            return;
        }
        void fetchProducts();
        void fetchBalance();
    }, [fetchBalance, fetchProducts, hasValidWorkId, showAlert]);

    useEffect(() => {
        if (!hydrated) return;
        if (!isLoggedIn) {
            setRedeemablePoints(null);
        }
    }, [hydrated, isLoggedIn]);

    const balanceDisplay =
        redeemablePoints == null ? "—" : formatNumber(Number(redeemablePoints) || 0);

    return (
        <WorkDetailLayout pageTitle="Points Redemption">
            <div className="px-4 pb-8 pt-4">
                <p className="text-base font-semibold text-white">
                    Redeemable Points: {balanceDisplay}
                </p>

                <ProjectTabs
                    className="mt-4"
                    tabs={tabs}
                    activeIndex={activeTab}
                    onTabChange={setActiveTab}
                />

                {activeTab === TAB_MALL && (
                    <ul className="mt-4 flex flex-col gap-4" role="list">
                        {productsLoading ? (
                            <li className="flex justify-center py-8">
                                <Spinner size="medium" />
                            </li>
                        ) : mallItems.length === 0 ? (
                            <li className="py-8 text-center text-sm text-white/60">
                                暂无可兑换商品
                            </li>
                        ) : (
                            mallItems.map(item => {
                                const product = productsById.get(item.id);
                                const isUnavailable =
                                    !product || product.status !== 1 || product.stock <= 0;
                                return (
                                    <li key={item.id}>
                                        <RedeemItemCard
                                            data={item}
                                            actionText={isUnavailable ? "Unavailable" : "Redeem"}
                                            actionDisabled={isUnavailable || redeemLoading}
                                            onAction={() => {
                                                if (product) {
                                                    handleRedeem(product);
                                                }
                                            }}
                                        />
                                    </li>
                                );
                            })
                        )}
                    </ul>
                )}

                {activeTab === TAB_MY_REDEMPTIONS && (
                    <ul className="mt-4 flex flex-col gap-4" role="list">
                        {myRedemptions.length === 0 ? (
                            <li className="py-8 text-center text-sm text-white/60">暂无兑换记录</li>
                        ) : (
                            myRedemptions.map(item => (
                                <li key={item.id}>
                                    <MyRedemptionItemCard
                                        data={item}
                                        actionText="SAVE"
                                        onAction={() => handleSave(item)}
                                    />
                                </li>
                            ))
                        )}
                    </ul>
                )}

                {selectedItem && (
                    <ConfirmRedemptionModal
                        open={confirmModalOpen}
                        onClose={handleConfirmCancel}
                        name={selectedItem.name}
                        points={Number(selectedItem.points_price ?? 0) || 0}
                        insufficientPoints={
                            redeemablePoints == null ||
                            Number(redeemablePoints) < Number(selectedItem.points_price ?? 0)
                        }
                        onConfirm={handleConfirmRedeem}
                        onCancel={handleConfirmCancel}
                    />
                )}

                {selectedItem && (
                    <GiftReceiptModal
                        open={giftReceiptModalOpen}
                        onClose={() => {
                            setGiftReceiptModalOpen(false);
                            setSelectedItem(null);
                        }}
                        name={selectedItem.name}
                        points={Number(selectedItem.points_price ?? 0) || 0}
                        stock={String(selectedItem.stock ?? 0)}
                        fields={giftReceiptFields}
                        onRedeem={handleGiftRedeem}
                        onFillLater={handleFillLater}
                    />
                )}
            </div>
            {redeemLoading ? (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                    <Spinner size="large" />
                </div>
            ) : null}
        </WorkDetailLayout>
    );
}
