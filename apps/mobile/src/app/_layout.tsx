import "../i18n";
import "../../global.css";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LoginModal } from "../components";
import { AuthProvider, LoginModalProvider, WalletProvider } from "../providers";
import { ReownModalPortal, ReownProvider } from "../wallet/reown";

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ReownProvider>
                <AuthProvider>
                    <WalletProvider>
                        <LoginModalProvider>
                            <Stack
                                screenOptions={{
                                    headerShown: false,
                                    animation: "none",
                                    contentStyle: { backgroundColor: "#f8fafc" },
                                }}
                            />
                            <LoginModal />
                        </LoginModalProvider>
                        <ReownModalPortal />
                    </WalletProvider>
                </AuthProvider>
            </ReownProvider>
        </GestureHandlerRootView>
    );
}
