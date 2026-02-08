/**
 * Design Token System - Colors
 * Semantic color tokens for light and dark themes
 * Based on shadcn/ui color system
 */

export interface ColorToken {
  hex: string;
  rgb: { r: number; g: number; b: number };
}

export interface ThemeColors {
  // Base
  background: ColorToken;
  foreground: ColorToken;

  // Card
  card: ColorToken;
  cardForeground: ColorToken;

  // Popover
  popover: ColorToken;
  popoverForeground: ColorToken;

  // Primary
  primary: ColorToken;
  primaryForeground: ColorToken;

  // Secondary
  secondary: ColorToken;
  secondaryForeground: ColorToken;

  // Muted
  muted: ColorToken;
  mutedForeground: ColorToken;

  // Accent
  accent: ColorToken;
  accentForeground: ColorToken;

  // Destructive
  destructive: ColorToken;
  destructiveForeground: ColorToken;

  // Border & Input
  border: ColorToken;
  input: ColorToken;
  ring: ColorToken;

  // Chart colors
  chart1: ColorToken;
  chart2: ColorToken;
  chart3: ColorToken;
  chart4: ColorToken;
  chart5: ColorToken;

  // Status colors
  statusSuccess: ColorToken;
  statusWarning: ColorToken;
  statusError: ColorToken;
  statusInfo: ColorToken;
}

export interface AppleColors {
  // iOS System Colors
  systemBlue: ColorToken;
  systemGreen: ColorToken;
  systemIndigo: ColorToken;
  systemOrange: ColorToken;
  systemPink: ColorToken;
  systemPurple: ColorToken;
  systemRed: ColorToken;
  systemTeal: ColorToken;
  systemYellow: ColorToken;

  // iOS Gray Colors
  systemGray: ColorToken;
  systemGray2: ColorToken;
  systemGray3: ColorToken;
  systemGray4: ColorToken;
  systemGray5: ColorToken;
  systemGray6: ColorToken;

  // Backgrounds
  systemBackground: ColorToken;
  secondarySystemBackground: ColorToken;
  tertiarySystemBackground: ColorToken;

  // Grouped Backgrounds
  systemGroupedBackground: ColorToken;
  secondarySystemGroupedBackground: ColorToken;
  tertiarySystemGroupedBackground: ColorToken;

  // Labels
  label: ColorToken;
  secondaryLabel: ColorToken;
  tertiaryLabel: ColorToken;
  quaternaryLabel: ColorToken;

  // Separator
  separator: ColorToken;
  opaqueSeparator: ColorToken;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
}

function createColorToken(hex: string): ColorToken {
  return {
    hex,
    rgb: hexToRgb(hex),
  };
}

// shadcn Light Theme Colors
export const shadcnLight: ThemeColors = {
  background: createColorToken("#FFFFFF"),
  foreground: createColorToken("#0A0A0A"),

  card: createColorToken("#FFFFFF"),
  cardForeground: createColorToken("#0A0A0A"),

  popover: createColorToken("#FFFFFF"),
  popoverForeground: createColorToken("#0A0A0A"),

  primary: createColorToken("#18181B"),
  primaryForeground: createColorToken("#FAFAFA"),

  secondary: createColorToken("#F4F4F5"),
  secondaryForeground: createColorToken("#18181B"),

  muted: createColorToken("#F4F4F5"),
  mutedForeground: createColorToken("#71717A"),

  accent: createColorToken("#F4F4F5"),
  accentForeground: createColorToken("#18181B"),

  destructive: createColorToken("#EF4444"),
  destructiveForeground: createColorToken("#FAFAFA"),

  border: createColorToken("#E4E4E7"),
  input: createColorToken("#E4E4E7"),
  ring: createColorToken("#18181B"),

  chart1: createColorToken("#E76E50"),
  chart2: createColorToken("#2A9D90"),
  chart3: createColorToken("#274754"),
  chart4: createColorToken("#E8C468"),
  chart5: createColorToken("#F4A462"),

  statusSuccess: createColorToken("#22C55E"),
  statusWarning: createColorToken("#F59E0B"),
  statusError: createColorToken("#EF4444"),
  statusInfo: createColorToken("#3B82F6"),
};

// shadcn Dark Theme Colors
export const shadcnDark: ThemeColors = {
  background: createColorToken("#0A0A0A"),
  foreground: createColorToken("#FAFAFA"),

  card: createColorToken("#0A0A0A"),
  cardForeground: createColorToken("#FAFAFA"),

  popover: createColorToken("#0A0A0A"),
  popoverForeground: createColorToken("#FAFAFA"),

  primary: createColorToken("#FAFAFA"),
  primaryForeground: createColorToken("#18181B"),

  secondary: createColorToken("#27272A"),
  secondaryForeground: createColorToken("#FAFAFA"),

  muted: createColorToken("#27272A"),
  mutedForeground: createColorToken("#A1A1AA"),

  accent: createColorToken("#27272A"),
  accentForeground: createColorToken("#FAFAFA"),

  destructive: createColorToken("#7F1D1D"),
  destructiveForeground: createColorToken("#FAFAFA"),

  border: createColorToken("#27272A"),
  input: createColorToken("#27272A"),
  ring: createColorToken("#D4D4D8"),

  chart1: createColorToken("#2662D9"),
  chart2: createColorToken("#2EB88A"),
  chart3: createColorToken("#E88C30"),
  chart4: createColorToken("#AF57DB"),
  chart5: createColorToken("#E23670"),

  statusSuccess: createColorToken("#4ADE80"),
  statusWarning: createColorToken("#FBBF24"),
  statusError: createColorToken("#F87171"),
  statusInfo: createColorToken("#60A5FA"),
};

// Apple iOS Light Theme Colors
export const appleIOSLight: AppleColors = {
  // System Colors
  systemBlue: createColorToken("#007AFF"),
  systemGreen: createColorToken("#34C759"),
  systemIndigo: createColorToken("#5856D6"),
  systemOrange: createColorToken("#FF9500"),
  systemPink: createColorToken("#FF2D55"),
  systemPurple: createColorToken("#AF52DE"),
  systemRed: createColorToken("#FF3B30"),
  systemTeal: createColorToken("#5AC8FA"),
  systemYellow: createColorToken("#FFCC00"),

  // Gray Colors
  systemGray: createColorToken("#8E8E93"),
  systemGray2: createColorToken("#AEAEB2"),
  systemGray3: createColorToken("#C7C7CC"),
  systemGray4: createColorToken("#D1D1D6"),
  systemGray5: createColorToken("#E5E5EA"),
  systemGray6: createColorToken("#F2F2F7"),

  // Backgrounds
  systemBackground: createColorToken("#FFFFFF"),
  secondarySystemBackground: createColorToken("#F2F2F7"),
  tertiarySystemBackground: createColorToken("#FFFFFF"),

  // Grouped Backgrounds
  systemGroupedBackground: createColorToken("#F2F2F7"),
  secondarySystemGroupedBackground: createColorToken("#FFFFFF"),
  tertiarySystemGroupedBackground: createColorToken("#F2F2F7"),

  // Labels
  label: createColorToken("#000000"),
  secondaryLabel: createColorToken("#3C3C43"),
  tertiaryLabel: createColorToken("#3C3C43"),
  quaternaryLabel: createColorToken("#3C3C43"),

  // Separators
  separator: createColorToken("#3C3C43"),
  opaqueSeparator: createColorToken("#C6C6C8"),
};

// Apple iOS Dark Theme Colors
export const appleIOSDark: AppleColors = {
  // System Colors
  systemBlue: createColorToken("#0A84FF"),
  systemGreen: createColorToken("#30D158"),
  systemIndigo: createColorToken("#5E5CE6"),
  systemOrange: createColorToken("#FF9F0A"),
  systemPink: createColorToken("#FF375F"),
  systemPurple: createColorToken("#BF5AF2"),
  systemRed: createColorToken("#FF453A"),
  systemTeal: createColorToken("#64D2FF"),
  systemYellow: createColorToken("#FFD60A"),

  // Gray Colors
  systemGray: createColorToken("#8E8E93"),
  systemGray2: createColorToken("#636366"),
  systemGray3: createColorToken("#48484A"),
  systemGray4: createColorToken("#3A3A3C"),
  systemGray5: createColorToken("#2C2C2E"),
  systemGray6: createColorToken("#1C1C1E"),

  // Backgrounds
  systemBackground: createColorToken("#000000"),
  secondarySystemBackground: createColorToken("#1C1C1E"),
  tertiarySystemBackground: createColorToken("#2C2C2E"),

  // Grouped Backgrounds
  systemGroupedBackground: createColorToken("#000000"),
  secondarySystemGroupedBackground: createColorToken("#1C1C1E"),
  tertiarySystemGroupedBackground: createColorToken("#2C2C2E"),

  // Labels
  label: createColorToken("#FFFFFF"),
  secondaryLabel: createColorToken("#EBEBF5"),
  tertiaryLabel: createColorToken("#EBEBF5"),
  quaternaryLabel: createColorToken("#EBEBF5"),

  // Separators
  separator: createColorToken("#545458"),
  opaqueSeparator: createColorToken("#38383A"),
};

// Apple macOS Light Theme Colors
export const appleMacOSLight: AppleColors = {
  // System Colors
  systemBlue: createColorToken("#007AFF"),
  systemGreen: createColorToken("#28CD41"),
  systemIndigo: createColorToken("#5856D6"),
  systemOrange: createColorToken("#FF9500"),
  systemPink: createColorToken("#FF2D55"),
  systemPurple: createColorToken("#AF52DE"),
  systemRed: createColorToken("#FF3B30"),
  systemTeal: createColorToken("#55BEF0"),
  systemYellow: createColorToken("#FFCC00"),

  // Gray Colors
  systemGray: createColorToken("#8E8E93"),
  systemGray2: createColorToken("#AEAEB2"),
  systemGray3: createColorToken("#C7C7CC"),
  systemGray4: createColorToken("#D1D1D6"),
  systemGray5: createColorToken("#E5E5EA"),
  systemGray6: createColorToken("#F2F2F7"),

  // Backgrounds
  systemBackground: createColorToken("#FFFFFF"),
  secondarySystemBackground: createColorToken("#F5F5F5"),
  tertiarySystemBackground: createColorToken("#FFFFFF"),

  // Grouped Backgrounds (same as regular for macOS)
  systemGroupedBackground: createColorToken("#F5F5F5"),
  secondarySystemGroupedBackground: createColorToken("#FFFFFF"),
  tertiarySystemGroupedBackground: createColorToken("#F5F5F5"),

  // Labels
  label: createColorToken("#000000"),
  secondaryLabel: createColorToken("#3C3C43"),
  tertiaryLabel: createColorToken("#3C3C43"),
  quaternaryLabel: createColorToken("#3C3C43"),

  // Separators
  separator: createColorToken("#D1D1D6"),
  opaqueSeparator: createColorToken("#C6C6C8"),
};

// Apple macOS Dark Theme Colors
export const appleMacOSDark: AppleColors = {
  // System Colors
  systemBlue: createColorToken("#0A84FF"),
  systemGreen: createColorToken("#32D74B"),
  systemIndigo: createColorToken("#5E5CE6"),
  systemOrange: createColorToken("#FF9F0A"),
  systemPink: createColorToken("#FF375F"),
  systemPurple: createColorToken("#BF5AF2"),
  systemRed: createColorToken("#FF453A"),
  systemTeal: createColorToken("#6AC4DC"),
  systemYellow: createColorToken("#FFD60A"),

  // Gray Colors
  systemGray: createColorToken("#98989D"),
  systemGray2: createColorToken("#636366"),
  systemGray3: createColorToken("#48484A"),
  systemGray4: createColorToken("#3A3A3C"),
  systemGray5: createColorToken("#2C2C2E"),
  systemGray6: createColorToken("#1C1C1E"),

  // Backgrounds
  systemBackground: createColorToken("#1E1E1E"),
  secondarySystemBackground: createColorToken("#2D2D2D"),
  tertiarySystemBackground: createColorToken("#3D3D3D"),

  // Grouped Backgrounds
  systemGroupedBackground: createColorToken("#1E1E1E"),
  secondarySystemGroupedBackground: createColorToken("#2D2D2D"),
  tertiarySystemGroupedBackground: createColorToken("#3D3D3D"),

  // Labels
  label: createColorToken("#FFFFFF"),
  secondaryLabel: createColorToken("#EBEBF5"),
  tertiaryLabel: createColorToken("#EBEBF5"),
  quaternaryLabel: createColorToken("#EBEBF5"),

  // Separators
  separator: createColorToken("#545458"),
  opaqueSeparator: createColorToken("#38383A"),
};

// ============================================================================
// iOS 26 Liquid Glass Design System
// ============================================================================

export interface LiquidGlassColors {
  // Primary Liquid Colors
  liquidBlue: ColorToken;
  liquidPurple: ColorToken;
  liquidIndigo: ColorToken;
  liquidTeal: ColorToken;
  liquidPink: ColorToken;
  liquidOrange: ColorToken;
  liquidGreen: ColorToken;
  liquidRed: ColorToken;
  liquidYellow: ColorToken;

  // Glass Materials
  glassLight: ColorToken;
  glassDark: ColorToken;
  glassAccent: ColorToken;
  glassTint: ColorToken;

  // Labels on Glass
  labelOnGlass: ColorToken;
  secondaryLabelOnGlass: ColorToken;

  // Separators on Glass
  separatorOnGlass: ColorToken;
}

export interface LiquidGlassEffects {
  // Blur values
  backgroundBlur: number;
  thinMaterialBlur: number;
  regularMaterialBlur: number;
  thickMaterialBlur: number;

  // Opacity values
  lightGlassOpacity: number;
  darkGlassOpacity: number;
  accentTintOpacity: number;

  // Specular highlights
  specularOpacity: number;
  specularBlur: number;

  // Shadow for glass elements
  glassShadowOpacity: number;
  glassShadowBlur: number;
  glassShadowOffsetY: number;
}

// iOS 26 Liquid Glass Light Theme
export const liquidGlassLight: LiquidGlassColors = {
  // Primary Liquid Colors
  liquidBlue: createColorToken("#007AFF"),
  liquidPurple: createColorToken("#AF52DE"),
  liquidIndigo: createColorToken("#5856D6"),
  liquidTeal: createColorToken("#5AC8FA"),
  liquidPink: createColorToken("#FF2D55"),
  liquidOrange: createColorToken("#FF9500"),
  liquidGreen: createColorToken("#34C759"),
  liquidRed: createColorToken("#FF3B30"),
  liquidYellow: createColorToken("#FFCC00"),

  // Glass Materials - Light mode uses white-based glass
  glassLight: createColorToken("#FFFFFF"),
  glassDark: createColorToken("#000000"),
  glassAccent: createColorToken("#007AFF"),
  glassTint: createColorToken("#F2F2F7"),

  // Labels on Glass
  labelOnGlass: createColorToken("#000000"),
  secondaryLabelOnGlass: createColorToken("#3C3C43"),

  // Separators on Glass
  separatorOnGlass: createColorToken("#3C3C43"),
};

// iOS 26 Liquid Glass Dark Theme
export const liquidGlassDark: LiquidGlassColors = {
  // Primary Liquid Colors (slightly adjusted for dark mode)
  liquidBlue: createColorToken("#0A84FF"),
  liquidPurple: createColorToken("#BF5AF2"),
  liquidIndigo: createColorToken("#5E5CE6"),
  liquidTeal: createColorToken("#64D2FF"),
  liquidPink: createColorToken("#FF375F"),
  liquidOrange: createColorToken("#FF9F0A"),
  liquidGreen: createColorToken("#30D158"),
  liquidRed: createColorToken("#FF453A"),
  liquidYellow: createColorToken("#FFD60A"),

  // Glass Materials - Dark mode uses dark-based glass
  glassLight: createColorToken("#FFFFFF"),
  glassDark: createColorToken("#1C1C1E"),
  glassAccent: createColorToken("#0A84FF"),
  glassTint: createColorToken("#2C2C2E"),

  // Labels on Glass
  labelOnGlass: createColorToken("#FFFFFF"),
  secondaryLabelOnGlass: createColorToken("#EBEBF5"),

  // Separators on Glass
  separatorOnGlass: createColorToken("#545458"),
};

// Liquid Glass Effect Values
export const liquidGlassEffectsLight: LiquidGlassEffects = {
  // Blur values (in pixels)
  backgroundBlur: 40,
  thinMaterialBlur: 20,
  regularMaterialBlur: 30,
  thickMaterialBlur: 50,

  // Opacity values (0-1)
  lightGlassOpacity: 0.72,
  darkGlassOpacity: 0.15,
  accentTintOpacity: 0.15,

  // Specular highlights
  specularOpacity: 0.5,
  specularBlur: 0,

  // Shadow for glass elements
  glassShadowOpacity: 0.15,
  glassShadowBlur: 16,
  glassShadowOffsetY: 4,
};

export const liquidGlassEffectsDark: LiquidGlassEffects = {
  // Blur values (in pixels)
  backgroundBlur: 40,
  thinMaterialBlur: 20,
  regularMaterialBlur: 30,
  thickMaterialBlur: 50,

  // Opacity values (0-1)
  lightGlassOpacity: 0.18,
  darkGlassOpacity: 0.72,
  accentTintOpacity: 0.20,

  // Specular highlights
  specularOpacity: 0.3,
  specularBlur: 0,

  // Shadow for glass elements
  glassShadowOpacity: 0.4,
  glassShadowBlur: 20,
  glassShadowOffsetY: 6,
};

// Helper to get Liquid Glass colors by theme
export function getLiquidGlassColors(theme: "light" | "dark"): LiquidGlassColors {
  return theme === "light" ? liquidGlassLight : liquidGlassDark;
}

// Helper to get Liquid Glass effects by theme
export function getLiquidGlassEffects(theme: "light" | "dark"): LiquidGlassEffects {
  return theme === "light" ? liquidGlassEffectsLight : liquidGlassEffectsDark;
}

export { hexToRgb, createColorToken };
