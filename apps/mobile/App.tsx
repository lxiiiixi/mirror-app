import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>MIRROR APP</Text>
            </View>
            <Text style={styles.title}>Mobile Preview</Text>
            <Text style={styles.subtitle}>
              A simple React Native layout with cards, buttons, and status blocks.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick actions</Text>
            <Text style={styles.cardSubtitle}>
              Tap the button to update the counter.
            </Text>
            <Pressable
              onPress={() => setCount((value) => value + 1)}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                Clicked {count} times
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>View details</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Live status</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>API Gateway</Text>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Healthy</Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Queue</Text>
              <View style={[styles.pill, styles.pillWarn]}>
                <Text style={[styles.pillText, styles.pillWarnText]}>
                  Degraded
                </Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Latency</Text>
              <Text style={styles.statusValue}>128ms</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#dcfce7',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
    color: '#047857',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    gap: 10,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.9,
    transform: [{ translateY: 1 }],
  },
  primaryButtonText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryButtonPressed: {
    backgroundColor: '#f1f5f9',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  statusLabel: {
    fontSize: 14,
    color: '#334155',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  pill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
  },
  pillWarn: {
    backgroundColor: '#fef3c7',
  },
  pillWarnText: {
    color: '#b45309',
  },
});
