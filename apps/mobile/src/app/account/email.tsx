import { images } from "@mirror/assets";
import { API_ERROR_CODES, isApiErrorCode } from "@mirror/api";
import { ROUTE_PATHS } from "@mirror/routes";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { artsApiClient } from "../../api/artsClient";
import { useAuth } from "../../hooks/useAuth";
import { themeColors } from "../../theme/colors";
import { toImageSource } from "../../utils/imageSource";
import {
    clearPendingInviteUid,
    getPendingInviteParams,
    persistInviteParams,
} from "../../utils/inviteParams";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_LENGTH = 6;
const COUNTDOWN_SECONDS = 60;

export default function AccountEmailPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const params = useLocalSearchParams<{ club_invite?: string; invite_code?: string }>();
    const { saveToken } = useAuth();

    const [email, setEmail] = useState("slowlyxixi@outlook.com");
    const [code, setCode] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const redirectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const normalizedEmail = email.trim();
    const normalizedCode = code.trim();

    const isEmailValid = useMemo(() => EMAIL_REGEX.test(normalizedEmail), [normalizedEmail]);
    const canLogin = useMemo(
        () => isEmailValid && normalizedCode.length === CODE_LENGTH,
        [isEmailValid, normalizedCode.length],
    );

    const clearCountdown = useCallback(() => {
        if (!timerRef.current) {
            return;
        }

        clearInterval(timerRef.current);
        timerRef.current = null;
    }, []);

    const startCountdown = useCallback(() => {
        clearCountdown();
        setCountdown(COUNTDOWN_SECONDS);

        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearCountdown();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [clearCountdown]);

    useEffect(() => {
        void persistInviteParams({
            club_invite: params.club_invite,
            invite_code: params.invite_code,
        });
    }, [params.club_invite, params.invite_code]);

    useEffect(() => {
        return () => {
            clearCountdown();
            if (redirectRef.current) {
                clearTimeout(redirectRef.current);
            }
        };
    }, [clearCountdown]);

    const showError = (message: string) => {
        Alert.alert(t("common.error", { defaultValue: "Error" }), message);
    };

    const showSuccess = (message: string) => {
        Alert.alert(t("common.success", { defaultValue: "Success" }), message);
    };

    const handleSendCode = useCallback(async () => {
        if (countdown > 0 || isSending) {
            return;
        }

        if (!isEmailValid) {
            showError(t("emailLogin.emailInvalid"));
            return;
        }

        setIsSending(true);
        try {
            await artsApiClient.user.sendEmailCode({
                email: normalizedEmail,
                type: 1,
            });
            showSuccess(t("emailLogin.codeSent"));
            startCountdown();
        } catch (error) {
            console.error("[EmailLogin] send code failed", error);
            if (isApiErrorCode(error, API_ERROR_CODES.SEND_EMAIL_CODE_TOO_FREQUENT)) {
                showError(t("emailLogin.sendTooFrequent"));
            } else {
                showError(t("emailLogin.sendFailed"));
            }
        } finally {
            setIsSending(false);
        }
    }, [countdown, isEmailValid, isSending, normalizedEmail, startCountdown, t]);

    const handleLogin = useCallback(async () => {
        if (!isEmailValid) {
            showError(t("emailLogin.emailInvalid"));
            return;
        }

        if (normalizedCode.length !== CODE_LENGTH) {
            showError(t("emailLogin.codeRequired"));
            return;
        }

        setIsSubmitting(true);

        try {
            const pending = await getPendingInviteParams();
            const response = await artsApiClient.user.emailLogin({
                email: normalizedEmail,
                code: normalizedCode,
                ...(pending.inviteUid ? { invite_uid_code: pending.inviteUid } : {}),
            });

            const token = response.data?.token;
            if (!token) {
                showError(t("emailLogin.loginFailed"));
                return;
            }

            await saveToken(token, "email");
            await clearPendingInviteUid();
            showSuccess(t("emailLogin.loginSuccess"));

            redirectRef.current = setTimeout(() => {
                router.replace(ROUTE_PATHS.home);
            }, 800);
        } catch (error) {
            console.error("[EmailLogin] login failed", error);
            // Backend code 30013 means invite_uid_code is invalid.
            // Clear cached value to avoid repeated login failures with stale invite params.
            if (isApiErrorCode(error, API_ERROR_CODES.INVALID_INVITE_UID_CODE)) {
                await clearPendingInviteUid();
            }
            showError(t("emailLogin.loginFailed"));
        } finally {
            setIsSubmitting(false);
        }
    }, [isEmailValid, normalizedCode, normalizedEmail, router, saveToken, t]);

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
            return;
        }
        router.replace(ROUTE_PATHS.home);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardWrap}
                behavior={Platform.select({ ios: "padding", android: undefined })}
            >
                <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
                    <Pressable style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backText}>←</Text>
                    </Pressable>

                    <View style={styles.loginCard}>
                        <View style={styles.brand}>
                            <Image
                                source={toImageSource(images.loginImg)}
                                style={styles.brandLogo}
                                resizeMode="contain"
                            />
                        </View>

                        <View style={styles.form}>
                            <View style={styles.field}>
                                <Text style={styles.fieldLabel}>{t("emailLogin.email")}</Text>
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    style={styles.input}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    placeholder={t("emailLogin.emailPlaceholder")}
                                    placeholderTextColor="rgba(255,255,255,0.42)"
                                />
                            </View>

                            <View style={styles.field}>
                                <Text style={styles.fieldLabel}>{t("emailLogin.code")}</Text>
                                <View style={styles.codeRow}>
                                    <TextInput
                                        value={code}
                                        onChangeText={value => setCode(value.replace(/\D/g, ""))}
                                        style={[styles.input, styles.codeInput]}
                                        keyboardType="number-pad"
                                        autoCapitalize="none"
                                        autoComplete="one-time-code"
                                        maxLength={CODE_LENGTH}
                                        placeholder={t("emailLogin.codePlaceholder")}
                                        placeholderTextColor="rgba(255,255,255,0.42)"
                                    />
                                    <Pressable
                                        style={[
                                            styles.codeButton,
                                            (countdown > 0 || !isEmailValid || isSending) &&
                                                styles.codeButtonDisabled,
                                        ]}
                                        disabled={countdown > 0 || !isEmailValid || isSending}
                                        onPress={() => void handleSendCode()}
                                    >
                                        <Text style={styles.codeButtonText}>
                                            {countdown > 0
                                                ? t("emailLogin.resendCode", { time: countdown })
                                                : t("emailLogin.sendCode")}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>

                            <Pressable
                                style={[
                                    styles.loginButton,
                                    (!canLogin || isSubmitting) && styles.loginButtonDisabled,
                                ]}
                                disabled={!canLogin || isSubmitting}
                                onPress={() => void handleLogin()}
                            >
                                <Text style={styles.loginButtonText}>
                                    {isSubmitting
                                        ? t("emailLogin.loggingIn")
                                        : t("emailLogin.login")}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#030620",
    },
    keyboardWrap: {
        flex: 1,
    },
    page: {
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 38,
        gap: 10,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
    },
    backText: {
        color: "#ffffff",
        fontSize: 22,
        fontWeight: "700",
        lineHeight: 22,
        marginTop: -2,
    },
    loginCard: {
        width: "100%",
        paddingHorizontal: 6,
        paddingVertical: 10,
    },
    brand: {
        alignItems: "center",
        marginBottom: 24,
    },
    brandLogo: {
        width: "100%",
        height: 88,
    },
    form: {
        gap: 18,
    },
    field: {
        gap: 8,
    },
    fieldLabel: {
        color: "rgba(255,255,255,0.85)",
        fontSize: 13,
        fontWeight: "600",
    },
    input: {
        height: 44,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        backgroundColor: "rgba(255,255,255,0.05)",
        paddingHorizontal: 12,
        color: "#ffffff",
        fontSize: 14,
    },
    codeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    codeInput: {
        flex: 1,
    },
    codeButton: {
        minWidth: 112,
        height: 44,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: themeColors.primary,
    },
    codeButtonDisabled: {
        backgroundColor: "rgba(126, 0, 245, 0.3)",
    },
    codeButtonText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "600",
    },
    loginButton: {
        width: "100%",
        height: 48,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: themeColors.primary,
    },
    loginButtonDisabled: {
        opacity: 0.5,
    },
    loginButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});
