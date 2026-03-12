import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, RefreshControl,
  Alert, ActivityIndicator, Platform,
} from "react-native";
import { router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { api, Order } from "@/lib/api";

function AvailableOrderCard({ order, driverId, onAccept }: { order: Order; driverId: number; onAccept: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await api.acceptOrder(driverId, order.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onAccept();
    } catch (e: any) {
      Alert.alert("Gabim", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Porosi #{order.id}</Text>
          <Text style={styles.orderTime}>{new Date(order.createdAt).toLocaleString("sq-AL")}</Text>
        </View>
        <View style={styles.earningBadge}>
          <Text style={styles.earningText}>{order.deliveryFee.toFixed(2)}€</Text>
          <Text style={styles.earningLabel}>fitim</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={[styles.infoIcon, { backgroundColor: Colors.primary + "15" }]}>
          <Ionicons name="storefront" size={16} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.infoLabel}>Marrja</Text>
          <Text style={styles.infoText}>{order.storeName}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={[styles.infoIcon, { backgroundColor: Colors.primaryGreen + "15" }]}>
          <Ionicons name="location" size={16} color={Colors.primaryGreen} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.infoLabel}>Dorëzimi</Text>
          <Text style={styles.infoText} numberOfLines={1}>{order.customerAddress}</Text>
        </View>
      </View>

      <View style={styles.orderMeta}>
        <View style={styles.metaChip}>
          <Ionicons name="cube-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.metaChipText}>{order.items.length} produkte</Text>
        </View>
        <View style={styles.metaChip}>
          <Ionicons name="cash-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.metaChipText}>{order.totalAmount.toFixed(2)}€</Text>
        </View>
      </View>

      <Pressable style={[styles.acceptBtn, { opacity: loading ? 0.8 : 1 }]} onPress={handleAccept} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
            <Text style={styles.acceptBtnText}>Pranoj Dërgimin</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

function ActiveOrderCard({ order, driverId }: { order: Order; driverId: number }) {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleDeliver = async () => {
    Alert.alert("Konfirmo Dorëzimin", "A e keni dorëzuar porosinë?", [
      { text: "Jo" },
      {
        text: "Po, e dorëzova!", onPress: async () => {
          setLoading(true);
          try {
            await api.updateOrderStatus(order.id, "delivered");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            qc.invalidateQueries({ queryKey: ["driver-active", driverId] });
            qc.invalidateQueries({ queryKey: ["available-orders", driverId] });
          } catch (e: any) {
            Alert.alert("Gabim", e.message);
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  return (
    <View style={[styles.orderCard, { borderLeftWidth: 4, borderLeftColor: Colors.primaryGreen }]}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Porosi #{order.id}</Text>
          <View style={styles.activeStatus}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Duke u Dërguar</Text>
          </View>
        </View>
        <Text style={styles.earningAmount}>{order.deliveryFee.toFixed(2)}€</Text>
      </View>

      <View style={styles.deliveryRoute}>
        <View style={styles.routePoint}>
          <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
          <View>
            <Text style={styles.routeLabel}>Merre nga</Text>
            <Text style={styles.routeText}>{order.storeName}</Text>
          </View>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <View style={[styles.routeDot, { backgroundColor: Colors.primaryGreen }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.routeLabel}>Dërgo tek</Text>
            <Text style={styles.routeText} numberOfLines={2}>{order.customerAddress}</Text>
            <Text style={styles.routeContact}>{order.customerName} • {order.customerPhone}</Text>
          </View>
        </View>
      </View>

      <Pressable style={[styles.deliveredBtn, { opacity: loading ? 0.8 : 1 }]} onPress={handleDeliver} disabled={loading}>
        {loading ? <ActivityIndicator color={Colors.white} /> : (
          <>
            <Ionicons name="checkmark-done" size={18} color={Colors.white} />
            <Text style={styles.deliveredBtnText}>E kam Dorëzuar</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

export default function DeliveryDashboard() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { deliveryUser } = useApp();
  const [tab, setTab] = useState<"available" | "active">("available");
  const [refreshing, setRefreshing] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: availableOrders } = useQuery({
    queryKey: ["available-orders", deliveryUser?.id],
    queryFn: () => api.getAvailableOrders(deliveryUser!.id),
    enabled: !!deliveryUser,
    refetchInterval: 10000,
  });

  const { data: activeOrders } = useQuery({
    queryKey: ["driver-active", deliveryUser?.id],
    queryFn: () => api.getDriverActiveOrders(deliveryUser!.id),
    enabled: !!deliveryUser,
    refetchInterval: 10000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ["available-orders", deliveryUser?.id] });
    await qc.invalidateQueries({ queryKey: ["driver-active", deliveryUser?.id] });
    setRefreshing(false);
  }, [deliveryUser]);

  if (!deliveryUser) {
    return (
      <View style={[styles.container, { paddingTop: topPad + 20, alignItems: "center", justifyContent: "center" }]}>
        <Text style={styles.noAuthText}>Hyr si korrierë për të filluar</Text>
        <Pressable style={styles.authBtn} onPress={() => router.replace("/delivery-auth")}>
          <Text style={styles.authBtnText}>Hyr</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{deliveryUser.name}</Text>
          <Text style={styles.headerSub}>{deliveryUser.vehicleType} • {deliveryUser.totalDeliveries} dërgime</Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Online</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="cube" size={20} color={Colors.primary} />
          <Text style={styles.statValue}>{availableOrders?.length ?? 0}</Text>
          <Text style={styles.statLabel}>Disponueshme</Text>
        </View>
        <View style={[styles.statCard, (activeOrders?.length ?? 0) > 0 && { borderColor: Colors.primaryGreen, borderWidth: 2 }]}>
          <Ionicons name="bicycle" size={20} color={Colors.primaryGreen} />
          <Text style={[styles.statValue, { color: Colors.primaryGreen }]}>{activeOrders?.length ?? 0}</Text>
          <Text style={styles.statLabel}>Aktive</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={20} color="#D4870A" />
          <Text style={styles.statValue}>{deliveryUser.totalDeliveries}</Text>
          <Text style={styles.statLabel}>Totali</Text>
        </View>
      </View>

      <View style={styles.tabsRow}>
        <Pressable style={[styles.tabBtn, tab === "available" && styles.tabBtnActive]} onPress={() => setTab("available")}>
          <Text style={[styles.tabBtnText, tab === "available" && styles.tabBtnTextActive]}>
            Disponueshme {availableOrders && availableOrders.length > 0 ? `(${availableOrders.length})` : ""}
          </Text>
        </Pressable>
        <Pressable style={[styles.tabBtn, tab === "active" && styles.tabBtnActive]} onPress={() => setTab("active")}>
          <Text style={[styles.tabBtnText, tab === "active" && styles.tabBtnTextActive]}>
            Aktive {activeOrders && activeOrders.length > 0 ? `(${activeOrders.length})` : ""}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {tab === "available" ? (
          availableOrders?.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="hourglass-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>Nuk ka porosi disponueshme</Text>
              <Text style={styles.emptyText}>Porositë e reja do të shfaqen këtu. Tërhiqni poshtë për të rifreskuar.</Text>
            </View>
          ) : (
            availableOrders?.map(order => (
              <AvailableOrderCard
                key={order.id} order={order} driverId={deliveryUser.id}
                onAccept={() => { qc.invalidateQueries({ queryKey: ["available-orders", deliveryUser.id] }); qc.invalidateQueries({ queryKey: ["driver-active", deliveryUser.id] }); }}
              />
            ))
          )
        ) : (
          activeOrders?.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="bicycle-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>Nuk ka dërgime aktive</Text>
              <Text style={styles.emptyText}>Pranoni porosi nga lista e disponueshme</Text>
            </View>
          ) : (
            activeOrders?.map(order => <ActiveOrderCard key={order.id} order={order} driverId={deliveryUser.id} />)
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: "#D4870A",
    paddingHorizontal: 16, paddingBottom: 16,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.white },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  statusIndicator: { flexDirection: "row", alignItems: "center", gap: 5 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#7FFF00" },
  onlineText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.white },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  statCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    alignItems: "center", gap: 4, ...Colors.cardShadow,
  },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center" },
  tabsRow: {
    flexDirection: "row", marginHorizontal: 16, marginBottom: 14,
    backgroundColor: Colors.surfaceSecondary, borderRadius: 12, padding: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  tabBtnActive: { backgroundColor: Colors.white, ...Colors.cardShadow },
  tabBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  tabBtnTextActive: { color: Colors.text, fontFamily: "Inter_700Bold" },
  orderCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12, ...Colors.cardShadow,
  },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  orderId: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
  orderTime: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  earningBadge: {
    backgroundColor: Colors.primaryGreen + "15", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6, alignItems: "center",
  },
  earningText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.primaryGreen },
  earningLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.primaryGreen },
  earningAmount: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.primaryGreen },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  infoIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  infoText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  orderMeta: { flexDirection: "row", gap: 8, marginBottom: 14 },
  metaChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.surfaceSecondary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  metaChipText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  acceptBtn: {
    backgroundColor: Colors.primaryGreen, borderRadius: 14, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  acceptBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.white },
  activeStatus: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryGreen },
  activeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.primaryGreen },
  deliveryRoute: { gap: 12, marginBottom: 14 },
  routePoint: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  routeLine: { height: 16, width: 2, backgroundColor: Colors.border, marginLeft: 4 },
  routeLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  routeText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  routeContact: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  deliveredBtn: {
    backgroundColor: Colors.primaryGreen, borderRadius: 14, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  deliveredBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.white },
  empty: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: Colors.text },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center" },
  noAuthText: { fontSize: 16, fontFamily: "Inter_500Medium", color: Colors.textMuted, marginBottom: 16 },
  authBtn: { backgroundColor: "#D4870A", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  authBtnText: { color: Colors.white, fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
