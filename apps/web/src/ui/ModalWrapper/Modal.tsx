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

    /**
     * 容器样式类名
     */
    panelClassName?: string;

    /**
     * 标题区域样式类名
     */
    headerClassName?: string;

    /**
     * 内容区域样式类名
     */
    bodyClassName?: string;

    /**
     * 底部操作区样式类名
     */
    actionsClassName?: string;

    /**
     * 是否隐藏头部区域
     */
    hideHeader?: boolean;

    /**
     * 边框样式：default 普通边框，gradient 渐变色描边（粉到蓝）
     */
    borderVariant?: "default" | "gradient";

    /**
     * 插在遮罩之上、面板之下的一层（如签到成功大图），可选
     */
    illustration?: ReactNode;
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
    panelClassName = "",
    headerClassName = "",
    bodyClassName = "",
    actionsClassName = "",
    hideHeader = false,
    borderVariant = "default",
    illustration,
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
                className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-6"
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    // backdropFilter: "blur(10px)",
                    // WebkitBackdropFilter: "blur(10px)",
                }}
                onClick={closeOnBackdrop ? handleClose : undefined}
                role="presentation"
            >
                <div className="relative flex items-start justify-center">
                    {illustration ? (
                        <div
                            className="pointer-events-none absolute -top-[90px] left-1/2 z-0 -translate-x-1/2 bg-amber-50"
                            aria-hidden
                        >
                            {illustration}
                        </div>
                    ) : null}
                    {borderVariant === "gradient" ? (
                        <div
                            className="modal-gradient-ring relative z-10 rounded-2xl p-[2px]"
                            onClick={e => e.stopPropagation()}
                            role="presentation"
                        >
                            <div className="modal-gradient-ring-inner">
                                <div
                                    className={[
                                        "modal-panel w-full max-w-lg overflow-hidden rounded-[14px] border-0",
                                        panelClassName,
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    role="dialog"
                                    aria-modal="true"
                                >
                                    {!hideHeader && (title || onClose) && (
                                        <div
                                            className={`relative px-6 py-4 text-center ${headerClassName}`.trim()}
                                        >
                                            {title ? (
                                                <h3 className="text-lg font-semibold">
                                                    <span className="text-center">{title}</span>
                                                </h3>
                                            ) : null}
                                            {onClose ? (
                                                <button
                                                    type="button"
                                                    className="absolute right-4 top-4 inline-flex items-center justify-center text-white/80 transition hover:border-white/40 hover:text-white cursor-pointer"
                                                    onClick={handleClose}
                                                    aria-label="Close"
                                                >
                                                    <X className="h-5 w-5" />
                                                </button>
                                            ) : null}
                                        </div>
                                    )}
                                    <div className={`px-6 py-5 ${bodyClassName}`.trim()}>
                                        {children}
                                    </div>
                                    {actions ? (
                                        <div
                                            className={`border-t border-white/10 px-6 py-4 ${actionsClassName}`.trim()}
                                        >
                                            {actions}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={[
                                "modal-panel backdrop-blur-[10px] relative z-10 w-full max-w-lg min-w-[320px] overflow-hidden rounded-xl",
                                panelClassName,
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            onClick={e => e.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                        >
                            {!hideHeader && (title || onClose) && (
                                <div
                                    className={`relative px-6 py-4 text-center ${headerClassName}`.trim()}
                                >
                                    {title ? (
                                        <h3 className="text-lg font-semibold">
                                            <span className="text-center">{title}</span>
                                        </h3>
                                    ) : null}
                                    {onClose ? (
                                        <button
                                            type="button"
                                            className="absolute right-4 top-4 inline-flex items-center justify-center text-white/80 transition hover:border-white/40 hover:text-white cursor-pointer"
                                            onClick={handleClose}
                                            aria-label="Close"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    ) : null}
                                </div>
                            )}
                            <div className={`px-6 py-5 ${bodyClassName}`.trim()}>{children}</div>
                            {actions ? (
                                <div
                                    className={`border-t border-white/10 px-6 py-4 ${actionsClassName}`.trim()}
                                >
                                    {actions}
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

Modal.displayName = "Modal";
