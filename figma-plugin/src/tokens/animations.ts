/**
 * Animation, Timing & Layout Tokens
 * Duration, easing curves, z-index scale, and responsive breakpoints
 */

// ============================================================================
// Duration Tokens (in milliseconds)
// ============================================================================

export const duration = {
  /** Instant - no animation */
  instant: 0,
  /** Fast - quick micro-interactions */
  fast: 150,
  /** Normal - standard transitions */
  normal: 300,
  /** Slow - deliberate animations */
  slow: 500,
  /** Slower - dramatic effects */
  slower: 700,
  /** Slowest - page transitions */
  slowest: 1000,
} as const;

export type DurationKey = keyof typeof duration;

// ============================================================================
// Easing Curves (cubic-bezier values)
// ============================================================================

export interface EasingCurve {
  /** Cubic bezier values [x1, y1, x2, y2] */
  bezier: readonly [number, number, number, number];
  /** CSS cubic-bezier string */
  css: string;
  /** Description */
  description: string;
}

export const easing = {
  /** Linear - constant speed */
  linear: {
    bezier: [0, 0, 1, 1] as const,
    css: "linear",
    description: "Constant speed, no acceleration",
  },
  /** Ease In - starts slow, ends fast */
  easeIn: {
    bezier: [0.4, 0, 1, 1] as const,
    css: "cubic-bezier(0.4, 0, 1, 1)",
    description: "Starts slow, accelerates to end",
  },
  /** Ease Out - starts fast, ends slow */
  easeOut: {
    bezier: [0, 0, 0.2, 1] as const,
    css: "cubic-bezier(0, 0, 0.2, 1)",
    description: "Starts fast, decelerates to end",
  },
  /** Ease In-Out - slow start and end */
  easeInOut: {
    bezier: [0.4, 0, 0.2, 1] as const,
    css: "cubic-bezier(0.4, 0, 0.2, 1)",
    description: "Slow start and end, fast middle",
  },
  /** Spring - bouncy overshoot */
  spring: {
    bezier: [0.175, 0.885, 0.32, 1.275] as const,
    css: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    description: "Bouncy overshoot effect",
  },
  /** iOS Standard - Apple's default curve */
  iosStandard: {
    bezier: [0.25, 0.1, 0.25, 1] as const,
    css: "cubic-bezier(0.25, 0.1, 0.25, 1)",
    description: "iOS default animation curve",
  },
  /** iOS Modal - for sheet presentations */
  iosModal: {
    bezier: [0.32, 0.72, 0, 1] as const,
    css: "cubic-bezier(0.32, 0.72, 0, 1)",
    description: "iOS modal presentation curve",
  },
  /** Anticipate - slight pullback before motion */
  anticipate: {
    bezier: [0.36, 0, 0.66, -0.56] as const,
    css: "cubic-bezier(0.36, 0, 0.66, -0.56)",
    description: "Slight pullback before moving forward",
  },
} as const;

export type EasingKey = keyof typeof easing;

// ============================================================================
// Z-Index Scale
// ============================================================================

export const zIndex = {
  /** Hide - below everything */
  hide: -1,
  /** Base - default layer */
  base: 0,
  /** Raised - slightly elevated content */
  raised: 1,
  /** Dropdown - dropdown menus */
  dropdown: 1000,
  /** Sticky - sticky headers */
  sticky: 1100,
  /** Fixed - fixed position elements */
  fixed: 1200,
  /** Modal Backdrop - behind modals */
  modalBackdrop: 1300,
  /** Modal - modal dialogs */
  modal: 1400,
  /** Popover - popovers and tooltips */
  popover: 1500,
  /** Tooltip - tooltips (highest interactive) */
  tooltip: 1600,
  /** Toast - notification toasts */
  toast: 1700,
  /** Overlay - full-screen overlays */
  overlay: 1800,
  /** Max - highest possible */
  max: 9999,
} as const;

export type ZIndexKey = keyof typeof zIndex;

// ============================================================================
// Responsive Breakpoints (in pixels)
// ============================================================================

export const breakpoints = {
  /** Extra Small - small phones */
  xs: 320,
  /** Small - standard phones (iPhone SE) */
  sm: 375,
  /** Medium - modern phones (iPhone 14/15) */
  md: 390,
  /** Large - large phones (iPhone Pro Max) */
  lg: 428,
  /** Extra Large - tablets (iPad Mini) */
  xl: 768,
  /** 2XL - large tablets (iPad) */
  "2xl": 1024,
  /** 3XL - desktop */
  "3xl": 1280,
  /** 4XL - large desktop */
  "4xl": 1440,
  /** 5XL - Full HD */
  "5xl": 1920,
} as const;

export type BreakpointKey = keyof typeof breakpoints;

// Device-specific breakpoints
export const deviceBreakpoints = {
  // iOS Devices
  iPhoneSE: 375,
  iPhone14: 390,
  iPhone14Pro: 393,
  iPhone14ProMax: 430,
  iPhone15: 393,
  iPhone15Pro: 393,
  iPhone15ProMax: 430,
  iPadMini: 744,
  iPad: 820,
  iPadAir: 820,
  iPadPro11: 834,
  iPadPro12: 1024,

  // Android Common
  androidSmall: 360,
  androidMedium: 390,
  androidLarge: 412,
  androidTablet: 800,

  // Desktop
  laptop: 1280,
  desktop: 1440,
  largeDesktop: 1920,
  ultrawide: 2560,
} as const;

export type DeviceBreakpointKey = keyof typeof deviceBreakpoints;

// ============================================================================
// Opacity Scale
// ============================================================================

export const opacity = {
  /** Invisible */
  none: 0,
  /** Very faint */
  5: 0.05,
  /** Subtle hint */
  10: 0.1,
  /** Light */
  15: 0.15,
  /** Soft */
  20: 0.2,
  /** Quarter */
  25: 0.25,
  /** Medium-light */
  30: 0.3,
  /** Medium */
  40: 0.4,
  /** Half */
  50: 0.5,
  /** Medium-strong */
  60: 0.6,
  /** Strong */
  70: 0.7,
  /** Heavy */
  80: 0.8,
  /** Very heavy */
  90: 0.9,
  /** Fully opaque */
  100: 1,
} as const;

export type OpacityKey = keyof typeof opacity;

// ============================================================================
// Grid & Layout Tokens
// ============================================================================

export const grid = {
  /** Base unit (4px grid) */
  base: 4,
  /** Standard grid (8px) */
  standard: 8,
  /** Large grid (12px) */
  large: 12,
  /** Content grid (16px) */
  content: 16,
  /** Section grid (24px) */
  section: 24,
} as const;

export type GridKey = keyof typeof grid;

// Column configurations for different breakpoints
export const columns = {
  mobile: 4,
  tablet: 8,
  desktop: 12,
  widescreen: 16,
} as const;

export type ColumnsKey = keyof typeof columns;

// Gutter widths
export const gutters = {
  mobile: 16,
  tablet: 24,
  desktop: 32,
} as const;

export type GuttersKey = keyof typeof gutters;

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get duration value in seconds (for CSS)
 */
export function getDurationInSeconds(key: DurationKey): string {
  return `${duration[key] / 1000}s`;
}

/**
 * Get CSS cubic-bezier string
 */
export function getEasingCSS(key: EasingKey): string {
  return easing[key].css;
}

/**
 * Check if width matches or exceeds breakpoint
 */
export function matchesBreakpoint(width: number, breakpoint: BreakpointKey): boolean {
  return width >= breakpoints[breakpoint];
}

/**
 * Get current breakpoint for a given width
 */
export function getCurrentBreakpoint(width: number): BreakpointKey {
  const keys = Object.keys(breakpoints) as BreakpointKey[];
  for (let i = keys.length - 1; i >= 0; i--) {
    if (width >= breakpoints[keys[i]]) {
      return keys[i];
    }
  }
  return "xs";
}

/**
 * Get opacity value from percentage
 */
export function getOpacityValue(key: OpacityKey): number {
  return opacity[key];
}
