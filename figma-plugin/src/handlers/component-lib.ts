// figma-plugin/src/handlers/component-lib.ts
/**
 * Component Library Handlers Module
 *
 * Handles component operations including create component, create instance,
 * register to library, component slots, and listing operations.
 */

import {
  // Types
  type FillConfig,
  // Node helpers
  registerNode,
  getNode,
  // Paint helpers
  createSolidPaint,
} from "./utils";

// ============================================================================
// Types
// ============================================================================

/**
 * Component definition for listing purposes
 */
interface ComponentDefinition {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

/**
 * Component slot with optional variants
 */
interface ComponentSlot {
  nodeId: string;
  variants?: Record<string, string>;
}

// ============================================================================
// State - Component Library and Slots
// ============================================================================

/**
 * Component Library - Store components by name for reuse
 */
const componentLibrary: Map<string, ComponentNode> = new Map();

/**
 * Component Slots - Reusable component slots with variant support
 */
const componentSlots = new Map<string, ComponentSlot>();

// ============================================================================
// CreateComponent Handler
// ============================================================================

/**
 * Creates a new component from a source node or selection.
 * @param params - Object containing optional nodeId, name, and libraryKey
 * @returns Node ID of the created component
 */
export async function handleCreateComponent(
  params: Record<string, unknown>
): Promise<{ nodeId: string }> {
  let sourceNode: SceneNode | null = null;

  if (params.nodeId) {
    sourceNode = await getNode(params.nodeId as string);
  } else if (figma.currentPage.selection.length > 0) {
    sourceNode = figma.currentPage.selection[0];
  }

  if (!sourceNode) {
    throw new Error("No node specified or selected");
  }

  const component = figma.createComponent();
  component.name = (params.name as string) || sourceNode.name || "Component";

  if ("resize" in sourceNode) {
    component.resize(sourceNode.width, sourceNode.height);
  }

  if (sourceNode.type === "FRAME" && "children" in sourceNode) {
    for (const child of sourceNode.children) {
      const clone = child.clone();
      component.appendChild(clone);
    }
  }

  figma.currentPage.appendChild(component);
  registerNode(component);

  // Save to component library
  const libraryKey = (params.libraryKey as string) || component.name;
  componentLibrary.set(libraryKey, component);

  return { nodeId: component.id };
}

// ============================================================================
// CreateComponentInstance Handler
// ============================================================================

/**
 * Creates an instance of an existing component.
 * @param params - Object containing componentKey or componentId, optional position and parent
 * @returns Node ID of the created instance
 */
export async function handleCreateComponentInstance(
  params: Record<string, unknown>
): Promise<{ nodeId: string }> {
  const componentKey = params.componentKey as string;
  const componentId = params.componentId as string;

  let component: ComponentNode | null = null;

  // First look in library
  if (componentKey && componentLibrary.has(componentKey)) {
    component = componentLibrary.get(componentKey) || null;
  }

  // Then look by ID
  if (!component && componentId) {
    const node = await getNode(componentId);
    if (node && node.type === "COMPONENT") {
      component = node as ComponentNode;
    }
  }

  if (!component) {
    throw new Error(`Component not found: ${componentKey || componentId}`);
  }

  const instance = component.createInstance();

  if (params.x !== undefined) instance.x = params.x as number;
  if (params.y !== undefined) instance.y = params.y as number;
  if (params.name) instance.name = params.name as string;

  // Add to parent
  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(instance);
    }
  } else {
    figma.currentPage.appendChild(instance);
  }

  registerNode(instance);
  return { nodeId: instance.id };
}

// ============================================================================
// GetLocalComponents Handler
// ============================================================================

/**
 * Gets all local components in the current page and library.
 * @returns Array of component definitions
 */
export async function handleGetLocalComponents(): Promise<{ components: ComponentDefinition[] }> {
  const components: ComponentDefinition[] = [];

  // Add components from library
  componentLibrary.forEach((comp, key) => {
    components.push({
      id: comp.id,
      name: key,
      description: comp.description,
    });
  });

  // Scan all components in the page
  function findComponents(node: BaseNode): void {
    if (node.type === "COMPONENT") {
      const comp = node as ComponentNode;
      if (!Array.from(componentLibrary.values()).includes(comp)) {
        components.push({
          id: comp.id,
          name: comp.name,
          description: comp.description,
        });
      }
    }
    if ("children" in node) {
      for (const child of (node as ChildrenMixin).children) {
        findComponents(child);
      }
    }
  }

  findComponents(figma.currentPage);

  return { components };
}

// ============================================================================
// RegisterComponent Handler
// ============================================================================

/**
 * Registers an existing component to the library.
 * @param params - Object containing nodeId and libraryKey
 * @returns Success confirmation
 */
export async function handleRegisterComponent(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const libraryKey = params.libraryKey as string;

  const node = await getNode(nodeId);

  if (!node || node.type !== "COMPONENT") {
    throw new Error(`Node ${nodeId} is not a component`);
  }

  componentLibrary.set(libraryKey, node as ComponentNode);
  return { success: true };
}

// ============================================================================
// RegisterComponentSlot Handler
// ============================================================================

/**
 * Registers a component as a reusable slot.
 * @param params - Object containing nodeId, slotKey, and optional variants
 * @returns Success confirmation with slot info
 */
export async function handleRegisterComponentSlot(
  params: Record<string, unknown>
): Promise<{ success: boolean; slotKey: string; nodeId: string }> {
  const nodeId = params.nodeId as string;
  const slotKey = params.slotKey as string;
  const variants = params.variants as Record<string, string> | undefined;

  // Validate required params
  if (!nodeId) {
    throw new Error("nodeId is required");
  }
  if (!slotKey) {
    throw new Error("slotKey is required");
  }

  const node = await getNode(nodeId);

  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  // Verify node is a ComponentNode or ComponentSetNode
  if (node.type !== "COMPONENT" && node.type !== "COMPONENT_SET") {
    throw new Error(`Node ${nodeId} must be a COMPONENT or COMPONENT_SET, got ${node.type}`);
  }

  // Store in componentSlots Map
  componentSlots.set(slotKey, {
    nodeId,
    variants,
  });

  return { success: true, slotKey, nodeId };
}

// ============================================================================
// CreateFromSlot Handler
// ============================================================================

/**
 * Creates a component instance from a registered slot.
 * @param params - Object containing slotKey, optional variant, parentId, and overrides
 * @returns Node ID and name of the created instance
 */
export async function handleCreateFromSlot(
  params: Record<string, unknown>
): Promise<{ nodeId: string; name: string }> {
  const slotKey = params.slotKey as string;
  const variant = params.variant as string | undefined;
  const parentId = params.parentId as string | undefined;
  const overrides = params.overrides as Record<string, unknown> | undefined;

  // Validate required params
  if (!slotKey) {
    throw new Error("slotKey is required");
  }

  // Look up slot in componentSlots Map
  const slot = componentSlots.get(slotKey);
  if (!slot) {
    throw new Error(`Slot not found: ${slotKey}. Available slots: ${Array.from(componentSlots.keys()).join(", ") || "none"}`);
  }

  // Determine which nodeId to use
  let targetNodeId = slot.nodeId;
  if (variant && slot.variants && slot.variants[variant]) {
    targetNodeId = slot.variants[variant];
  }

  // Get the component node
  const node = await getNode(targetNodeId);
  if (!node) {
    throw new Error(`Component node not found: ${targetNodeId}`);
  }

  if (node.type !== "COMPONENT" && node.type !== "COMPONENT_SET") {
    throw new Error(`Node ${targetNodeId} must be a COMPONENT or COMPONENT_SET, got ${node.type}`);
  }

  // Create instance
  let instance: InstanceNode;
  if (node.type === "COMPONENT") {
    instance = (node as ComponentNode).createInstance();
  } else {
    // For ComponentSet, get the default variant
    const componentSet = node as ComponentSetNode;
    const defaultVariant = componentSet.defaultVariant;
    if (!defaultVariant) {
      throw new Error(`ComponentSet ${targetNodeId} has no default variant`);
    }
    instance = defaultVariant.createInstance();
  }

  // Append to parent if specified
  if (parentId) {
    const parent = await getNode(parentId);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(instance);
    }
  } else {
    figma.currentPage.appendChild(instance);
  }

  // Apply overrides if any
  if (overrides) {
    // Handle text overrides
    if (overrides.text !== undefined && typeof overrides.text === "string") {
      const textNodes = instance.findAll(n => n.type === "TEXT") as TextNode[];
      if (textNodes.length > 0) {
        await figma.loadFontAsync(textNodes[0].fontName as FontName);
        textNodes[0].characters = overrides.text;
      }
    }

    // Handle position overrides
    if (overrides.x !== undefined) {
      instance.x = overrides.x as number;
    }
    if (overrides.y !== undefined) {
      instance.y = overrides.y as number;
    }

    // Handle name override
    if (overrides.name !== undefined) {
      instance.name = overrides.name as string;
    }

    // Handle fill overrides
    if (overrides.fills !== undefined && "fills" in instance) {
      const fills = overrides.fills as FillConfig[];
      const convertedFills = fills.map(fill => {
        if (fill.type === "SOLID" && fill.color) {
          return createSolidPaint(fill.color, fill.opacity);
        }
        return null;
      }).filter(Boolean) as Paint[];
      if (convertedFills.length > 0) {
        instance.fills = convertedFills;
      }
    }
  }

  registerNode(instance);
  return { nodeId: instance.id, name: instance.name };
}

// ============================================================================
// ListComponentSlots Handler
// ============================================================================

/**
 * Lists all registered component slots.
 * @param params - Object containing optional filter prefix
 * @returns Array of slot entries with their variants
 */
export function handleListComponentSlots(
  params: Record<string, unknown>
): { slots: Array<{ slotKey: string; nodeId: string; variants?: Record<string, string> }> } {
  const filter = params.filter as string | undefined;

  // Convert Map to array of entries
  const allSlots = Array.from(componentSlots.entries()).map(([slotKey, slot]) => ({
    slotKey,
    nodeId: slot.nodeId,
    variants: slot.variants,
  }));

  // Filter by slotKey prefix if filter provided
  if (filter) {
    const filteredSlots = allSlots.filter(slot => slot.slotKey.startsWith(filter));
    return { slots: filteredSlots };
  }

  return { slots: allSlots };
}

// ============================================================================
// Exports for State Access
// ============================================================================

/**
 * Export component library map for access from other modules
 */
export { componentLibrary, componentSlots };
