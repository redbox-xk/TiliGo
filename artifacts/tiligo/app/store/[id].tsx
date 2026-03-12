import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Image, Pressable,
  ActivityIndicator, Alert, Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { api, Product } from "@/lib/api";
import { useApp, CartItem } from "@/context/AppContext";

function ProductCard({ product, storeId, storeName }: { product: Product; storeId: number; storeName: string }) {
  const { addToCart, cart } = useApp();
  const cartItem = cart.find(c => c.productId === product.id);
  const qty = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      storeId,
      storeName,
    });
  };

  return (
    <View style={[styles.productCard, !product.isAvailable && { opacity: 0.5 }]}>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} resizeMode="cover" />
      ) : (
        <View style={[styles.productImage, styles.productImagePlaceholder]}>
          <Ionicons name="image-outline" size={28} color={Colors.textLight} />
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        {product.description && (
          <Text style={styles.productDesc} numberOfLines={2}>{product.description}</Text>
        )}
        <View style={styles.productBottom}>
          <Text style={styles.productPrice}>{product.price.toFixed(2)}€</Text>
          {product.isAvailable ? (
            <Pressable
              style={[styles.addBtn, qty > 0 && styles.addBtnActive]}
              onPress={handleAdd}
            >
              <Ionicons name="add" size={18} color={Colors.white} />
              {qty > 0 && <Text style={styles.addBtnQty}>{qty}</Text>}
            </Pressable>
          ) : (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Pa stok</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export default function StoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { cart, cartTotal, cartCount } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["store", id],
    queryFn: () => api.getStore(parseInt(id ?? "0")),
    enabled: !!id,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products", id],
    queryFn: () => api.getStoreProducts(parseInt(id ?? "0")),
    enabled: !!id,
  });

  const categories = products
    ? ["all", ...new Set(products.map(p => p.category))]
    : ["all"];

  const filteredProducts = products?.filter(p =>
    selectedCategory === "all" || p.category === selectedCategory
  ) ?? [];

  const cartHasItems = cart.length > 0 && cart[0].storeId === parseInt(id ?? "0");
  const deliveryFee = store?.deliveryFee ?? 1.5;

  if (storeLoading) {
    return (
      <View style={[styles.loadingScreen, { paddingTop: topPad }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Duke ngarkuar...</Text>
      </View>
    );
  }

  if (!store) {
    return (
      <View style={[styles.loadingScreen, { paddingTop: topPad }]}>
        <Text style={styles.loadingText}>Dyqani nuk u gjet</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Kthehu</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: cartHasItems ? 120 + botPad : 40 + botPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image */}
        <View style={[styles.coverContainer, { paddingTop: topPad }]}>
          {store.coverImageUrl ? (
            <Image source={{ uri: store.coverImageUrl }} style={styles.cover} resizeMode="cover" />
          ) : (
            <View style={[styles.cover, { backgroundColor: Colors.primary }]}>
              <Ionicons name="storefront" size={60} color="rgba(255,255,255,0.4)" />
            </View>
          )}
          <View style={styles.coverOverlay} />
          <Pressable style={[styles.backButton, { top: topPad + 10 }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.white} />
          </Pressable>
        </View>

        {/* Store Info */}
        <View style={styles.storeInfoCard}>
          {store.imageUrl && (
            <Image source={{ uri: store.imageUrl }} style={styles.storeLogo} resizeMode="cover" />
          )}
          <View style={styles.storeInfoContent}>
            <View style={styles.storeNameRow}>
              <Text style={styles.storeName}>{store.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: store.isOpen ? Colors.success : Colors.error }]}>
                <Text style={styles.statusText}>{store.isOpen ? "Hapur" : "Mbyllur"}</Text>
              </View>
            </View>
            <Text style={styles.storeCategory}>{store.category} • {store.city}</Text>
            {store.description && <Text style={styles.storeDescription}>{store.description}</Text>}

            <View style={styles.storeMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="star" size={14} color="#F6C90E" />
                <Text style={styles.metaText}>{store.rating.toFixed(1)}</Text>
              </View>
              <View style={styles.metaDot} />
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.metaText}>{store.deliveryTime}</Text>
              </View>
              <View style={styles.metaDot} />
              <View style={styles.metaItem}>
                <Ionicons name="bicycle-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.metaText}>{deliveryFee === 0 ? "Falas" : `${deliveryFee.toFixed(2)}€`}</Text>
              </View>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>Min: {store.minOrder.toFixed(2)}€</Text>
            </View>
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categories}>
          {categories.map(cat => (
            <Pressable
              key={cat}
              style={[styles.catBtn, selectedCategory === cat && styles.catBtnActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.catBtnText, selectedCategory === cat && styles.catBtnTextActive]}>
                {cat === "all" ? "Të Gjitha" : cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Products */}
        <View style={styles.productsContainer}>
          {productsLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyProducts}>
              <Ionicons name="basket-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>Nuk ka produkte</Text>
            </View>
          ) : (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} storeId={store.id} storeName={store.name} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Cart Bar */}
      {cartHasItems && (
        <View style={[styles.cartBar, { paddingBottom: botPad + 16 }]}>
          <Pressable
            style={({ pressed }) => [styles.cartBarBtn, { opacity: pressed ? 0.9 : 1 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(tabs)/cart");
            }}
          >
            <View style={styles.cartBarLeft}>
              <Text style={styles.cartBarCount}>{cartCount}</Text>
            </View>
            <Text style={styles.cartBarText}>Shikoni Shportën</Text>
            <Text style={styles.cartBarPrice}>{(cartTotal + deliveryFee).toFixed(2)}€</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingScreen: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: Colors.background },
  loadingText: { fontSize: 16, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  backBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  backBtnText: { color: Colors.white, fontFamily: "Inter_600SemiBold" },
  coverContainer: { position: "relative", height: 260 },
  cover: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  coverOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)" },
  backButton: {
    position: "absolute", left: 16,
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center", justifyContent: "center",
  },
  storeInfoCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 20,
    padding: 16,
    ...Colors.strongShadow,
  },
  storeLogo: { width: 60, height: 60, borderRadius: 14, marginBottom: 12 },
  storeInfoContent: {},
  storeNameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  storeName: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text, flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 8 },
  statusText: { color: Colors.white, fontSize: 11, fontFamily: "Inter_600SemiBold" },
  storeCategory: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginBottom: 8 },
  storeDescription: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, marginBottom: 12, lineHeight: 18 },
  storeMeta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.textLight },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  categoriesScroll: { marginTop: 20 },
  categories: { paddingHorizontal: 16, gap: 8 },
  catBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  catBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  catBtnTextActive: { color: Colors.white },
  productsContainer: { paddingHorizontal: 16, marginTop: 16, gap: 12 },
  productCard: {
    backgroundColor: Colors.white, borderRadius: 16, overflow: "hidden",
    flexDirection: "row", ...Colors.cardShadow,
  },
  productImage: { width: 100, height: 100 },
  productImagePlaceholder: { backgroundColor: Colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  productInfo: { flex: 1, padding: 12, justifyContent: "space-between" },
  productName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text, lineHeight: 20 },
  productDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, lineHeight: 16 },
  productBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  productPrice: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.primary },
  addBtn: {
    backgroundColor: Colors.primary, width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 4,
  },
  addBtnActive: { backgroundColor: Colors.accent, paddingHorizontal: 10, width: "auto" },
  addBtnQty: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.white },
  unavailableBadge: {
    backgroundColor: Colors.surfaceSecondary, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8,
  },
  unavailableText: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  emptyProducts: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  cartBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  cartBarBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16, padding: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    ...Colors.strongShadow,
  },
  cartBarLeft: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 28, height: 28, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  cartBarCount: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.white },
  cartBarText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.white },
  cartBarPrice: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.white },
});
