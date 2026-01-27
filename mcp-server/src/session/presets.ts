/**
 * Device Presets & Default Themes
 * Mobile-first device dimensions and default themes
 */

import type { DevicePreset, ThemeConfig } from "./types.js";

// ============================================================================
// Mobile Device Presets
// ============================================================================

export const DEVICE_PRESETS: Record<string, DevicePreset> = {
  // iOS Devices
  "iphone-14": {
    name: "iPhone 14",
    type: "mobile",
    width: 393,
    height: 852,
    platform: "ios",
  },
  "iphone-14-pro": {
    name: "iPhone 14 Pro",
    type: "mobile",
    width: 393,
    height: 852,
    platform: "ios",
  },
  "iphone-14-pro-max": {
    name: "iPhone 14 Pro Max",
    type: "mobile",
    width: 430,
    height: 932,
    platform: "ios",
  },
  "iphone-15": {
    name: "iPhone 15",
    type: "mobile",
    width: 393,
    height: 852,
    platform: "ios",
  },
  "iphone-15-pro": {
    name: "iPhone 15 Pro",
    type: "mobile",
    width: 393,
    height: 852,
    platform: "ios",
  },
  "iphone-15-pro-max": {
    name: "iPhone 15 Pro Max",
    type: "mobile",
    width: 430,
    height: 932,
    platform: "ios",
  },
  "iphone-se": {
    name: "iPhone SE",
    type: "mobile",
    width: 375,
    height: 667,
    platform: "ios",
  },

  // Android Devices
  "pixel-8": {
    name: "Google Pixel 8",
    type: "mobile",
    width: 412,
    height: 915,
    platform: "android",
  },
  "pixel-8-pro": {
    name: "Google Pixel 8 Pro",
    type: "mobile",
    width: 448,
    height: 998,
    platform: "android",
  },
  "samsung-s24": {
    name: "Samsung Galaxy S24",
    type: "mobile",
    width: 412,
    height: 915,
    platform: "android",
  },
  "samsung-s24-ultra": {
    name: "Samsung Galaxy S24 Ultra",
    type: "mobile",
    width: 412,
    height: 915,
    platform: "android",
  },

  // Tablets
  "ipad-pro-11": {
    name: "iPad Pro 11\"",
    type: "tablet",
    width: 834,
    height: 1194,
    platform: "ios",
  },
  "ipad-pro-12": {
    name: "iPad Pro 12.9\"",
    type: "tablet",
    width: 1024,
    height: 1366,
    platform: "ios",
  },
  "ipad-mini": {
    name: "iPad Mini",
    type: "tablet",
    width: 744,
    height: 1133,
    platform: "ios",
  },

  // Generic
  "mobile-small": {
    name: "Mobile Small",
    type: "mobile",
    width: 320,
    height: 568,
    platform: "web",
  },
  "mobile-medium": {
    name: "Mobile Medium",
    type: "mobile",
    width: 375,
    height: 812,
    platform: "web",
  },
  "mobile-large": {
    name: "Mobile Large",
    type: "mobile",
    width: 428,
    height: 926,
    platform: "web",
  },
};

// Default device for new sessions
export const DEFAULT_DEVICE = DEVICE_PRESETS["iphone-15"];

// ============================================================================
// Theme Presets
// ============================================================================

export const DARK_THEME: ThemeConfig = {
  primary: "#8B5CF6",
  secondary: "#6366F1",
  background: "#09090B",
  surface: "#18181B",
  text: "#FAFAFA",
  textSecondary: "#A1A1AA",
  border: "#27272A",
  error: "#EF4444",
  success: "#22C55E",
  warning: "#F59E0B",
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
};

export const LIGHT_THEME: ThemeConfig = {
  primary: "#8B5CF6",
  secondary: "#6366F1",
  background: "#FFFFFF",
  surface: "#F4F4F5",
  text: "#09090B",
  textSecondary: "#71717A",
  border: "#E4E4E7",
  error: "#EF4444",
  success: "#22C55E",
  warning: "#F59E0B",
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
};

// Default theme for new sessions
export const DEFAULT_THEME = DARK_THEME;

// ============================================================================
// Mobile Layout Regions
// ============================================================================

export interface MobileLayoutTemplate {
  name: string;
  description: string;
  regions: Array<{
    name: string;
    type: "header" | "content" | "footer";
    height: number | "auto" | "fill";
    position: "top" | "bottom";
  }>;
}

export const MOBILE_LAYOUTS: Record<string, MobileLayoutTemplate> = {
  "standard": {
    name: "Standard",
    description: "Header + Content + Footer",
    regions: [
      { name: "Header", type: "header", height: 60, position: "top" },
      { name: "Content", type: "content", height: "fill", position: "top" },
      { name: "Footer", type: "footer", height: 80, position: "bottom" },
    ],
  },
  "header-only": {
    name: "Header Only",
    description: "Header + Full Content",
    regions: [
      { name: "Header", type: "header", height: 60, position: "top" },
      { name: "Content", type: "content", height: "fill", position: "top" },
    ],
  },
  "footer-only": {
    name: "Footer Only",
    description: "Full Content + Footer",
    regions: [
      { name: "Content", type: "content", height: "fill", position: "top" },
      { name: "Footer", type: "footer", height: 80, position: "bottom" },
    ],
  },
  "fullscreen": {
    name: "Fullscreen",
    description: "No header/footer",
    regions: [
      { name: "Content", type: "content", height: "fill", position: "top" },
    ],
  },
  "tab-bar": {
    name: "Tab Bar",
    description: "Content + iOS Tab Bar",
    regions: [
      { name: "Content", type: "content", height: "fill", position: "top" },
      { name: "TabBar", type: "footer", height: 83, position: "bottom" },
    ],
  },
  "navigation-bar": {
    name: "Navigation Bar",
    description: "iOS Navigation Bar + Content",
    regions: [
      { name: "NavigationBar", type: "header", height: 96, position: "top" },
      { name: "Content", type: "content", height: "fill", position: "top" },
    ],
  },
};

export const DEFAULT_MOBILE_LAYOUT = MOBILE_LAYOUTS["standard"];
