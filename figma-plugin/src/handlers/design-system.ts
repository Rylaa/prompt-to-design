// figma-plugin/src/handlers/design-system.ts
/**
 * Design system handlers
 * Handles: SetTheme, SetThemeTokens, CreateShadcnComponent,
 * CreateAppleComponent, CreateLiquidGlassComponent, ListComponents, GetDesignTokens
 */

// Handler utilities
import {
  registerNode,
  attachToParentOrPage,
} from "./utils";

// Token system
import {
  themeManager,
  getColors,
  createColorToken,
  type Theme,
  type Platform,
  type ThemeColors,
} from "../tokens";

// Component libraries
import { listComponents, type ComponentLibrary } from "../components";
import { createShadcnComponent } from "../components/shadcn";
import { createIOSComponent } from "../components/apple-ios";
import { createMacOSComponent } from "../components/apple-macos";
import { createLiquidGlassComponent, listLiquidGlassComponents } from "../components/liquid-glass";

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Finalizes a design system component by attaching to parent, scrolling into view, and registering
 * @param node - The created component node
 * @param parentId - Optional parent ID to attach to
 * @returns Object with nodeId
 */
async function finalizeComponent(
  node: SceneNode,
  parentId?: string
): Promise<{ nodeId: string }> {
  await attachToParentOrPage(node, parentId);

  // Scroll into view if added to page (not to a parent)
  if (!parentId) {
    figma.viewport.scrollAndZoomIntoView([node]);
  }

  registerNode(node);
  return { nodeId: node.id };
}

// ============================================================================
// Theme Handlers
// ============================================================================

/**
 * Sets the global theme (light/dark) and optionally the platform
 * @param params - Contains theme and optional platform
 * @returns Object with success status and current theme/platform values
 */
async function handleSetTheme(
  params: Record<string, unknown>
): Promise<{ success: boolean; theme: string; platform: string }> {
  const theme = (params.theme as Theme) || "light";
  const platform = params.platform as Platform | undefined;

  themeManager.setTheme(theme);
  if (platform) {
    themeManager.setPlatform(platform);
  }

  return {
    success: true,
    theme: themeManager.getTheme(),
    platform: themeManager.getPlatform(),
  };
}

/**
 * Sets custom color tokens for the current theme
 * Converts hex color strings to ColorToken objects and applies them
 * @param params - Contains colors object mapping token names to hex strings
 * @returns Object with success status
 */
async function handleSetThemeTokens(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const colors = params.colors as Record<string, string>;
  const partialTokens: Partial<ThemeColors> = {};

  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === "string") {
      partialTokens[key as keyof ThemeColors] = createColorToken(value);
    }
  }

  themeManager.setCustomColors(partialTokens);
  return { success: true };
}

// ============================================================================
// Component Creation Handlers
// ============================================================================

/**
 * Creates a shadcn/ui component
 * @param params - Component creation parameters including component name and options
 * @returns Object containing the created node's ID
 */
async function handleCreateShadcnComponent(
  params: Record<string, unknown>
): Promise<{ nodeId: string }> {
  const componentName = params.component as string;
  const theme = (params.theme as Theme) || themeManager.getTheme();
  const options = { ...params, theme };

  const node = await createShadcnComponent(componentName, options);

  if (!node) {
    throw new Error(`Failed to create shadcn component: ${componentName}`);
  }

  return await finalizeComponent(node, params.parentId as string | undefined);
}

/**
 * Creates an Apple iOS or macOS component
 * @param params - Component creation parameters including platform, component name, and options
 * @returns Object containing the created node's ID
 */
async function handleCreateAppleComponent(
  params: Record<string, unknown>
): Promise<{ nodeId: string }> {
  const platform = params.platform as "ios" | "macos";
  const componentName = params.component as string;
  const theme = (params.theme as Theme) || themeManager.getTheme();
  const options = { ...params, theme };

  let node: SceneNode | null = null;

  if (platform === "ios") {
    node = await createIOSComponent(componentName, options);
  } else if (platform === "macos") {
    node = await createMacOSComponent(componentName, options);
  }

  if (!node) {
    throw new Error(`Failed to create ${platform} component: ${componentName}`);
  }

  return await finalizeComponent(node, params.parentId as string | undefined);
}

/**
 * Creates an iOS 26 Liquid Glass component
 * @param params - Component creation parameters including component name and options
 * @returns Object containing the created node's ID
 */
async function handleCreateLiquidGlassComponent(
  params: Record<string, unknown>
): Promise<{ nodeId: string }> {
  const componentName = params.component as string;
  const theme = (params.theme as Theme) || themeManager.getTheme();
  const options = { ...params, theme };

  const node = await createLiquidGlassComponent(componentName, options);

  if (!node) {
    throw new Error(
      `Failed to create Liquid Glass component: ${componentName}. Available: ${listLiquidGlassComponents().join(", ")}`
    );
  }

  return await finalizeComponent(node, params.parentId as string | undefined);
}

// ============================================================================
// Query Handlers
// ============================================================================

/**
 * Lists all available components from component libraries
 * @param params - Optional library filter (shadcn, ios, macos, liquid-glass)
 * @returns Object containing component names grouped by library
 */
async function handleListComponents(
  params: Record<string, unknown>
): Promise<{ components: Record<string, string[]> }> {
  const library = params.library as ComponentLibrary | undefined;
  const components = listComponents(library);
  return { components };
}

/**
 * Gets design tokens for the specified category, theme, and platform
 * @param params - Contains optional category, theme, and platform
 * @returns Object containing the requested tokens
 */
async function handleGetDesignTokens(
  params: Record<string, unknown>
): Promise<{ tokens: Record<string, unknown> }> {
  const category = params.category as string | undefined;
  const theme = (params.theme as Theme) || themeManager.getTheme();
  const platform = (params.platform as Platform) || themeManager.getPlatform();

  // Temporarily set theme/platform for getting colors
  const originalTheme = themeManager.getTheme();
  const originalPlatform = themeManager.getPlatform();
  themeManager.setTheme(theme);
  themeManager.setPlatform(platform);

  const tokens: Record<string, unknown> = {};

  if (!category || category === "colors") {
    tokens.colors = getColors();
  }

  if (!category || category === "typography") {
    const { shadcnTypography, iosTypography, macOSTypography } = await import(
      "../tokens/typography"
    );
    tokens.typography =
      platform === "ios"
        ? iosTypography
        : platform === "macos"
          ? macOSTypography
          : shadcnTypography;
  }

  if (!category || category === "spacing") {
    const { spacing, radius, iosSpacing, macOSSpacing, shadcnSpacing } =
      await import("../tokens/spacing");
    tokens.spacing = {
      base: spacing,
      radius,
      platform:
        platform === "ios"
          ? iosSpacing
          : platform === "macos"
            ? macOSSpacing
            : shadcnSpacing,
    };
  }

  if (!category || category === "shadows") {
    const {
      shadcnShadows,
      iosShadowsLight,
      iosShadowsDark,
      macOSShadowsLight,
      macOSShadowsDark,
    } = await import("../tokens/shadows");

    if (platform === "ios") {
      tokens.shadows = theme === "light" ? iosShadowsLight : iosShadowsDark;
    } else if (platform === "macos") {
      tokens.shadows = theme === "light" ? macOSShadowsLight : macOSShadowsDark;
    } else {
      tokens.shadows = shadcnShadows;
    }
  }

  // Restore original theme/platform
  themeManager.setTheme(originalTheme);
  themeManager.setPlatform(originalPlatform);

  return { tokens };
}

// ============================================================================
// Exports
// ============================================================================

export {
  handleSetTheme,
  handleSetThemeTokens,
  handleCreateShadcnComponent,
  handleCreateAppleComponent,
  handleCreateLiquidGlassComponent,
  handleListComponents,
  handleGetDesignTokens,
};
