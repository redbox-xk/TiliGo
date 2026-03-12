import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Store } from "@/lib/api";

interface StoreCardProps {
  store: Store;
  onPress: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  Restaurant: "restaurant",
  "Fast Food": "fast-food",
  Supermarket: "cart",
  Kafe: "cafe",
  Farmaci: "medical",
};

export function StoreCard({ store, onPress }: StoreCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        {store.imageUrl ? (
          <Image source={{ uri: store.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name={(CATEGORY_ICONS[store.category] as any) ?? "storefront"} size={40} color={Colors.primary} />
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: store.isOpen ? Colors.success : Colors.error }]}>
          <Text style={styles.statusText}>{store.isOpen ? "Hapur" : "Mbyllur"}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{store.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#F6C90E" />
            <Text style={styles.rating}>{store.rating.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.category}>{store.category} • {store.city}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.metaText}>{store.deliveryTime ?? "20-35 min"}</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Ionicons name="bicycle-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.metaText}>{store.deliveryFee === 0 ? "Falas" : `${store.deliveryFee.toFixed(2)}€`}</Text>
          </View>
          {store.minOrder > 0 && (
            <>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>Min: {store.minOrder.toFixed(2)}€</Text>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    ...Colors.cardShadow,
  },
  imageContainer: {
    position: "relative",
    height: 160,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: Colors.white,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  info: {
    padding: 14,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rating: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  category: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
});
