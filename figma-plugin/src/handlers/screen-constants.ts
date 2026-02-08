// figma-plugin/src/handlers/screen-constants.ts

export const DEVICE_PRESETS: Record<string, { width: number; height: number }> = {
  "iphone-15":          { width: 393, height: 852 },
  "iphone-15-pro":      { width: 393, height: 852 },
  "iphone-15-pro-max":  { width: 430, height: 932 },
  "iphone-se":          { width: 375, height: 667 },
  "ipad-pro-11":        { width: 834, height: 1194 },
  "ipad-pro-13":        { width: 1024, height: 1366 },
};

export const IOS_LAYOUT = {
  statusBarHeight: 54,
  navBarHeightInline: 44,
  navBarHeightLarge: 96,
  tabBarHeight: 49,
  tabBarSafeArea: 34,
  tabBarTotalHeight: 83,  // 49 + 34
  screenPadding: 16,
  contentPadding: 16,
};

export const SPACER_SIZES: Record<string, number> = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  // "fill" handled separately with layoutGrow
};

export const IOS_TYPOGRAPHY: Record<string, { fontSize: number; lineHeight: number; fontWeight: string }> = {
  largeTitle:  { fontSize: 34, lineHeight: 41, fontWeight: "Bold" },
  title1:     { fontSize: 28, lineHeight: 34, fontWeight: "Bold" },
  title2:     { fontSize: 22, lineHeight: 28, fontWeight: "Bold" },
  title3:     { fontSize: 20, lineHeight: 25, fontWeight: "Semi Bold" },
  headline:   { fontSize: 17, lineHeight: 22, fontWeight: "Semi Bold" },
  subheadline:{ fontSize: 15, lineHeight: 20, fontWeight: "Regular" },
  body:       { fontSize: 17, lineHeight: 22, fontWeight: "Regular" },
  callout:    { fontSize: 16, lineHeight: 21, fontWeight: "Regular" },
  footnote:   { fontSize: 13, lineHeight: 18, fontWeight: "Regular" },
  caption1:   { fontSize: 12, lineHeight: 16, fontWeight: "Regular" },
  caption2:   { fontSize: 11, lineHeight: 13, fontWeight: "Regular" },
};
