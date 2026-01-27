// figma-plugin/src/handlers/variant-generator.ts
/**
 * Variant Generator Handler
 * Automatically generates component variants (states, sizes, themes)
 * Handles: GENERATE_VARIANTS action
 */

import { getNodeOrThrow } from "./utils";

// ============================================================================
// Types
// ============================================================================

interface VariantConfig {
  name: string;
  properties: Record<string, string>;
  modifications: VariantModification[];
}

interface VariantModification {
  target: "fill" | "stroke" | "opacity" | "size" | "text";
  value: unknown;
}

interface GeneratedVariant {
  nodeId: string;
  name: string;
  variantProperties: Record<string, string>;
}

interface VariantGenerationResult {
  success: boolean;
  componentSetId?: string;
  variants: GeneratedVariant[];
  error?: string;
}

type VariantType = "STATE" | "SIZE" | "THEME" | "DENSITY";

interface VariantOptions {
  includeHover?: boolean;
  includeDisabled?: boolean;
  includeFocused?: boolean;
  sizeScale?: string[];
  createComponentSet?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Infers the component type from node name
 */
function inferComponentType(node: SceneNode): string {
  const name = node.name.toLowerCase();

  if (name.includes("button") || name.includes("btn")) return "button";
  if (name.includes("input") || name.includes("field")) return "input";
  if (name.includes("card")) return "card";
  if (name.includes("badge")) return "badge";
  if (name.includes("avatar")) return "avatar";
  if (name.includes("checkbox")) return "checkbox";
  if (name.includes("toggle") || name.includes("switch")) return "toggle";
  if (name.includes("tab")) return "tab";

  return "generic";
}

/**
 * Generates state variants (hover, active, disabled, focused)
 */
function generateStateVariants(
  _componentType: string,
  options: VariantOptions
): VariantConfig[] {
  const variants: VariantConfig[] = [];

  // Default state
  variants.push({
    name: "Default",
    properties: { State: "Default" },
    modifications: [],
  });

  // Hover state
  if (options.includeHover !== false) {
    variants.push({
      name: "Hover",
      properties: { State: "Hover" },
      modifications: [
        { target: "opacity", value: 0.9 },
        { target: "fill", value: "lighten" },
      ],
    });
  }

  // Active/Pressed state
  variants.push({
    name: "Active",
    properties: { State: "Active" },
    modifications: [
      { target: "opacity", value: 0.8 },
      { target: "fill", value: "darken" },
    ],
  });

  // Disabled state
  if (options.includeDisabled !== false) {
    variants.push({
      name: "Disabled",
      properties: { State: "Disabled" },
      modifications: [{ target: "opacity", value: 0.5 }],
    });
  }

  // Focused state
  if (options.includeFocused) {
    variants.push({
      name: "Focused",
      properties: { State: "Focused" },
      modifications: [
        { target: "stroke", value: { color: { r: 0.4, g: 0.4, b: 1 }, weight: 2 } },
      ],
    });
  }

  return variants;
}

/**
 * Generates size variants (sm, md, lg, xl)
 */
function generateSizeVariants(_baseNode: SceneNode, sizeScale: string[]): VariantConfig[] {
  const variants: VariantConfig[] = [];

  const sizeMultipliers: Record<string, number> = {
    sm: 0.875,
    md: 1,
    lg: 1.125,
    xl: 1.25,
  };

  for (const size of sizeScale) {
    variants.push({
      name: size.toUpperCase(),
      properties: { Size: size },
      modifications: [{ target: "size", value: sizeMultipliers[size] || 1 }],
    });
  }

  return variants;
}

/**
 * Generates theme variants (light, dark)
 */
function generateThemeVariants(): VariantConfig[] {
  return [
    {
      name: "Light",
      properties: { Theme: "light" },
      modifications: [
        { target: "fill", value: { type: "light" } },
      ],
    },
    {
      name: "Dark",
      properties: { Theme: "dark" },
      modifications: [
        { target: "fill", value: { type: "dark" } },
      ],
    },
  ];
}

/**
 * Generates density variants (compact, default, comfortable)
 */
function generateDensityVariants(): VariantConfig[] {
  return [
    {
      name: "Compact",
      properties: { Density: "compact" },
      modifications: [{ target: "size", value: 0.85 }],
    },
    {
      name: "Default",
      properties: { Density: "default" },
      modifications: [],
    },
    {
      name: "Comfortable",
      properties: { Density: "comfortable" },
      modifications: [{ target: "size", value: 1.15 }],
    },
  ];
}

/**
 * Applies variant modifications to a node
 */
function applyVariantModifications(node: SceneNode, modifications: VariantModification[]): void {
  for (const mod of modifications) {
    switch (mod.target) {
      case "opacity":
        if ("opacity" in node) {
          node.opacity = mod.value as number;
        }
        break;

      case "fill":
        if ("fills" in node && Array.isArray(node.fills) && node.fills.length > 0) {
          const fills = [...node.fills] as Paint[];
          if (fills[0].type === "SOLID") {
            const fill = { ...fills[0] } as SolidPaint;
            if (mod.value === "lighten") {
              fill.color = {
                r: Math.min(1, fill.color.r + 0.1),
                g: Math.min(1, fill.color.g + 0.1),
                b: Math.min(1, fill.color.b + 0.1),
              };
            } else if (mod.value === "darken") {
              fill.color = {
                r: Math.max(0, fill.color.r - 0.1),
                g: Math.max(0, fill.color.g - 0.1),
                b: Math.max(0, fill.color.b - 0.1),
              };
            }
            node.fills = [fill];
          }
        }
        break;

      case "stroke":
        if ("strokes" in node) {
          const strokeValue = mod.value as { color: RGB; weight: number };
          node.strokes = [{ type: "SOLID", color: strokeValue.color }];
          if ("strokeWeight" in node) {
            node.strokeWeight = strokeValue.weight;
          }
        }
        break;

      case "size":
        if ("resize" in node && "width" in node && "height" in node) {
          const multiplier = mod.value as number;
          const newWidth = node.width * multiplier;
          const newHeight = node.height * multiplier;
          (node as FrameNode).resize(newWidth, newHeight);

          // Scale font size for text children
          if ("findAll" in node) {
            const textNodes = (node as FrameNode).findAll((n) => n.type === "TEXT") as TextNode[];
            for (const textNode of textNodes) {
              const currentSize = textNode.fontSize as number;
              textNode.fontSize = Math.round(currentSize * multiplier);
            }
          }
        }
        break;
    }
  }
}

/**
 * Creates a variant from a base node with applied modifications
 */
async function createVariantFromBase(
  baseNode: SceneNode,
  config: VariantConfig
): Promise<SceneNode> {
  const clone = baseNode.clone();

  // Set variant name
  const propString = Object.entries(config.properties)
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
  clone.name = propString;

  // Apply modifications
  applyVariantModifications(clone, config.modifications);

  return clone;
}

// ============================================================================
// Main Handler
// ============================================================================

/**
 * Handles the GENERATE_VARIANTS action
 * Automatically generates component variants from a base component
 */
async function handleGenerateVariants(
  params: Record<string, unknown>
): Promise<VariantGenerationResult> {
  const nodeId = params.nodeId as string;
  const variantTypes = (params.variantTypes as VariantType[]) || ["STATE"];
  const options = (params.options as VariantOptions) || {};

  const node = await getNodeOrThrow(nodeId);

  if (!node) {
    return { success: false, error: "Node not found", variants: [] };
  }

  // Infer component type
  const componentType = inferComponentType(node as SceneNode);

  // Generate variant configurations
  let allVariants: VariantConfig[] = [];

  if (variantTypes.includes("STATE")) {
    allVariants = allVariants.concat(generateStateVariants(componentType, options));
  }

  if (variantTypes.includes("SIZE")) {
    allVariants = allVariants.concat(
      generateSizeVariants(node as SceneNode, options.sizeScale || ["sm", "md", "lg"])
    );
  }

  if (variantTypes.includes("THEME")) {
    allVariants = allVariants.concat(generateThemeVariants());
  }

  if (variantTypes.includes("DENSITY")) {
    allVariants = allVariants.concat(generateDensityVariants());
  }

  // Create variants
  const createdVariants: GeneratedVariant[] = [];

  const baseNode = node as SceneNode;
  const spacing = 20;
  let xOffset = 0;

  // Get base position
  const baseX = "x" in baseNode ? baseNode.x : 0;
  const baseWidth = "width" in baseNode ? baseNode.width : 100;

  for (const config of allVariants) {
    const variant = await createVariantFromBase(baseNode, config);

    // Position variant
    if ("x" in variant) {
      variant.x = baseX + baseWidth + spacing + xOffset;
      xOffset += ("width" in variant ? variant.width : 100) + spacing;
    }

    createdVariants.push({
      nodeId: variant.id,
      name: config.name,
      variantProperties: config.properties,
    });
  }

  // Create ComponentSet if requested
  let componentSetId: string | undefined;

  if (options.createComponentSet !== false && createdVariants.length > 0) {
    // Convert all to components first
    const components: ComponentNode[] = [];
    for (const v of createdVariants) {
      const variantNode = figma.getNodeById(v.nodeId) as SceneNode;
      if (variantNode && variantNode.type === "FRAME") {
        const component = figma.createComponentFromNode(variantNode);
        components.push(component);
      }
    }

    // Create ComponentSet
    if (components.length > 0) {
      const componentSet = figma.combineAsVariants(components, figma.currentPage);
      componentSet.name = `${baseNode.name} Variants`;
      componentSetId = componentSet.id;
    }
  }

  return {
    success: true,
    componentSetId,
    variants: createdVariants,
  };
}

// ============================================================================
// Exports
// ============================================================================

export { handleGenerateVariants };
