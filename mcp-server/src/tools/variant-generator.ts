/**
 * Variant Generator Tool
 * Automatically generates component variants (states, sizes, themes)
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS } from "./handler-factory.js";
import { GenerateVariantsInputSchema, type GenerateVariantsInput } from "../schemas/index.js";

export function registerVariantGeneratorTools(server: McpServer): void {
  server.registerTool(
    "figma_generate_variants",
    {
      title: "Generate Variants",
      description: `Automatically generate component variants from a base component.

Variant Types:
- STATE: hover, pressed, disabled, focused states
- SIZE: sm, md, lg, xl size variations
- THEME: light/dark theme versions
- DENSITY: compact, default, comfortable spacing

Features:
- Clones base component and applies variant-specific changes
- Maintains design system consistency
- Optionally creates Figma ComponentSet for organization
- Preserves auto-layout and responsive properties

Options:
- includeHover: Generate hover state (default: true)
- includeDisabled: Generate disabled state (default: true)
- includeFocused: Generate focused state (default: false)
- sizeScale: Size variants to generate (default: ["sm", "md", "lg"])
- createComponentSet: Group variants into ComponentSet (default: true)

Args:
  - nodeId: Component node ID to generate variants for
  - variantTypes: Types of variants to generate (STATE, SIZE, THEME, DENSITY)
  - options: Variant generation options

Returns: VariantGenerationResult with generated variants and component set info`,
      inputSchema: GenerateVariantsInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<GenerateVariantsInput>("GENERATE_VARIANTS")
  );
}
