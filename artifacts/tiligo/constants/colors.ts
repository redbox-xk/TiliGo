const primaryBlue = "#1565C0";
const primaryGreen = "#2E7D32";
const accentBlue = "#1E88E5";
const accentGreen = "#43A047";

export const Colors = {
  primary: primaryBlue,
  primaryGreen: primaryGreen,
  accent: accentBlue,
  accentGreen: accentGreen,
  background: "#F8FAFB",
  surface: "#FFFFFF",
  surfaceSecondary: "#F0F4F8",
  border: "#E2E8F0",
  borderLight: "#EDF2F7",
  text: "#0F1117",
  textSecondary: "#4A5568",
  textMuted: "#718096",
  textLight: "#A0AEC0",
  error: "#E53E3E",
  errorLight: "#FFF5F5",
  success: "#38A169",
  successLight: "#F0FFF4",
  warning: "#D69E2E",
  warningLight: "#FFFFF0",
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0,0,0,0.5)",
  gradientBlue: ["#1565C0", "#1E88E5"],
  gradientGreen: ["#2E7D32", "#43A047"],
  gradientBluGreen: ["#1565C0", "#2E7D32"],
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  strongShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export default {
  light: {
    text: Colors.text,
    background: Colors.background,
    tint: Colors.primary,
    tabIconDefault: Colors.textMuted,
    tabIconSelected: Colors.primary,
  },
};
