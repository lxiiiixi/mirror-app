import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { formatNumber } from "@mirror/utils";
import { ProjectTabs, Spinner } from "../ui";
import { RedeemItemCard } from "../components/PointsRedemption/RedeemItemCard";
import {
    MyRedemptionItemCard,
    type MyRedemptionItemCardData,
} from "../components/PointsRedemption/MyRedemptionItemCard";
import {
    RedeemFlowModal,
    type RedeemFlowField,
} from "../components/PointsRedemption/RedeemFlowModal";
import { artsApiClient } from "../api/artsClient";
import { useAuth } from "../hooks/useAuth";
import { useAlertStore } from "../store/useAlertStore";
import { useLoginModalStore } from "../store/useLoginModalStore";
import type { PointsOrderItem, PointsProductItem } from "@mirror/api";
import { PointsRedemptionLayout } from "../components/PointsRedemption";

/** 积分商城 Tab 索引 */
const TAB_MALL = 0;
const TAB_MY_REDEMPTIONS = 1;

const statusTextMap: Record<number, string> = {
    0: "待发货",
    1: "已发货",
    2: "已完成",
    3: "已取消",
};

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
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [redeemLoading, setRedeemLoading] = useState(false);
    const [products, setProducts] = useState<PointsProductItem[]>([]);
    const [orders, setOrders] = useState<PointsOrderItem[]>([]);
    const [redeemModalOpen, setRedeemModalOpen] = useState(false);
    const [redeemStep, setRedeemStep] = useState<1 | 2>(1);
    const [selectedItem, setSelectedItem] = useState<PointsProductItem | null>(null);
    const [workInfo, setWorkInfo] = useState<{ name: string; coverUrl?: string } | null>(null);

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
        if (item.stock <= 0 || item.status !== 1) {
            showAlert({ message: "This item is out of stock.", variant: "error" });
            return;
        }
        setSelectedItem(item);
        setRedeemStep(1);
        setRedeemModalOpen(true);
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
        setRedeemStep(2);
    };

    const isVirtualProduct = selectedItem?.product_type === 1;
    const giftReceiptFields: RedeemFlowField[] = useMemo(() => {
        const fields: RedeemFlowField[] = [
            {
                label: "Enter Recipient Name",
                value: recipientName,
                onChange: setRecipientName,
            },
        ];
        if (!isVirtualProduct) {
            fields.push(
                { label: "Enter Phone Number", value: phone, onChange: setPhone },
                {
                    label: "Enter Shipping Address",
                    value: shippingAddress,
                    onChange: setShippingAddress,
                },
            );
        }
        return fields;
    }, [isVirtualProduct, phone, recipientName, shippingAddress]);

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
        if (!recipientName.trim()) {
            showAlert({ message: "Please enter recipient name.", variant: "error" });
            return;
        }
        if (!isVirtualProduct) {
            if (!phone.trim()) {
                showAlert({ message: "Please enter phone number.", variant: "error" });
                return;
            }
            if (!shippingAddress.trim()) {
                showAlert({ message: "Please enter shipping address.", variant: "error" });
                return;
            }
        }

        setRedeemLoading(true);
        try {
            const payload = {
                work_id: workId,
                product_id: selectedItem.id,
                quantity: 1,
                receiver_name: recipientName.trim() || undefined,
                receiver_phone: isVirtualProduct ? undefined : phone.trim() || undefined,
                receiver_address: isVirtualProduct
                    ? undefined
                    : shippingAddress.trim() || undefined,
            };
            await artsApiClient.points.redeem(payload);
            showAlert({ message: "Redeemed successfully!", variant: "success" });
            setRedeemModalOpen(false);
            setRedeemStep(1);
            setSelectedItem(null);
            setRecipientName("");
            setPhone("");
            setShippingAddress("");
            void fetchBalance();
            void fetchProducts();
            void fetchOrders();
        } catch (error) {
            console.error("[PointsRedemption] redeem failed", error);
            showAlert({ message: "Redeem failed. Please try again.", variant: "error" });
        } finally {
            setRedeemLoading(false);
        }
    };

    const handleRedeemModalClose = () => {
        setRedeemModalOpen(false);
        setRedeemStep(1);
        setSelectedItem(null);
    };

    const handleRedeemBack = () => {
        setRedeemStep(1);
    };

    const myRedemptions: MyRedemptionItemCardData[] = useMemo(() => {
        return orders.map(order => {
            const product = products.find(item => item.id === order.product_id);
            const name = product?.name ?? `商品 #${order.product_id}`;
            const statusLabel = statusTextMap[order.status] ?? "未知状态";
            const status = `${statusLabel} · x${order.quantity}`;
            return {
                id: String(order.id),
                name,
                points: Number(order.points_cost ?? 0) || 0,
                status,
            };
        });
    }, [orders, products]);

    const handleSave = (item: MyRedemptionItemCardData) => {
        // TODO: 保存/提交凭证等
        console.log("save", item);
    };

    const lastProductsWorkIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!hasValidWorkId) {
            showAlert({ message: "Missing work id for points redemption.", variant: "error" });
            return;
        }
        if (lastProductsWorkIdRef.current !== workId) {
            lastProductsWorkIdRef.current = workId;
            void fetchProducts();
        }
        void fetchBalance();
    }, [fetchBalance, fetchProducts, hasValidWorkId, showAlert, workId]);

    const fetchOrders = useCallback(async () => {
        if (!hasValidWorkId || !isLoggedIn) {
            setOrders([]);
            return;
        }
        setOrdersLoading(true);
        try {
            const response = await artsApiClient.points.getOrders({
                work_id: workId,
                page: 1,
                page_size: 50,
            });
            setOrders(response.data?.list ?? []);
        } catch (error) {
            console.error("[PointsRedemption] orders fetch failed", error);
            setOrders([]);
            showAlert({ message: "Failed to load redemption history.", variant: "error" });
        } finally {
            setOrdersLoading(false);
        }
    }, [hasValidWorkId, isLoggedIn, showAlert, workId]);

    const fetchWorkInfo = useCallback(async () => {
        if (!hasValidWorkId) return;
        try {
            const response = await artsApiClient.work.detail({ work_id: workId });
            const payload = response.data;
            setWorkInfo({
                name: payload.work_name || `Work #${workId}`,
                coverUrl: payload.work_cover_url,
            });
        } catch (error) {
            console.error("[PointsRedemption] work detail fetch failed", error);
            setWorkInfo({ name: `Work #${workId}` });
        }
    }, [hasValidWorkId, workId]);

    useEffect(() => {
        void fetchWorkInfo();
    }, [fetchWorkInfo]);

    useEffect(() => {
        void fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        if (!hydrated) return;
        if (!isLoggedIn) {
            setRedeemablePoints(null);
            setOrders([]);
        }
    }, [hydrated, isLoggedIn]);

    const balanceDisplay =
        redeemablePoints == null ? "—" : formatNumber(Number(redeemablePoints) || 0);

    return (
        <PointsRedemptionLayout>
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
                    <ul className="mt-10 flex flex-col gap-10 " role="list">
                        {productsLoading ? (
                            <li className="flex justify-center py-8">
                                <Spinner size="medium" />
                            </li>
                        ) : products.length === 0 ? (
                            <li className="py-8 text-center text-sm text-white/60">
                                暂无可兑换商品
                            </li>
                        ) : (
                            products.map(item => {
                                return (
                                    <li key={item.id}>
                                        <RedeemItemCard
                                            redeemablePoints={redeemablePoints}
                                            data={item}
                                            onAction={() => handleRedeem(item)}
                                        />
                                    </li>
                                );
                            })
                        )}
                    </ul>
                )}

                {activeTab === TAB_MY_REDEMPTIONS && (
                    <ul className="mt-4 flex flex-col gap-4" role="list">
                        {ordersLoading ? (
                            <li className="flex justify-center py-8">
                                <Spinner size="medium" />
                            </li>
                        ) : myRedemptions.length === 0 ? (
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
                    <RedeemFlowModal
                        open={redeemModalOpen}
                        step={redeemStep}
                        productName={selectedItem.name}
                        points={Number(selectedItem.points_price ?? 0) || 0}
                        stock={selectedItem.stock ?? 0}
                        insufficientPoints={
                            redeemablePoints == null ||
                            Number(redeemablePoints) < Number(selectedItem.points_price ?? 0)
                        }
                        fields={giftReceiptFields}
                        isSubmitting={redeemLoading}
                        onConfirmStep1={handleConfirmRedeem}
                        onConfirmStep2={handleGiftRedeem}
                        onBack={handleRedeemBack}
                        onClose={handleRedeemModalClose}
                    />
                )}
            </div>
            {redeemLoading ? (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                    <Spinner size="large" />
                </div>
            ) : null}
        </PointsRedemptionLayout>
    );
}
