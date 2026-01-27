// mcp-server/src/prompt-engine/parser.ts
/**
 * Prompt Parser
 * Parses natural language prompts into structured component and layout specifications
 */

import type { ParsedPrompt, PromptIntent, ComponentSpec, LayoutSpec } from "./types.js";

// ============================================================================
// Component Keywords Mapping (EN/TR)
// ============================================================================

const COMPONENT_KEYWORDS: Record<string, string> = {
  // Buttons
  button: "button",
  btn: "button",
  buton: "button", // Turkish

  // Inputs
  input: "input",
  "text field": "input",
  "metin kutusu": "input", // Turkish

  // Cards
  card: "card",
  kart: "card", // Turkish

  // Avatar & Badge
  avatar: "avatar",
  badge: "badge",
  rozet: "badge", // Turkish

  // Form controls
  checkbox: "checkbox",
  toggle: "toggle",
  switch: "switch",

  // Tabs
  tabs: "tabs",
  sekme: "tabs", // Turkish

  // Dialogs
  modal: "dialog",
  dialog: "dialog",

  // Menus
  dropdown: "dropdown-menu",
  select: "select",

  // Navigation
  navbar: "navigation-bar",
  navigation: "navigation-bar",
  sidebar: "sidebar",

  // Layout elements
  footer: "footer",
  header: "header",
  hero: "hero",
  form: "form",
  list: "list",
  table: "table",
  tablo: "table", // Turkish
};

// ============================================================================
// Layout Keywords (EN/TR)
// ============================================================================

const LAYOUT_KEYWORDS = {
  vertical: ["vertical", "dikey", "column", "stack", "yukarıdan aşağı"],
  horizontal: ["horizontal", "yatay", "row", "side by side", "yan yana"],
  grid: ["grid", "ızgara", "matrix"],
  centered: ["center", "orta", "ortala", "centered"],
};

// ============================================================================
// Intent Detection Patterns
// ============================================================================

const INTENT_PATTERNS: Array<{ pattern: RegExp; intent: PromptIntent }> = [
  { pattern: /create|make|build|oluştur|yap|ekle/i, intent: "CREATE_COMPONENT" },
  { pattern: /screen|page|ekran|sayfa/i, intent: "CREATE_SCREEN" },
  { pattern: /layout|yerleşim|düzen/i, intent: "CREATE_LAYOUT" },
  { pattern: /change|modify|update|değiştir|güncelle/i, intent: "MODIFY_EXISTING" },
  { pattern: /style|color|renk|tema|theme/i, intent: "STYLE_CHANGE" },
];

// ============================================================================
// Variant Patterns
// ============================================================================

const VARIANT_PATTERNS: Record<string, Record<string, string[]>> = {
  button: {
    primary: ["primary", "main", "ana", "birincil"],
    secondary: ["secondary", "ikincil"],
    outline: ["outline", "bordered", "çerçeveli"],
    ghost: ["ghost", "transparent", "şeffaf"],
    destructive: ["destructive", "danger", "delete", "sil", "tehlike"],
  },
  badge: {
    default: ["default", "varsayılan"],
    success: ["success", "başarı", "yeşil", "green"],
    warning: ["warning", "uyarı", "sarı", "yellow"],
    error: ["error", "hata", "kırmızı", "red"],
  },
};

// ============================================================================
// Main Parser Function
// ============================================================================

/**
 * Parses a natural language prompt into structured specifications
 * @param prompt - The raw prompt string
 * @returns Parsed prompt with intent, components, and layout
 */
export function parsePrompt(prompt: string): ParsedPrompt {
  const normalizedPrompt = prompt.toLowerCase();

  return {
    intent: detectIntent(normalizedPrompt),
    components: extractComponents(normalizedPrompt),
    layout: extractLayout(normalizedPrompt),
    style: null, // Will be filled by style-inferrer
    context: null, // Will be filled by context-resolver
  };
}

// ============================================================================
// Intent Detection
// ============================================================================

/**
 * Detects the primary intent of the prompt
 */
function detectIntent(prompt: string): PromptIntent {
  for (const { pattern, intent } of INTENT_PATTERNS) {
    if (pattern.test(prompt)) {
      return intent;
    }
  }
  return "UNKNOWN";
}

// ============================================================================
// Component Extraction
// ============================================================================

/**
 * Extracts component specifications from the prompt
 */
function extractComponents(prompt: string): ComponentSpec[] {
  const components: ComponentSpec[] = [];

  for (const [keyword, componentType] of Object.entries(COMPONENT_KEYWORDS)) {
    const regex = new RegExp(`(\\d+)?\\s*${keyword}s?`, "gi");
    const match = prompt.match(regex);

    if (match) {
      // Extract count if specified (e.g., "3 buttons")
      const countMatch = match[0].match(/(\d+)/);
      const count = countMatch ? parseInt(countMatch[1], 10) : 1;

      // Extract variant if mentioned
      const variant = extractVariant(prompt, componentType);

      // Extract text content
      const text = extractTextContent(prompt, keyword);

      components.push({
        type: componentType,
        variant,
        text,
        count,
      });
    }
  }

  return components;
}

/**
 * Extracts variant information for a component type
 */
function extractVariant(prompt: string, componentType: string): string | undefined {
  const patterns = VARIANT_PATTERNS[componentType];
  if (!patterns) return undefined;

  for (const [variant, keywords] of Object.entries(patterns)) {
    if (keywords.some((kw) => prompt.includes(kw))) {
      return variant;
    }
  }

  return undefined;
}

/**
 * Extracts text content from the prompt
 */
function extractTextContent(prompt: string, keyword: string): string | undefined {
  // Look for quoted text near the keyword
  const quotedMatch = prompt.match(new RegExp(`${keyword}[^"]*"([^"]+)"`, "i"));
  if (quotedMatch) return quotedMatch[1];

  // Look for "with text" pattern
  const withTextMatch = prompt.match(
    new RegExp(`${keyword}[^,]*(?:with text|yazısı|metni)\\s+([\\w\\s]+)`, "i")
  );
  if (withTextMatch) return withTextMatch[1].trim();

  return undefined;
}

// ============================================================================
// Layout Extraction
// ============================================================================

/**
 * Extracts layout specifications from the prompt
 */
function extractLayout(prompt: string): LayoutSpec | null {
  let direction: "VERTICAL" | "HORIZONTAL" = "VERTICAL";
  let spacing: number | undefined;
  let centered = false;

  // Check direction
  if (LAYOUT_KEYWORDS.horizontal.some((kw) => prompt.includes(kw))) {
    direction = "HORIZONTAL";
  }

  // Check centering
  if (LAYOUT_KEYWORDS.centered.some((kw) => prompt.includes(kw))) {
    centered = true;
  }

  // Extract spacing if mentioned
  const spacingMatch = prompt.match(/(\d+)\s*(?:px|pixel)?\s*(?:spacing|gap|boşluk|aralık)/i);
  if (spacingMatch) {
    spacing = parseInt(spacingMatch[1], 10);
  }

  // Only return layout if meaningful info extracted
  if (direction !== "VERTICAL" || spacing || centered) {
    return {
      direction,
      spacing,
      alignment: centered ? "CENTER" : undefined,
    };
  }

  return null;
}

// ============================================================================
// Dimension Extraction
// ============================================================================

/**
 * Extracts width and height dimensions from the prompt
 */
export function extractDimensions(prompt: string): { width?: number; height?: number } {
  const result: { width?: number; height?: number } = {};

  // Width patterns
  const widthMatch = prompt.match(/(\d+)\s*(?:px)?\s*(?:wide|width|genişlik|en)/i);
  if (widthMatch) result.width = parseInt(widthMatch[1], 10);

  // Height patterns
  const heightMatch = prompt.match(/(\d+)\s*(?:px)?\s*(?:tall|height|yükseklik|boy)/i);
  if (heightMatch) result.height = parseInt(heightMatch[1], 10);

  // Size patterns (e.g., "400x300")
  const sizeMatch = prompt.match(/(\d+)\s*[xX×]\s*(\d+)/);
  if (sizeMatch) {
    result.width = parseInt(sizeMatch[1], 10);
    result.height = parseInt(sizeMatch[2], 10);
  }

  return result;
}
