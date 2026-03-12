import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, RefreshControl,
  Alert, ActivityIndicator, TextInput, Platform, Modal,
} from "react-native";
import { router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { api, Order, Product } from "@/lib/api";

const STATUS_CONFIG: Record<string, { label: string; color: string; next?: string; nextLabel?: string }> = {
  pending: { label: "Në Pritje", color: Colors.warning, next: "confirmed", nextLabel: "Konfirmo" },
  confirmed: { label: "Konfirmuar", color: Colors.accent, next: "preparing", nextLabel: "Fillo Gatimin" },
  preparing: { label: "Duke u Gatitur", color: "#9C27B0", next: "ready", nextLabel: "Gati" },
  ready: { label: "Gati", color: Colors.primaryGreen, next: "delivered", nextLabel: "Dorëzuar" },
  picked_up: { label: "Duke u Dërguar", color: Colors.primary },
  delivered: { label: "Dorëzuar", color: Colors.success },
  cancelled: { label: "Anuluar", color: Colors.error },
};

function OrderCard({ order, storeId }: { order: Order; storeId: number }) {
  const qc = useQueryClient();
  const [updating, setUpdating] = useState(false);
  const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: Colors.textMuted };

  const handleStatusUpdate = async () => {
    if (!cfg.next) return;
    setUpdating(true);
    try {
      await api.updateOrderStatus(order.id, cfg.next);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      qc.invalidateQueries({ queryKey: ["store-orders", storeId] });
    } catch (e: any) {
      Alert.alert("Gabim", e.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert("Anulo Porosinë", "A jeni i sigurt?", [
      { text: "Jo" },
      {
        text: "Anulo", style: "destructive", onPress: async () => {
          try {
            await api.updateOrderStatus(order.id, "cancelled");
            qc.invalidateQueries({ queryKey: ["store-orders", storeId] });
          } catch {}
        }
      }
    ]);
  };

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Porosi #{order.id}</Text>
          <Text style={styles.orderTime}>{new Date(order.createdAt).toLocaleString("sq-AL")}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.color + "20" }]}>
          <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={styles.customerInfo}>
        <Ionicons name="person-outline" size={14} color={Colors.textMuted} />
        <Text style={styles.customerText}>{order.customerName} • {order.customerPhone}</Text>
      </View>
      <View style={styles.customerInfo}>
        <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
        <Text style={styles.customerText} numberOfLines={1}>{order.customerAddress}</Text>
      </View>

      <View style={styles.itemsContainer}>
        {order.items.map((item, i) => (
          <View key={i} style={styles.orderItem}>
            <Text style={styles.itemQty}>{item.quantity}x</Text>
            <Text style={styles.itemName}>{item.productName}</Text>
            <Text style={styles.itemPrice}>{(item.price * item.quantity).toFixed(2)}€</Text>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalText}>Totali: <Text style={styles.totalAmount}>{(order.totalAmount + order.deliveryFee).toFixed(2)}€</Text></Text>
        <View style={styles.orderActions}>
          {order.status !== "delivered" && order.status !== "cancelled" && order.status !== "picked_up" && (
            <Pressable style={styles.cancelBtn} onPress={handleCancel}>
              <Ionicons name="close" size={14} color={Colors.error} />
            </Pressable>
          )}
          {cfg.next && (
            <Pressable style={[styles.nextBtn, { backgroundColor: cfg.color }]} onPress={handleStatusUpdate} disabled={updating}>
              {updating ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.nextBtnText}>{cfg.nextLabel}</Text>}
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

function ProductModal({ visible, onClose, storeId, product }: { visible: boolean; onClose: () => void; storeId: number; product?: Product }) {
  const qc = useQueryClient();
  const [name, setName] = useState(product?.name ?? "");
  const [desc, setDesc] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !price || !category) { Alert.alert("Gabim", "Plotësoni fushat e detyrueshme"); return; }
    setLoading(true);
    try {
      if (product) {
        await api.updateProduct(storeId, product.id, { name, description: desc, price: parseFloat(price), category });
      } else {
        await api.createProduct(storeId, { name, description: desc, price: parseFloat(price), category, isAvailable: true });
      }
      qc.invalidateQueries({ queryKey: ["store-products", storeId] });
      onClose();
    } catch (e: any) {
      Alert.alert("Gabim", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{product ? "Edito Produktin" : "Produkt i Ri"}</Text>
            <Pressable onPress={onClose}><Ionicons name="close" size={24} color={Colors.text} /></Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.formLabel}>Emri *</Text>
            <TextInput style={styles.formInput} value={name} onChangeText={setName} placeholder="Emri i produktit" placeholderTextColor={Colors.textLight} />
            <Text style={styles.formLabel}>Përshkrimi</Text>
            <TextInput style={[styles.formInput, { height: 70, textAlignVertical: "top" }]} value={desc} onChangeText={setDesc} placeholder="Përshkrim i shkurtër" placeholderTextColor={Colors.textLight} multiline />
            <Text style={styles.formLabel}>Çmimi (€) *</Text>
            <TextInput style={styles.formInput} value={price} onChangeText={setPrice} placeholder="0.00" placeholderTextColor={Colors.textLight} keyboardType="decimal-pad" />
            <Text style={styles.formLabel}>Kategoria *</Text>
            <TextInput style={styles.formInput} value={category} onChangeText={setCategory} placeholder="Pizza, Burger, Kafe..." placeholderTextColor={Colors.textLight} />
          </ScrollView>
          <Pressable style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveBtnText}>{product ? "Ruaj Ndryshimet" : "Shto Produktin"}</Text>}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function StoreDashboard() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { storeUser } = useApp();
  const [tab, setTab] = useState<"orders" | "products">("orders");
  const [refreshing, setRefreshing] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: orders } = useQuery({
    queryKey: ["store-orders", storeUser?.id],
    queryFn: () => api.getStoreOrders(storeUser!.id),
    enabled: !!storeUser,
    refetchInterval: 15000,
  });

  const { data: products } = useQuery({
    queryKey: ["store-products", storeUser?.id],
    queryFn: () => api.getStoreProducts(storeUser!.id),
    enabled: !!storeUser,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ["store-orders", storeUser?.id] });
    setRefreshing(false);
  }, [storeUser]);

  const handleDeleteProduct = async (productId: number) => {
    Alert.alert("Fshi Produktin", "A jeni i sigurt?", [
      { text: "Anulo" },
      {
        text: "Fshi", style: "destructive", onPress: async () => {
          try {
            await api.deleteProduct(storeUser!.id, productId);
            qc.invalidateQueries({ queryKey: ["store-products", storeUser?.id] });
          } catch {}
        }
      }
    ]);
  };

  if (!storeUser) {
    return (
      <View style={[styles.container, { paddingTop: topPad + 20, alignItems: "center", justifyContent: "center" }]}>
        <Text style={styles.noAuthText}>Hyr si biznes për të menaxhuar</Text>
        <Pressable style={styles.authBtn} onPress={() => router.replace("/store-auth")}>
          <Text style={styles.authBtnText}>Hyr</Text>
        </Pressable>
      </View>
    );
  }

  const pendingCount = orders?.filter(o => o.status === "pending").length ?? 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{storeUser.name}</Text>
          <Text style={styles.headerSub}>{storeUser.category} • {storeUser.city}</Text>
        </View>
        <Pressable onPress={() => router.push("/notifications")}>
          <Ionicons name="notifications" size={22} color={Colors.white} />
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{orders?.filter(o => ["pending", "confirmed", "preparing", "ready"].includes(o.status)).length ?? 0}</Text>
          <Text style={styles.statLabel}>Aktive</Text>
        </View>
        <View style={[styles.statCard, pendingCount > 0 && { borderColor: Colors.warning, borderWidth: 2 }]}>
          <Text style={[styles.statValue, pendingCount > 0 && { color: Colors.warning }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Të reja</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{orders?.filter(o => o.status === "delivered").length ?? 0}</Text>
          <Text style={styles.statLabel}>Dorëzuar</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{products?.length ?? 0}</Text>
          <Text style={styles.statLabel}>Produkte</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <Pressable style={[styles.tabBtn, tab === "orders" && styles.tabBtnActive]} onPress={() => setTab("orders")}>
          <Ionicons name="receipt" size={16} color={tab === "orders" ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabBtnText, tab === "orders" && styles.tabBtnTextActive]}>
            Porositë {pendingCount > 0 ? `(${pendingCount})` : ""}
          </Text>
        </Pressable>
        <Pressable style={[styles.tabBtn, tab === "products" && styles.tabBtnActive]} onPress={() => setTab("products")}>
          <Ionicons name="grid" size={16} color={tab === "products" ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabBtnText, tab === "products" && styles.tabBtnTextActive]}>Produktet</Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {tab === "orders" ? (
          <>
            {!orders || orders.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="receipt-outline" size={48} color={Colors.textLight} />
                <Text style={styles.emptyText}>Nuk ka porosi ende</Text>
              </View>
            ) : (
              orders
                .filter(o => o.status !== "delivered" && o.status !== "cancelled")
                .concat(orders.filter(o => o.status === "delivered" || o.status === "cancelled"))
                .map(order => <OrderCard key={order.id} order={order} storeId={storeUser.id} />)
            )}
          </>
        ) : (
          <>
            <Pressable style={styles.addProductBtn} onPress={() => { setEditingProduct(undefined); setShowProductModal(true); }}>
              <Ionicons name="add-circle" size={20} color={Colors.white} />
              <Text style={styles.addProductBtnText}>Shto Produkt</Text>
            </Pressable>
            {!products || products.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="basket-outline" size={48} color={Colors.textLight} />
                <Text style={styles.emptyText}>Nuk ka produkte. Shtoni produkte!</Text>
              </View>
            ) : (
              products.map(product => (
                <View key={product.id} style={styles.productRow}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productCategory}>{product.category}</Text>
                  </View>
                  <Text style={styles.productPrice}>{product.price.toFixed(2)}€</Text>
                  <View style={[styles.availBadge, { backgroundColor: product.isAvailable ? Colors.successLight : Colors.errorLight }]}>
                    <Text style={{ fontSize: 11, color: product.isAvailable ? Colors.success : Colors.error, fontFamily: "Inter_600SemiBold" }}>
                      {product.isAvailable ? "Aktiv" : "Jo Aktiv"}
                    </Text>
                  </View>
                  <Pressable onPress={() => { setEditingProduct(product); setShowProductModal(true); }}>
                    <Ionicons name="create-outline" size={20} color={Colors.primary} />
                  </Pressable>
                  <Pressable onPress={() => handleDeleteProduct(product.id)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.error} />
                  </Pressable>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      <ProductModal
        visible={showProductModal}
        onClose={() => setShowProductModal(false)}
        storeId={storeUser.id}
        product={editingProduct}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16, paddingBottom: 16,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.white },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  statCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 12, padding: 12,
    alignItems: "center", ...Colors.cardShadow,
  },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.primary },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  tabsRow: {
    flexDirection: "row", marginHorizontal: 16, marginBottom: 14,
    backgroundColor: Colors.surfaceSecondary, borderRadius: 12, padding: 4,
  },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 10, gap: 6 },
  tabBtnActive: { backgroundColor: Colors.white, ...Colors.cardShadow },
  tabBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  tabBtnTextActive: { color: Colors.primary, fontFamily: "Inter_700Bold" },
  orderCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16,
    marginBottom: 12, ...Colors.cardShadow,
  },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  orderId: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
  orderTime: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  customerInfo: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  customerText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, flex: 1 },
  itemsContainer: { backgroundColor: Colors.surfaceSecondary, borderRadius: 10, padding: 10, marginVertical: 10 },
  orderItem: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  itemQty: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.primary, width: 24 },
  itemName: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.text },
  itemPrice: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  orderFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  totalAmount: { fontFamily: "Inter_700Bold", color: Colors.text },
  orderActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  cancelBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.errorLight, alignItems: "center", justifyContent: "center",
  },
  nextBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  nextBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.white },
  addProductBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.primaryGreen, borderRadius: 14,
    paddingVertical: 14, marginBottom: 16, ...Colors.cardShadow,
  },
  addProductBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.white },
  productRow: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8, ...Colors.cardShadow,
  },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  productCategory: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  productPrice: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.primary },
  availBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  empty: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: Colors.textMuted, textAlign: "center" },
  noAuthText: { fontSize: 16, fontFamily: "Inter_500Medium", color: Colors.textMuted, marginBottom: 16 },
  authBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  authBtnText: { color: Colors.white, fontFamily: "Inter_600SemiBold", fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: "85%",
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text },
  formLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary, marginTop: 14, marginBottom: 6 },
  formInput: {
    backgroundColor: Colors.surfaceSecondary, borderRadius: 12, borderWidth: 1.5,
    borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.text,
  },
  saveBtn: {
    backgroundColor: Colors.primaryGreen, borderRadius: 14, paddingVertical: 16,
    alignItems: "center", marginTop: 20,
  },
  saveBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.white },
});
