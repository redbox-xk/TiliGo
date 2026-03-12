import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Pressable, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";

export default function OrderSuccessScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 7 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={48} color={Colors.white} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: opacityAnim, alignItems: "center" }}>
          <Text style={styles.title}>Porosia u Pranua!</Text>
          <Text style={styles.subtitle}>Faleminderit për porosinë tuaj</Text>
          {orderId && (
            <View style={styles.orderIdCard}>
              <Text style={styles.orderIdLabel}>Numri i Porosisë</Text>
              <Text style={styles.orderId}>#{orderId}</Text>
            </View>
          )}

          <View style={styles.stepsContainer}>
            {[
              { icon: "checkmark-circle", label: "Porosia u pranua", status: "done" },
              { icon: "restaurant", label: "Duke u përgatitur", status: "pending" },
              { icon: "bicycle", label: "Duke u dërguar", status: "pending" },
              { icon: "home", label: "Dorëzuar", status: "pending" },
            ].map((step, i) => (
              <View key={i} style={styles.step}>
                <View style={[styles.stepDot, step.status === "done" && styles.stepDotDone]}>
                  <Ionicons
                    name={step.icon as any}
                    size={16}
                    color={step.status === "done" ? Colors.white : Colors.textLight}
                  />
                </View>
                {i < 3 && <View style={[styles.stepLine, step.status === "done" && styles.stepLineDone]} />}
                <Text style={[styles.stepLabel, step.status === "done" && styles.stepLabelDone]}>
                  {step.label}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.estimateText}>
            Koha e parashikuar e dërgimit: <Text style={styles.estimateTime}>20-35 minuta</Text>
          </Text>
        </Animated.View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.homeBtn, { opacity: pressed ? 0.9 : 1 }]}
          onPress={() => router.replace("/(tabs)/")}
        >
          <Ionicons name="home-outline" size={18} color={Colors.primary} />
          <Text style={styles.homeBtnText}>Kthehu në Ballina</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.ordersBtn, { opacity: pressed ? 0.9 : 1 }]}
          onPress={() => router.replace("/(tabs)/")}
        >
          <Text style={styles.ordersBtnText}>Porosit Sërish</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.background,
    justifyContent: "space-between", padding: 24,
  },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 24 },
  iconWrapper: { marginBottom: 8 },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.primaryGreen,
    alignItems: "center", justifyContent: "center",
    ...Colors.strongShadow,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", color: Colors.text, textAlign: "center" },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center" },
  orderIdCard: {
    backgroundColor: Colors.white,
    borderRadius: 16, padding: 16,
    alignItems: "center", marginTop: 8,
    borderWidth: 1, borderColor: Colors.border,
    minWidth: 200,
    ...Colors.cardShadow,
  },
  orderIdLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  orderId: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.primary, marginTop: 4 },
  stepsContainer: {
    flexDirection: "row", alignItems: "flex-start",
    gap: 0, marginTop: 8,
  },
  step: { alignItems: "center", flex: 1 },
  stepDot: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: Colors.border,
    marginBottom: 6,
  },
  stepDotDone: { backgroundColor: Colors.primaryGreen, borderColor: Colors.primaryGreen },
  stepLine: {
    position: "absolute",
    top: 18, left: "50%", right: "-50%",
    height: 2, backgroundColor: Colors.border,
    zIndex: -1,
  },
  stepLineDone: { backgroundColor: Colors.primaryGreen },
  stepLabel: {
    fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted,
    textAlign: "center", paddingHorizontal: 4,
  },
  stepLabelDone: { color: Colors.primaryGreen, fontFamily: "Inter_600SemiBold" },
  estimateText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center" },
  estimateTime: { fontFamily: "Inter_700Bold", color: Colors.primary },
  actions: { gap: 12 },
  homeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 14, paddingVertical: 14,
    borderWidth: 2, borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  homeBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.primary },
  ordersBtn: {
    borderRadius: 14, paddingVertical: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  ordersBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.white },
});
