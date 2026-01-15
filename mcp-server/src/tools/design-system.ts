/**
 * Design System Tools - shadcn, Apple, Liquid Glass components
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS, READONLY_ANNOTATIONS } from "./handler-factory.js";
import {
  CreateShadcnComponentInputSchema,
  CreateAppleComponentInputSchema,
  CreateLiquidGlassComponentInputSchema,
  ListComponentsInputSchema,
  GetDesignTokensInputSchema,
  type CreateShadcnComponentInput,
  type CreateAppleComponentInput,
  type CreateLiquidGlassComponentInput,
  type ListComponentsInput,
  type GetDesignTokensInput,
} from "../schemas/index.js";

export function registerDesignSystemTools(server: McpServer): void {
  server.registerTool(
    "figma_create_shadcn_component",
    {
      title: "Create shadcn Component",
      description: `Create a shadcn/ui style component in Figma.

Available components:
  - button: variants (default, destructive, outline, secondary, ghost, link), sizes (sm, default, lg, icon)
  - input: placeholder, disabled state
  - textarea: placeholder, rows
  - card: with header, content, footer sections
  - badge: variants (default, secondary, destructive, outline)
  - avatar: initials, status indicator
  - avatar-group: multiple avatars with overlap
  - checkbox: label, checked state
  - radio: label, checked state
  - switch: label, checked state
  - progress: value (0-100)
  - slider: value (0-100)
  - skeleton: animated placeholder
  - alert: variants (default, destructive), with title and description
  - toast: variants (default, destructive, success)
  - tabs: items array, activeIndex
  - separator: horizontal divider
  - dialog: title, description, with action buttons
  - sheet: side panel (left, right, top, bottom)

Args:
  - component: Component type
  - variant: Style variant
  - size: Size variant (for button)
  - theme: "light" | "dark"
  - parentId: Parent frame to add component to
  - Various content props depending on component

Returns: Node ID of created component.`,
      inputSchema: CreateShadcnComponentInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateShadcnComponentInput>("CREATE_SHADCN_COMPONENT")
  );

  server.registerTool(
    "figma_create_apple_component",
    {
      title: "Create Apple Component",
      description: `Create an Apple iOS or macOS style component in Figma.

iOS Components:
  - button: styles (filled, tinted, gray, plain), sizes (small, medium, large)
  - navigation-bar: variants (large, inline), with title and buttons
  - search-bar: placeholder text
  - tab-bar: items with icon, label, optional badge
  - cell: styles (default, subtitle, value), with chevron
  - toggle: iOS-style switch
  - list: styles (plain, inset, grouped), with cells

macOS Components:
  - window: variants (document, utility, panel), with title bar and traffic lights
  - title-bar: with title and toolbar
  - sidebar: with items and active state
  - button: styles (push, gradient, help, toolbar), isDefault state
  - checkbox: with label
  - text-field: placeholder, value

Args:
  - platform: "ios" | "macos"
  - component: Component name
  - variant: Style variant
  - theme: "light" | "dark"
  - parentId: Parent frame to add component to
  - Various platform-specific props

Returns: Node ID of created component.`,
      inputSchema: CreateAppleComponentInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateAppleComponentInput>("CREATE_APPLE_COMPONENT")
  );

  server.registerTool(
    "figma_create_liquid_glass_component",
    {
      title: "Create Liquid Glass Component",
      description: `Create an iOS 26 Liquid Glass style component in Figma.

Liquid Glass is Apple's new design language featuring translucent materials with
backdrop blur, specular highlights, and depth-aware shadows.

Available components:
  - button: Glass-style button with blur and specular highlight
  - tab-bar: iOS-style tab bar with glass material
  - navigation-bar: Glass navigation bar with title
  - card: Translucent card with glass effects
  - toggle: Glass-style toggle switch
  - sidebar: Glass sidebar panel
  - floating-panel: Floating glass panel
  - modal: Glass modal dialog
  - search-bar: Glass search input
  - toolbar: Glass toolbar

Args:
  - component: Component type
  - variant: Style variant
  - theme: "light" | "dark"
  - material: Glass thickness ("thin" | "regular" | "thick" | "ultraThin")
  - tint: Accent tint color (hex)
  - parentId: Parent frame to add component to
  - Various component-specific props

Returns: Node ID of created component.`,
      inputSchema: CreateLiquidGlassComponentInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateLiquidGlassComponentInput>("CREATE_LIQUID_GLASS_COMPONENT")
  );

  server.registerTool(
    "figma_list_components",
    {
      title: "List Components",
      description: `List all available pre-built components from component libraries.

Returns component names grouped by library (shadcn, ios, macos, liquid-glass).
Use these names with figma_create_shadcn_component, figma_create_apple_component, or figma_create_liquid_glass_component.

Args:
  - library: Optional filter by library ("shadcn" | "ios" | "macos" | "liquid-glass")

Returns: Object with component names grouped by library.`,
      inputSchema: ListComponentsInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<ListComponentsInput>("LIST_COMPONENTS")
  );

  server.registerTool(
    "figma_get_design_tokens",
    {
      title: "Get Design Tokens",
      description: `Get design tokens (colors, spacing, typography, shadows) for a platform.

Returns semantic design tokens that can be used for consistent styling.

Args:
  - category: Token category ("colors" | "spacing" | "typography" | "shadows")
  - theme: "light" | "dark"
  - platform: "shadcn" | "ios" | "macos" | "liquid-glass"

Returns: Design tokens for the specified category.`,
      inputSchema: GetDesignTokensInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<GetDesignTokensInput>("GET_DESIGN_TOKENS")
  );
}
