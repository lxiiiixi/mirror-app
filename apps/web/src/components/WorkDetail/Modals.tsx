import { ReactNode, useCallback, useEffect, useState } from "react";
import { Button } from "../../ui";
import { artsApiClient } from "../../api/artsClient";
import type { WorkFriendItem } from "@mirror/api";

const modalGradient = "linear-gradient(139.96deg, #ED62CE 0.37%, #444AFB 99.63%)";
const modalCardClass =
    "w-full min-w-[320px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[14px] bg-white/20 text-white shadow-[0_4px_20px_rgba(0,0,0,0.25)]";

function WorkDetailModalShell({
    open,
    onClose,
    children,
}: {
    open: boolean;
    onClose?: () => void;
    children: ReactNode;
}) {
    useEffect(() => {
        if (!open || !onClose) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={onClose}
            role="presentation"
        >
            <div
                id="work-detail-modal"
                className="rounded-2xl p-[2px]"
                style={{ background: modalGradient }}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className={modalCardClass} style={{ background: "rgb(255, 255, 255)" }}>
                    <div className={modalCardClass} style={{ background: "rgba(0, 0, 0, 0.8)" }}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

/** 邀请列表弹窗：请求 getFriendsList 展示实际数据 */
export function InvitationListModal({
    open,
    onClose,
    workId,
}: {
    open: boolean;
    onClose?: () => void;
    workId: number;
}) {
    const [list, setList] = useState<WorkFriendItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const fetchList = useCallback(() => {
        if (!workId || !open) return;
        setLoading(true);
        setError(false);
        artsApiClient.work
            .getFriendsList({ work_id: workId, page: 1, page_size: 50 })
            .then(res => {
                setList(res.data?.list ?? []);
                setTotal(res.data?.total ?? 0);
            })
            .catch(() => {
                setError(true);
                setList([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [workId, open]);

    useEffect(() => {
        if (open && workId) fetchList();
    }, [open, workId, fetchList]);

    const getCheckInLabel = (item: WorkFriendItem) => {
        if (item.signed_in) return "Check-in";
        return "Remind to Check-in";
    };

    const isCheckInDone = (item: WorkFriendItem) => item.signed_in;

    return (
        <WorkDetailModalShell open={open} onClose={onClose}>
            <h3 className="py-4 text-center text-[18px] font-bold">Invitation List</h3>
            <div className="p-4 pt-0">
                <div className="mb-2 flex items-center gap-2 text-[14px] font-medium text-white/90">
                    <span className="flex-1">Wallet</span>
                    <span className="text-center">Invitation Time</span>
                    <span className="text-right">Check-in</span>
                </div>
                <div className="rounded-lg bg-[#1b1d23] px-3 py-3">
                    {loading && (
                        <p className="py-6 text-center text-[13px] text-white/70">Loading...</p>
                    )}
                    {error && (
                        <p className="py-6 text-center text-[13px] text-red-400">
                            Failed to load list
                        </p>
                    )}
                    {!loading && !error && list.length === 0 && (
                        <p className="py-6 text-center text-[13px] text-white/70">
                            No invitations yet
                        </p>
                    )}
                    {!loading && !error && list.length > 0 && (
                        <>
                            {list.length > 0 && (
                                <p className="px-4 text-center text-[13px] font-medium">
                                    {total > 0 ? `${total}-Person Team` : "Team"}
                                </p>
                            )}
                            {list.map((item, index) => (
                                <div
                                    key={`${item.wallet_display}-${item.invitation_time}-${index}`}
                                    className="grid grid-cols-3 items-center gap-2 py-1 text-[12px]"
                                >
                                    <span className="flex-1 truncate" title={item.invite}>
                                        {item.wallet_display || item.invite}
                                    </span>
                                    <span className="text-center">{item.invitation_time}</span>
                                    <span
                                        className={
                                            isCheckInDone(item)
                                                ? "text-right text-[#37ffc6]"
                                                : "text-right text-[#37ffc6]"
                                        }
                                    >
                                        {getCheckInLabel(item)}
                                    </span>
                                </div>
                            ))}
                            <p className="mt-2 px-4 text-center text-[12px] text-white/90">
                                If all team members check in, each member gets +3 points
                            </p>
                        </>
                    )}
                </div>
            </div>
        </WorkDetailModalShell>
    );
}

/** 签到任务弹窗：任务列表 + Got it 按钮 */
export function CheckInModal({ open, onClose }: { open: boolean; onClose?: () => void }) {
    return (
        <WorkDetailModalShell open={open} onClose={onClose}>
            <div className="space-y-4 px-4 py-4">
                <div className="flex items-center justify-between text-[14px]">
                    <span>Daily Check-in +5 LGN</span>
                    <span>Completed</span>
                </div>
                <div className="flex items-center justify-between text-[14px]">
                    <span>3-Person Team Check-in +3 LGN</span>
                    <span className="text-[#d432f4]">Go to Team Up</span>
                </div>
                <div className="flex items-center justify-between text-[14px]">
                    <span>Invite One User +5 LGN</span>
                    <span className="text-[#d432f4]">Go to Invite</span>
                </div>
            </div>
            <div className="px-4 pb-4">
                <Button
                    type="button"
                    className="w-full rounded-xl bg-[#eb1484] py-3 text-[15px] font-bold text-white"
                    onClick={onClose}
                >
                    Got it
                </Button>
            </div>
        </WorkDetailModalShell>
    );
}
