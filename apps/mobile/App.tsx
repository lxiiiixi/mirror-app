// import { fontsCss } from '@mirror/assets';
// import { useFonts } from "expo-font";
import "./global.css";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LANGUAGE_ORDER } from "./i18n";

// const defaultFontStyle = { fontFamily: 'Rubik' };
// Text.defaultProps = Text.defaultProps ?? {};
// Text.defaultProps.style = [defaultFontStyle, Text.defaultProps.style];
// TextInput.defaultProps = TextInput.defaultProps ?? {};
// TextInput.defaultProps.style = [defaultFontStyle, TextInput.defaultProps.style];

export default function App() {
    const { t, i18n } = useTranslation();
    // const [fontsLoaded] = useFonts(fonts);

    // if (!fontsLoaded) {
    //   return null;
    // }

    const switchLanguage = () => {
        const currentIndex = LANGUAGE_ORDER.indexOf(i18n.language as (typeof LANGUAGE_ORDER)[number]);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % LANGUAGE_ORDER.length;
        void i18n.changeLanguage(LANGUAGE_ORDER[nextIndex]);
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar style="dark" />
                <ScrollView contentContainerStyle={styles.content}>
                    <Text className="text-xs font-semibold tracking-wider text-emerald-700">
                        MIRROR APP
                    </Text>
                    <Pressable style={styles.languageButton} onPress={switchLanguage}>
                        <Text style={styles.languageButtonText}>
                            {t("header.language", { defaultValue: "Language" })}: {i18n.language}
                        </Text>
                    </Pressable>
                    <Text style={styles.copy}>{t("header.login", { defaultValue: "Login" })}</Text>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
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
    languageButton: {
        alignSelf: "flex-start",
        borderRadius: 999,
        backgroundColor: "#eef2ff",
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    languageButtonText: {
        fontSize: 12,
        color: "#3730a3",
        fontWeight: "600",
    },
    copy: {
        color: "#0f172a",
        fontSize: 16,
        fontWeight: "600",
    },
});
