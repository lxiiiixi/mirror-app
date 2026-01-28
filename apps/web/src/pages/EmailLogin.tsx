import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { artsApiClient } from "../api/artsClient";
import { useAuth } from "../hooks/useAuth";
import { Button, Input } from "../ui";
import { images } from "@mirror/assets";
import { BackButton } from "../components/Common/BackButton";
import { useAlertStore } from "../store/useAlertStore";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_LENGTH = 6;
const COUNTDOWN_SECONDS = 60;

function EmailLogin() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { saveToken } = useAuth();
    const showAlert = useAlertStore(state => state.show);

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const timerRef = useRef<number | null>(null);
    const redirectRef = useRef<number | null>(null);

    const normalizedEmail = email.trim();
    const normalizedCode = code.trim();

    const isEmailValid = useMemo(() => EMAIL_REGEX.test(normalizedEmail), [normalizedEmail]);

    const canLogin = useMemo(
        () => isEmailValid && normalizedCode.length === CODE_LENGTH,
        [isEmailValid, normalizedCode.length],
    );

    const clearCountdown = useCallback(() => {
        if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startCountdown = useCallback(() => {
        clearCountdown();
        setCountdown(COUNTDOWN_SECONDS);
        timerRef.current = window.setInterval(() => {
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
        return () => {
            clearCountdown();
            if (redirectRef.current) {
                window.clearTimeout(redirectRef.current);
            }
        };
    }, [clearCountdown]);

    const handleSendCode = useCallback(async () => {
        if (countdown > 0 || isSending) return;

        if (!isEmailValid) {
            showAlert({ message: t("emailLogin.emailInvalid"), variant: "error" });
            return;
        }

        setIsSending(true);

        try {
            await artsApiClient.user.sendEmailCode({
                email: normalizedEmail,
                type: 1,
            });
            showAlert({ message: t("emailLogin.codeSent"), variant: "success" });
            startCountdown();
        } catch (error) {
            console.error("[EmailLogin] send code failed", error);
            showAlert({ message: t("emailLogin.sendFailed"), variant: "error" });
        } finally {
            setIsSending(false);
        }
    }, [countdown, isEmailValid, isSending, normalizedEmail, showAlert, startCountdown, t]);

    const handleLogin = useCallback(
        async (event?: FormEvent) => {
            event?.preventDefault();

            if (!isEmailValid) {
                showAlert({ message: t("emailLogin.emailInvalid"), variant: "error" });
                return;
            }

            if (normalizedCode.length !== CODE_LENGTH) {
                showAlert({ message: t("emailLogin.codeRequired"), variant: "error" });
                return;
            }

            setIsSubmitting(true);

            try {
                const response = await artsApiClient.user.emailLogin({
                    email: normalizedEmail,
                    code: normalizedCode,
                    ...(inviteCode.trim() ? { work_invite_code: inviteCode.trim() } : {}),
                });

                const token = response.data?.token;
                if (token) {
                    saveToken(token, "email");
                    showAlert({ message: t("emailLogin.loginSuccess"), variant: "success" });
                    redirectRef.current = window.setTimeout(() => {
                        navigate("/");
                    }, 800);
                } else {
                    showAlert({ message: t("emailLogin.loginFailed"), variant: "error" });
                }
            } catch (error) {
                console.error("[EmailLogin] login failed", error);
                showAlert({ message: t("emailLogin.loginFailed"), variant: "error" });
            } finally {
                setIsSubmitting(false);
            }
        },
        [
            isEmailValid,
            normalizedCode,
            normalizedEmail,
            inviteCode,
            saveToken,
            navigate,
            showAlert,
            t,
        ],
    );

    return (
        <div className="email-login-page">
            <BackButton />
            <div className="login-card">
                <div className="brand">
                    <img src={images.loginImg} alt="Mirror" className="brand-logo" />
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                    <label className="field">
                        <span className="field-label">{t("emailLogin.email")}</span>
                        <Input
                            value={email}
                            inputSize="lg"
                            onChange={event => setEmail(event.target.value)}
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            placeholder={t("emailLogin.emailPlaceholder")}
                        />
                    </label>

                    <label className="field">
                        <span className="field-label">{t("emailLogin.code")}</span>
                        <div className="code-row">
                            <Input
                                value={code}
                                inputSize="lg"
                                onChange={event => setCode(event.target.value.replace(/\\D/g, ""))}
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={CODE_LENGTH}
                                placeholder={t("emailLogin.codePlaceholder")}
                            />
                            <button
                                type="button"
                                className={`code-button ${countdown > 0 || !isEmailValid ? "disabled" : ""}`}
                                disabled={countdown > 0 || !isEmailValid || isSending}
                                onClick={handleSendCode}
                            >
                                {countdown > 0
                                    ? t("emailLogin.resendCode", { time: countdown })
                                    : t("emailLogin.sendCode")}
                            </button>
                        </div>
                    </label>

                    <label className="field">
                        <span className="field-label">{t("emailLogin.inviteCode")}</span>
                        <Input
                            value={inviteCode}
                            onChange={event => setInviteCode(event.target.value)}
                            inputSize="lg"
                            type="text"
                            autoComplete="off"
                            placeholder={t("emailLogin.inviteCodePlaceholder")}
                        />
                    </label>

                    <Button
                        type="submit"
                        fullWidth
                        size="large"
                        disabled={!canLogin || isSubmitting}
                    >
                        {isSubmitting ? t("emailLogin.loggingIn") : t("emailLogin.login")}
                    </Button>
                </form>
            </div>

            <style jsx>{`
                .email-login-page {
                    width: 100vw;
                    min-height: 100vh;
                    display: flex;
                    align-items: start;
                    justify-content: center;
                    padding: 24px 16px 40px;
                    position: relative;
                }

                .login-card {
                    width: 100%;
                    padding: 28px 22px 30px;
                }

                .brand {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 26px;
                }

                .brand-logo {
                    width: 100%;
                    height: auto;
                    object-fit: contain;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }

                .field {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .field-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.85);
                }

                .code-row {
                    display: flex;
                    gap: 10px;
                }

                .code-button {
                    min-width: 110px;
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.12);
                    color: #fff;
                    font-size: 12px;
                    font-weight: 600;
                    padding: 0 12px;
                    cursor: pointer;
                    transition:
                        background 0.2s ease,
                        border 0.2s ease,
                        opacity 0.2s ease;
                }

                .code-button:hover {
                    background: rgba(255, 255, 255, 0.18);
                }

                .code-button.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}

export default EmailLogin;
