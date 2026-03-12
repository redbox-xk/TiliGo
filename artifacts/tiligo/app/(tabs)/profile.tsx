import React from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Image, Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

function MenuRow({ icon, label, sublabel, onPress, color, badge }: {
  icon: any; label: string; sublabel?: string; onPress: () => void; color?: string; badge?: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuRow, { opacity: pressed ? 0.7 : 1 }]}
      onPress={() => { Haptics.selectionAsync(); onPress(); }}
    >
      <View style={[styles.menuIcon, { backgroundColor: (color ?? Colors.primary) + "20" }]}>
        <Ionicons name={icon} size={20} color={color ?? Colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      {badge && <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}
      <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { role, setRole, storeUser, setStoreUser, deliveryUser, setDeliveryUser, notificationCount } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleLogout = () => {
    setStoreUser(null);
    setDeliveryUser(null);
    setRole("customer");
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={styles.headerTitle}>Profili</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : 100 + insets.bottom }}
      >
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.avatar}
              resizeMode="contain"
            />
          </View>
          <View style={styles.heroInfo}>
            {role === "store" && storeUser ? (
              <>
                <Text style={styles.heroName}>{storeUser.name}</Text>
                <Text style={styles.heroRole}>Biznes • {storeUser.category}</Text>
                <View style={styles.heroMeta}>
                  <Ionicons name="location" size={13} color={Colors.textMuted} />
                  <Text style={styles.heroMetaText}>{storeUser.city}</Text>
                </View>
              </>
            ) : role === "delivery" && deliveryUser ? (
              <>
                <Text style={styles.heroName}>{deliveryUser.name}</Text>
                <Text style={styles.heroRole}>Korrierë • {deliveryUser.vehicleType}</Text>
                <View style={styles.heroMeta}>
                  <Ionicons name="bicycle" size={13} color={Colors.textMuted} />
                  <Text style={styles.heroMetaText}>{deliveryUser.totalDeliveries} dërgime</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.heroName}>Blerës</Text>
                <Text style={styles.heroRole}>Porositni pa regjistrim</Text>
                <Text style={styles.heroSubtext}>TiliGo • Kosovo</Text>
              </>
            )}
          </View>
        </View>

        {/* Role Switcher */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Lloji i Llogarisë</Text>
          <View style={styles.card}>
            <View style={styles.roleGrid}>
              {([
                { id: "customer", label: "Blerës", icon: "person", color: Colors.primary },
                { id: "store", label: "Biznes", icon: "storefront", color: Colors.primaryGreen },
                { id: "delivery", label: "Korrierë", icon: "bicycle", color: "#D4870A" },
              ] as const).map(r => (
                <Pressable
                  key={r.id}
                  style={[styles.roleBtn, role === r.id && { backgroundColor: r.color + "15", borderColor: r.color }]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    if (r.id === "store") {
                      if (!storeUser) router.push("/store-auth");
                    } else if (r.id === "delivery") {
                      if (!deliveryUser) router.push("/delivery-auth");
                    }
                    setRole(r.id);
                  }}
                >
                  <Ionicons name={r.icon} size={22} color={role === r.id ? r.color : Colors.textMuted} />
                  <Text style={[styles.roleBtnText, role === r.id && { color: r.color }]}>{r.label}</Text>
                  {role === r.id && <View style={[styles.roleActive, { backgroundColor: r.color }]} />}
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Dashboard Links */}
        {role === "store" && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Menaxhimi i Biznesit</Text>
            <View style={styles.card}>
              {storeUser ? (
                <MenuRow icon="grid" label="Paneli i Biznesit" sublabel="Menaxho produktet dhe porositë"
                  onPress={() => router.push("/store-dashboard")} color={Colors.primaryGreen} />
              ) : (
                <MenuRow icon="log-in" label="Hyr / Regjistrohu si Biznes"
                  onPress={() => router.push("/store-auth")} color={Colors.primaryGreen} />
              )}
            </View>
          </View>
        )}

        {role === "delivery" && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Menaxhimi i Dërgesave</Text>
            <View style={styles.card}>
              {deliveryUser ? (
                <MenuRow icon="bicycle" label="Paneli i Korrieres" sublabel="Shiko porositë në pritje"
                  onPress={() => router.push("/delivery-dashboard")} color="#D4870A" />
              ) : (
                <MenuRow icon="log-in" label="Hyr / Regjistrohu si Korrierë"
                  onPress={() => router.push("/delivery-auth")} color="#D4870A" />
              )}
            </View>
          </View>
        )}

        {/* General */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Të Tjera</Text>
          <View style={styles.card}>
            <MenuRow icon="notifications" label="Njoftimet"
              badge={notificationCount > 0 ? notificationCount.toString() : undefined}
              onPress={() => router.push("/notifications")} />
            <View style={styles.divider} />
            <MenuRow icon="information-circle" label="Rreth TiliGo" onPress={() => {}} />
            <View style={styles.divider} />
            <MenuRow icon="call" label="Kontakt" sublabel="038-000-000" onPress={() => {}} />
          </View>
        </View>

        {/* Logout */}
        {(storeUser || deliveryUser) && (
          <View style={styles.section}>
            <View style={styles.card}>
              <MenuRow icon="log-out" label="Dil nga llogaria" onPress={handleLogout} color={Colors.error} />
            </View>
          </View>
        )}

        {/* Branding */}
        <View style={styles.brandingContainer}>
          <Image source={require("../../assets/images/icon.png")} style={styles.brandLogo} resizeMode="contain" />
          <Text style={styles.brandText}>TiliGo v1.0</Text>
          <Text style={styles.brandSubtext}>Shpejt, Sigurt, Shqip</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text },
  heroCard: {
    margin: 20,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    ...Colors.cardShadow,
  },
  avatarContainer: {
    width: 70, height: 70, borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    overflow: "hidden",
    borderWidth: 2, borderColor: Colors.border,
  },
  avatar: { width: "100%", height: "100%" },
  heroInfo: { flex: 1 },
  heroName: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text },
  heroRole: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textMuted, marginTop: 2 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  heroMetaText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  heroSubtext: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 4 },
  section: { marginHorizontal: 20, marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 },
  card: { backgroundColor: Colors.white, borderRadius: 16, overflow: "hidden", ...Colors.cardShadow },
  roleGrid: { flexDirection: "row", padding: 12, gap: 8 },
  roleBtn: {
    flex: 1, alignItems: "center", paddingVertical: 14, paddingHorizontal: 8,
    borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border,
    gap: 6, position: "relative",
  },
  roleBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.textMuted },
  roleActive: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4 },
  menuRow: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  menuIcon: {
    width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center",
  },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 15, fontFamily: "Inter_500Medium", color: Colors.text },
  menuSublabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 1 },
  badge: {
    backgroundColor: Colors.error, borderRadius: 10,
    minWidth: 22, height: 22, alignItems: "center", justifyContent: "center", paddingHorizontal: 6,
  },
  badgeText: { fontSize: 11, fontFamily: "Inter_700Bold", color: Colors.white },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: 16 },
  brandingContainer: { alignItems: "center", paddingVertical: 24, gap: 4 },
  brandLogo: { width: 50, height: 50, borderRadius: 12 },
  brandText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textMuted },
  brandSubtext: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textLight },
});
