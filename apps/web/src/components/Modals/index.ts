// Modal exports with trigger notes for QA/testing.

// LoginModal: triggered via useLoginModalStore.openModal when user attempts login-required actions.
export { LoginModal } from "./LoginModal";
export type { LoginModalProps } from "./LoginModal";

// LegalRestrictionModal: triggered via useLegalRestrictionStore.show when a restricted action is blocked (e.g., VIP purchase / recharge / withdraw).
export { LegalRestrictionModal } from "./LegalRestrictionModal";
export type { LegalRestrictionModalProps } from "./LegalRestrictionModal";

// RechargeWithdrawalDialog: triggered from Assets page when user taps Recharge/Withdraw entry.
export { RechargeWithdrawalDialog } from "./RechargeWithdrawalDialog";
export type { RechargeWithdrawalDialogProps } from "./RechargeWithdrawalDialog";

// AgntDialog: triggered on VIP Purchase page when user taps the header image to view agent info.
export { AgntDialog } from "./AgntDialog";
export type { AgntDialogProps } from "./AgntDialog";

// PaySuccDialog: triggered on VIP Purchase page after a successful payment/transaction.
export { PaySuccDialog } from "./PaySuccDialog";
export type { PaySuccDialogProps } from "./PaySuccDialog";

// RedeemFlowModal: triggered in Points Redemption when user starts redeeming a product (step 1/2).
export { RedeemFlowModal } from "./RedeemFlowModal";
export type { RedeemFlowModalProps, RedeemFlowField } from "./RedeemFlowModal";

// GiftReceiptModal: triggered when user needs to fill in gift/receipt info after redeem flow.
export { GiftReceiptModal } from "./GiftReceiptModal";
export type { GiftReceiptModalProps, GiftReceiptField } from "./GiftReceiptModal";

// InvitationListModal: triggered in Work Detail when user taps the invited count to view invite list (special gradient shell).
export { InvitationListModal } from "./WorkDetailModals";

// CheckInModal: triggered in Work Detail when showing check-in tasks/confirmation.
export { CheckInModal } from "./WorkDetailModals";
