/**
 * Base Schemas - Shared primitives used across all tool schemas
 */

import { z } from "zod";

// ============================================================================
// Color Schemas
// ============================================================================

export const RGBColorSchema = z.object({
  r: z.number().min(0).max(1).describe("Red channel (0-1)"),
  g: z.number().min(0).max(1).describe("Green channel (0-1)"),
  b: z.number().min(0).max(1).describe("Blue channel (0-1)"),
  a: z.number().min(0).max(1).optional().default(1).describe("Alpha channel (0-1)"),
});

export const HexColorSchema = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color");

export const ColorSchema = z.union([HexColorSchema, RGBColorSchema]);

export const GradientStopSchema = z.object({
  position: z.number().min(0).max(1).describe("Position (0-1)"),
  color: ColorSchema,
});

export const GradientSchema = z.object({
  type: z.enum(["LINEAR", "RADIAL", "ANGULAR", "DIAMOND"]).default("LINEAR"),
  stops: z.array(GradientStopSchema).min(2),
  angle: z.number().optional().describe("Angle in degrees (for linear gradient)"),
});

export const FillSchema = z.union([
  z.object({
    type: z.literal("SOLID"),
    color: ColorSchema,
    opacity: z.number().min(0).max(1).optional(),
  }),
  z.object({
    type: z.literal("GRADIENT"),
    gradient: GradientSchema,
  }),
]);

// ============================================================================
// Effect Schemas
// ============================================================================

export const ShadowSchema = z.object({
  type: z.enum(["DROP_SHADOW", "INNER_SHADOW"]).default("DROP_SHADOW"),
  color: ColorSchema.optional().default("#000000"),
  offsetX: z.number().default(0),
  offsetY: z.number().default(4),
  blur: z.number().min(0).default(8),
  spread: z.number().default(0),
  opacity: z.number().min(0).max(1).optional().default(0.1),
});

export const BlurSchema = z.object({
  type: z.enum(["LAYER_BLUR", "BACKGROUND_BLUR"]).default("LAYER_BLUR"),
  radius: z.number().min(0),
});

export const EffectSchema = z.union([ShadowSchema, BlurSchema]);

// ============================================================================
// Layout Schemas
// ============================================================================

export const AutoLayoutSchema = z.object({
  mode: z.enum(["HORIZONTAL", "VERTICAL"]).describe("Layout direction"),
  spacing: z.number().min(0).optional().default(0).describe("Gap between items"),
  paddingTop: z.number().min(0).optional().default(0),
  paddingRight: z.number().min(0).optional().default(0),
  paddingBottom: z.number().min(0).optional().default(0),
  paddingLeft: z.number().min(0).optional().default(0),
  padding: z.number().min(0).optional().describe("Uniform padding (overrides individual)"),
  primaryAxisAlign: z.enum(["MIN", "CENTER", "MAX", "SPACE_BETWEEN"]).optional().default("MIN"),
  counterAxisAlign: z.enum(["MIN", "CENTER", "MAX", "BASELINE"]).optional().default("MIN"),
  wrap: z.boolean().optional().default(false),
});

export const ConstraintsSchema = z.object({
  horizontal: z.enum(["MIN", "CENTER", "MAX", "STRETCH", "SCALE"]).optional(),
  vertical: z.enum(["MIN", "CENTER", "MAX", "STRETCH", "SCALE"]).optional(),
});

// ============================================================================
// Text Schemas
// ============================================================================

export const TextStyleSchema = z.object({
  fontFamily: z.string().optional().default("Inter"),
  fontSize: z.number().min(1).optional().default(16),
  fontWeight: z.number().min(100).max(900).optional().default(400),
  lineHeight: z.union([z.number(), z.string()]).optional(),
  letterSpacing: z.number().optional(),
  textAlign: z.enum(["LEFT", "CENTER", "RIGHT", "JUSTIFIED"]).optional().default("LEFT"),
  textDecoration: z.enum(["NONE", "UNDERLINE", "STRIKETHROUGH"]).optional(),
  textCase: z.enum(["ORIGINAL", "UPPER", "LOWER", "TITLE"]).optional(),
});

// ============================================================================
// Stroke Schema
// ============================================================================

export const StrokeSchema = z.object({
  color: ColorSchema,
  weight: z.number().min(0).default(1),
  align: z.enum(["INSIDE", "OUTSIDE", "CENTER"]).optional().default("INSIDE"),
});

// ============================================================================
// Type exports
// ============================================================================

export type RGBColor = z.infer<typeof RGBColorSchema>;
export type HexColor = z.infer<typeof HexColorSchema>;
export type Color = z.infer<typeof ColorSchema>;
export type GradientStop = z.infer<typeof GradientStopSchema>;
export type Gradient = z.infer<typeof GradientSchema>;
export type Fill = z.infer<typeof FillSchema>;
export type Shadow = z.infer<typeof ShadowSchema>;
export type Blur = z.infer<typeof BlurSchema>;
export type Effect = z.infer<typeof EffectSchema>;
export type AutoLayout = z.infer<typeof AutoLayoutSchema>;
export type Constraints = z.infer<typeof ConstraintsSchema>;
export type TextStyle = z.infer<typeof TextStyleSchema>;
export type Stroke = z.infer<typeof StrokeSchema>;
