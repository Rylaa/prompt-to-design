/**
 * Core Layout Types
 * Type-safe frame creation with Auto Layout
 */

import type { SpacingKey, RadiusKey } from "../tokens/spacing";

// Layout direction
export type LayoutDirection = "VERTICAL" | "HORIZONTAL";

// Sizing modes
export type SizingMode = "FIXED" | "HUG" | "FILL";

// Alignment
export type PrimaryAxisAlign = "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
export type CounterAxisAlign = "MIN" | "CENTER" | "MAX" | "BASELINE";

// Spacing - only accepts token keys, raw numbers are FORBIDDEN
export interface SpacingConfig {
  gap?: SpacingKey;
  paddingTop?: SpacingKey;
  paddingRight?: SpacingKey;
  paddingBottom?: SpacingKey;
  paddingLeft?: SpacingKey;
  // Shorthand - sets all padding to the same value
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

// Fill config - hex is FORBIDDEN, only token or semantic color
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
  // Parent - if undefined, added to currentPage
  parent?: FrameNode | ComponentNode;
  // Explicit width/height - only for FIXED sizing
  width?: number;
  height?: number;
  // Theme for semantic colors
  theme?: "light" | "dark";
}

// For layout sizing configuration
export interface LayoutSizingConfig {
  horizontal?: SizingMode;
  vertical?: SizingMode;
}
