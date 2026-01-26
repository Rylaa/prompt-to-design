// figma-plugin/src/handlers/utils/node-helpers.ts
// Node operation helper functions

import { FinalizeOptions } from "./types";

// Gets a node by ID using Figma's async API
// Returns null if not found
export async function getNode(nodeId: string): Promise<SceneNode | null> {
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
