// mcp-server/src/prompt-engine/types.ts
/**
 * Type definitions for the Prompt Enhancement Engine
 * Handles parsing, context resolution, and style inference for natural language prompts
 */

// ============================================================================
// Parsed Prompt Types
// ============================================================================

export interface ParsedPrompt {
  intent: PromptIntent;
  components: ComponentSpec[];
  layout: LayoutSpec | null;
  style: StyleSpec | null;
  context: ContextSpec | null;
}

export type PromptIntent =
  | "CREATE_COMPONENT"
  | "CREATE_SCREEN"
  | "CREATE_LAYOUT"
  | "MODIFY_EXISTING"
  | "STYLE_CHANGE"
  | "UNKNOWN";

// ============================================================================
// Component Specification
// ============================================================================

export interface ComponentSpec {
  type: string;
  variant?: string;
  text?: string;
  icon?: string;
  count?: number;
  children?: ComponentSpec[];
}

// ============================================================================
// Layout Specification
// ============================================================================

export interface LayoutSpec {
  direction: "VERTICAL" | "HORIZONTAL";
  spacing?: number;
  padding?: number;
  alignment?: string;
  wrap?: boolean;
}

// ============================================================================
// Style Specification
// ============================================================================

export interface StyleSpec {
  theme?: "light" | "dark";
  platform?: "shadcn" | "ios" | "macos" | "liquid-glass";
  colors?: Record<string, string>;
  typography?: {
    headingSize?: number;
    bodySize?: number;
  };
}

// ============================================================================
// Context Specification
// ============================================================================

export interface ContextSpec {
  deviceType?: "mobile" | "tablet" | "desktop";
  screenType?: "landing" | "dashboard" | "form" | "profile" | "settings" | "list" | "detail" | "checkout";
  industry?: string;
}

// ============================================================================
// Tool Call Enhancement
// ============================================================================

export interface EnhancedToolCall {
  tool: string;
  params: Record<string, unknown>;
  priority: number;
  dependsOn?: string[];
}

// ============================================================================
// Final Enhancement Result
// ============================================================================

export interface PromptEnhancementResult {
  originalPrompt: string;
  parsedPrompt: ParsedPrompt;
  suggestedToolCalls: EnhancedToolCall[];
  styleRecommendations: string[];
  layoutRecommendations: string[];
}
