import { type UserAssetItem } from "@mirror/api";
import { images } from "@mirror/assets";
import { ROUTE_PATHS } from "@mirror/routes";
import { displayAddress, displayNumber } from "@mirror/utils";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { artsApiClient } from "../api/artsClient";
import { RechargeWithdrawalDialog } from "../components";
import { useAuth } from "../hooks/useAuth";
import { themeColors } from "../theme/colors";
import { AppLayout } from "../ui";

type RechargeTab = "recharge" | "withdraw";

enum AssetName {
  ENT = "ENT",
  USDT = "USDT",
  ART = "ART",
  TICKET = "TICKET",
}

const toImageSource = (value?: string | number) => {
  if (value == null) {
    return undefined;
  }
  if (typeof value === "number") {
    return value;
  }
  return { uri: value };
};

export default function AssetsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isLoggedIn, hydrated, clearToken } = useAuth();
  const [assets, setAssets] = useState<UserAssetItem[]>([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<RechargeTab>("recharge");

  const refreshAssets = useCallback(async () => {
    if (!isLoggedIn) {
      return;
    }

    setLoading(true);
    try {
      const [assetResponse, walletResponse] = await Promise.all([
        artsApiClient.user.getAsset(),
        artsApiClient.user.getWallets(),
      ]);

      setAssets(assetResponse.data ?? []);

      const wallets = walletResponse.data?.wallets ?? [];
      const primary = wallets.find((wallet) => wallet.is_primary) ?? wallets[0];
      setWalletAddress(primary?.wallet_address ?? "");
      setEmail(walletResponse.data?.bound_email ?? "");
    } catch (error) {
      console.error("[Assets] fetch failed", error);
      Alert.alert(
        t("common.error", { defaultValue: "Error" }),
        t("assets.loadFailed", { defaultValue: "Failed to load assets" }),
      );
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, t]);

  useEffect(() => {
    void refreshAssets();
  }, [refreshAssets]);

  useEffect(() => {
    if (hydrated && !isLoggedIn) {
      router.replace(ROUTE_PATHS.home);
    }
  }, [hydrated, isLoggedIn, router]);

  const total = useMemo(() => {
    const sum = assets.reduce((acc, item) => acc + Number(item.balance ?? 0), 0);
    return Number.isFinite(sum) ? sum : 0;
  }, [assets]);

  const getBalance = (name: AssetName) =>
    displayNumber(assets.find((item) => item.name === name)?.balance ?? 0);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTE_PATHS.home);
  };

  const handleCopyAddress = async () => {
    if (!walletAddress) {
      return;
    }

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(walletAddress);
        Alert.alert(
          t("common.success", { defaultValue: "Success" }),
          t("account.copySu", { defaultValue: "Copied" }),
        );
        return;
      }
    } catch (error) {
      console.error("[Assets] copy failed", error);
    }

    Alert.alert(
      t("account.address", { defaultValue: "Linked wallet" }),
      displayAddress(walletAddress),
    );
  };

  const openDialog = (tab: RechargeTab) => {
    setDialogTab(tab);
    setDialogOpen(true);
  };

  const handleLogout = async () => {
    await clearToken();
    router.replace(ROUTE_PATHS.home);
  };

  if (!hydrated || !isLoggedIn) {
    return null;
  }

  return (
    <AppLayout
      showWalletBar={false}
      showPageNav
      showFooter={false}
      pageTitle={t("assets.title", { defaultValue: "Assets" })}
      onBackPress={handleBack}
      headerRight={
        <Pressable style={styles.logoutButton} onPress={() => void handleLogout()}>
          <Text style={styles.logoutButtonText}>
            {t("account.logout", { defaultValue: "Logout" })}
          </Text>
        </Pressable>
      }
    >
      <View style={styles.page}>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>
            {t("account.balanceTotal", { d: "USDT", defaultValue: "Total Value (USDT)" })}
          </Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalValue}>{displayNumber(total, 2)}</Text>
            <Pressable style={styles.refreshButton} onPress={() => void refreshAssets()}>
              <Text style={styles.refreshButtonText}>
                {t("account.refresh", { defaultValue: "Refresh" })}
              </Text>
              <Image source={toImageSource(images.account.refresh)} style={styles.refreshIcon} />
            </Pressable>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceGridRow}>
            <View style={styles.balanceItem}>
              <Image source={toImageSource(images.account.ent)} style={styles.balanceIcon} />
              <View>
                <Text style={styles.balanceLabel}>{t("account.ent", { defaultValue: "ENT" })}</Text>
                <Text style={styles.balanceValue}>{getBalance(AssetName.ENT)}</Text>
              </View>
            </View>
            <View style={styles.balanceItem}>
              <Image source={toImageSource(images.account.usdtIcon)} style={styles.balanceIcon} />
              <View>
                <Text style={styles.balanceLabel}>
                  {t("account.rwa_token", { defaultValue: "USDT quantity" })}
                </Text>
                <Text style={styles.balanceValue}>{getBalance(AssetName.USDT)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.balanceGridRow}>
            <View style={styles.balanceItem}>
              <Image source={toImageSource(images.account.todayIcon)} style={styles.balanceIcon} />
              <View>
                <Text style={styles.balanceLabel}>{t("account.ticket", { defaultValue: "Ticket" })}</Text>
                <Text style={[styles.balanceValue, styles.balanceValueAccent]}>
                  {getBalance(AssetName.ART)}
                </Text>
              </View>
            </View>
            <View style={styles.balanceItem}>
              <Image source={toImageSource(images.account.art)} style={styles.balanceIcon} />
              <View>
                <Text style={styles.balanceLabel}>
                  {t("account.rwa_ticket", { defaultValue: "ART quantity" })}
                </Text>
                <Text style={styles.balanceValue}>{getBalance(AssetName.TICKET)}</Text>
              </View>
            </View>
          </View>

          {walletAddress ? (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>
                    {t("account.address", { defaultValue: "Linked wallet" })}
                  </Text>
                  <Text style={styles.infoValue}>{displayAddress(walletAddress)}</Text>
                </View>
                <Pressable style={styles.copyButton} onPress={() => void handleCopyAddress()}>
                  <Text style={styles.copyButtonText}>
                    {t("account.copy", { defaultValue: "Copy" })}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : null}

          {email ? (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>{t("emailLogin.email", { defaultValue: "Email" })}</Text>
                  <Text style={styles.infoValue}>{email}</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.linkList}>
          <Pressable style={styles.linkButton} onPress={() => router.push(ROUTE_PATHS.accountToken)}>
            <Text style={styles.linkButtonText}>{t("account.token", { defaultValue: "Hold RWA Token" })}</Text>
            <Image source={toImageSource(images.account.right)} style={styles.linkArrow} />
          </Pressable>

          <Pressable
            style={styles.linkButton}
            onPress={() => router.push(ROUTE_PATHS.accountBilling)}
          >
            <Text style={styles.linkButtonText}>{t("account.bill", { defaultValue: "My bill" })}</Text>
            <Image source={toImageSource(images.account.right)} style={styles.linkArrow} />
          </Pressable>
        </View>

        <Pressable style={styles.actionButton} onPress={() => openDialog("recharge")}>
          <Text style={styles.actionButtonText}>
            {t("account.withdrawDialog.title1", { defaultValue: "Recharge and withdrawal" })}
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingMask}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : null}

      <RechargeWithdrawalDialog
        open={dialogOpen}
        initialTab={dialogTab}
        walletAddress={walletAddress}
        onClose={() => setDialogOpen(false)}
        onSuccess={refreshAssets}
      />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: 14,
    paddingTop: 4,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  totalCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 26,
    backgroundColor: "#7c1af3",
  },
  totalLabel: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 14,
    fontWeight: "600",
  },
  totalRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  totalValue: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  refreshButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  refreshIcon: {
    width: 12,
    height: 12,
  },
  balanceCard: {
    marginTop: -18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  balanceGridRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  balanceItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  balanceIcon: {
    width: 24,
    height: 24,
    marginTop: 1,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    fontWeight: "600",
  },
  balanceValue: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 2,
  },
  balanceValueAccent: {
    color: "#32f4dd",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginVertical: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  infoValue: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginTop: 2,
  },
  copyButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  copyButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  linkList: {
    gap: 10,
  },
  linkButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  linkButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  linkArrow: {
    width: 10,
    height: 10,
    opacity: 0.86,
  },
  actionButton: {
    width: "100%",
    minHeight: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: themeColors.primary,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  loadingMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
});
