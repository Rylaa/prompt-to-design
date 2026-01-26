// figma-plugin/src/handlers/utils/node-helpers.ts
// Node operation helper functions

import type { FinalizeOptions } from "./types";

// Node Registry - Track created nodes for fast lookup
export const nodeRegistry: Map<string, SceneNode> = new Map();

// Register a node in the registry for fast lookup
export function registerNode(node: SceneNode): void {
  nodeRegistry.set(node.id, node);
}

// Remove a node from the registry
export function unregisterNode(nodeId: string): void {
  nodeRegistry.delete(nodeId);
}

// Gets a node by ID - checks registry first, then Figma async API
// Returns null if not found
export async function getNode(nodeId: string): Promise<SceneNode | null> {
  // Check registry first for faster lookup
  if (nodeRegistry.has(nodeId)) {
    return nodeRegistry.get(nodeId) || null;
  }
  // Fall back to Figma async API
  const node = await figma.getNodeByIdAsync(nodeId);
  if (node && "type" in node) {
    return node as SceneNode;
  }
  return null;
}

// Gets a node by ID or throws an error if not found
// Use this when the node must exist for the operation to continue
export async function getNodeOrThrow(
  nodeId: string,
  errorMessage?: string
): Promise<SceneNode> {
  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(errorMessage || `Node not found: ${nodeId}`);
  }
  return node;
}

// Attaches a node to a parent frame or to the current page
// If parentId is provided and valid, appends to that parent
// Otherwise, appends to figma.currentPage
export async function attachToParentOrPage(
  node: SceneNode,
  parentId?: string
): Promise<void> {
  if (parentId) {
    const parent = await getNode(parentId);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(node);
      return;
    }
  }
  figma.currentPage.appendChild(node);
}

// Sets the position of a node
// Only sets x if x is provided (not undefined)
// Only sets y if y is provided (not undefined)
export function setPosition(node: SceneNode, x?: number, y?: number): void {
  if (x !== undefined) node.x = x;
  if (y !== undefined) node.y = y;
}

// Finalizes a node by attaching it to a parent and setting position
// This combines attachToParentOrPage and setPosition into a single call
// Common pattern used after creating nodes
export async function finalizeNode(
  node: SceneNode,
  options: FinalizeOptions
): Promise<void> {
  await attachToParentOrPage(node, options.parentId);
  setPosition(node, options.x, options.y);
}

// Type guard to check if a node can have children
export function canHaveChildren(
  node: BaseNode
): node is FrameNode | GroupNode | ComponentNode | InstanceNode {
  return "appendChild" in node;
}

// Gets a parent node that can have children, or throws
export async function getParentNodeOrThrow(
  parentId: string,
  errorMessage?: string
): Promise<FrameNode | GroupNode | ComponentNode | InstanceNode> {
  const node = await getNodeOrThrow(parentId, errorMessage);
  if (!canHaveChildren(node)) {
    throw new Error(
      errorMessage || `Node ${parentId} cannot have children`
    );
  }
  return node as FrameNode | GroupNode | ComponentNode | InstanceNode;
}
