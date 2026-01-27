// figma-plugin/src/handlers/media.ts
/**
 * Media Handlers Module
 *
 * Handles media operations including images, videos, and link previews.
 * - Images: create image nodes, set image fills
 * - Videos: create video containers, set video data
 * - Links: create link previews (FigJam only)
 */

import {
  // Node helpers
  registerNode,
  getNode,
  // Paint helpers
  createSolidPaint,
} from "./utils";

// ============================================================================
// Types
// ============================================================================

type ImageScaleMode = "FILL" | "FIT" | "CROP" | "TILE";

// ============================================================================
// Image Handlers
// ============================================================================

/**
 * Creates an image node from base64 data.
 * @param params - Object containing imageData, dimensions, name, position, and parentId
 * @returns Node ID of the created image
 */
export async function handleCreateImage(
  params: Record<string, unknown>
): Promise<{ nodeId: string }> {
  const imageData = params.imageData as string; // base64 encoded
  const width = (params.width as number) || 100;
  const height = (params.height as number) || 100;
  const name = (params.name as string) || "Image";

  // Create a rectangle to hold the image
  const rect = figma.createRectangle();
  rect.name = name;
  rect.resize(width, height);

  if (imageData) {
    // Decode base64 and create image
    const bytes = figma.base64Decode(imageData);
    const image = figma.createImage(bytes);

    rect.fills = [{
      type: "IMAGE",
      imageHash: image.hash,
      scaleMode: (params.scaleMode as ImageScaleMode) || "FILL",
    }];
  }

  // Position
  if (params.x !== undefined) rect.x = params.x as number;
  if (params.y !== undefined) rect.y = params.y as number;

  // Add to parent
  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(rect);
    }
  } else {
    figma.currentPage.appendChild(rect);
  }

  registerNode(rect);
  return { nodeId: rect.id };
}

/**
 * Sets an image as fill on an existing node.
 * @param params - Object containing nodeId, imageData, and scaleMode
 * @returns Success confirmation
 */
export async function handleSetImageFill(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const imageData = params.imageData as string;
  const scaleMode = (params.scaleMode as ImageScaleMode) || "FILL";

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if (!("fills" in node)) {
    throw new Error("Node does not support fills");
  }

  const bytes = figma.base64Decode(imageData);
  const image = figma.createImage(bytes);

  (node as GeometryMixin).fills = [{
    type: "IMAGE",
    imageHash: image.hash,
    scaleMode,
  }];

  return { success: true };
}

// ============================================================================
// Video Handlers
// ============================================================================

/**
 * Creates a video container frame.
 * Note: Figma doesn't support actual video playback, this creates a placeholder.
 * @param params - Object containing name, dimensions, position, videoData, and parentId
 * @returns Node ID of the created video container
 */
export async function handleCreateVideo(
  params: Record<string, unknown>
): Promise<{ nodeId: string }> {
  const name = (params.name as string) || "Video";
  const width = (params.width as number) || 320;
  const height = (params.height as number) || 180;

  // Create a frame as video container
  const videoFrame = figma.createFrame();
  videoFrame.name = name;
  videoFrame.resize(width, height);

  if (params.x !== undefined) videoFrame.x = params.x as number;
  if (params.y !== undefined) videoFrame.y = params.y as number;

  // Apply placeholder fill
  videoFrame.fills = [createSolidPaint("#1a1a1a")];

  // Store video metadata as plugin data
  if (params.videoData) {
    videoFrame.setPluginData("videoData", params.videoData as string);
  }

  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(videoFrame);
    }
  } else {
    figma.currentPage.appendChild(videoFrame);
  }

  registerNode(videoFrame);
  return { nodeId: videoFrame.id };
}

/**
 * Sets video data on an existing node.
 * Stores video data as plugin data for potential future use.
 * @param params - Object containing nodeId and videoData
 * @returns Success confirmation
 */
export async function handleSetVideoFill(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const videoData = params.videoData as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  // Store video data
  node.setPluginData("videoData", videoData);
  node.setPluginData("isVideo", "true");

  return { success: true };
}

// ============================================================================
// Link Preview Handlers
// ============================================================================

/**
 * Creates a link preview card (FigJam only).
 * @param params - Object containing url, position, and parentId
 * @returns Node ID of the created link preview
 */
export async function handleCreateLinkPreview(
  params: Record<string, unknown>
): Promise<{ nodeId: string }> {
  // Check if we're in FigJam mode
  if (figma.editorType !== "figjam") {
    throw new Error("Link previews can only be created in FigJam files");
  }

  const url = (params.url as string) || "https://example.com";
  const linkPreview = await figma.createLinkPreviewAsync(url);

  if (params.x !== undefined) linkPreview.x = params.x as number;
  if (params.y !== undefined) linkPreview.y = params.y as number;

  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(linkPreview);
    }
  }

  registerNode(linkPreview);
  return { nodeId: linkPreview.id };
}
