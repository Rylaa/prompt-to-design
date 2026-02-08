// figma-plugin/src/handlers/export.ts
/**
 * Export Handlers Module
 *
 * Handles exporting nodes as PNG, JPG, SVG, or PDF.
 */

import { getNode } from "./utils";

// ============================================================================
// Export Single Node
// ============================================================================

/**
 * Exports a single node as an image.
 * @param params - Object containing nodeId, format, scale, quality, contentsOnly
 * @returns Base64 encoded image data with metadata
 */
export async function handleExportNode(
  params: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const nodeId = params.nodeId as string;
  const format = (params.format as string) || "PNG";
  const scale = (params.scale as number) || 1;
  const contentsOnly = params.contentsOnly !== undefined ? (params.contentsOnly as boolean) : true;

  const node = await getNode(nodeId);
  if (!node) throw new Error(`Node not found: ${nodeId}`);

  const sceneNode = node as SceneNode;

  const settings: ExportSettings = {
    format: format as "PNG" | "JPG" | "SVG" | "PDF",
    ...(format !== "SVG" && format !== "PDF"
      ? { constraint: { type: "SCALE", value: scale } }
      : {}),
    ...(format === "SVG" ? { svgOutlineText: true } : {}),
    contentsOnly,
  };

  const bytes = await sceneNode.exportAsync(settings);
  const base64 = figma.base64Encode(bytes);

  return {
    nodeId: node.id,
    name: node.name,
    format,
    scale,
    data: base64,
    size: bytes.length,
  };
}

// ============================================================================
// Export Multiple Nodes
// ============================================================================

/**
 * Exports multiple nodes as images.
 * @param params - Object containing nodeIds, format, scale
 * @returns Array of exported data for each node
 */
export async function handleExportMultiple(
  params: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const nodeIds = params.nodeIds as string[];
  const format = (params.format as string) || "PNG";
  const scale = (params.scale as number) || 1;

  const results: Array<Record<string, unknown>> = [];

  for (const nodeId of nodeIds) {
    const node = await getNode(nodeId);
    if (!node) {
      results.push({
        nodeId,
        error: `Node not found: ${nodeId}`,
      });
      continue;
    }

    const sceneNode = node as SceneNode;

    const settings: ExportSettings = {
      format: format as "PNG" | "JPG" | "SVG" | "PDF",
      ...(format !== "SVG" && format !== "PDF"
        ? { constraint: { type: "SCALE", value: scale } }
        : {}),
      ...(format === "SVG" ? { svgOutlineText: true } : {}),
    };

    const bytes = await sceneNode.exportAsync(settings);
    const base64 = figma.base64Encode(bytes);

    results.push({
      nodeId: node.id,
      name: node.name,
      format,
      scale,
      data: base64,
      size: bytes.length,
    });
  }

  return { exports: results, count: results.length };
}
