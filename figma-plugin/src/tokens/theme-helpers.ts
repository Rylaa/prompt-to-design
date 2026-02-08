/**
 * Theme Helper Utilities
 * Centralizes theme resolution and contrast validation
 */

import { themeManager, getShadcnColors } from "./index";
import type { ColorToken } from "./colors";

// ============================================================================
// Theme Resolution
// ============================================================================

/**
 * Resolves theme from handler params, falling back to themeManager global.
 * This is the canonical way to get the current theme in any handler.
 */
export function resolveTheme(params: Record<string, unknown>): "light" | "dark" {
  const paramTheme = params.theme as string | undefined;
  if (paramTheme === "light" || paramTheme === "dark") {
    return paramTheme;
  }
  const global = themeManager.getTheme();
  return global === "light" ? "light" : "dark";
}

/**
 * Resolves theme from shadcn component options (optional theme parameter).
 * Used in shadcn/*.ts component files.
 */
export function resolveThemeFromOptions(theme?: string): "light" | "dark" {
  if (theme === "light" || theme === "dark") {
    return theme;
  }
  const global = themeManager.getTheme();
  return global === "light" ? "light" : "dark";
}

// ============================================================================
// Quick Theme Colors
// ============================================================================

export interface QuickThemeColors {
  background: { r: number; g: number; b: number };
  foreground: { r: number; g: number; b: number };
  card: { r: number; g: number; b: number };
  cardForeground: { r: number; g: number; b: number };
  border: { r: number; g: number; b: number };
  primary: { r: number; g: number; b: number };
  primaryForeground: { r: number; g: number; b: number };
  muted: { r: number; g: number; b: number };
  mutedForeground: { r: number; g: number; b: number };
  secondary: { r: number; g: number; b: number };
  secondaryForeground: { r: number; g: number; b: number };
  destructive: { r: number; g: number; b: number };
  destructiveForeground: { r: number; g: number; b: number };
  input: { r: number; g: number; b: number };
}

/**
 * Returns commonly needed RGB colors for the given theme.
 * Avoids repeated getShadcnColors() + .rgb lookups in handlers.
 */
export function getQuickThemeColors(theme: "light" | "dark"): QuickThemeColors {
  const c = getShadcnColors(theme);
  return {
    background: c.background.rgb,
    foreground: c.foreground.rgb,
    card: c.card.rgb,
    cardForeground: c.cardForeground.rgb,
    border: c.border.rgb,
    primary: c.primary.rgb,
    primaryForeground: c.primaryForeground.rgb,
    muted: c.muted.rgb,
    mutedForeground: c.mutedForeground.rgb,
    secondary: c.secondary.rgb,
    secondaryForeground: c.secondaryForeground.rgb,
    destructive: c.destructive.rgb,
    destructiveForeground: c.destructiveForeground.rgb,
    input: c.input.rgb,
  };
}

// ============================================================================
// Contrast Validation (WCAG 2.1)
// ============================================================================

/**
 * Calculates relative luminance of an RGB color (0-1 range).
 */
function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates WCAG 2.1 contrast ratio between two RGB colors.
 * Returns a value between 1 and 21.
 */
export function contrastRatio(
  fg: { r: number; g: number; b: number },
  bg: { r: number; g: number; b: number }
): number {
  const l1 = relativeLuminance(fg.r, fg.g, fg.b);
  const l2 = relativeLuminance(bg.r, bg.g, bg.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validates text contrast and logs a warning if below WCAG thresholds.
 * Does NOT throw - purely informational.
 *
 * WCAG AA: 4.5:1 for normal text, 3:1 for large text (>=18px bold or >=24px)
 */
export function validateTextContrast(
  fg: { r: number; g: number; b: number },
  bg: { r: number; g: number; b: number },
  name: string,
  fontSize?: number
): void {
  const ratio = contrastRatio(fg, bg);
  const isLargeText = fontSize !== undefined && fontSize >= 24;
  const threshold = isLargeText ? 3 : 4.5;

  if (ratio < threshold) {
    console.warn(
      `[theme] Low contrast (${ratio.toFixed(1)}:1) on "${name}" — ` +
        `needs ${threshold}:1 for WCAG AA. ` +
        `fg: rgb(${Math.round(fg.r * 255)},${Math.round(fg.g * 255)},${Math.round(fg.b * 255)}) ` +
        `bg: rgb(${Math.round(bg.r * 255)},${Math.round(bg.g * 255)},${Math.round(bg.b * 255)})`
    );
  }
}
