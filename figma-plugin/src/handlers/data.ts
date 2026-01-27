// figma-plugin/src/handlers/data.ts
/**
 * Data Handlers Module
 *
 * Handles data storage operations including:
 * - Plugin data (node-level storage)
 * - Client storage (persistent across sessions)
 * - Shared plugin data (accessible by other plugins)
 */

import {
  // Node helpers
  getNode,
} from "./utils";

// ============================================================================
// Plugin Data Handlers
// ============================================================================

/**
 * Sets plugin data on a node.
 * @param params - Object containing nodeId, key, and value
 * @returns Success confirmation
 */
export async function handleSetPluginData(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const key = params.key as string;
  const value = params.value as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  node.setPluginData(key, value);

  return { success: true };
}

/**
 * Gets plugin data from a node.
 * @param params - Object containing nodeId and key
 * @returns The stored value
 */
export async function handleGetPluginData(
  params: Record<string, unknown>
): Promise<{ value: string }> {
  const nodeId = params.nodeId as string;
  const key = params.key as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  const value = node.getPluginData(key);

  return { value };
}

/**
 * Gets all plugin data keys and values from a node.
 * @param params - Object containing nodeId
 * @returns Object with all key-value pairs
 */
export async function handleGetAllPluginData(
  params: Record<string, unknown>
): Promise<{ data: Record<string, string> }> {
  const nodeId = params.nodeId as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  const keys = node.getPluginDataKeys();
  const data: Record<string, string> = {};

  for (const key of keys) {
    data[key] = node.getPluginData(key);
  }

  return { data };
}

/**
 * Deletes plugin data from a node.
 * @param params - Object containing nodeId and key
 * @returns Success confirmation
 */
export async function handleDeletePluginData(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const key = params.key as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  node.setPluginData(key, "");

  return { success: true };
}

// ============================================================================
// Client Storage Handlers
// ============================================================================

/**
 * Sets a value in client storage (persistent across sessions).
 * @param params - Object containing key and value
 * @returns Success confirmation
 */
export async function handleClientStorageSet(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const key = params.key as string;
  const value = params.value;

  await figma.clientStorage.setAsync(key, value);

  return { success: true };
}

/**
 * Gets a value from client storage.
 * @param params - Object containing key
 * @returns The stored value or undefined
 */
export async function handleClientStorageGet(
  params: Record<string, unknown>
): Promise<{ value: unknown }> {
  const key = params.key as string;

  const value = await figma.clientStorage.getAsync(key);

  return { value };
}

/**
 * Deletes a value from client storage.
 * @param params - Object containing key
 * @returns Success confirmation
 */
export async function handleClientStorageDelete(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const key = params.key as string;

  await figma.clientStorage.deleteAsync(key);

  return { success: true };
}

/**
 * Gets all keys from client storage.
 * @returns Array of storage keys
 */
export async function handleClientStorageKeys(): Promise<{ keys: string[] }> {
  const keys = await figma.clientStorage.keysAsync();

  return { keys };
}

// ============================================================================
// Shared Plugin Data Handlers
// ============================================================================

/**
 * Sets shared plugin data on a node (accessible by other plugins).
 * @param params - Object containing nodeId, namespace, key, and value
 * @returns Success confirmation
 */
export async function handleSetSharedPluginData(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const namespace = params.namespace as string;
  const key = params.key as string;
  const value = params.value as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  node.setSharedPluginData(namespace, key, value);

  return { success: true };
}

/**
 * Gets shared plugin data from a node.
 * @param params - Object containing nodeId, namespace, and key
 * @returns The stored value
 */
export async function handleGetSharedPluginData(
  params: Record<string, unknown>
): Promise<{ value: string }> {
  const nodeId = params.nodeId as string;
  const namespace = params.namespace as string;
  const key = params.key as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  const value = node.getSharedPluginData(namespace, key);

  return { value };
}

/**
 * Gets all shared plugin data keys for a namespace on a node.
 * @param params - Object containing nodeId and namespace
 * @returns Array of keys
 */
export async function handleGetSharedPluginDataKeys(
  params: Record<string, unknown>
): Promise<{ keys: string[] }> {
  const nodeId = params.nodeId as string;
  const namespace = params.namespace as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  const keys = node.getSharedPluginDataKeys(namespace);

  return { keys };
}
