import "../i18n";
import "../../global.css";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LoginModal } from "../components";
import { AuthProvider, LoginModalProvider } from "../providers";

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
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
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
