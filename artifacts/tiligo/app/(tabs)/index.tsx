import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TextInput, Pressable, Image, ActivityIndicator, Animated,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { Colors } from "@/constants/colors";
import { api, Store } from "@/lib/api";
import { StoreCard } from "@/components/StoreCard";

const CATEGORIES = [
  { id: "all", label: "Të Gjitha", icon: "grid" as const },
  { id: "Restaurant", label: "Restaurant", icon: "restaurant" as const },
  { id: "Fast Food", label: "Fast Food", icon: "fast-food" as const },
  { id: "Supermarket", label: "Supermarket", icon: "cart" as const },
  { id: "Kafe", label: "Kafe", icon: "cafe" as const },
  { id: "Farmaci", label: "Farmaci", icon: "medical" as const },
];

const BANNERS = [
  { id: 1, text: "Dërgesa Falas\npër 3 porosite e para", bg: Colors.primary, icon: "bicycle" as const },
  { id: 2, text: "Restorante të Reja\nçdo javë", bg: Colors.primaryGreen, icon: "restaurant" as const },
  { id: 3, text: "Shpejt & Sigurt\nnë Kosovë", bg: "#7B1FA2", icon: "flash" as const },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [seeded, setSeeded] = useState(false);

  const { data: stores, isLoading, error } = useQuery({
    queryKey: ["stores"],
    queryFn: () => api.getStores(),
  });

  useEffect(() => {
    const seed = async () => {
      try {
        await api.seed();
        queryClient.invalidateQueries({ queryKey: ["stores"] });
        setSeeded(true);
      } catch {}
    };
    if (!seeded) seed();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex(i => (i + 1) % BANNERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["stores"] });
    setRefreshing(false);
  }, []);

  const filteredStores = stores?.filter(s =>
    selectedCategory === "all" || s.category === selectedCategory
  ) ?? [];

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 16 }]}>
          <View style={styles.headerTop}>
            <View>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color={Colors.accent} />
                <Text style={styles.locationText}>Prishtinë, Kosovë</Text>
                <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
              </View>
              <Text style={styles.greeting}>Çfarë dëshironi sot?</Text>
            </View>
            <Pressable style={styles.logoContainer} onPress={() => router.push("/notifications")}>
              <Image
                source={require("../../assets/images/icon.png")}
                style={styles.logoSmall}
                resizeMode="contain"
              />
              <View style={styles.notifBadge} />
            </Pressable>
          </View>

          {/* Search Bar */}
          <Pressable
            style={styles.searchBar}
            onPress={() => router.push("/(tabs)/search")}
          >
            <Ionicons name="search" size={18} color={Colors.textMuted} />
            <Text style={styles.searchPlaceholder}>Kërko restorante, dyqane...</Text>
          </Pressable>
        </View>

        {/* Promo Banner */}
        <View style={styles.bannerContainer}>
          <View style={[styles.banner, { backgroundColor: BANNERS[bannerIndex].bg }]}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerText}>{BANNERS[bannerIndex].text}</Text>
              <Pressable style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>Porosit Tani</Text>
              </Pressable>
            </View>
            <View style={styles.bannerIconContainer}>
              <Ionicons name={BANNERS[bannerIndex].icon} size={60} color="rgba(255,255,255,0.3)" />
            </View>
          </View>
          <View style={styles.bannerDots}>
            {BANNERS.map((_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: i === bannerIndex ? Colors.primary : Colors.border }]} />
            ))}
          </View>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categories}>
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat.id}
              style={[styles.categoryBtn, selectedCategory === cat.id && styles.categoryBtnActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon}
                size={18}
                color={selectedCategory === cat.id ? Colors.white : Colors.textSecondary}
              />
              <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Stores Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === "all" ? "Të Gjitha Dyqanet" : selectedCategory}
            </Text>
            <Text style={styles.sectionCount}>{filteredStores.length} disponueshëm</Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Duke ngarkuar...</Text>
            </View>
          ) : filteredStores.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="storefront-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>Nuk ka dyqane disponueshëm</Text>
            </View>
          ) : (
            <View style={styles.storesList}>
              {filteredStores.map(store => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onPress={() => router.push({ pathname: "/store/[id]", params: { id: store.id.toString() } })}
                />
              ))}
            </View>
          )}
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  locationText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  greeting: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text },
  logoContainer: { position: "relative" },
  logoSmall: { width: 44, height: 44, borderRadius: 12 },
  notifBadge: {
    position: "absolute", top: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.error, borderWidth: 2, borderColor: Colors.white,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchPlaceholder: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  bannerContainer: { paddingHorizontal: 20, marginTop: 20 },
  banner: {
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    overflow: "hidden",
    minHeight: 110,
  },
  bannerContent: { flex: 1, justifyContent: "space-between" },
  bannerText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.white, lineHeight: 22 },
  bannerBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  bannerBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.white },
  bannerIconContainer: { justifyContent: "center" },
  bannerDots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  categoriesScroll: { marginTop: 20 },
  categories: { paddingHorizontal: 20, gap: 8 },
  categoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  categoryTextActive: { color: Colors.white },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  sectionCount: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  storesList: { gap: 0 },
  loadingContainer: { alignItems: "center", paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  emptyContainer: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium", color: Colors.textMuted },
});
