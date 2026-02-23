import { StyleSheet, View } from "react-native";
import { MainTabsLayout } from "../layouts/MainTabsLayout";
import { HomeNotice } from "../components";
import { useTranslation } from "react-i18next";

export default function HomeRoutePage() {
    const { t } = useTranslation();

    return (
        <MainTabsLayout activeFooterIndex={0}>
            <View style={styles.content}>
                <HomeNotice
                    message={t("notice.defaultMessage", {
                        defaultValue:
                            "Blessed with good luck, tickets come at your fingertips! Good luck to you!",
                    })}
                />
            </View>
        </MainTabsLayout>
    );
}

const styles = StyleSheet.create({
    content: {
        gap: 12,
    },
});
