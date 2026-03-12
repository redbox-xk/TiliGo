import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { cart, cartTotal, clearCart } = useApp();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const deliveryFee = 1.5;
  const storeId = cart[0]?.storeId;
  const storeName = cart[0]?.storeName;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Emri është i detyrueshëm";
    if (!phone.trim()) e.phone = "Telefoni është i detyrueshëm";
    else if (!/^[\d\s\-\+]{6,15}$/.test(phone.trim())) e.phone = "Numri i telefonit jo valid";
    if (!address.trim()) e.address = "Adresa është e detyrueshme";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleOrder = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!storeId) {
      Alert.alert("Gabim", "Shporta është bosh");
      return;
    }

    setLoading(true);
    try {
      const order = await api.createOrder({
        storeId,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerAddress: address.trim(),
        items: cart.map(c => ({
          productId: c.productId,
          productName: c.productName,
          quantity: c.quantity,
          price: c.price,
        })),
        notes: notes.trim() || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await clearCart();
      router.replace({ pathname: "/order-success", params: { orderId: order.id.toString() } });
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Gabim", e.message || "Ndodhi një gabim. Provoni përsëri.");
    } finally {
      setLoading(false);
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <Pressable onPress={() => router.back()} style={styles.headerBack}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Finalizoni Porosinë</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 + botPad }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Order from */}
          <View style={styles.storeRow}>
            <Ionicons name="storefront" size={16} color={Colors.primary} />
            <Text style={styles.storeText}>Porosi nga: <Text style={{ fontFamily: "Inter_700Bold" }}>{storeName}</Text></Text>
          </View>

          {/* Customer Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Të Dhënat Tuaja</Text>

            <Text style={styles.fieldLabel}>Emri i plotë *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="p.sh. Agron Berisha"
              placeholderTextColor={Colors.textLight}
              value={name}
              onChangeText={v => { setName(v); setErrors(e => ({ ...e, name: "" })); }}
              autoCapitalize="words"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <Text style={styles.fieldLabel}>Numri i Telefonit *</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="p.sh. 044 123 456"
              placeholderTextColor={Colors.textLight}
              value={phone}
              onChangeText={v => { setPhone(v); setErrors(e => ({ ...e, phone: "" })); }}
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

            <Text style={styles.fieldLabel}>Adresa e Dërgimit *</Text>
            <TextInput
              style={[styles.input, styles.inputMulti, errors.address && styles.inputError]}
              placeholder="Rruga, numri, lagjja, qyteti"
              placeholderTextColor={Colors.textLight}
              value={address}
              onChangeText={v => { setAddress(v); setErrors(e => ({ ...e, address: "" })); }}
              multiline
              numberOfLines={2}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

            <Text style={styles.fieldLabel}>Shënime (Opsionale)</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Udhëzime të veçanta për dorëzimin..."
              placeholderTextColor={Colors.textLight}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Përmbledhja e Porosisë</Text>
            <View style={styles.summaryCard}>
              {cart.map(item => (
                <View key={item.productId} style={styles.summaryItem}>
                  <View style={styles.summaryItemLeft}>
                    <View style={styles.qtyBadge}>
                      <Text style={styles.qtyBadgeText}>{item.quantity}</Text>
                    </View>
                    <Text style={styles.summaryItemName}>{item.productName}</Text>
                  </View>
                  <Text style={styles.summaryItemPrice}>{(item.price * item.quantity).toFixed(2)}€</Text>
                </View>
              ))}
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Nëntotali</Text>
                <Text style={styles.summaryValue}>{cartTotal.toFixed(2)}€</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tarifa e Dërgimit</Text>
                <Text style={styles.summaryValue}>{deliveryFee.toFixed(2)}€</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Totali</Text>
                <Text style={styles.totalValue}>{(cartTotal + deliveryFee).toFixed(2)}€</Text>
              </View>
            </View>
          </View>

          {/* Payment */}
          <View style={styles.paymentNote}>
            <Ionicons name="cash-outline" size={18} color={Colors.primaryGreen} />
            <Text style={styles.paymentText}>Pagesë me para ne dorë gjatë dorëzimit</Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={[styles.submitContainer, { paddingBottom: botPad + 16 }]}>
          <Pressable
            style={({ pressed }) => [styles.submitBtn, { opacity: pressed || loading ? 0.9 : 1 }]}
            onPress={handleOrder}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                <Text style={styles.submitText}>Konfirmo Porosinë • {(cartTotal + deliveryFee).toFixed(2)}€</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerBack: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, textAlign: "center" },
  storeRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.white, borderRadius: 12,
    padding: 14, marginTop: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  storeText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12, borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, fontFamily: "Inter_400Regular",
    color: Colors.text,
  },
  inputMulti: { minHeight: 60, textAlignVertical: "top" },
  inputError: { borderColor: Colors.error },
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.error, marginTop: 4 },
  summaryCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, ...Colors.cardShadow,
  },
  summaryItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  summaryItemLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  qtyBadge: {
    backgroundColor: Colors.primary, width: 22, height: 22,
    borderRadius: 6, alignItems: "center", justifyContent: "center",
  },
  qtyBadgeText: { color: Colors.white, fontSize: 11, fontFamily: "Inter_700Bold" },
  summaryItemName: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.text, flex: 1 },
  summaryItemPrice: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  summaryValue: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.text },
  totalRow: { paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 4 },
  totalLabel: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text },
  totalValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.primary },
  paymentNote: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.successLight,
    borderRadius: 12, padding: 14, marginTop: 16,
    borderWidth: 1, borderColor: Colors.success + "40",
  },
  paymentText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.primaryGreen },
  submitContainer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    ...Colors.strongShadow,
  },
  submitText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.white },
});
