import React, { useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Platform,
} from "react-native";
import { router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";

const TYPE_CONFIG: Record<string, { icon: any; color: string }> = {
  new_order: { icon: "receipt", color: Colors.primary },
  order_update: { icon: "notifications", color: Colors.primaryGreen },
  delivery: { icon: "bicycle", color: "#D4870A" },
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { storeUser, deliveryUser, role } = useApp();

  const userId = role === "store" ? storeUser?.id?.toString() : role === "delivery" ? deliveryUser?.phone : "guest";
  const userType = role;

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", userId, userType],
    queryFn: () => api.getNotifications(userId!, userType),
    enabled: !!userId,
    refetchInterval: 15000,
  });

  const onRefresh = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: ["notifications", userId, userType] });
  }, [userId, userType]);

  const handleMarkRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      qc.invalidateQueries({ queryKey: ["notifications", userId, userType] });
    } catch {}
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Njoftimet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: botPad + 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {!userId || userId === "guest" ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="person-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Nuk jeni kyçur</Text>
            <Text style={styles.emptyText}>Hyni si biznes ose korrierë për të parë njoftimet</Text>
          </View>
        ) : !notifications || notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Nuk ka njoftime</Text>
            <Text style={styles.emptyText}>Njoftimet e reja do të shfaqen këtu</Text>
          </View>
        ) : (
          <View style={{ marginTop: 16, gap: 8 }}>
            {notifications.map(notif => {
              const config = TYPE_CONFIG[notif.type] ?? { icon: "notifications", color: Colors.primary };
              return (
                <Pressable
                  key={notif.id}
                  style={[styles.notifCard, !notif.isRead && styles.notifCardUnread]}
                  onPress={() => handleMarkRead(notif.id)}
                >
                  <View style={[styles.notifIcon, { backgroundColor: config.color + "15" }]}>
                    <Ionicons name={config.icon} size={20} color={config.color} />
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifHeader}>
                      <Text style={styles.notifTitle}>{notif.title}</Text>
                      {!notif.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notifMessage}>{notif.message}</Text>
                    <Text style={styles.notifTime}>
                      {new Date(notif.createdAt).toLocaleString("sq-AL")}
                    </Text>
                    {notif.orderId && (
                      <Text style={styles.notifOrder}>Porosi #{notif.orderId}</Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.white,
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text, textAlign: "center" },
  notifCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    flexDirection: "row", gap: 12, ...Colors.cardShadow,
  },
  notifCardUnread: {
    backgroundColor: Colors.primary + "05",
    borderWidth: 1, borderColor: Colors.primary + "20",
  },
  notifIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  notifTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginLeft: 8, marginTop: 3 },
  notifMessage: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 18, marginBottom: 6 },
  notifTime: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textLight },
  notifOrder: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.primary, marginTop: 4 },
  emptyContainer: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.text },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center" },
});
