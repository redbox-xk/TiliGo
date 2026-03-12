import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";

type AuthMode = "login" | "register";

export default function StoreAuthScreen() {
  const insets = useSafeAreaInsets();
  const { setStoreUser, setRole } = useApp();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);

  const [businessNumber, setBusinessNumber] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [showPass, setShowPass] = useState(false);

  const CATEGORIES = ["Restaurant", "Fast Food", "Supermarket", "Kafe", "Farmaci", "Tjetër"];

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleLogin = async () => {
    if (!businessNumber.trim() || !password.trim()) {
      Alert.alert("Gabim", "Plotësoni të gjitha fushat");
      return;
    }
    setLoading(true);
    try {
      const store = await api.loginStore(businessNumber.trim(), password);
      setStoreUser({
        id: store.id,
        name: store.name,
        businessNumber: store.businessNumber,
        category: store.category,
        address: store.address,
        city: store.city,
        phone: store.phone,
        imageUrl: store.imageUrl,
        coverImageUrl: store.coverImageUrl,
        rating: store.rating,
        deliveryTime: store.deliveryTime,
        minOrder: store.minOrder,
        deliveryFee: store.deliveryFee,
        isOpen: store.isOpen,
      });
      setRole("store");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/store-dashboard");
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Gabim", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !businessNumber || !password || !category || !address || !city || !phone) {
      Alert.alert("Gabim", "Plotësoni të gjitha fushat e detyrueshme");
      return;
    }
    setLoading(true);
    try {
      const store = await api.registerStore({
        name, businessNumber, password, category, address, city, phone,
      });
      setStoreUser({
        id: store.id,
        name: store.name,
        businessNumber: store.businessNumber,
        category: store.category,
        address: store.address,
        city: store.city,
        phone: store.phone,
        imageUrl: store.imageUrl,
        rating: store.rating,
        minOrder: store.minOrder,
        deliveryFee: store.deliveryFee,
        isOpen: store.isOpen,
      });
      setRole("store");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/store-dashboard");
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Gabim", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Portali i Biznesit</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Image source={require("../assets/images/icon.png")} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.logoTitle}>TiliGo Biznes</Text>
            <Text style={styles.logoSubtitle}>Menaxhoni dyqanin tuaj me lehtësi</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <Pressable style={[styles.tab, mode === "login" && styles.tabActive]} onPress={() => setMode("login")}>
              <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>Hyrja</Text>
            </Pressable>
            <Pressable style={[styles.tab, mode === "register" && styles.tabActive]} onPress={() => setMode("register")}>
              <Text style={[styles.tabText, mode === "register" && styles.tabTextActive]}>Regjistrohu</Text>
            </Pressable>
          </View>

          {mode === "login" ? (
            <View style={styles.form}>
              <Text style={styles.label}>Numri i Biznesit *</Text>
              <TextInput
                style={styles.input}
                placeholder="p.sh. 811123456"
                placeholderTextColor={Colors.textLight}
                value={businessNumber}
                onChangeText={setBusinessNumber}
                autoCapitalize="none"
              />
              <Text style={styles.label}>Fjalëkalimi *</Text>
              <View style={styles.passRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <Pressable style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
                  <Ionicons name={showPass ? "eye-off" : "eye"} size={20} color={Colors.textMuted} />
                </Pressable>
              </View>
              <Pressable style={[styles.submitBtn, { opacity: loading ? 0.8 : 1 }]} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitText}>Hyr</Text>}
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>Emri i Biznesit *</Text>
              <TextInput style={styles.input} placeholder="p.sh. Pizzeria Prishtina" placeholderTextColor={Colors.textLight} value={name} onChangeText={setName} autoCapitalize="words" />

              <Text style={styles.label}>Numri i Regjistrimit të Biznesit (NRB) *</Text>
              <TextInput style={styles.input} placeholder="p.sh. 811123456" placeholderTextColor={Colors.textLight} value={businessNumber} onChangeText={setBusinessNumber} autoCapitalize="none" />

              <Text style={styles.label}>Kategoria *</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map(cat => (
                  <Pressable key={cat} style={[styles.catChip, category === cat && styles.catChipActive]} onPress={() => setCategory(cat)}>
                    <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>{cat}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Adresa *</Text>
              <TextInput style={styles.input} placeholder="Rr. Nënë Tereza 15" placeholderTextColor={Colors.textLight} value={address} onChangeText={setAddress} />

              <Text style={styles.label}>Qyteti *</Text>
              <TextInput style={styles.input} placeholder="Prishtinë" placeholderTextColor={Colors.textLight} value={city} onChangeText={setCity} autoCapitalize="words" />

              <Text style={styles.label}>Telefoni *</Text>
              <TextInput style={styles.input} placeholder="038-123-456" placeholderTextColor={Colors.textLight} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

              <Text style={styles.label}>Fjalëkalimi *</Text>
              <View style={styles.passRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Min. 6 karaktere"
                  placeholderTextColor={Colors.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <Pressable style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
                  <Ionicons name={showPass ? "eye-off" : "eye"} size={20} color={Colors.textMuted} />
                </Pressable>
              </View>

              <Pressable style={[styles.submitBtn, { backgroundColor: Colors.primaryGreen, opacity: loading ? 0.8 : 1 }]} onPress={handleRegister} disabled={loading}>
                {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitText}>Regjistrohu</Text>}
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, textAlign: "center" },
  logoArea: { alignItems: "center", paddingVertical: 28, gap: 8 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    overflow: "hidden",
    borderWidth: 2, borderColor: Colors.border,
  },
  logo: { width: "100%", height: "100%" },
  logoTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text },
  logoSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  tabs: {
    flexDirection: "row", backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12, padding: 4, marginBottom: 24,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  tabActive: { backgroundColor: Colors.white, ...Colors.cardShadow },
  tabText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  tabTextActive: { color: Colors.text, fontFamily: "Inter_700Bold" },
  form: { gap: 4 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary, marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: Colors.white, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.text,
  },
  passRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  eyeBtn: {
    backgroundColor: Colors.white, width: 50, height: 50,
    borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  catChipActive: { backgroundColor: Colors.primaryGreen, borderColor: Colors.primaryGreen },
  catChipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  catChipTextActive: { color: Colors.white },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16,
    alignItems: "center", marginTop: 24, ...Colors.strongShadow,
  },
  submitText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.white },
});
