// figma-plugin/src/handlers/utils/types.ts
/**
 * Shared type definitions for all handlers
 */

export interface Command {
  type: "COMMAND";
  id: string;
  action: string;
  params: Record<string, unknown>;
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface GradientStop {
  position: number;
  color: string | RGBColor;
}

export interface GradientConfig {
  type: "LINEAR" | "RADIAL" | "ANGULAR" | "DIAMOND";
  stops: GradientStop[];
  angle?: number;
}

export interface FillConfig {
  type: "SOLID" | "GRADIENT";
  color?: string | RGBColor;
  opacity?: number;
  gradient?: GradientConfig;
}

export interface ShadowConfig {
  type: "DROP_SHADOW" | "INNER_SHADOW";
  color?: string | RGBColor;
  offsetX?: number;
  offsetY?: number;
  blur?: number;
  spread?: number;
  opacity?: number;
}

export interface BlurConfig {
  type: "LAYER_BLUR" | "BACKGROUND_BLUR";
  radius: number;
}

export type EffectConfig = ShadowConfig | BlurConfig;

export interface AutoLayoutConfig {
  mode: "HORIZONTAL" | "VERTICAL";
  spacing?: number;
  counterAxisSpacing?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  padding?: number;
  primaryAxisAlign?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  counterAxisAlign?: "MIN" | "CENTER" | "MAX" | "BASELINE";
  wrap?: boolean;
  strokesIncludedInLayout?: boolean;
}

export interface TextStyleConfig {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number | string;
  letterSpacing?: number;
  textAlign?: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
  textCase?: "ORIGINAL" | "UPPER" | "LOWER" | "TITLE";
  textDecoration?: "NONE" | "UNDERLINE" | "STRIKETHROUGH";
}

export interface StrokeConfig {
  color: string | RGBColor;
  weight?: number;
  align?: "INSIDE" | "OUTSIDE" | "CENTER";
}

export interface FinalizeOptions {
  parentId?: string;
  x?: number;
  y?: number;
}

// Handler types
export type CommandHandler = (params: Record<string, unknown>) => Promise<Record<string, unknown>> | Record<string, unknown>;
export type NoParamsHandler = () => Promise<Record<string, unknown>> | Record<string, unknown>;
