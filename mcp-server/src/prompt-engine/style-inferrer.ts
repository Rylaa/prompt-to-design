// mcp-server/src/prompt-engine/style-inferrer.ts
/**
 * Style Inferrer
 * Infers styling preferences from prompts and context
 */

import type { StyleSpec, ContextSpec, ParsedPrompt } from "./types.js";

// ============================================================================
// Color Keyword Mappings (EN/TR)
// ============================================================================

const COLOR_KEYWORDS: Record<string, string> = {
  // Primary colors
  blue: "#3B82F6",
  mavi: "#3B82F6",
  red: "#EF4444",
  kırmızı: "#EF4444",
  green: "#22C55E",
  yeşil: "#22C55E",
  yellow: "#EAB308",
  sarı: "#EAB308",
  purple: "#A855F7",
  mor: "#A855F7",
  pink: "#EC4899",
  pembe: "#EC4899",
  orange: "#F97316",
  turuncu: "#F97316",

  // Neutral colors
  black: "#000000",
  siyah: "#000000",
  white: "#FFFFFF",
  beyaz: "#FFFFFF",
  gray: "#6B7280",
  gri: "#6B7280",

  // Brand colors
  brand: "#6366F1", // Indigo as default brand
};

// ============================================================================
// Theme Keywords (EN/TR)
// ============================================================================

const THEME_KEYWORDS = {
  dark: ["dark", "karanlık", "koyu", "gece", "night"],
  light: ["light", "aydınlık", "açık", "gündüz", "day"],
};

// ============================================================================
// Typography Scale Recommendations
// ============================================================================

const TYPOGRAPHY_SCALES: Record<string, { heading: number; body: number }> = {
  mobile: { heading: 24, body: 14 },
  tablet: { heading: 28, body: 15 },
  desktop: { heading: 32, body: 16 },
  landing: { heading: 48, body: 18 },
  dashboard: { heading: 24, body: 14 },
};

// ============================================================================
// Main Style Inference
// ============================================================================

/**
 * Infers style specifications from a prompt and context
 * @param prompt - Raw prompt string
 * @param context - Resolved context specification
 * @param _parsedPrompt - Parsed prompt data (unused but available for future use)
 * @returns Style specification
 */
export function inferStyle(
  prompt: string,
  context: ContextSpec,
  _parsedPrompt: ParsedPrompt
): StyleSpec {
  const normalizedPrompt = prompt.toLowerCase();

  return {
    theme: detectTheme(normalizedPrompt),
    platform: detectPlatform(normalizedPrompt, context),
    colors: extractColors(normalizedPrompt),
    typography: getTypographyScale(context),
  };
}

// ============================================================================
// Theme Detection
// ============================================================================

/**
 * Detects the preferred theme from the prompt
 */
function detectTheme(prompt: string): "light" | "dark" {
  if (THEME_KEYWORDS.dark.some((kw) => prompt.includes(kw))) {
    return "dark";
  }
  if (THEME_KEYWORDS.light.some((kw) => prompt.includes(kw))) {
    return "light";
  }
  return "dark"; // Default to dark theme
}

// ============================================================================
// Platform Detection
// ============================================================================

/**
 * Detects the target platform from prompt and context
 */
function detectPlatform(
  prompt: string,
  context: ContextSpec
): "shadcn" | "ios" | "macos" | "liquid-glass" {
  // Explicit platform mentions
  if (prompt.includes("ios") || prompt.includes("iphone")) return "ios";
  if (prompt.includes("macos") || prompt.includes("mac")) return "macos";
  if (prompt.includes("glass") || prompt.includes("blur") || prompt.includes("cam")) return "liquid-glass";
  if (prompt.includes("shadcn") || prompt.includes("radix")) return "shadcn";

  // Infer from context
  if (context.deviceType === "mobile") return "ios";
  if (context.screenType === "landing") return "liquid-glass";

  return "shadcn"; // Default
}

// ============================================================================
// Color Extraction
// ============================================================================

/**
 * Extracts color values from the prompt
 */
function extractColors(prompt: string): Record<string, string> {
  const colors: Record<string, string> = {};

  // Extract hex colors directly mentioned
  const hexMatches = prompt.match(/#[A-Fa-f0-9]{6}/g);
  if (hexMatches) {
    hexMatches.forEach((hex, i) => {
      colors[`custom${i + 1}`] = hex;
    });
  }

  // Extract named colors
  for (const [keyword, hex] of Object.entries(COLOR_KEYWORDS)) {
    if (prompt.includes(keyword)) {
      // Determine role (primary, accent, etc.)
      if (prompt.includes(`${keyword} primary`) || prompt.includes(`ana ${keyword}`)) {
        colors.primary = hex;
      } else if (prompt.includes(`${keyword} accent`) || prompt.includes(`vurgu ${keyword}`)) {
        colors.accent = hex;
      } else if (prompt.includes(`${keyword} background`) || prompt.includes(`${keyword} arka plan`)) {
        colors.background = hex;
      } else {
        // Default to primary if not specified
        if (!colors.primary) colors.primary = hex;
      }
    }
  }

  return colors;
}

// ============================================================================
// Typography Scale
// ============================================================================

/**
 * Gets appropriate typography scale based on context
 */
function getTypographyScale(context: ContextSpec): { headingSize: number; bodySize: number } {
  // Check screen type first
  if (context.screenType && TYPOGRAPHY_SCALES[context.screenType]) {
    const scale = TYPOGRAPHY_SCALES[context.screenType];
    return { headingSize: scale.heading, bodySize: scale.body };
  }

  // Fall back to device type
  if (context.deviceType && TYPOGRAPHY_SCALES[context.deviceType]) {
    const scale = TYPOGRAPHY_SCALES[context.deviceType];
    return { headingSize: scale.heading, bodySize: scale.body };
  }

  // Default
  return { headingSize: 32, bodySize: 16 };
}

// ============================================================================
// Style Recommendations
// ============================================================================

/**
 * Generates style recommendations based on inferred style and context
 */
export function generateStyleRecommendations(style: StyleSpec, context: ContextSpec): string[] {
  const recommendations: string[] = [];

  if (style.theme === "dark") {
    recommendations.push("Using dark theme - ensure sufficient contrast for text (min 4.5:1)");
  }

  if (style.platform === "ios" && context.deviceType !== "mobile") {
    recommendations.push("iOS components work best on mobile dimensions (390x844)");
  }

  if (style.platform === "liquid-glass") {
    recommendations.push("Liquid Glass works best with background images or gradients");
  }

  if (context.industry === "fintech") {
    recommendations.push("Consider using professional color palette (blues, grays) for fintech");
  }

  if (context.screenType === "form") {
    recommendations.push("Form screens benefit from clear visual hierarchy and consistent spacing");
  }

  return recommendations;
}
