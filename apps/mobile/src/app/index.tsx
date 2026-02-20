import { Link } from "expo-router";
import { SHARED_ROUTE_CONFIGS } from "@mirror/routes";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../ui";

const routeCards = SHARED_ROUTE_CONFIGS.filter(
    route => route.key !== "home" && route.key !== "notFound",
);

export default function HomeRoutePage() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.badge}>EXPO ROUTER READY</Text>
                <Text style={styles.title}>Mirror Mobile Routes</Text>
                <Text style={styles.description}>
                    These pages are scaffolded from the shared route definitions.
                </Text>

                <View style={styles.list}>
                    {routeCards.map(route => (
                        <View key={route.key} style={styles.card}>
                            <Text style={styles.cardTitle}>{route.title}</Text>
                            <Text style={styles.cardPath}>{route.path}</Text>
                            <Text style={styles.cardMeta}>Layout: {route.layoutType}</Text>
                            <Link href={route.path} asChild>
                                {/* <Button size="small">Open Page</Button> */}
                                <Text className="text-sm font-medium text-blue-500">Open Page</Text>
                            </Link>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    content: {
        padding: 20,
        gap: 14,
    },
    badge: {
        alignSelf: "flex-start",
        backgroundColor: "#dbeafe",
        color: "#1d4ed8",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    title: {
        color: "#0f172a",
        fontSize: 30,
        fontWeight: "700",
    },
    description: {
        color: "#334155",
        fontSize: 15,
        lineHeight: 22,
    },
    list: {
        gap: 10,
    },
    card: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: "#ffffff",
        padding: 12,
        gap: 8,
    },
    cardTitle: {
        color: "#0f172a",
        fontSize: 16,
        fontWeight: "700",
    },
    cardPath: {
        color: "#475569",
        fontSize: 13,
        fontWeight: "500",
    },
    cardMeta: {
        color: "#64748b",
        fontSize: 12,
        fontWeight: "500",
    },
});
