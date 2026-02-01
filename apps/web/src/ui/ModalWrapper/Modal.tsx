import { ReactNode, useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import "./modal.css";

export interface ModalProps {
    /**
     * 是否显示弹窗
     */
    open: boolean;

    /**
     * 标题
     */
    title?: string;

    /**
     * 内容区域
     */
    children: ReactNode;

    /**
     * 底部操作区
     */
    actions?: ReactNode;

    /**
     * 关闭回调
     */
    onClose?: () => void;

    /**
     * 点击遮罩是否关闭
     */
    closeOnBackdrop?: boolean;
}

/**
 * Modal 组件
 * 玻璃拟态弹窗容器，带出现/消失动画（仅透明度过渡）
 */
export function Modal({
    open,
    title,
    children,
    actions,
    onClose,
    closeOnBackdrop = true,
}: ModalProps) {
    const [exiting, setExiting] = useState(false);
    const [entered, setEntered] = useState(false);

    useEffect(() => {
        if (!open && !exiting) setEntered(false);
    }, [open, exiting]);

    useEffect(() => {
        if (open && !exiting) {
            const raf = requestAnimationFrame(() => {
                requestAnimationFrame(() => setEntered(true));
            });
            return () => cancelAnimationFrame(raf);
        }
    }, [open, exiting]);

    useEffect(() => {
        if (!exiting) return;
        const timer = setTimeout(() => {
            onClose?.();
            setExiting(false);
        }, 280);
        return () => clearTimeout(timer);
    }, [exiting, onClose]);

    const handleClose = useCallback(() => {
        if (!exiting) setExiting(true);
    }, [exiting]);

    useEffect(() => {
        if (!open || !onClose) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                handleClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose, handleClose]);

    const visible = open || exiting;
    if (!visible) return null;

    return (
        <div
            className={`modal-wrapper ${entered ? "enter" : ""} ${exiting ? "exit" : ""}`}
            aria-hidden={!open}
        >
            <div
                className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
                onClick={closeOnBackdrop ? handleClose : undefined}
                role="presentation"
            >
                <div
                    className="w-full max-w-lg overflow-hidden rounded-xl border border-[#727272] bg-image:var(--gradient-card) text-[--color-text] shadow-[0_30px_80px_rgba(3,6,32,0.6)] backdrop-blur-3xl"
                    onClick={e => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                >
                    {(title || onClose) && (
                        <div className="relative px-6 py-4 text-center">
                            {title ? (
                                <h3 className="text-lg font-semibold">
                                    <span className="text-center">{title}</span>
                                </h3>
                            ) : null}
                            {onClose ? (
                                <button
                                    type="button"
                                    className="absolute right-4 top-4 inline-flex items-center justify-center text-white/80 transition hover:border-white/40 hover:text-white"
                                    onClick={handleClose}
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            ) : null}
                        </div>
                    )}
                    <div className="px-6 py-5">{children}</div>
                    {actions ? (
                        <div className="border-t border-white/10 px-6 py-4">{actions}</div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

Modal.displayName = "Modal";
