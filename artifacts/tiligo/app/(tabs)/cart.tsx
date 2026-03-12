import React from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Image, Alert, Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { useApp, CartItem } from "@/context/AppContext";

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart } = useApp();

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeFromCart(item.productId);
  };

  return (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemStore}>{item.storeName}</Text>
        <Text style={styles.itemPrice}>{(item.price * item.quantity).toFixed(2)}€</Text>
      </View>
      <View style={styles.quantityRow}>
        <Pressable
          style={styles.qtyBtn}
          onPress={() => {
            Haptics.selectionAsync();
            updateQuantity(item.productId, item.quantity - 1);
          }}
        >
          <Ionicons name="remove" size={16} color={Colors.primary} />
        </Pressable>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <Pressable
          style={styles.qtyBtn}
          onPress={() => {
            Haptics.selectionAsync();
            updateQuantity(item.productId, item.quantity + 1);
          }}
        >
          <Ionicons name="add" size={16} color={Colors.primary} />
        </Pressable>
        <Pressable style={styles.removeBtn} onPress={handleRemove}>
          <Ionicons name="trash-outline" size={16} color={Colors.error} />
        </Pressable>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { cart, cartTotal, cartCount, clearCart } = useApp();
  const deliveryFee = cart.length > 0 ? 1.50 : 0;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (cart.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <Text style={styles.headerTitle}>Shporta</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={72} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>Shporta është bosh</Text>
          <Text style={styles.emptyText}>Shto produkte nga dyqanet tona</Text>
          <Pressable style={styles.browseBtn} onPress={() => router.push("/(tabs)/")}>
            <Text style={styles.browseBtnText}>Shfleto Dyqanet</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const storeId = cart[0]?.storeId;
  const storeName = cart[0]?.storeName;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={styles.headerTitle}>Shporta ({cartCount})</Text>
        <Pressable onPress={() => {
          Alert.alert("Fshi Shportën", "A jeni i sigurt?", [
            { text: "Anulo" },
            { text: "Fshi", style: "destructive", onPress: () => clearCart() },
          ]);
        }}>
          <Text style={styles.clearText}>Fshi të gjitha</Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 160 + botPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Store Info */}
        <View style={styles.storeInfo}>
          <Ionicons name="storefront" size={18} color={Colors.primary} />
          <Text style={styles.storeName}>{storeName}</Text>
        </View>

        {/* Items */}
        <View style={styles.itemsContainer}>
          {cart.map(item => <CartItemRow key={item.productId} item={item} />)}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Përmbledhja</Text>
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
      </ScrollView>

      {/* Checkout Button */}
      <View style={[styles.checkoutContainer, { paddingBottom: botPad + 16 }]}>
        <Pressable
          style={({ pressed }) => [styles.checkoutBtn, { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/checkout");
          }}
        >
          <View style={styles.checkoutLeft}>
            <Text style={styles.checkoutCount}>{cartCount}</Text>
          </View>
          <Text style={styles.checkoutText}>Vazhdo me Porosinë</Text>
          <Text style={styles.checkoutPrice}>{(cartTotal + deliveryFee).toFixed(2)}€</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text },
  clearText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.error },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  storeName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  itemsContainer: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    ...Colors.cardShadow,
  },
  cartItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemInfo: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  itemStore: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  itemPrice: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.primary, marginTop: 4 },
  quantityRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.border,
  },
  qtyText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text, minWidth: 20, textAlign: "center" },
  removeBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.errorLight,
    alignItems: "center", justifyContent: "center",
  },
  summary: {
    marginHorizontal: 20, marginTop: 16,
    backgroundColor: Colors.white, borderRadius: 16,
    padding: 16, ...Colors.cardShadow, gap: 12,
  },
  summaryTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  summaryValue: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.text },
  totalRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text },
  totalValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.primary },
  checkoutContainer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Colors.strongShadow,
  },
  checkoutLeft: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 30, height: 30, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  checkoutCount: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.white },
  checkoutText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.white },
  checkoutPrice: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.white },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  emptyTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  browseBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 14, marginTop: 8,
  },
  browseBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.white },
});
