import { images } from "@mirror/assets";
import { displayAddress } from "@mirror/utils";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function GlassButton({ route, title }: { route: string; title: string }) {
    const navigate = useNavigate();
    return (
        <button
            type="button"
            className="flex items-center justify-between rounded-2xl border-2 border-white/30 bg-linear-to-b from-white/5 to-white/20 px-4 py-4 text-left backdrop-blur-xl"
            onClick={() => navigate(route)}
        >
            <span className="text-[15px] font-semibold text-white">{title}</span>
            <img src={images.account.right} alt="" className="h-3 w-3 opacity-80" aria-hidden />
        </button>
    );
}

export function WithdrawButton({
    onClick,
    title,
}: {
    onClick: (tab: "recharge" | "withdraw") => void;
    title: string;
}) {
    return (
        <button
            type="button"
            className="flex-1 rounded-xl bg-linear-to-r from-[#f063cd] to-[#424afb] py-3.5 text-[15px] font-semibold text-white"
            onClick={() => onClick("recharge")}
        >
            {title}
        </button>
    );
}

export function LinearDivideHorizontal() {
    return <div className="my-3 h-px w-full bg-linear-to-r from-[#f063cd] to-[#424afb]" />;
}

/** 竖线分隔（渐变），放在 flex/grid 中可 self-stretch 填满高度 */
export function LinearDivideVertical() {
    return (
        <div
            className="w-px self-stretch shrink-0 bg-linear-to-b from-[#f063cd] to-[#424afb]"
            aria-hidden
        />
    );
}

export function UserInfo({
    walletAddress,
    email,
    handleCopyAddress,
}: {
    walletAddress: string;
    email: string;
    handleCopyAddress: () => void;
}) {
    const { t } = useTranslation();
    return (
        <>
            {walletAddress ? (
                <>
                    <LinearDivideHorizontal />
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-[14px] font-semibold text-white">
                                {t("account.address")}
                            </div>
                            <div className="truncate text-[13px] font-medium text-white/90">
                                {displayAddress(walletAddress)}
                            </div>
                        </div>
                        <button
                            type="button"
                            className="shrink-0 rounded-lg border border-white px-2 py-1 text-[12px] text-white"
                            onClick={handleCopyAddress}
                        >
                            {t("account.copy")}
                        </button>
                    </div>
                </>
            ) : null}

            {email ? (
                <>
                    <LinearDivideHorizontal />
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-[14px] font-semibold text-white">
                                {t("emailLogin.email")}
                            </div>
                            <div className="truncate text-[13px] font-medium text-white/90">
                                {email}
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
        </>
    );
}
