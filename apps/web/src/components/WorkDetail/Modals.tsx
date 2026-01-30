import { ReactNode, useEffect } from "react";
import { Button } from "../../ui";

const modalCardClass =
  "w-full max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border-2 border-transparent bg-white/20 text-white shadow-[0_4px_20px_rgba(0,0,0,0.25)] backdrop-blur-xl bg-clip-padding";
const gradientBorderClass =
  "rounded-2xl p-[2px] bg-gradient-to-br from-[#ed62ce] to-[#444afb]";

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
        className={gradientBorderClass}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={modalCardClass}>{children}</div>
      </div>
    </div>
  );
}

/** 邀请列表弹窗：标题 + 表头 + 列表区 + 底部说明 */
export function InvitationListModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose?: () => void;
}) {
  return (
    <WorkDetailModalShell open={open} onClose={onClose}>
      <h3 className="py-4 text-center text-[18px] font-bold">
        Invitation List
      </h3>
      <div className="px-4 pb-2">
        <div className="mb-2 flex items-center gap-2 text-[14px] font-medium text-white/90">
          <span className="flex-1">Wallet</span>
          <span className="w-[72px] text-center">Invitation Time</span>
          <span className="w-[72px] text-right">Check-in</span>
        </div>
        <div className="rounded-lg bg-[#1b1d23] px-3 py-3">
          <div className="flex items-center gap-2 py-2.5 text-[13px]">
            <span className="flex-1 truncate">153***@**</span>
            <span className="w-[72px] text-center">01-28 18</span>
            <span className="w-[72px] text-right text-[#37ffc6]">
              Check-in
            </span>
          </div>
          <div className="flex items-center gap-2 py-2.5 text-[13px]">
            <span className="flex-1 truncate">asd****kljd</span>
            <span className="w-[72px] text-center">01-28 18</span>
            <span className="w-[72px] text-right text-[#37ffc6]">
              Remind to Check-in
            </span>
          </div>
          <div className="flex items-center gap-2 py-2.5 text-[13px]">
            <span className="flex-1 truncate">asd****kljd</span>
            <span className="w-[72px] text-center">01-28 18</span>
            <span className="w-[72px] text-right">Completed</span>
          </div>
        </div>
      </div>
      <p className="px-4 pb-3 text-center text-[12px] text-white/90">
        If all team members check in, each member gets +3 points
      </p>
      <p className="px-4 pb-4 text-center text-[13px] font-medium">
        3-Person Team
      </p>
    </WorkDetailModalShell>
  );
}

/** 签到任务弹窗：任务列表 + Got it 按钮 */
export function CheckInModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose?: () => void;
}) {
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
