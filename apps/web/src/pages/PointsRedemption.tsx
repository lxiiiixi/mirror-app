import { useState, useMemo } from "react";
import { formatNumber } from "@mirror/utils";
import { WorkDetailLayout } from "../components/WorkDetail";
import { ProjectTabs } from "../ui";
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

/** 积分商城 Tab 索引 */
const TAB_MALL = 0;
const TAB_MY_REDEMPTIONS = 1;

/** 占位图（无图时使用透明或占位） */
const PLACEHOLDER_IMAGE = "";

/** Mock: 可兑换商品列表 */
const MOCK_MALL_ITEMS: RedeemItemCardData[] = [
    { id: "1", name: "Merchandise 1", coverUrl: PLACEHOLDER_IMAGE, points: 1123 },
    { id: "2", name: "Merchandise 2", coverUrl: PLACEHOLDER_IMAGE, points: 2500 },
    { id: "3", name: "Merchandise 3", coverUrl: PLACEHOLDER_IMAGE, points: 5800 },
];

/** Mock: 我的兑换记录 */
const MOCK_MY_REDEMPTIONS: MyRedemptionItemCardData[] = [
    { id: "r1", name: "Merchandise 11", points: 1123, status: "Receipt Info Not Submitted" },
    { id: "r2", name: "Merchandise 22", points: 2500, status: "Shipped" },
];

export default function PointsRedemption() {
    const [activeTab, setActiveTab] = useState(TAB_MALL);
    const [redeemablePoints] = useState(123312);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [giftReceiptModalOpen, setGiftReceiptModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<RedeemItemCardData | null>(null);

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

    const handleRedeem = (item: RedeemItemCardData) => {
        setSelectedItem(item);
        setConfirmModalOpen(true);
    };

    const handleConfirmRedeem = () => {
        if (!selectedItem) return;
        const insufficient = redeemablePoints < selectedItem.points;
        if (insufficient) return;
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

    const handleGiftRedeem = () => {
        // TODO: 调用兑换 API，提交 recipientName / phone / shippingAddress
        setGiftReceiptModalOpen(false);
        setSelectedItem(null);
        setRecipientName("");
        setPhone("");
        setShippingAddress("");
    };

    const handleFillLater = () => {
        setGiftReceiptModalOpen(false);
        setSelectedItem(null);
    };

    const handleSave = (item: MyRedemptionItemCardData) => {
        // TODO: 保存/提交凭证等
        console.log("save", item);
    };

    return (
        <WorkDetailLayout pageTitle="Points Redemption">
            <div className="px-4 pb-8 pt-4">
                <p className="text-base font-semibold text-white">
                    Redeemable Points: {formatNumber(redeemablePoints)}
                </p>

                <ProjectTabs
                    className="mt-4"
                    tabs={tabs}
                    activeIndex={activeTab}
                    onTabChange={setActiveTab}
                />

                {activeTab === TAB_MALL && (
                    <ul className="mt-4 flex flex-col gap-4" role="list">
                        {MOCK_MALL_ITEMS.map(item => (
                            <li key={item.id}>
                                <RedeemItemCard
                                    data={item}
                                    actionText="SAVE"
                                    onAction={() => handleRedeem(item)}
                                />
                            </li>
                        ))}
                    </ul>
                )}

                {activeTab === TAB_MY_REDEMPTIONS && (
                    <ul className="mt-4 flex flex-col gap-4" role="list">
                        {MOCK_MY_REDEMPTIONS.length === 0 ? (
                            <li className="py-8 text-center text-sm text-white/60">暂无兑换记录</li>
                        ) : (
                            MOCK_MY_REDEMPTIONS.map(item => (
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
                        points={selectedItem.points}
                        insufficientPoints={redeemablePoints < selectedItem.points}
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
                        points={selectedItem.points}
                        stock="123"
                        fields={giftReceiptFields}
                        onRedeem={handleGiftRedeem}
                        onFillLater={handleFillLater}
                    />
                )}
            </div>
        </WorkDetailLayout>
    );
}
