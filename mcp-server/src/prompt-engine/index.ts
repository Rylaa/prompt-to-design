// mcp-server/src/prompt-engine/index.ts
/**
 * Prompt Enhancement Engine
 * Transforms natural language prompts into structured tool calls
 */

import { parsePrompt, extractDimensions } from "./parser.js";
import { resolveContext, getSpacingRecommendation } from "./context-resolver.js";
import { inferStyle, generateStyleRecommendations } from "./style-inferrer.js";
import type {
  PromptEnhancementResult,
  EnhancedToolCall,
  ParsedPrompt,
  ContextSpec,
  ComponentSpec,
} from "./types.js";

// ============================================================================
// Re-exports
// ============================================================================

export * from "./types.js";
export { parsePrompt } from "./parser.js";
export { resolveContext } from "./context-resolver.js";
export { inferStyle } from "./style-inferrer.js";

// ============================================================================
// Main Prompt Enhancement Function
// ============================================================================

/**
 * Main prompt enhancement function
 * Takes a natural language prompt and returns enhanced tool calls
 * @param prompt - Natural language prompt from user
 * @returns Enhanced result with parsed data, tool calls, and recommendations
 */
export function enhancePrompt(prompt: string): PromptEnhancementResult {
  // Step 1: Parse the prompt
  const parsedPrompt = parsePrompt(prompt);

  // Step 2: Resolve context
  const context = resolveContext(prompt, parsedPrompt);
  parsedPrompt.context = context;

  // Step 3: Infer style
  const style = inferStyle(prompt, context, parsedPrompt);
  parsedPrompt.style = style;

  // Step 4: Generate tool calls
  const suggestedToolCalls = generateToolCalls(parsedPrompt, prompt);

  // Step 5: Generate recommendations
  const styleRecommendations = generateStyleRecommendations(style, context);
  const layoutRecommendations = generateLayoutRecommendations(parsedPrompt, context);

  return {
    originalPrompt: prompt,
    parsedPrompt,
    suggestedToolCalls,
    styleRecommendations,
    layoutRecommendations,
  };
}

// ============================================================================
// Tool Call Generation
// ============================================================================

/**
 * Generates tool calls from parsed prompt data
 */
function generateToolCalls(parsed: ParsedPrompt, originalPrompt: string): EnhancedToolCall[] {
  const calls: EnhancedToolCall[] = [];
  const dimensions = extractDimensions(originalPrompt);
  const spacing = parsed.context ? getSpacingRecommendation(parsed.context) : { base: 24, section: 48 };

  // If creating a screen, start with a frame
  if (parsed.intent === "CREATE_SCREEN" || parsed.intent === "CREATE_LAYOUT") {
    calls.push({
      tool: "figma_create_frame",
      params: {
        name: inferFrameName(parsed),
        width: dimensions.width || getDefaultWidth(parsed.context || {}),
        height: dimensions.height || getDefaultHeight(parsed.context || {}),
        autoLayout: {
          mode: parsed.layout?.direction || "VERTICAL",
          spacing: parsed.layout?.spacing || spacing.base,
          padding: spacing.base,
          primaryAxisAlign: parsed.layout?.alignment || "MIN",
          counterAxisAlign: "CENTER",
        },
        fill: {
          type: "SOLID" as const,
          color: parsed.style?.theme === "dark" ? "#09090B" : "#FFFFFF",
        },
      },
      priority: 1,
    });
  }

  // Add component creation calls
  for (const component of parsed.components) {
    const toolCall = componentToToolCall(component, parsed);
    if (toolCall) {
      calls.push({
        ...toolCall,
        priority: calls.length + 1,
        dependsOn: calls.length > 0 ? ["frame"] : undefined,
      });
    }
  }

  // Add smart layout call if multiple components
  if (parsed.components.length > 2) {
    calls.push({
      tool: "figma_smart_layout",
      params: {
        nodeId: "{{frameId}}", // Placeholder for actual frame ID
        strategy: "AUTO_DETECT",
        options: {
          enforceGrid: true,
          optimizeHierarchy: true,
          targetPlatform: parsed.context?.deviceType === "mobile" ? "ios" : "web",
        },
      },
      priority: calls.length + 1,
      dependsOn: ["frame"],
    });
  }

  return calls;
}

// ============================================================================
// Component to Tool Call Mapping
// ============================================================================

/**
 * Converts a component specification to the appropriate tool call
 */
function componentToToolCall(
  component: ComponentSpec,
  parsed: ParsedPrompt
): Omit<EnhancedToolCall, "priority" | "dependsOn"> | null {
  const platform = parsed.style?.platform || "shadcn";
  const theme = parsed.style?.theme || "dark";

  // Map component type to appropriate tool
  switch (component.type) {
    case "button":
      if (platform === "ios") {
        return {
          tool: "figma_create_apple_component",
          params: {
            platform: "ios",
            component: "button",
            style: component.variant || "filled",
            text: component.text || "Button",
            theme,
          },
        };
      }
      if (platform === "liquid-glass") {
        return {
          tool: "figma_create_liquid_glass_component",
          params: {
            component: "button",
            text: component.text || "Button",
            theme,
          },
        };
      }
      return {
        tool: "figma_create_shadcn_component",
        params: {
          component: "button",
          variant: component.variant || "default",
          text: component.text || "Button",
          theme,
        },
      };

    case "input":
      return {
        tool: "figma_create_shadcn_component",
        params: {
          component: "input",
          placeholder: component.text || "Enter text...",
          theme,
        },
      };

    case "card":
      return {
        tool: "figma_create_shadcn_component",
        params: {
          component: "card",
          title: component.text,
          theme,
        },
      };

    case "navigation-bar":
      if (platform === "ios") {
        return {
          tool: "figma_create_apple_component",
          params: {
            platform: "ios",
            component: "navigation-bar",
            title: component.text || "Title",
            theme,
          },
        };
      }
      if (platform === "liquid-glass") {
        return {
          tool: "figma_create_liquid_glass_component",
          params: {
            component: "navigation-bar",
            title: component.text || "Title",
            theme,
          },
        };
      }
      return null;

    default:
      // Generic shadcn component
      return {
        tool: "figma_create_shadcn_component",
        params: {
          component: component.type,
          variant: component.variant,
          text: component.text,
          theme,
        },
      };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Infers a frame name from parsed prompt data
 */
function inferFrameName(parsed: ParsedPrompt): string {
  if (parsed.context?.screenType) {
    return `${parsed.context.screenType.charAt(0).toUpperCase()}${parsed.context.screenType.slice(1)} Screen`;
  }
  if (parsed.components.length > 0) {
    return `${parsed.components[0].type} Container`;
  }
  return "Frame";
}

/**
 * Gets default width based on device type
 */
function getDefaultWidth(context: ContextSpec): number {
  switch (context.deviceType) {
    case "mobile":
      return 390;
    case "tablet":
      return 768;
    case "desktop":
    default:
      return 1440;
  }
}

/**
 * Gets default height based on device type
 */
function getDefaultHeight(context: ContextSpec): number {
  switch (context.deviceType) {
    case "mobile":
      return 844;
    case "tablet":
      return 1024;
    case "desktop":
    default:
      return 900;
  }
}

// ============================================================================
// Layout Recommendations
// ============================================================================

/**
 * Generates layout recommendations based on parsed data and context
 */
function generateLayoutRecommendations(parsed: ParsedPrompt, context: ContextSpec): string[] {
  const recommendations: string[] = [];

  if (parsed.components.length > 4) {
    recommendations.push("Consider grouping related components to reduce visual complexity");
  }

  if (context.deviceType === "mobile" && parsed.layout?.direction === "HORIZONTAL") {
    recommendations.push("Horizontal layouts may cause overflow on mobile - consider vertical stacking");
  }

  if (parsed.intent === "CREATE_SCREEN" && !parsed.components.some((c) => c.type === "navigation-bar")) {
    recommendations.push("Consider adding a navigation bar for better screen structure");
  }

  return recommendations;
}
