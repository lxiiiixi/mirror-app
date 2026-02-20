import { type ReactNode } from "react";
import { Link } from "expo-router";
import { ROUTE_PATHS } from "@mirror/routes";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../ui";

interface RouteStubScreenProps {
  title: string;
  path: string;
  children?: ReactNode;
}

export function RouteStubScreen({ title, path, children }: RouteStubScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.badge}>MOBILE ROUTE PAGE</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.path}>Path: {path}</Text>
        <Text style={styles.description}>
          This is a scaffold page generated from shared route config. Replace with real business UI.
        </Text>

        {children}

        <Link href={ROUTE_PATHS.home} asChild>
          <Button variant="secondary" size="small">
            Back Home
          </Button>
        </Link>
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
    gap: 12,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#dcfce7",
    color: "#166534",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    color: "#0f172a",
    fontSize: 28,
    fontWeight: "700",
  },
  path: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },
  description: {
    color: "#334155",
    fontSize: 15,
    lineHeight: 22,
  },
});
