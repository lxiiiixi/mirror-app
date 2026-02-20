// import { fontsCss } from '@mirror/assets';
// import { useFonts } from "expo-font";
import "./global.css";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// const defaultFontStyle = { fontFamily: 'Rubik' };
// Text.defaultProps = Text.defaultProps ?? {};
// Text.defaultProps.style = [defaultFontStyle, Text.defaultProps.style];
// TextInput.defaultProps = TextInput.defaultProps ?? {};
// TextInput.defaultProps.style = [defaultFontStyle, TextInput.defaultProps.style];

export default function App() {
    // const [fontsLoaded] = useFonts(fonts);

    // if (!fontsLoaded) {
    //   return null;
    // }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar style="dark" />
                <ScrollView>
                    <Text className="text-xs font-semibold tracking-wider text-emerald-700">
                        MIRROR APP
                    </Text>
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
});
