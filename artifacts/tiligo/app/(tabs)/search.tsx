import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  Pressable, ActivityIndicator, Platform,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { api } from "@/lib/api";
import { StoreCard } from "@/components/StoreCard";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: allStores, isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: () => api.getStores(),
  });

  const filtered = allStores?.filter(s =>
    !searchText ||
    s.name.toLowerCase().includes(searchText.toLowerCase()) ||
    s.category.toLowerCase().includes(searchText.toLowerCase()) ||
    s.city.toLowerCase().includes(searchText.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchText.toLowerCase()))
  ) ?? [];

  const suggestions = ["Pizza", "Burger", "Kafe", "Supermarket", "Farmaci"];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={styles.title}>Kërko</Text>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Restorante, dyqane, ushqime..."
            placeholderTextColor={Colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Platform.OS === "web" ? 100 : 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {!searchText ? (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Sugjerime Popullore</Text>
            <View style={styles.suggestionsGrid}>
              {suggestions.map(s => (
                <Pressable key={s} style={styles.suggestionChip} onPress={() => setSearchText(s)}>
                  <Ionicons name="trending-up" size={14} color={Colors.primary} />
                  <Text style={styles.suggestionText}>{s}</Text>
                </Pressable>
              ))}
            </View>
            {allStores && allStores.length > 0 && (
              <>
                <Text style={[styles.suggestionsTitle, { marginTop: 24 }]}>Të Gjitha Dyqanet</Text>
                {allStores.map(store => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    onPress={() => router.push({ pathname: "/store/[id]", params: { id: store.id.toString() } })}
                  />
                ))}
              </>
            )}
          </View>
        ) : (
          <View style={{ marginTop: 16 }}>
            {isLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
            ) : filtered.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={Colors.textLight} />
                <Text style={styles.emptyTitle}>Nuk u gjet asgjë</Text>
                <Text style={styles.emptyText}>Provoni me fjalë të tjera</Text>
              </View>
            ) : (
              <>
                <Text style={styles.resultsText}>{filtered.length} rezultate për "{searchText}"</Text>
                {filtered.map(store => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    onPress={() => router.push({ pathname: "/store/[id]", params: { id: store.id.toString() } })}
                  />
                ))}
              </>
            )}
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 14 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    padding: 0,
  },
  suggestionsContainer: { marginTop: 20 },
  suggestionsTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 12 },
  suggestionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Colors.cardShadow,
  },
  suggestionText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.text },
  resultsText: {
    fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginBottom: 16,
  },
  emptyContainer: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.text },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textMuted },
});
