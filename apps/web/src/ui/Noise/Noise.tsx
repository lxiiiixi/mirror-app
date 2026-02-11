import { type CSSProperties, type HTMLAttributes, useMemo } from "react";

export type NoiseVariant = "0";

export interface NoiseOptions {
    baseFrequency?: number;
    numOctaves?: number;
    seed?: number;
    opacity?: number;
}

export interface NoiseProps extends HTMLAttributes<HTMLDivElement>, NoiseOptions {
    /**
     * 预设样式类型
     */
    variant?: NoiseVariant;

    /**
     * 渐变背景（会与噪点叠加）
     * 例如：linear-gradient(to right bottom, var(--color-bg), rgba(0,0,0,0))
     */
    gradient?: string;

    /**
     * 背景混合模式
     */
    blendMode?: CSSProperties["backgroundBlendMode"];
}

const DEFAULTS: Required<NoiseOptions> = {
    baseFrequency: 0.65,
    numOctaves: 3,
    seed: 1,
    opacity: 0.35,
};

export function createNoiseSvg({
    baseFrequency = DEFAULTS.baseFrequency,
    numOctaves = DEFAULTS.numOctaves,
    seed = DEFAULTS.seed,
    opacity = DEFAULTS.opacity,
}: NoiseOptions = {}) {
    return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">` +
        `<filter id="noiseFilter">` +
        `<feTurbulence type="fractalNoise" baseFrequency="${baseFrequency}" numOctaves="${numOctaves}" seed="${seed}" stitchTiles="stitch" />` +
        `</filter>` +
        `<rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="${opacity}"/>` +
        `</svg>`
    );
}

export function createNoiseDataUrl(options: NoiseOptions = {}) {
    const svg = createNoiseSvg(options);
    const encoded = encodeURIComponent(svg)
        .replace(/%0A/g, "")
        .replace(/%20/g, " ")
        .replace(/%3D/g, "=")
        .replace(/%3A/g, ":")
        .replace(/%2F/g, "/");
    return `data:image/svg+xml;utf8,${encoded}`;
}

/**
 * Noise 组件：渲染带噪点背景的容器
 */
export function Noise({
    variant = "0",
    baseFrequency,
    numOctaves,
    seed,
    opacity,
    gradient,
    blendMode = "normal",
    className = "",
    style,
    ...props
}: NoiseProps) {
    const noiseUrl = useMemo(
        () => createNoiseDataUrl({ baseFrequency, numOctaves, seed, opacity }),
        [baseFrequency, numOctaves, opacity, seed],
    );

    const resolvedGradient =
        gradient ?? "linear-gradient(to right bottom, var(--color-bg), rgba(0, 0, 0, 0))";

    const backgroundImage = resolvedGradient
        ? `${resolvedGradient}, url("${noiseUrl}")`
        : `url("${noiseUrl}")`;

    const mergedStyle: CSSProperties = {
        backgroundImage,
        backgroundRepeat: "repeat",
        backgroundBlendMode: blendMode,
        ...style,
    };

    return <div className={`noise noise-${variant} ${className}`} style={mergedStyle} {...props} />;
}
