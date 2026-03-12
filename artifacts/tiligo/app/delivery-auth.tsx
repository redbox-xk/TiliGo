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

export default function DeliveryAuthScreen() {
  const insets = useSafeAreaInsets();
  const { setDeliveryUser, setRole } = useApp();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);

  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [showPass, setShowPass] = useState(false);

  const VEHICLES = ["Makinë", "Motor", "Biçikletë", "Kambuz"];
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleLogin = async () => {
    if (!idNumber.trim() || !password.trim()) {
      Alert.alert("Gabim", "Plotësoni të gjitha fushat");
      return;
    }
    setLoading(true);
    try {
      const driver = await api.loginDelivery(idNumber.trim(), password);
      setDeliveryUser(driver);
      setRole("delivery");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/delivery-dashboard");
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Gabim", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !idNumber || !password || !phone || !vehicleType) {
      Alert.alert("Gabim", "Plotësoni të gjitha fushat");
      return;
    }
    setLoading(true);
    try {
      const driver = await api.registerDelivery({ name, idNumber, phone, vehicleType, password });
      setDeliveryUser(driver);
      setRole("delivery");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/delivery-dashboard");
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
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Portali i Korriereve</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoArea}>
            <View style={[styles.logoCircle, { backgroundColor: "#D4870A" + "20" }]}>
              <Ionicons name="bicycle" size={48} color="#D4870A" />
            </View>
            <Text style={styles.logoTitle}>TiliGo Korrierë</Text>
            <Text style={styles.logoSubtitle}>Fitoni duke dërguar porosi</Text>
          </View>

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
              <Text style={styles.label}>Numri i Dokumentit të Identitetit (ID) *</Text>
              <TextInput
                style={styles.input}
                placeholder="p.sh. 1234567890"
                placeholderTextColor={Colors.textLight}
                value={idNumber}
                onChangeText={setIdNumber}
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
              <Pressable style={[styles.submitBtn, { backgroundColor: "#D4870A" }]} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitText}>Hyr</Text>}
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>Emri i plotë *</Text>
              <TextInput style={styles.input} placeholder="Agron Berisha" placeholderTextColor={Colors.textLight} value={name} onChangeText={setName} autoCapitalize="words" />

              <Text style={styles.label}>Numri i Dokumentit të Identitetit (ID) *</Text>
              <TextInput style={styles.input} placeholder="p.sh. 1234567890" placeholderTextColor={Colors.textLight} value={idNumber} onChangeText={setIdNumber} autoCapitalize="none" />

              <Text style={styles.label}>Telefoni *</Text>
              <TextInput style={styles.input} placeholder="044 123 456" placeholderTextColor={Colors.textLight} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

              <Text style={styles.label}>Lloji i Mjetit *</Text>
              <View style={styles.vehicleGrid}>
                {VEHICLES.map(v => (
                  <Pressable key={v} style={[styles.vehicleChip, vehicleType === v && styles.vehicleChipActive]} onPress={() => setVehicleType(v)}>
                    <Ionicons
                      name={v === "Makinë" ? "car" : v === "Motor" ? "speedometer" : v === "Biçikletë" ? "bicycle" : "cube"}
                      size={20}
                      color={vehicleType === v ? Colors.white : "#D4870A"}
                    />
                    <Text style={[styles.vehicleText, vehicleType === v && styles.vehicleTextActive]}>{v}</Text>
                  </Pressable>
                ))}
              </View>

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

              <View style={styles.noteCard}>
                <Ionicons name="information-circle" size={18} color={Colors.accent} />
                <Text style={styles.noteText}>Nuk keni nevojë për email. Identifikohuni vetëm me numrin e ID-së tuaj.</Text>
              </View>

              <Pressable style={[styles.submitBtn, { backgroundColor: "#D4870A" }]} onPress={handleRegister} disabled={loading}>
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
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#D4870A" + "40",
  },
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
  vehicleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  vehicleChip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1.5, borderColor: "#D4870A" + "60",
    backgroundColor: Colors.white,
  },
  vehicleChipActive: { backgroundColor: "#D4870A", borderColor: "#D4870A" },
  vehicleText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#D4870A" },
  vehicleTextActive: { color: Colors.white },
  noteCard: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    backgroundColor: Colors.accent + "10",
    borderRadius: 12, padding: 14, marginTop: 12,
    borderWidth: 1, borderColor: Colors.accent + "30",
  },
  noteText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, flex: 1 },
  submitBtn: {
    borderRadius: 16, paddingVertical: 16,
    alignItems: "center", marginTop: 24, ...Colors.strongShadow,
  },
  submitText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.white },
});
