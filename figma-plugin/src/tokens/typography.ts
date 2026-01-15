/**
 * Design Token System - Typography
 * Font styles for web and mobile platforms
 */

export interface FontStyle {
  family: string;
  size: number;
  weight: number;
  lineHeight: number;
  letterSpacing?: number;
}

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

// Font families by platform
export const fontFamilies = {
  // Web (shadcn default)
  inter: "Inter",
  geist: "Geist",
  geistMono: "Geist Mono",

  // iOS
  sfPro: "SF Pro",
  sfProDisplay: "SF Pro Display",
  sfProText: "SF Pro Text",
  sfProRounded: "SF Pro Rounded",
  sfMono: "SF Mono",
  newYork: "New York",

  // macOS (same as iOS but with some additions)
  sfCompact: "SF Compact",
  sfCompactDisplay: "SF Compact Display",
  sfCompactText: "SF Compact Text",
  sfCompactRounded: "SF Compact Rounded",
};

// shadcn Typography Scale
export const shadcnTypography: Record<string, FontStyle> = {
  // Headings
  h1: {
    family: fontFamilies.inter,
    size: 36,
    weight: 800,
    lineHeight: 40,
    letterSpacing: -0.9,
  },
  h2: {
    family: fontFamilies.inter,
    size: 30,
    weight: 600,
    lineHeight: 36,
    letterSpacing: -0.75,
  },
  h3: {
    family: fontFamilies.inter,
    size: 24,
    weight: 600,
    lineHeight: 32,
    letterSpacing: -0.6,
  },
  h4: {
    family: fontFamilies.inter,
    size: 20,
    weight: 600,
    lineHeight: 28,
  },

  // Body text
  p: {
    family: fontFamilies.inter,
    size: 16,
    weight: 400,
    lineHeight: 28,
  },
  lead: {
    family: fontFamilies.inter,
    size: 20,
    weight: 400,
    lineHeight: 28,
  },
  large: {
    family: fontFamilies.inter,
    size: 18,
    weight: 600,
    lineHeight: 28,
  },
  small: {
    family: fontFamilies.inter,
    size: 14,
    weight: 500,
    lineHeight: 14,
  },
  muted: {
    family: fontFamilies.inter,
    size: 14,
    weight: 400,
    lineHeight: 20,
  },

  // UI text
  button: {
    family: fontFamilies.inter,
    size: 14,
    weight: 500,
    lineHeight: 20,
  },
  buttonSm: {
    family: fontFamilies.inter,
    size: 13,
    weight: 500,
    lineHeight: 16,
  },
  buttonLg: {
    family: fontFamilies.inter,
    size: 16,
    weight: 500,
    lineHeight: 24,
  },
  label: {
    family: fontFamilies.inter,
    size: 14,
    weight: 500,
    lineHeight: 14,
  },
  input: {
    family: fontFamilies.inter,
    size: 14,
    weight: 400,
    lineHeight: 20,
  },
  placeholder: {
    family: fontFamilies.inter,
    size: 14,
    weight: 400,
    lineHeight: 20,
  },

  // Code
  code: {
    family: fontFamilies.geistMono,
    size: 14,
    weight: 400,
    lineHeight: 20,
  },
};

// iOS Typography Scale (based on Apple HIG)
export const iosTypography: Record<string, FontStyle> = {
  // Large Title
  largeTitle: {
    family: fontFamilies.sfProDisplay,
    size: 34,
    weight: 400,
    lineHeight: 41,
  },
  largeTitleEmphasized: {
    family: fontFamilies.sfProDisplay,
    size: 34,
    weight: 700,
    lineHeight: 41,
  },

  // Title
  title1: {
    family: fontFamilies.sfProDisplay,
    size: 28,
    weight: 400,
    lineHeight: 34,
  },
  title1Emphasized: {
    family: fontFamilies.sfProDisplay,
    size: 28,
    weight: 700,
    lineHeight: 34,
  },
  title2: {
    family: fontFamilies.sfProDisplay,
    size: 22,
    weight: 400,
    lineHeight: 28,
  },
  title2Emphasized: {
    family: fontFamilies.sfProDisplay,
    size: 22,
    weight: 700,
    lineHeight: 28,
  },
  title3: {
    family: fontFamilies.sfProDisplay,
    size: 20,
    weight: 400,
    lineHeight: 25,
  },
  title3Emphasized: {
    family: fontFamilies.sfProDisplay,
    size: 20,
    weight: 600,
    lineHeight: 25,
  },

  // Headline
  headline: {
    family: fontFamilies.sfProText,
    size: 17,
    weight: 600,
    lineHeight: 22,
  },
  headlineItalic: {
    family: fontFamilies.sfProText,
    size: 17,
    weight: 600,
    lineHeight: 22,
  },

  // Body
  body: {
    family: fontFamilies.sfProText,
    size: 17,
    weight: 400,
    lineHeight: 22,
  },
  bodyEmphasized: {
    family: fontFamilies.sfProText,
    size: 17,
    weight: 600,
    lineHeight: 22,
  },

  // Callout
  callout: {
    family: fontFamilies.sfProText,
    size: 16,
    weight: 400,
    lineHeight: 21,
  },
  calloutEmphasized: {
    family: fontFamilies.sfProText,
    size: 16,
    weight: 600,
    lineHeight: 21,
  },

  // Subhead
  subhead: {
    family: fontFamilies.sfProText,
    size: 15,
    weight: 400,
    lineHeight: 20,
  },
  subheadEmphasized: {
    family: fontFamilies.sfProText,
    size: 15,
    weight: 600,
    lineHeight: 20,
  },

  // Footnote
  footnote: {
    family: fontFamilies.sfProText,
    size: 13,
    weight: 400,
    lineHeight: 18,
  },
  footnoteEmphasized: {
    family: fontFamilies.sfProText,
    size: 13,
    weight: 600,
    lineHeight: 18,
  },

  // Caption
  caption1: {
    family: fontFamilies.sfProText,
    size: 12,
    weight: 400,
    lineHeight: 16,
  },
  caption1Emphasized: {
    family: fontFamilies.sfProText,
    size: 12,
    weight: 500,
    lineHeight: 16,
  },
  caption2: {
    family: fontFamilies.sfProText,
    size: 11,
    weight: 400,
    lineHeight: 13,
  },
  caption2Emphasized: {
    family: fontFamilies.sfProText,
    size: 11,
    weight: 600,
    lineHeight: 13,
  },
};

// macOS Typography Scale
export const macOSTypography: Record<string, FontStyle> = {
  // Large Title
  largeTitle: {
    family: fontFamilies.sfProDisplay,
    size: 26,
    weight: 400,
    lineHeight: 32,
  },
  largeTitleEmphasized: {
    family: fontFamilies.sfProDisplay,
    size: 26,
    weight: 700,
    lineHeight: 32,
  },

  // Title
  title1: {
    family: fontFamilies.sfProDisplay,
    size: 22,
    weight: 400,
    lineHeight: 26,
  },
  title1Emphasized: {
    family: fontFamilies.sfProDisplay,
    size: 22,
    weight: 700,
    lineHeight: 26,
  },
  title2: {
    family: fontFamilies.sfProDisplay,
    size: 17,
    weight: 400,
    lineHeight: 22,
  },
  title2Emphasized: {
    family: fontFamilies.sfProDisplay,
    size: 17,
    weight: 700,
    lineHeight: 22,
  },
  title3: {
    family: fontFamilies.sfProDisplay,
    size: 15,
    weight: 400,
    lineHeight: 20,
  },
  title3Emphasized: {
    family: fontFamilies.sfProDisplay,
    size: 15,
    weight: 600,
    lineHeight: 20,
  },

  // Headline
  headline: {
    family: fontFamilies.sfProText,
    size: 13,
    weight: 700,
    lineHeight: 16,
  },

  // Body
  body: {
    family: fontFamilies.sfProText,
    size: 13,
    weight: 400,
    lineHeight: 16,
  },
  bodyEmphasized: {
    family: fontFamilies.sfProText,
    size: 13,
    weight: 600,
    lineHeight: 16,
  },

  // Callout
  callout: {
    family: fontFamilies.sfProText,
    size: 12,
    weight: 400,
    lineHeight: 15,
  },
  calloutEmphasized: {
    family: fontFamilies.sfProText,
    size: 12,
    weight: 600,
    lineHeight: 15,
  },

  // Subhead
  subhead: {
    family: fontFamilies.sfProText,
    size: 11,
    weight: 400,
    lineHeight: 14,
  },
  subheadEmphasized: {
    family: fontFamilies.sfProText,
    size: 11,
    weight: 600,
    lineHeight: 14,
  },

  // Footnote
  footnote: {
    family: fontFamilies.sfProText,
    size: 10,
    weight: 400,
    lineHeight: 13,
  },
  footnoteEmphasized: {
    family: fontFamilies.sfProText,
    size: 10,
    weight: 600,
    lineHeight: 13,
  },

  // Caption
  caption1: {
    family: fontFamilies.sfProText,
    size: 10,
    weight: 400,
    lineHeight: 13,
  },
  caption2: {
    family: fontFamilies.sfProText,
    size: 10,
    weight: 400,
    lineHeight: 13,
  },

  // Menu & Controls
  menu: {
    family: fontFamilies.sfProText,
    size: 13,
    weight: 400,
    lineHeight: 16,
  },
  menuSelected: {
    family: fontFamilies.sfProText,
    size: 13,
    weight: 600,
    lineHeight: 16,
  },
  button: {
    family: fontFamilies.sfProText,
    size: 13,
    weight: 400,
    lineHeight: 16,
  },
  label: {
    family: fontFamilies.sfProText,
    size: 13,
    weight: 400,
    lineHeight: 16,
  },
};

// Font weight mapping
export const fontWeightMap: Record<string, FontWeight> = {
  thin: 100,
  extralight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

// Helper to get Figma font style string
export function getFigmaFontStyle(weight: number): string {
  switch (weight) {
    case 100:
      return "Thin";
    case 200:
      return "ExtraLight";
    case 300:
      return "Light";
    case 400:
      return "Regular";
    case 500:
      return "Medium";
    case 600:
      return "Semi Bold";
    case 700:
      return "Bold";
    case 800:
      return "ExtraBold";
    case 900:
      return "Black";
    default:
      return "Regular";
  }
}

// Helper to get typography style by platform
export function getTypography(
  platform: "shadcn" | "ios" | "macos",
  style: string
): FontStyle | undefined {
  switch (platform) {
    case "shadcn":
      return shadcnTypography[style];
    case "ios":
      return iosTypography[style];
    case "macos":
      return macOSTypography[style];
    default:
      return undefined;
  }
}
