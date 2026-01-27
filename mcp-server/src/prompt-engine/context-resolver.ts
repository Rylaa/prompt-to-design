// mcp-server/src/prompt-engine/context-resolver.ts
/**
 * Context Resolver
 * Resolves contextual information from prompts for better design decisions
 */

import type { ContextSpec, ParsedPrompt } from "./types.js";

// ============================================================================
// Screen Type Patterns (EN/TR)
// ============================================================================

const SCREEN_PATTERNS: Record<string, string[]> = {
  landing: ["landing", "home", "anasayfa", "karşılama", "hero"],
  dashboard: ["dashboard", "panel", "kontrol paneli", "analytics", "metrics"],
  form: ["form", "login", "signup", "register", "kayıt", "giriş", "contact"],
  profile: ["profile", "profil", "user", "kullanıcı", "account", "hesap"],
  settings: ["settings", "ayarlar", "preferences", "tercihler", "config"],
  list: ["list", "liste", "items", "products", "ürünler"],
  detail: ["detail", "detay", "single", "tekil", "view"],
  checkout: ["checkout", "payment", "ödeme", "sepet", "cart"],
};

// ============================================================================
// Device Type Patterns
// ============================================================================

const DEVICE_PATTERNS: Record<string, string[]> = {
  mobile: ["mobile", "phone", "mobil", "telefon", "iphone", "android", "390", "375", "414"],
  tablet: ["tablet", "ipad", "768", "820", "1024"],
  desktop: ["desktop", "web", "masaüstü", "1440", "1920", "1280"],
};

// ============================================================================
// Industry Patterns for Context-Aware Styling
// ============================================================================

const INDUSTRY_PATTERNS: Record<string, string[]> = {
  fintech: ["finance", "finans", "bank", "banka", "payment", "ödeme", "crypto", "trading"],
  ecommerce: ["ecommerce", "shop", "store", "mağaza", "ürün", "product", "cart", "sepet"],
  healthcare: ["health", "sağlık", "medical", "tıp", "hospital", "hastane", "doctor"],
  education: ["education", "eğitim", "course", "kurs", "learn", "öğren", "school"],
  social: ["social", "sosyal", "chat", "message", "mesaj", "feed", "timeline"],
  saas: ["saas", "dashboard", "analytics", "workspace", "team", "project"],
};

// ============================================================================
// Main Context Resolution
// ============================================================================

/**
 * Resolves contextual information from a prompt
 * @param prompt - Raw prompt string
 * @param parsedPrompt - Already parsed prompt data
 * @returns Context specification
 */
export function resolveContext(prompt: string, parsedPrompt: ParsedPrompt): ContextSpec {
  const normalizedPrompt = prompt.toLowerCase();

  return {
    deviceType: detectDeviceType(normalizedPrompt),
    screenType: detectScreenType(normalizedPrompt, parsedPrompt),
    industry: detectIndustry(normalizedPrompt),
  };
}

// ============================================================================
// Device Type Detection
// ============================================================================

/**
 * Detects the target device type from the prompt
 */
function detectDeviceType(prompt: string): "mobile" | "tablet" | "desktop" {
  for (const [device, patterns] of Object.entries(DEVICE_PATTERNS)) {
    if (patterns.some((p) => prompt.includes(p))) {
      return device as "mobile" | "tablet" | "desktop";
    }
  }

  // Default based on dimension hints
  const dimensionMatch = prompt.match(/(\d+)\s*[xX×]\s*(\d+)/);
  if (dimensionMatch) {
    const width = parseInt(dimensionMatch[1], 10);
    if (width <= 430) return "mobile";
    if (width <= 1024) return "tablet";
    return "desktop";
  }

  return "desktop"; // Default
}

// ============================================================================
// Screen Type Detection
// ============================================================================

// Valid screen types
type ScreenType = "landing" | "dashboard" | "form" | "profile" | "settings" | "list" | "detail" | "checkout";

/**
 * Detects the screen type from the prompt and parsed components
 */
function detectScreenType(prompt: string, parsedPrompt: ParsedPrompt): ScreenType | undefined {
  // Direct pattern matching
  for (const [screenType, patterns] of Object.entries(SCREEN_PATTERNS)) {
    if (patterns.some((p) => prompt.includes(p))) {
      return screenType as ScreenType;
    }
  }

  // Infer from components
  const componentTypes = parsedPrompt.components.map((c) => c.type);

  if (componentTypes.includes("form") || componentTypes.some((t) => t.includes("input"))) {
    return "form";
  }

  if (componentTypes.some((t) => t.includes("card")) && parsedPrompt.components.length > 2) {
    return "dashboard";
  }

  if (componentTypes.includes("hero")) {
    return "landing";
  }

  return undefined;
}

// ============================================================================
// Industry Detection
// ============================================================================

/**
 * Detects the industry context from the prompt
 */
function detectIndustry(prompt: string): string | undefined {
  for (const [industry, patterns] of Object.entries(INDUSTRY_PATTERNS)) {
    if (patterns.some((p) => prompt.includes(p))) {
      return industry;
    }
  }
  return undefined;
}

// ============================================================================
// Platform Recommendation
// ============================================================================

/**
 * Recommends a design platform based on context
 */
export function getPlatformRecommendation(context: ContextSpec): string {
  if (context.deviceType === "mobile") {
    // iOS-style for mobile
    return "ios";
  }

  if (context.industry === "fintech" || context.industry === "saas") {
    // shadcn for professional apps
    return "shadcn";
  }

  if (context.screenType === "landing") {
    // Modern glass effect for landing pages
    return "liquid-glass";
  }

  return "shadcn"; // Default
}

// ============================================================================
// Spacing Recommendation
// ============================================================================

/**
 * Recommends spacing values based on device type
 */
export function getSpacingRecommendation(context: ContextSpec): { base: number; section: number } {
  switch (context.deviceType) {
    case "mobile":
      return { base: 16, section: 24 };
    case "tablet":
      return { base: 20, section: 32 };
    case "desktop":
    default:
      return { base: 24, section: 48 };
  }
}
