/**
 * Design Token System - Spacing
 * Consistent spacing scale for layouts
 */

export type SpacingKey =
  | "0"
  | "0.5"
  | "1"
  | "1.5"
  | "2"
  | "2.5"
  | "3"
  | "3.5"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "14"
  | "16"
  | "20"
  | "24"
  | "28"
  | "32"
  | "36"
  | "40"
  | "44"
  | "48"
  | "52"
  | "56"
  | "60"
  | "64"
  | "72"
  | "80"
  | "96";

// Base spacing unit in pixels (4px)
const BASE_UNIT = 4;

// Spacing scale (Tailwind-inspired)
export const spacing: Record<SpacingKey, number> = {
  "0": 0,
  "0.5": 2,
  "1": 4,
  "1.5": 6,
  "2": 8,
  "2.5": 10,
  "3": 12,
  "3.5": 14,
  "4": 16,
  "5": 20,
  "6": 24,
  "7": 28,
  "8": 32,
  "9": 36,
  "10": 40,
  "11": 44,
  "12": 48,
  "14": 56,
  "16": 64,
  "20": 80,
  "24": 96,
  "28": 112,
  "32": 128,
  "36": 144,
  "40": 160,
  "44": 176,
  "48": 192,
  "52": 208,
  "56": 224,
  "60": 240,
  "64": 256,
  "72": 288,
  "80": 320,
  "96": 384,
};

// Border radius scale
export type RadiusKey =
  | "none"
  | "sm"
  | "default"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "full";

export const radius: Record<RadiusKey, number> = {
  none: 0,
  sm: 2,
  default: 4,
  md: 6,
  lg: 8,
  xl: 12,
  "2xl": 16,
  "3xl": 24,
  full: 9999,
};

// iOS-specific spacing
export const iosSpacing = {
  // Standard margins
  layoutMargin: 16,
  layoutMarginCompact: 20,

  // List insets
  listInsetGrouped: 16,
  listInsetInset: 20,

  // Cell padding
  cellPaddingVertical: 11,
  cellPaddingHorizontal: 16,

  // Navigation bar
  navBarHeight: 44,
  navBarHeightLarge: 96,

  // Tab bar
  tabBarHeight: 49,
  tabBarHeightCompact: 32,

  // Search bar
  searchBarHeight: 36,

  // Standard spacing
  standardSpacing: 8,
  compactSpacing: 4,
};

// macOS-specific spacing
export const macOSSpacing = {
  // Window
  windowMinWidth: 480,
  windowMinHeight: 320,

  // Toolbar
  toolbarHeight: 52,
  toolbarItemSpacing: 8,

  // Sidebar
  sidebarWidth: 240,
  sidebarMinWidth: 200,
  sidebarItemHeight: 24,
  sidebarItemPadding: 8,

  // Content
  contentPadding: 20,
  sectionSpacing: 20,

  // Controls
  buttonHeight: 22,
  buttonPaddingHorizontal: 12,
  checkboxSize: 14,
  radioSize: 14,
  sliderHeight: 4,

  // Text field
  textFieldHeight: 22,
  textFieldPadding: 4,
};

// shadcn-specific spacing
export const shadcnSpacing = {
  // Button sizes
  buttonHeightSm: 36,
  buttonHeightDefault: 40,
  buttonHeightLg: 44,
  buttonHeightIcon: 40,
  buttonPaddingSm: 12,
  buttonPaddingDefault: 16,
  buttonPaddingLg: 32,

  // Input
  inputHeight: 40,
  inputPadding: 12,

  // Card
  cardPadding: 24,
  cardHeaderPadding: 24,
  cardFooterPadding: 24,

  // Dialog
  dialogPadding: 24,
  dialogHeaderPadding: 24,
  dialogFooterPadding: 24,
  dialogMaxWidth: 512,

  // Dropdown
  dropdownPadding: 4,
  dropdownItemPadding: 8,

  // Tabs
  tabHeight: 40,
  tabPadding: 12,

  // Avatar sizes
  avatarSm: 32,
  avatarDefault: 40,
  avatarLg: 48,

  // Badge
  badgePaddingX: 10,
  badgePaddingY: 2,

  // Checkbox/Radio
  checkboxSize: 16,
  radioSize: 16,

  // Switch
  switchWidth: 44,
  switchHeight: 24,
  switchThumbSize: 20,

  // Slider
  sliderTrackHeight: 8,
  sliderThumbSize: 20,

  // Progress
  progressHeight: 16,

  // Separator
  separatorThickness: 1,

  // Tooltip
  tooltipPadding: 12,

  // Alert
  alertPadding: 16,
  alertIconSize: 16,
};

// Helper function to get spacing value
export function getSpacing(key: SpacingKey): number {
  return spacing[key];
}

// Helper function to get radius value
export function getRadius(key: RadiusKey): number {
  return radius[key];
}

// Helper to convert px to spacing key (approximate)
export function pxToSpacingKey(px: number): SpacingKey {
  const keys = Object.keys(spacing) as SpacingKey[];
  let closest: SpacingKey = "0";
  let minDiff = Infinity;

  for (const key of keys) {
    const diff = Math.abs(spacing[key] - px);
    if (diff < minDiff) {
      minDiff = diff;
      closest = key;
    }
  }

  return closest;
}
