import { ROUTE_PATHS } from "@mirror/routes";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useLoginModal } from "../../hooks/useLoginModal";
import { useWallet } from "../../hooks/useWallet";

function GlassPanel({ children }: { children: ReactNode }) {
    try {
        const maybeExpoBlur = require("expo-blur");
        if (maybeExpoBlur?.BlurView) {
            const BlurViewComponent = maybeExpoBlur.BlurView as React.ComponentType<{
                intensity?: number;
                tint?: "light" | "dark" | "default" | string;
                style?: object;
                children?: ReactNode;
            }>;
            return (
                <BlurViewComponent intensity={40} tint="dark" style={styles.panel}>
                    {children}
                </BlurViewComponent>
            );
        }
    } catch (error) {
        // no-op: fallback to non-blur panel when expo-blur is not installed
    }

    return <View style={[styles.panel, styles.panelFallback]}>{children}</View>;
}

export function LoginModal() {
    const { t } = useTranslation();
    const router = useRouter();
    const { open, closeModal } = useLoginModal();
    const { openWallet, isLoggingIn, available } = useWallet();

    const handleEmailLogin = () => {
        closeModal();
        router.push(ROUTE_PATHS.accountEmail);
    };

    const handleWalletLogin = () => {
        closeModal();
        if (!available) {
            Alert.alert(
                t("loginModal.wallet", { defaultValue: "Wallet" }),
                "Wallet SDK is not installed. Please run pnpm install first.",
            );
            return;
        }
        openWallet();
    };

    return (
        <Modal transparent animationType="fade" visible={open} onRequestClose={closeModal}>
            <Pressable style={styles.overlay} onPress={closeModal}>
                <Pressable style={styles.panelContainer} onPress={() => undefined}>
                    <GlassPanel>
                        <Pressable
                            style={styles.closeIconButton}
                            onPress={closeModal}
                            accessibilityLabel={t("common.close", { defaultValue: "Close" })}
                            accessibilityRole="button"
                        >
                            <X size={22} color="rgba(255, 255, 255, 0.85)" strokeWidth={2} />
                        </Pressable>

                        <Text style={styles.title}>
                            {t("loginModal.title", { defaultValue: "Login" })}
                        </Text>

                        <View style={styles.body}>
                            <Pressable style={styles.optionButton} onPress={handleEmailLogin}>
                                <Text style={styles.optionText}>
                                    {t("loginModal.email", { defaultValue: "Email" })}
                                </Text>
                            </Pressable>

                            <Pressable style={styles.optionButton} onPress={handleWalletLogin}>
                                <Text style={styles.optionText}>
                                    {isLoggingIn
                                        ? t("common.loading", { defaultValue: "Connecting..." })
                                        : t("loginModal.wallet", { defaultValue: "Wallet" })}
                                </Text>
                            </Pressable>
                        </View>
                    </GlassPanel>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    panelContainer: {
        width: "100%",
        maxWidth: 360,
        borderRadius: 14,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(127, 127, 127, 0.8)",
    },
    panel: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        paddingHorizontal: 22,
        paddingTop: 16,
        paddingBottom: 20,
        gap: 14,
    },
    panelFallback: {
        backgroundColor: "rgba(23, 13, 50, 0.9)",
    },
    closeIconButton: {
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 1,
        padding: 6,
    },
    title: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
    },
    body: {
        gap: 14,
        paddingVertical: 10,
    },
    optionButton: {
        height: 48,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.04)",
    },
    optionText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});
