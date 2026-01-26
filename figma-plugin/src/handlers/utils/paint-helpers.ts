// figma-plugin/src/handlers/utils/paint-helpers.ts
/**
 * Paint/Color conversion utilities for Figma Plugin
 * Handles color parsing, fill creation, and effect creation
 */

import type {
  RGBColor,
  FillConfig,
  EffectConfig,
  GradientConfig,
  ShadowConfig,
  BlurConfig,
  StrokeConfig,
} from "./types";

/**
 * Converts a hex color string to Figma RGB format
 * Supports both 3-character (#RGB) and 6-character (#RRGGBB) hex formats
 * @param hex - Hex color string (with or without # prefix)
 * @returns RGB object with values normalized to 0-1 range
 */
export function hexToRgb(hex: string): RGB {
  // Try 6-character hex format first
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    };
  }

  // Try 3-character hex format
  const shortResult = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
  if (shortResult) {
    return {
      r: parseInt(shortResult[1] + shortResult[1], 16) / 255,
      g: parseInt(shortResult[2] + shortResult[2], 16) / 255,
      b: parseInt(shortResult[3] + shortResult[3], 16) / 255,
    };
  }

  // Return black as fallback for invalid hex
  return { r: 0, g: 0, b: 0 };
}

/**
 * Parses a color value (hex string or RGB object) to Figma RGB format
 * @param color - Hex string or RGBColor object
 * @returns RGB object with values normalized to 0-1 range
 */
export function parseColor(color: string | RGBColor): RGB {
  if (typeof color === "string") {
    return hexToRgb(color);
  }
  return { r: color.r, g: color.g, b: color.b };
}

/**
 * Converts an angle in degrees to a Figma gradient transform matrix
 * The transform matrix positions the gradient correctly based on the angle
 * @param angleDegrees - Angle in degrees (0 = left-to-right, 90 = top-to-bottom)
 * @returns 2x3 transform matrix for Figma gradients
 */
export function convertGradientAngleToTransform(
  angleDegrees: number
): Transform {
  const radians = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  // Transform matrix that rotates the gradient and centers it
  return [
    [cos, sin, 0.5 - cos * 0.5 - sin * 0.5],
    [-sin, cos, 0.5 + sin * 0.5 - cos * 0.5],
  ];
}

/**
 * Creates a solid paint from a color value
 * @param color - Hex string or RGBColor object
 * @param opacity - Optional opacity value (0-1)
 * @returns SolidPaint object for Figma
 */
export function createSolidPaint(
  color: string | RGBColor,
  opacity?: number
): SolidPaint {
  const rgb = parseColor(color);
  return {
    type: "SOLID",
    color: rgb,
    opacity: opacity !== undefined ? opacity : 1,
  };
}

/**
 * Creates a stroke paint from a stroke configuration
 * @param config - Stroke configuration with color
 * @returns SolidPaint object for Figma strokes
 */
export function createStrokePaint(config: StrokeConfig): SolidPaint {
  const rgb = parseColor(config.color);
  return {
    type: "SOLID",
    color: rgb,
    opacity: 1,
  };
}

/**
 * Creates a gradient paint from a gradient configuration
 * Currently supports LINEAR gradient type
 * @param config - Gradient configuration with stops and angle
 * @returns GradientPaint object for Figma
 */
export function createGradientPaint(config: GradientConfig): GradientPaint {
  const stops: ColorStop[] = config.stops.map((stop) => ({
    position: stop.position,
    color: { ...parseColor(stop.color), a: 1 },
  }));

  const angle = config.angle || 0;
  const gradientTransform = convertGradientAngleToTransform(angle);

  return {
    type: "GRADIENT_LINEAR",
    gradientTransform,
    gradientStops: stops,
  };
}

/**
 * Converts a FillConfig to a Figma Paint object
 * Handles both SOLID and GRADIENT fill types
 * @param config - Fill configuration
 * @returns Paint object (SolidPaint or GradientPaint)
 */
export function convertToFigmaPaint(config: FillConfig): Paint {
  if (config.type === "SOLID" && config.color) {
    return createSolidPaint(config.color, config.opacity);
  }
  if (config.type === "GRADIENT" && config.gradient) {
    return createGradientPaint(config.gradient);
  }
  // Return black solid paint as fallback
  return createSolidPaint("#000000");
}

/**
 * Converts an EffectConfig to a Figma Effect object
 * Handles shadow effects (DROP_SHADOW, INNER_SHADOW) and blur effects (LAYER_BLUR, BACKGROUND_BLUR)
 * @param config - Effect configuration
 * @returns Effect object (ShadowEffect or BlurEffect)
 */
export function convertToFigmaEffect(config: EffectConfig): Effect {
  if (config.type === "DROP_SHADOW" || config.type === "INNER_SHADOW") {
    const shadow = config as ShadowConfig;
    const color = shadow.color
      ? parseColor(shadow.color)
      : { r: 0, g: 0, b: 0 };

    return {
      type: shadow.type,
      color: {
        ...color,
        a: shadow.opacity !== undefined ? shadow.opacity : 0.25,
      },
      offset: {
        x: shadow.offsetX !== undefined ? shadow.offsetX : 0,
        y: shadow.offsetY !== undefined ? shadow.offsetY : 4,
      },
      radius: shadow.blur !== undefined ? shadow.blur : 8,
      spread: shadow.spread !== undefined ? shadow.spread : 0,
      visible: true,
      blendMode: "NORMAL",
    };
  }

  // Handle blur effects
  const blur = config as BlurConfig;
  return {
    type: blur.type,
    radius: blur.radius,
    visible: true,
  } as BlurEffect;
}

/**
 * Alias for convertToFigmaPaint for backwards compatibility
 * @param config - Fill configuration
 * @returns Paint object
 */
export const createFill = convertToFigmaPaint;

/**
 * Alias for convertToFigmaEffect for backwards compatibility
 * @param config - Effect configuration
 * @returns Effect object
 */
export const createEffect = convertToFigmaEffect;
