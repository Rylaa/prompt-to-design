// figma-plugin/src/handlers/style-initializer.ts

import { getIOSColors, type Theme } from "../tokens";

export interface DesignStyles {
  paintStyles: Map<string, string>;   // token name -> style ID
  textStyles: Map<string, string>;    // style name -> style ID
  effectStyles: Map<string, string>;  // effect name -> style ID
}

const IOS_TEXT_STYLES: Record<string, { fontSize: number; lineHeight: number; fontStyle: string }> = {
  largeTitle:   { fontSize: 34, lineHeight: 41, fontStyle: "Bold" },
  title1:       { fontSize: 28, lineHeight: 34, fontStyle: "Bold" },
  title2:       { fontSize: 22, lineHeight: 28, fontStyle: "Bold" },
  title3:       { fontSize: 20, lineHeight: 25, fontStyle: "Semi Bold" },
  headline:     { fontSize: 17, lineHeight: 22, fontStyle: "Semi Bold" },
  subheadline:  { fontSize: 15, lineHeight: 20, fontStyle: "Regular" },
  body:         { fontSize: 17, lineHeight: 22, fontStyle: "Regular" },
  callout:      { fontSize: 16, lineHeight: 21, fontStyle: "Regular" },
  footnote:     { fontSize: 13, lineHeight: 18, fontStyle: "Regular" },
  caption1:     { fontSize: 12, lineHeight: 16, fontStyle: "Regular" },
  caption2:     { fontSize: 11, lineHeight: 13, fontStyle: "Regular" },
};

export async function initializeDesignStyles(theme: Theme): Promise<DesignStyles> {
  const colors = getIOSColors(theme);
  const paintStyles = new Map<string, string>();
  const textStyles = new Map<string, string>();
  const effectStyles = new Map<string, string>();

  // Check if styles already exist to avoid duplicates
  const existingPaintStyles = figma.getLocalPaintStyles();
  const existingTextStyles = figma.getLocalTextStyles();
  const existingEffectStyles = figma.getLocalEffectStyles();

  // --- Paint Styles ---
  const colorTokens: Record<string, { r: number; g: number; b: number }> = {
    "label": colors.label.rgb,
    "secondaryLabel": colors.secondaryLabel.rgb,
    "tertiaryLabel": colors.tertiaryLabel.rgb,
    "systemBlue": colors.systemBlue.rgb,
    "systemRed": colors.systemRed.rgb,
    "systemGreen": colors.systemGreen.rgb,
    "separator": colors.separator.rgb,
    "systemBackground": colors.systemBackground.rgb,
    "secondarySystemBackground": colors.secondarySystemGroupedBackground.rgb,
  };

  for (const [name, color] of Object.entries(colorTokens)) {
    const styleName = `iOS/${name}/${theme}`;
    const existing = existingPaintStyles.find(s => s.name === styleName);
    if (existing) {
      paintStyles.set(name, existing.id);
    } else {
      const style = figma.createPaintStyle();
      style.name = styleName;
      style.paints = [{ type: "SOLID", color }];
      paintStyles.set(name, style.id);
    }
  }

  // --- Text Styles ---
  for (const [name, config] of Object.entries(IOS_TEXT_STYLES)) {
    const styleName = `iOS/${name}`;
    const existing = existingTextStyles.find(s => s.name === styleName);
    if (existing) {
      textStyles.set(name, existing.id);
    } else {
      await figma.loadFontAsync({ family: "Inter", style: config.fontStyle });
      const style = figma.createTextStyle();
      style.name = styleName;
      style.fontName = { family: "Inter", style: config.fontStyle };
      style.fontSize = config.fontSize;
      style.lineHeight = { value: config.lineHeight, unit: "PIXELS" };
      textStyles.set(name, style.id);
    }
  }

  // --- Effect Styles ---
  const shadowName = `iOS/cardShadow/${theme}`;
  const existingShadow = existingEffectStyles.find(s => s.name === shadowName);
  if (existingShadow) {
    effectStyles.set("cardShadow", existingShadow.id);
  } else {
    const style = figma.createEffectStyle();
    style.name = shadowName;
    style.effects = [{
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: theme === "dark" ? 0.3 : 0.08 },
      offset: { x: 0, y: 2 },
      radius: 8,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    }];
    effectStyles.set("cardShadow", style.id);
  }

  return { paintStyles, textStyles, effectStyles };
}
