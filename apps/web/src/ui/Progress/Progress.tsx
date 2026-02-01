import "./progress.css";

export type ProgressSize = "small" | "medium" | "large";

export interface ProgressProps {
    /**
     * 当前值
     */
    value: number;

    /**
     * 最大值，用于计算百分比
     */
    max?: number;

    /**
     * 左侧标签（如「有效用户」）
     */
    label?: React.ReactNode;

    /**
     * 是否显示数值（如 3/5）
     */
    showValue?: boolean;

    /**
     * 自定义数值展示，若提供则优先于 showValue
     */
    valueLabel?: React.ReactNode;

    /**
     * 尺寸
     */
    size?: ProgressSize;

    /**
     * 自定义类名
     */
    className?: string;
}

/**
 * 进度条组件
 * 纯 UI 组件，value/max 计算百分比，超出 100% 按 100% 显示
 */
export function Progress({
    value,
    max = 100,
    label,
    showValue = true,
    valueLabel,
    size = "medium",
    className = "",
}: ProgressProps) {
    const safeMax = max <= 0 ? 1 : max;
    const percent = Math.min(100, Math.max(0, (value / safeMax) * 100));
    const sizeClass = size === "small" ? "progress-sm" : size === "large" ? "progress-lg" : "";

    const displayValue =
        valueLabel !== undefined ? valueLabel : showValue ? `${label} ${value}/${max}` : null;

    return (
        <div className={`progress ${sizeClass} ${className}`.trim()}>
            <div className="progress-row">
                <div
                    className="progress-track"
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={safeMax}
                    style={{ ["--progress-percent" as string]: `${percent}%` }}
                >
                    <div className="progress-fill" style={{ width: `${percent}%` }} />
                </div>
                {displayValue != null && (
                    <span className="progress-value progress-value--tail">{displayValue}</span>
                )}
            </div>
        </div>
    );
}
