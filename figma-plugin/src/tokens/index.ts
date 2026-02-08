/**
 * Design Token System - Main Entry
 * Theme manager and token registry
 */

// Re-export all tokens
export * from "./colors";
export * from "./spacing";
export * from "./typography";
export * from "./shadows";
export * from "./animations";
export * from "./theme-helpers";

import {
  shadcnLight,
  shadcnDark,
  appleIOSLight,
  appleIOSDark,
  appleMacOSLight,
  appleMacOSDark,
  liquidGlassLight,
  liquidGlassDark,
  liquidGlassEffectsLight,
  liquidGlassEffectsDark,
  ThemeColors,
  AppleColors,
  LiquidGlassColors,
  LiquidGlassEffects,
  ColorToken,
} from "./colors";

import {
  spacing,
  radius,
  iosSpacing,
  macOSSpacing,
  shadcnSpacing,
  SpacingKey,
  RadiusKey,
} from "./spacing";

import {
  shadcnTypography,
  iosTypography,
  macOSTypography,
  FontStyle,
  fontFamilies,
  getFigmaFontStyle,
} from "./typography";

import {
  shadcnShadows,
  iosShadowsLight,
  iosShadowsDark,
  macOSShadowsLight,
  macOSShadowsDark,
  ShadowPreset,
  shadowsToFigmaEffects,
} from "./shadows";

// Theme types
export type Theme = "light" | "dark" | "custom";
export type Platform = "shadcn" | "ios" | "macos";

// Current theme state
let currentTheme: Theme = "dark";
let currentPlatform: Platform = "shadcn";
let customThemeColors: Partial<ThemeColors> = {};

// Theme manager
export const themeManager = {
  getTheme(): Theme {
    return currentTheme;
  },

  setTheme(theme: Theme): void {
    currentTheme = theme;
  },

  getPlatform(): Platform {
    return currentPlatform;
  },

  setPlatform(platform: Platform): void {
    currentPlatform = platform;
  },

  toggleTheme(): Theme {
    if (currentTheme === "custom") {
      currentTheme = "light";
    } else {
      currentTheme = currentTheme === "light" ? "dark" : "light";
    }
    return currentTheme;
  },

  setCustomColors(colors: Partial<ThemeColors>): void {
    customThemeColors = { ...customThemeColors, ...colors };
    currentTheme = "custom";
  },

  resetCustomColors(): void {
    customThemeColors = {};
    if (currentTheme === "custom") {
      currentTheme = "light";
    }
  }
};

// Get colors for current platform and theme
export function getColors(): ThemeColors | AppleColors {
  switch (currentPlatform) {
    case "shadcn":
      if (currentTheme === "custom") {
        return { ...shadcnDark, ...customThemeColors } as ThemeColors;
      }
      return currentTheme === "light" ? shadcnLight : shadcnDark;
    case "ios":
      return currentTheme === "light" ? appleIOSLight : appleIOSDark;
    case "macos":
      return currentTheme === "light" ? appleMacOSLight : appleMacOSDark;
    default:
      if (currentTheme === "custom") {
        return { ...shadcnDark, ...customThemeColors } as ThemeColors;
      }
      return shadcnLight;
  }
}

// Get specific color token
export function getColor(name: string): ColorToken | undefined {
  const colors = getColors() as unknown as Record<string, ColorToken>;
  return colors[name];
}

// Get shadcn colors specifically
export function getShadcnColors(theme?: Theme): ThemeColors {
  const t = theme || currentTheme;

  if (t === "custom") {
    return { ...shadcnDark, ...customThemeColors } as ThemeColors;
  }

  return t === "light" ? shadcnLight : shadcnDark;
}

// Get Apple iOS colors specifically
export function getIOSColors(theme?: Theme): AppleColors {
  const t = theme || currentTheme;
  return t === "light" ? appleIOSLight : appleIOSDark;
}

// Get Apple macOS colors specifically
export function getMacOSColors(theme?: Theme): AppleColors {
  const t = theme || currentTheme;
  return t === "light" ? appleMacOSLight : appleMacOSDark;
}

// Get spacing value
export function getSpacingValue(key: SpacingKey): number {
  return spacing[key];
}

// Get radius value
export function getRadiusValue(key: RadiusKey): number {
  return radius[key];
}

// Get platform-specific spacing
export function getPlatformSpacing(): typeof shadcnSpacing | typeof iosSpacing | typeof macOSSpacing {
  switch (currentPlatform) {
    case "ios":
      return iosSpacing;
    case "macos":
      return macOSSpacing;
    default:
      return shadcnSpacing;
  }
}

// Get typography style
export function getTypographyStyle(name: string): FontStyle | undefined {
  switch (currentPlatform) {
    case "shadcn":
      return shadcnTypography[name];
    case "ios":
      return iosTypography[name];
    case "macos":
      return macOSTypography[name];
    default:
      return shadcnTypography[name];
  }
}

// Get shadow preset
export function getShadowPreset(name: string): ShadowPreset | undefined {
  switch (currentPlatform) {
    case "shadcn":
      return shadcnShadows[name];
    case "ios":
      return currentTheme === "light"
        ? iosShadowsLight[name]
        : iosShadowsDark[name];
    case "macos":
      return currentTheme === "light"
        ? macOSShadowsLight[name]
        : macOSShadowsDark[name];
    default:
      return shadcnShadows[name];
  }
}

// Helper to create Figma solid paint from color token
export function colorTokenToPaint(token: ColorToken, opacity?: number): SolidPaint {
  return {
    type: "SOLID",
    color: token.rgb,
    opacity: opacity !== undefined ? opacity : 1,
  };
}

// Helper to apply typography to text node
export async function applyTypography(
  node: TextNode,
  styleName: string
): Promise<void> {
  const style = getTypographyStyle(styleName);
  if (!style) return;

  try {
    await figma.loadFontAsync({
      family: style.family,
      style: getFigmaFontStyle(style.weight),
    });

    node.fontName = {
      family: style.family,
      style: getFigmaFontStyle(style.weight),
    };
    node.fontSize = style.size;
    if (style.lineHeight) {
      node.lineHeight = { value: style.lineHeight, unit: "PIXELS" };
    }
    if (style.letterSpacing) {
      node.letterSpacing = { value: style.letterSpacing, unit: "PIXELS" };
    }
  } catch (e) {
    // Fallback to Inter if font not available
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      node.fontName = { family: "Inter", style: "Regular" };
      node.fontSize = style.size;
    } catch (fallbackError) {
      console.error("Failed to load fallback font:", fallbackError);
    }
  }
}

// Helper to apply shadow to node
export function applyShadow(node: SceneNode & { effects?: readonly Effect[] }, shadowName: string): void {
  const preset = getShadowPreset(shadowName);
  if (!preset || !("effects" in node)) return;

  const effects = shadowsToFigmaEffects(preset.shadows);
  (node as FrameNode).effects = effects;
}

// Token registry for component-level tokens
export interface ComponentTokens {
  colors: Record<string, ColorToken>;
  spacing: Record<string, number>;
  typography: Record<string, FontStyle>;
  shadows: Record<string, ShadowPreset>;
}

// Get all tokens for current theme/platform
export function getAllTokens(): ComponentTokens {
  const colors = getColors() as unknown as Record<string, ColorToken>;

  let platformTypography: Record<string, FontStyle>;
  let platformShadows: Record<string, ShadowPreset>;

  switch (currentPlatform) {
    case "ios":
      platformTypography = iosTypography;
      platformShadows =
        currentTheme === "light" ? iosShadowsLight : iosShadowsDark;
      break;
    case "macos":
      platformTypography = macOSTypography;
      platformShadows =
        currentTheme === "light" ? macOSShadowsLight : macOSShadowsDark;
      break;
    default:
      platformTypography = shadcnTypography;
      platformShadows = shadcnShadows;
  }

  return {
    colors,
    spacing: spacing as Record<string, number>,
    typography: platformTypography,
    shadows: platformShadows,
  };
}

// Export font families for external use
export { fontFamilies, getFigmaFontStyle };

// ============================================================================
// iOS 26 Liquid Glass Helpers
// ============================================================================

// Get Liquid Glass colors
export function getLiquidGlassColors(theme?: Theme): LiquidGlassColors {
  const t = theme || currentTheme;
  return t === "light" ? liquidGlassLight : liquidGlassDark;
}

// Get Liquid Glass effects
export function getLiquidGlassEffects(theme?: Theme): LiquidGlassEffects {
  const t = theme || currentTheme;
  return t === "light" ? liquidGlassEffectsLight : liquidGlassEffectsDark;
}

// Create Liquid Glass background blur effect
export function createGlassBlurEffect(theme?: Theme): Effect {
  const effects = getLiquidGlassEffects(theme);
  return {
    type: "BACKGROUND_BLUR",
    blurType: "NORMAL",
    radius: effects.backgroundBlur,
    visible: true,
  } as Effect;
}

// Create Liquid Glass shadow effect
export function createGlassShadowEffect(theme?: Theme): Effect {
  const effects = getLiquidGlassEffects(theme);
  return {
    type: "DROP_SHADOW",
    color: { r: 0, g: 0, b: 0, a: effects.glassShadowOpacity },
    offset: { x: 0, y: effects.glassShadowOffsetY },
    radius: effects.glassShadowBlur,
    spread: 0,
    visible: true,
    blendMode: "NORMAL",
  };
}

// Create specular highlight effect for glass
export function createSpecularEffect(theme?: Theme): Effect {
  const effects = getLiquidGlassEffects(theme);
  return {
    type: "INNER_SHADOW",
    color: { r: 1, g: 1, b: 1, a: effects.specularOpacity },
    offset: { x: 0, y: 1 },
    radius: effects.specularBlur,
    spread: 0,
    visible: true,
    blendMode: "NORMAL",
  };
}

// Get all Liquid Glass effects combined
export function getAllGlassEffects(theme?: Theme): Effect[] {
  return [
    createGlassBlurEffect(theme),
    createGlassShadowEffect(theme),
    createSpecularEffect(theme),
  ];
}
