// figma-plugin/src/handlers/variables.ts
/**
 * Variables Handlers Module
 *
 * Handles Figma Variables API operations including:
 * - Getting local variables and collections
 * - Creating variables and collections
 * - Binding variables to node properties
 */

import {
  // Node helpers
  getNode,
  // Paint helpers
  hexToRgb,
} from "./utils";

// ============================================================================
// Types
// ============================================================================

interface VariableDefinition {
  id: string;
  name: string;
  resolvedType: string;
}

interface CollectionMode {
  modeId: string;
  name: string;
}

interface CollectionDefinition {
  id: string;
  name: string;
  modes: CollectionMode[];
}

// ============================================================================
// GetLocalVariables Handler
// ============================================================================

/**
 * Gets all local variables, optionally filtered by collection.
 * @param params - Object containing optional collectionId filter
 * @returns Array of variable definitions
 */
export async function handleGetLocalVariables(
  params: Record<string, unknown>
): Promise<{ variables: VariableDefinition[] }> {
  const collectionId = params.collectionId as string | undefined;

  const localVariables = await figma.variables.getLocalVariablesAsync();

  const variables = localVariables
    .filter(v => !collectionId || v.variableCollectionId === collectionId)
    .map(v => ({
      id: v.id,
      name: v.name,
      resolvedType: v.resolvedType,
    }));

  return { variables };
}

// ============================================================================
// GetVariableCollections Handler
// ============================================================================

/**
 * Gets all local variable collections with their modes.
 * @returns Array of collection definitions with modes
 */
export async function handleGetVariableCollections(): Promise<{ collections: CollectionDefinition[] }> {
  const localCollections = await figma.variables.getLocalVariableCollectionsAsync();

  const collections = localCollections.map(c => ({
    id: c.id,
    name: c.name,
    modes: c.modes.map(m => ({ modeId: m.modeId, name: m.name })),
  }));

  return { collections };
}

// ============================================================================
// CreateVariable Handler
// ============================================================================

/**
 * Creates a new variable in a collection.
 * @param params - Object containing name, collectionId, resolvedType, value, and optional modeId
 * @returns Variable ID of the created variable
 */
export async function handleCreateVariable(
  params: Record<string, unknown>
): Promise<{ variableId: string }> {
  const name = params.name as string;
  const collectionId = params.collectionId as string;
  const resolvedType = params.resolvedType as VariableResolvedDataType;
  const value = params.value;
  const modeId = params.modeId as string | undefined;

  const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
  if (!collection) {
    throw new Error(`Variable collection not found: ${collectionId}`);
  }

  const variable = figma.variables.createVariable(name, collection, resolvedType);

  // Set value for the mode
  if (value !== undefined) {
    const targetModeId = modeId || collection.defaultModeId;

    // Convert value based on type
    if (resolvedType === "COLOR" && typeof value === "string") {
      const rgb = hexToRgb(value);
      variable.setValueForMode(targetModeId, { r: rgb.r, g: rgb.g, b: rgb.b, a: 1 });
    } else {
      variable.setValueForMode(targetModeId, value as VariableValue);
    }
  }

  return { variableId: variable.id };
}

// ============================================================================
// CreateVariableCollection Handler
// ============================================================================

/**
 * Creates a new variable collection with optional modes.
 * @param params - Object containing name and optional modes array
 * @returns Collection ID of the created collection
 */
export async function handleCreateVariableCollection(
  params: Record<string, unknown>
): Promise<{ collectionId: string }> {
  const name = params.name as string;

  const collection = figma.variables.createVariableCollection(name);

  // Add modes if specified
  const modes = params.modes as string[] | undefined;
  if (modes && modes.length > 0) {
    // Rename default mode to first mode name
    collection.renameMode(collection.defaultModeId, modes[0]);

    // Add additional modes
    for (let i = 1; i < modes.length; i++) {
      collection.addMode(modes[i]);
    }
  }

  return { collectionId: collection.id };
}

// ============================================================================
// BindVariable Handler
// ============================================================================

/**
 * Binds a variable to a node property.
 * @param params - Object containing nodeId, variableId, and field
 * @returns Success confirmation
 */
export async function handleBindVariable(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const variableId = params.variableId as string;
  const field = params.field as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  const variable = await figma.variables.getVariableByIdAsync(variableId);
  if (!variable) {
    throw new Error(`Variable not found: ${variableId}`);
  }

  // Bind variable to field
  if ("setBoundVariable" in node) {
    (node as SceneNode & MinimalFillsMixin).setBoundVariable(field as VariableBindableNodeField, variable);
  } else {
    throw new Error("Node does not support variable binding");
  }

  return { success: true };
}
