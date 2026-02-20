import "../i18n";
import "../../global.css";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getRouteByKey } from "@mirror/routes";

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
                screenOptions={{
                    headerBackButtonDisplayMode: "minimal",
                    contentStyle: { backgroundColor: "#f8fafc" },
                }}
            >
                <Stack.Screen name="index" options={{ title: getRouteByKey("home").title }} />
                <Stack.Screen name="vip/index" options={{ title: getRouteByKey("vip").title }} />
                <Stack.Screen
                    name="vip/purchase"
                    options={{ title: getRouteByKey("vipPurchase").title }}
                />
                <Stack.Screen
                    name="promotion"
                    options={{ title: getRouteByKey("promotion").title }}
                />
                <Stack.Screen
                    name="points-redemption"
                    options={{ title: getRouteByKey("pointsRedemption").title }}
                />
                <Stack.Screen name="assets" options={{ title: getRouteByKey("assets").title }} />
                <Stack.Screen
                    name="account/token"
                    options={{ title: getRouteByKey("accountToken").title }}
                />
                <Stack.Screen
                    name="account/billing"
                    options={{ title: getRouteByKey("accountBilling").title }}
                />
                <Stack.Screen
                    name="account/email"
                    options={{ title: getRouteByKey("accountEmail").title }}
                />
                <Stack.Screen
                    name="works/detail"
                    options={{ title: getRouteByKey("worksDetail").title }}
                />
                <Stack.Screen
                    name="+not-found"
                    options={{ title: getRouteByKey("notFound").title }}
                />
            </Stack>
        </GestureHandlerRootView>
    );
}
