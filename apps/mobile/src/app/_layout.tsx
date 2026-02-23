import "../i18n";
import "../../global.css";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
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
                        <View pointerEvents="box-none" style={styles.reownPortal}>
                            <ReownModalPortal />
                        </View>
                    </WalletProvider>
                </AuthProvider>
            </ReownProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    // Reown 模态挂载层（覆盖全屏）
    reownPortal: {
        ...StyleSheet.absoluteFillObject,
    },
});
