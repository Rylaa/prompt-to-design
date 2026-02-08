// figma-plugin/src/handlers/screen-componentizer.ts

import { handleGenerateVariants } from "./variant-generator";

interface ComponentizeOptions {
  screenFrameId: string;
  autoDetect?: boolean;
  createVariants?: boolean;
  variantTypes?: string[];
}

interface ComponentizeResult {
  componentsCreated: number;
  componentIds: string[];
  componentSetIds: string[];
}

export async function handleComponentizeScreen(
  params: ComponentizeOptions
): Promise<ComponentizeResult> {
  const screen = figma.getNodeById(params.screenFrameId);
  if (!screen || screen.type !== "FRAME") {
    throw new Error(`Screen frame not found: ${params.screenFrameId}`);
  }

  const componentIds: string[] = [];
  const componentSetIds: string[] = [];

  // 1. Find frames marked with _componentize pluginData
  const markedFrames = (screen as FrameNode).findAll(node => {
    if (node.type !== "FRAME") return false;
    return node.getPluginData("_componentize") !== "";
  });

  // 2. Auto-detect if enabled (find buttons, cards by name pattern)
  let candidates = [...markedFrames];
  if (params.autoDetect) {
    const autoDetected = (screen as FrameNode).findAll(node => {
      if (node.type !== "FRAME") return false;
      const name = node.name.toLowerCase();
      return name.includes("button") || name.includes("card") || name.includes("cell");
    });
    // Deduplicate
    const markedIds = new Set(markedFrames.map(n => n.id));
    for (const node of autoDetected) {
      if (!markedIds.has(node.id)) {
        candidates.push(node);
      }
    }
  }

  // 3. Convert each to component
  for (const frame of candidates) {
    try {
      const component = figma.createComponentFromNode(frame);

      // Read metadata if available
      const metadata = frame.getPluginData("_componentize");
      if (metadata) {
        try {
          const data = JSON.parse(metadata);
          if (data.name) component.name = data.name;
        } catch {
          // Invalid JSON, skip metadata
        }
      }

      componentIds.push(component.id);

      // 4. Generate variants if requested
      if (params.createVariants) {
        try {
          const result = await handleGenerateVariants({
            nodeId: component.id,
            variantTypes: (params.variantTypes as any[]) || ["STATE"],
            options: {
              createComponentSet: true,
              includeHover: true,
              includeDisabled: true,
            },
          });
          if (result && result.componentSetId) {
            componentSetIds.push(result.componentSetId);
          }
        } catch (e) {
          // Variant generation failed, component still created
          console.log(`Variant generation failed for ${component.name}: ${e}`);
        }
      }
    } catch (e) {
      console.log(`Failed to componentize: ${e}`);
    }
  }

  return {
    componentsCreated: componentIds.length,
    componentIds,
    componentSetIds,
  };
}
