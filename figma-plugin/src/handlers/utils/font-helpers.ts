// figma-plugin/src/handlers/utils/font-helpers.ts
/**
 * Font loading utilities for Figma Plugin
 * Handles font weight to style mapping and font loading with fallback
 */

/**
 * Converts numeric font weight to Figma font style name
 * @param weight - Numeric font weight (100-900)
 * @returns Font style string for Figma
 */
export function getFontStyle(weight: number): string {
  if (weight <= 100) return "Thin";
  if (weight <= 200) return "ExtraLight";
  if (weight <= 300) return "Light";
  if (weight <= 400) return "Regular";
  if (weight <= 500) return "Medium";
  if (weight <= 600) return "Semi Bold";
  if (weight <= 700) return "Bold";
  if (weight <= 800) return "ExtraBold";
  return "Black";
}

/**
 * Loads a font with the specified family and weight
 * Falls back to Inter Regular if the requested font cannot be loaded
 * @param fontFamily - Font family name
 * @param fontWeight - Numeric font weight (100-900)
 * @returns Promise resolving to the loaded FontName
 */
export async function loadFont(fontFamily: string, fontWeight: number): Promise<FontName> {
  const fontName: FontName = {
    family: fontFamily,
    style: getFontStyle(fontWeight),
  };
  try {
    await figma.loadFontAsync(fontName);
    return fontName;
  } catch {
    const fallback: FontName = { family: "Inter", style: "Regular" };
    await figma.loadFontAsync(fallback);
    return fallback;
  }
}
