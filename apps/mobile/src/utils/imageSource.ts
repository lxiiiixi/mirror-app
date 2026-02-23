import type { ImageSourcePropType } from "react-native";

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"] as const;

const isLikelyImagePath = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return false;

    return (
        normalized.startsWith("http://") ||
        normalized.startsWith("https://") ||
        normalized.startsWith("file://") ||
        normalized.startsWith("data:") ||
        normalized.includes("/") ||
        IMAGE_EXTENSIONS.some(ext => normalized.endsWith(ext))
    );
};

export const toImageSource = (
    value: string | number | null | undefined,
): ImageSourcePropType | undefined => {
    if (value == null) {
        return undefined;
    }

    if (typeof value === "number") {
        return value;
    }

    const normalized = value.trim();
    if (!isLikelyImagePath(normalized)) {
        return undefined;
    }

    return { uri: normalized };
};

