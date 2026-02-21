import { ROUTE_PATHS } from "@mirror/routes";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useLoginModal } from "../../hooks/useLoginModal";

export function LoginModal() {
  const { t } = useTranslation();
  const router = useRouter();
  const { open, closeModal } = useLoginModal();

  const handleEmailLogin = () => {
    closeModal();
    router.push(ROUTE_PATHS.accountEmail);
  };

  const handleWalletLogin = () => {
    closeModal();
    Alert.alert(
      t("loginModal.wallet", { defaultValue: "Wallet" }),
      t("common.comingSoon", { defaultValue: "Coming soon" }),
    );
  };

  return (
    <Modal transparent animationType="fade" visible={open} onRequestClose={closeModal}>
      <Pressable style={styles.overlay} onPress={closeModal}>
        <Pressable style={styles.panel} onPress={() => undefined}>
          <Text style={styles.title}>{t("loginModal.title", { defaultValue: "Login" })}</Text>

          <View style={styles.body}>
            <Pressable style={styles.optionButton} onPress={handleEmailLogin}>
              <Text style={styles.optionText}>{t("loginModal.email", { defaultValue: "Email" })}</Text>
            </Pressable>

            <Pressable style={styles.optionButton} onPress={handleWalletLogin}>
              <Text style={styles.optionText}>{t("loginModal.wallet", { defaultValue: "Wallet" })}</Text>
            </Pressable>
          </View>

          <Pressable style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeText}>{t("common.close", { defaultValue: "Close" })}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  panel: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    backgroundColor: "rgba(18, 9, 44, 0.94)",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 14,
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  body: {
    gap: 14,
    paddingVertical: 4,
  },
  optionButton: {
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  optionText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  closeText: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 13,
    fontWeight: "500",
  },
});
