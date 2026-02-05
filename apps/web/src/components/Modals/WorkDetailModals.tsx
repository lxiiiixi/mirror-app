import { useCallback, useEffect, useState } from "react";
import { Button, Modal } from "../../ui";
import { artsApiClient } from "../../api/artsClient";
import type { WorkFriendItem } from "@mirror/api";

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
        <Modal
            open={open}
            onClose={onClose}
            closeOnBackdrop
            hideHeader
            panelClassName="min-w-[320px] max-w-[calc(100vw-32px)] border-0 p-[2px] rounded-[14px] bg-[linear-gradient(139.96deg,#ED62CE_0.37%,#444AFB_99.63%)]"
            bodyClassName="p-0"
        >
            <h3 className="text-center text-[18px] font-bold mb-4">Invitation List</h3>
            <div className="">
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
                                    <span className="text-right text-[#37ffc6]">
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
        </Modal>
    );
}

/** 签到任务弹窗：任务列表 + Got it 按钮 */
export function CheckInModal({ open, onClose }: { open: boolean; onClose?: () => void }) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            closeOnBackdrop
            hideHeader
            panelClassName="min-w-[320px] max-w-[calc(100vw-32px)]"
            bodyClassName="px-4 py-4"
        >
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
        </Modal>
    );
}
