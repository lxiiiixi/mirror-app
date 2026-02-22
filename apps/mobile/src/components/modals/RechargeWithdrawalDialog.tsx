import { type UserAssetItem } from "@mirror/api";
import { images } from "@mirror/assets";
import { displayNumber } from "@mirror/utils";
import { ChevronDown } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { artsApiClient } from "../../api/artsClient";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../ui";

type RechargeTab = "recharge" | "withdraw";

interface RechargeWithdrawalDialogProps {
  open: boolean;
  initialTab?: RechargeTab;
  walletAddress?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const normalizeAmountString = (value?: string) => {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return trimmed;
  if (!trimmed.includes(".")) return trimmed;
  const normalized = trimmed.replace(/\.?0+$/, "");
  return normalized === "" ? "0" : normalized;
};

const toImageSource = (value?: string | number) => {
  if (value == null) {
    return undefined;
  }
  if (typeof value === "number") {
    return value;
  }
  return { uri: value };
};

const getAssetIcon = (name: string) => {
  if (name === "ENT") return toImageSource(images.account.ent);
  if (name === "USDT") return toImageSource(images.account.usdtIcon);
  if (name === "ART" || name === "TICKET") return toImageSource(images.account.art);
  return undefined;
};

const AssetIcon = ({ name }: { name: string }) => {
  const source = getAssetIcon(name);
  if (!source) {
    return null;
  }
  return <Image source={source} style={styles.selectIcon} />;
};

export function RechargeWithdrawalDialog({
  open,
  initialTab = "recharge",
  walletAddress,
  onClose,
  onSuccess,
}: RechargeWithdrawalDialogProps) {
  const { t } = useTranslation();
  const { loginMethod } = useAuth();
  const [activeTab, setActiveTab] = useState<RechargeTab>(initialTab);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [assets, setAssets] = useState<UserAssetItem[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setActiveTab(initialTab);
    setAmount("");
    setCurrencyOpen(false);
  }, [initialTab, open]);

  const fetchAssets = useCallback(async () => {
    if (!open) return;
    setLoadingAssets(true);
    try {
      const response = await artsApiClient.user.getAsset();
      setAssets(response.data ?? []);
    } catch (error) {
      console.error("[RechargeWithdrawalDialog] load assets failed", error);
      Alert.alert(
        t("assets.title", { defaultValue: "Assets" }),
        t("assets.loadFailed", { defaultValue: "Failed to load assets" }),
      );
    } finally {
      setLoadingAssets(false);
    }
  }, [open, t]);

  useEffect(() => {
    void fetchAssets();
  }, [fetchAssets]);

  const availableCurrencies = useMemo(() => {
    return assets.filter((item) =>
      activeTab === "recharge" ? item.can_recharge !== false : item.can_withdraw !== false,
    );
  }, [activeTab, assets]);

  useEffect(() => {
    if (!availableCurrencies.length) {
      setCurrency("");
      return;
    }
    if (!availableCurrencies.some((item) => item.name === currency)) {
      setCurrency(availableCurrencies[0].name);
    }
  }, [availableCurrencies, currency]);

  const currentBalance = useMemo(() => {
    return assets.find((item) => item.name === currency)?.balance ?? 0;
  }, [assets, currency]);

  const closeDialog = () => {
    setCurrencyOpen(false);
    onClose();
  };

  const handleSubmit = useCallback(async () => {
    if (!currency) {
      Alert.alert(
        t("account.withdrawDialog.title1", { defaultValue: "Recharge and withdrawal" }),
        t("account.withdrawDialog.selectCurrency", { defaultValue: "Please select currency" }),
      );
      return;
    }

    const numericValue = Number(amount);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      Alert.alert(
        t("account.withdrawDialog.title1", { defaultValue: "Recharge and withdrawal" }),
        t("account.withdrawDialog.placeholder", {
          defaultValue: "Please enter the quantity(10% handling fee)",
        }),
      );
      return;
    }

    if (activeTab === "recharge") {
      Alert.alert(
        t("account.withdrawDialog.title", { defaultValue: "Recharge" }),
        loginMethod === "wallet"
          ? t("common.comingSoon", { defaultValue: "Coming soon" })
          : t("miningIndex.pleaseConnectSolana", {
              defaultValue: "Please connect Solana wallet first !",
            }),
      );
      return;
    }

    const target = walletAddress?.trim();
    if (!target) {
      Alert.alert(
        t("account.withdrawDialog.confirm", { defaultValue: "Withdrawal" }),
        t("account.address", { defaultValue: "Linked wallet" }),
      );
      return;
    }

    if (currency !== "USDT") {
      Alert.alert(
        t("account.withdrawDialog.confirm", { defaultValue: "Withdrawal" }),
        t("common.comingSoon", { defaultValue: "Coming soon" }),
      );
      return;
    }

    setSubmitting(true);
    try {
      await artsApiClient.deposit.withdrawUsdt({
        amount: normalizeAmountString(amount),
        to_address: target,
        chain: "solana",
      });

      Alert.alert(
        t("account.withdrawDialog.confirm", { defaultValue: "Withdrawal" }),
        t("account.withdrawDialog.success", { defaultValue: "Withdrawal successful!" }),
      );

      onSuccess?.();
      closeDialog();
    } catch (error) {
      console.error("[RechargeWithdrawalDialog] submit failed", error);
      Alert.alert(
        t("account.withdrawDialog.confirm", { defaultValue: "Withdrawal" }),
        t("assets.loadFailed", { defaultValue: "Failed to load assets" }),
      );
    } finally {
      setSubmitting(false);
    }
  }, [activeTab, amount, currency, loginMethod, onSuccess, t, walletAddress]);

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={closeDialog}>
      <Pressable style={styles.overlay} onPress={closeDialog}>
        <Pressable style={styles.panel} onPress={() => undefined}>
          <Text style={styles.title}>
            {t("account.withdrawDialog.title1", { defaultValue: "Recharge and withdrawal" })}
          </Text>

          <View style={styles.tabRow}>
            <Pressable
              style={[styles.tab, activeTab === "recharge" && styles.tabActive]}
              onPress={() => {
                setActiveTab("recharge");
                setCurrencyOpen(false);
              }}
            >
              <Text style={styles.tabText}>
                {t("account.withdrawDialog.title", { defaultValue: "Recharge" })}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === "withdraw" && styles.tabActive]}
              onPress={() => {
                setActiveTab("withdraw");
                setCurrencyOpen(false);
              }}
            >
              <Text style={styles.tabText}>
                {t("account.withdrawDialog.confirm", { defaultValue: "Withdrawal" })}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.fieldLabel}>
            {activeTab === "recharge"
              ? t("account.withdrawDialog.recharge_currency", {
                  defaultValue: "Recharge Currency",
                })
              : t("account.withdrawDialog.withdraw_currency", {
                  defaultValue: "WithDraw Currency",
                })}
          </Text>

          <Pressable
            style={styles.selectButton}
            onPress={() => setCurrencyOpen((prev) => !prev)}
            disabled={loadingAssets || submitting}
          >
            <View style={styles.selectValueWrap}>
              {currency ? (
                <>
                  <AssetIcon name={currency} />
                  <Text style={styles.selectValue}>{currency}</Text>
                </>
              ) : (
                <Text style={styles.selectPlaceholder}>
                  {t("account.withdrawDialog.selectCurrency", {
                    defaultValue: "Please select currency",
                  })}
                </Text>
              )}
            </View>

            <View style={currencyOpen ? styles.chevronUp : undefined}>
              <ChevronDown size={16} color="#ffffff" strokeWidth={2.2} />
            </View>
          </Pressable>

          {currencyOpen ? (
            <View style={styles.selectList}>
              {availableCurrencies.map((item) => (
                <Pressable
                  key={item.name}
                  style={styles.selectItem}
                  onPress={() => {
                    setCurrency(item.name);
                    setCurrencyOpen(false);
                  }}
                >
                  <View style={styles.selectItemLeft}>
                    <AssetIcon name={item.name} />
                    <Text style={styles.selectItemText}>{item.name}</Text>
                  </View>
                  <Text style={styles.selectItemAmount}>{displayNumber(item.balance)}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Text style={styles.fieldLabel}>
            {activeTab === "recharge"
              ? t("account.withdrawDialog.recharge_number", {
                  defaultValue: "Recharge Quantity",
                })
              : t("account.withdrawDialog.withdraw_number", {
                  defaultValue: "WithDraw Quantity",
                })}
          </Text>

          <TextInput
            style={styles.input}
            value={amount}
            keyboardType="decimal-pad"
            onChangeText={setAmount}
            placeholder={t("account.withdrawDialog.placeholder", {
              defaultValue: "Please enter the quantity(10% handling fee)",
            })}
            placeholderTextColor="rgba(255,255,255,0.45)"
            editable={!submitting}
          />

          {currency ? (
            <Text style={styles.currentMaxText}>
              {t("account.withdrawDialog.currentMax", { num: displayNumber(currentBalance) })}
            </Text>
          ) : null}

          {loadingAssets ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.loadingText}>
                {t("miningIndex.processing", { defaultValue: "Processing..." })}
              </Text>
            </View>
          ) : null}

          <Button
            fullWidth
            size="large"
            onPress={() => void handleSubmit()}
            disabled={loadingAssets || submitting}
          >
            {submitting
              ? t("miningIndex.processing", { defaultValue: "Processing..." })
              : activeTab === "recharge"
                ? t("account.withdrawDialog.recharge_btn", { defaultValue: "Submit a recharge" })
                : t("account.withdrawDialog.withdraw_btn", { defaultValue: "Submit a withdraw" })}
          </Button>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
  },
  panel: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(18,9,44,0.96)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  tabRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 2,
  },
  tab: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.48)",
    paddingVertical: 8,
    alignItems: "center",
  },
  tabActive: {
    borderWidth: 0,
    backgroundColor: "#eb1484",
  },
  tabText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  fieldLabel: {
    color: "#ffffff",
    fontSize: 13,
    marginTop: 4,
  },
  selectButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  selectIcon: {
    width: 18,
    height: 18,
  },
  selectValue: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  selectPlaceholder: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },
  chevronUp: {
    transform: [{ rotate: "180deg" }],
  },
  selectList: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  selectItem: {
    minHeight: 42,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  selectItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectItemText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  selectItemAmount: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 13,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    minHeight: 46,
    color: "#ffffff",
    paddingHorizontal: 12,
    fontSize: 15,
  },
  currentMaxText: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 13,
  },
  loadingRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 2,
  },
  loadingText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
  },
});
