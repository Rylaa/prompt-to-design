/**
 * Core Layout Types
 * Auto Layout tabanlı type-safe frame oluşturma
 */

import type { SpacingKey, RadiusKey } from "../tokens/spacing";

// Layout direction
export type LayoutDirection = "VERTICAL" | "HORIZONTAL";

// Sizing modes
export type SizingMode = "FIXED" | "HUG" | "FILL";

// Alignment
export type PrimaryAxisAlign = "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
export type CounterAxisAlign = "MIN" | "CENTER" | "MAX" | "BASELINE";

// Spacing - sadece token key kabul eder, raw number YASAK
export interface SpacingConfig {
  gap?: SpacingKey;
  paddingTop?: SpacingKey;
  paddingRight?: SpacingKey;
  paddingBottom?: SpacingKey;
  paddingLeft?: SpacingKey;
  // Shorthand - tüm padding'leri aynı yapar
  padding?: SpacingKey;
}

// Semantic color token names from ThemeColors
export type SemanticColorToken =
  | "background"
  | "foreground"
  | "card"
  | "cardForeground"
  | "popover"
  | "popoverForeground"
  | "primary"
  | "primaryForeground"
  | "secondary"
  | "secondaryForeground"
  | "muted"
  | "mutedForeground"
  | "accent"
  | "accentForeground"
  | "destructive"
  | "destructiveForeground"
  | "border"
  | "input"
  | "ring";

// Fill config - hex YASAK, sadece token veya semantic color
export interface SemanticFillConfig {
  type: "SEMANTIC";
  token: SemanticColorToken;
  opacity?: number;
}

export interface SolidFillConfig {
  type: "SOLID";
  color: { r: number; g: number; b: number };
  opacity?: number;
}

export type FillConfig = SemanticFillConfig | SolidFillConfig;

// Auto Layout Frame Config
export interface AutoLayoutConfig {
  name?: string;
  direction: LayoutDirection;
  spacing: SpacingConfig;
  primaryAxisAlign?: PrimaryAxisAlign;
  counterAxisAlign?: CounterAxisAlign;
  primaryAxisSizing?: SizingMode;
  counterAxisSizing?: SizingMode;
  fill?: FillConfig;
  cornerRadius?: RadiusKey;
  // Parent - undefined ise currentPage'e eklenir
  parent?: FrameNode | ComponentNode;
  // Explicit width/height - sadece FIXED sizing için
  width?: number;
  height?: number;
  // Theme for semantic colors
  theme?: "light" | "dark";
}

// Layout sizing ayarı için
export interface LayoutSizingConfig {
  horizontal?: SizingMode;
  vertical?: SizingMode;
}
