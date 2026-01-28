// figma-plugin/src/handlers/smart-layout.ts
/**
 * Smart Layout Handler
 * AI-powered layout optimization for Figma designs
 * Handles: SMART_LAYOUT action
 */

import { getNodeOrThrow } from "./utils";

// ============================================================================
// Types
// ============================================================================

interface LayoutChange {
  nodeId: string;
  nodeName: string;
  changeType: string;
  before: unknown;
  after: unknown;
}

interface LayoutSuggestion {
  nodeId: string;
  message: string;
  priority: "high" | "medium" | "low";
}

type LayoutStrategy =
  | "AUTO_DETECT"
  | "CARD_GRID"
  | "FORM_LAYOUT"
  | "NAVIGATION"
  | "CONTENT_STACK"
  | "HERO_SECTION";

interface SmartLayoutResult {
  success: boolean;
  strategy?: LayoutStrategy;
  changes: LayoutChange[];
  suggestions: LayoutSuggestion[];
  error?: string;
}

// ============================================================================
// Constants
// ============================================================================

const GRID_UNIT = 8; // 8-point grid

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Snaps a value to the nearest 8-point grid value
 */
function snapToGrid(value: number): number {
  return Math.round(value / GRID_UNIT) * GRID_UNIT;
}

/**
 * Auto-detects the best layout strategy based on node content
 */
function detectLayoutStrategy(node: FrameNode): LayoutStrategy {
  const childNames: string[] = [];

  node.children.forEach((child) => {
    childNames.push(child.name.toLowerCase());
  });

  // Detect cards
  const hasCards = childNames.some((n) => n.includes("card"));
  if (hasCards && node.children.length >= 2) return "CARD_GRID";

  // Detect forms
  const hasInputs = childNames.some((n) => n.includes("input") || n.includes("field"));
  const hasLabels = childNames.some((n) => n.includes("label"));
  if (hasInputs && hasLabels) return "FORM_LAYOUT";

  // Detect navigation
  const hasNavItems = childNames.some(
    (n) => n.includes("nav") || n.includes("menu") || n.includes("link")
  );
  if (hasNavItems) return "NAVIGATION";

  // Detect hero
  const hasHeroElements = childNames.some(
    (n) => n.includes("hero") || n.includes("headline") || n.includes("cta")
  );
  if (hasHeroElements) return "HERO_SECTION";

  // Default to content stack
  return "CONTENT_STACK";
}

/**
 * Optimizes layout for card grid patterns
 */
function optimizeCardGrid(
  node: FrameNode,
  changes: LayoutChange[],
  _suggestions: LayoutSuggestion[]
): void {
  // Set horizontal layout with wrap
  if (node.layoutMode !== "HORIZONTAL") {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "layoutMode",
      before: node.layoutMode,
      after: "HORIZONTAL",
    });
    node.layoutMode = "HORIZONTAL";
  }

  // Enable wrap
  if (!node.layoutWrap || node.layoutWrap === "NO_WRAP") {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "layoutWrap",
      before: node.layoutWrap,
      after: "WRAP",
    });
    node.layoutWrap = "WRAP";
  }

  // Set consistent gap
  const gridGap = 24;
  if (node.itemSpacing !== gridGap) {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "itemSpacing",
      before: node.itemSpacing,
      after: gridGap,
    });
    node.itemSpacing = gridGap;
  }
}

/**
 * Optimizes layout for form patterns
 */
function optimizeFormLayout(
  node: FrameNode,
  changes: LayoutChange[],
  suggestions: LayoutSuggestion[]
): void {
  // Set vertical layout
  if (node.layoutMode !== "VERTICAL") {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "layoutMode",
      before: node.layoutMode,
      after: "VERTICAL",
    });
    node.layoutMode = "VERTICAL";
  }

  // Consistent form spacing
  const formGap = 16;
  if (node.itemSpacing !== formGap) {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "itemSpacing",
      before: node.itemSpacing,
      after: formGap,
    });
    node.itemSpacing = formGap;
  }

  // Suggest grouping label+input pairs
  suggestions.push({
    nodeId: node.id,
    message: "Consider grouping each label with its input field in a container for better structure",
    priority: "medium",
  });
}

/**
 * Optimizes layout for navigation patterns
 */
function optimizeNavigation(
  node: FrameNode,
  changes: LayoutChange[],
  _suggestions: LayoutSuggestion[]
): void {
  // Horizontal by default for nav
  if (node.layoutMode !== "HORIZONTAL") {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "layoutMode",
      before: node.layoutMode,
      after: "HORIZONTAL",
    });
    node.layoutMode = "HORIZONTAL";
  }

  // Center alignment
  if (node.counterAxisAlignItems !== "CENTER") {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "counterAxisAlignItems",
      before: node.counterAxisAlignItems,
      after: "CENTER",
    });
    node.counterAxisAlignItems = "CENTER";
  }

  // Consistent nav spacing
  const navGap = snapToGrid(24);
  if (node.itemSpacing !== navGap) {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "itemSpacing",
      before: node.itemSpacing,
      after: navGap,
    });
    node.itemSpacing = navGap;
  }
}

/**
 * Optimizes layout for content stack patterns
 */
function optimizeContentStack(
  node: FrameNode,
  changes: LayoutChange[],
  _suggestions: LayoutSuggestion[]
): void {
  // Vertical stack
  if (node.layoutMode !== "VERTICAL") {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "layoutMode",
      before: node.layoutMode,
      after: "VERTICAL",
    });
    node.layoutMode = "VERTICAL";
  }

  // Content spacing
  const contentGap = snapToGrid(32);
  if (node.itemSpacing !== contentGap) {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "itemSpacing",
      before: node.itemSpacing,
      after: contentGap,
    });
    node.itemSpacing = contentGap;
  }
}

/**
 * Optimizes layout for hero section patterns
 */
function optimizeHeroSection(
  node: FrameNode,
  changes: LayoutChange[],
  _suggestions: LayoutSuggestion[]
): void {
  // Vertical centered
  if (node.layoutMode !== "VERTICAL") {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "layoutMode",
      before: node.layoutMode,
      after: "VERTICAL",
    });
    node.layoutMode = "VERTICAL";
  }

  // Center both axes
  if (node.primaryAxisAlignItems !== "CENTER") {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "primaryAxisAlignItems",
      before: node.primaryAxisAlignItems,
      after: "CENTER",
    });
    node.primaryAxisAlignItems = "CENTER";
  }

  if (node.counterAxisAlignItems !== "CENTER") {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "counterAxisAlignItems",
      before: node.counterAxisAlignItems,
      after: "CENTER",
    });
    node.counterAxisAlignItems = "CENTER";
  }

  // Hero spacing
  const heroGap = snapToGrid(24);
  if (node.itemSpacing !== heroGap) {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "itemSpacing",
      before: node.itemSpacing,
      after: heroGap,
    });
    node.itemSpacing = heroGap;
  }
}

/**
 * Recursively optimizes layout for all child frames
 */
function optimizeChildrenRecursively(
  node: FrameNode,
  changes: LayoutChange[],
  suggestions: LayoutSuggestion[],
  depth: number = 0
): void {
  // Max recursion depth to prevent infinite loops
  if (depth > 10) return;

  for (const child of node.children) {
    if (child.type !== "FRAME") continue;

    const childFrame = child as FrameNode;

    // Skip if already has auto-layout
    if (childFrame.layoutMode === "NONE" && childFrame.children.length > 0) {
      // Auto-detect and enable layout for child
      const childStrategy = detectLayoutStrategy(childFrame);

      changes.push({
        nodeId: childFrame.id,
        nodeName: childFrame.name,
        changeType: "layoutMode",
        before: "NONE",
        after: "VERTICAL",
      });
      childFrame.layoutMode = "VERTICAL";
      childFrame.primaryAxisSizingMode = "AUTO";
      childFrame.counterAxisSizingMode = "AUTO";

      // Apply child strategy
      switch (childStrategy) {
        case "CARD_GRID":
          optimizeCardGrid(childFrame, changes, suggestions);
          break;
        case "FORM_LAYOUT":
          optimizeFormLayout(childFrame, changes, suggestions);
          break;
        case "NAVIGATION":
          optimizeNavigation(childFrame, changes, suggestions);
          break;
        case "HERO_SECTION":
          optimizeHeroSection(childFrame, changes, suggestions);
          break;
        default:
          optimizeContentStack(childFrame, changes, suggestions);
      }
    }

    // Recurse into children
    if (childFrame.children.length > 0) {
      optimizeChildrenRecursively(childFrame, changes, suggestions, depth + 1);
    }
  }
}

/**
 * Validates and fixes touch target sizes
 */
function validateTouchTargets(
  node: FrameNode,
  changes: LayoutChange[],
  suggestions: LayoutSuggestion[],
  platform: "web" | "ios" | "android"
): void {
  const minSize = platform === "android" ? 48 : 44;

  const checkTouchTarget = (n: SceneNode): void => {
    const interactiveNames = ["button", "btn", "input", "link", "toggle", "switch", "checkbox", "radio", "tap", "icon-button"];
    const isInteractive = interactiveNames.some(name => n.name.toLowerCase().includes(name));

    if (!isInteractive) return;

    if ("width" in n && "height" in n) {
      const width = n.width;
      const height = n.height;

      if (width < minSize || height < minSize) {
        suggestions.push({
          nodeId: n.id,
          message: `Touch target "${n.name}" is ${Math.round(width)}x${Math.round(height)}px. Minimum for ${platform} is ${minSize}x${minSize}px`,
          priority: "high",
        });
      }
    }
  };

  const traverse = (n: SceneNode): void => {
    checkTouchTarget(n);
    if ("children" in n) {
      (n as FrameNode).children.forEach(traverse);
    }
  };

  traverse(node);
}

/**
 * Optimizes visual hierarchy of text elements
 */
function optimizeVisualHierarchy(
  node: FrameNode,
  changes: LayoutChange[],
  suggestions: LayoutSuggestion[]
): void {
  const textNodes: TextNode[] = [];

  const collectTexts = (n: SceneNode): void => {
    if (n.type === "TEXT") textNodes.push(n);
    if ("children" in n) {
      (n as FrameNode).children.forEach(collectTexts);
    }
  };

  collectTexts(node);

  if (textNodes.length < 2) return;

  // Group by size
  const sizeGroups = new Map<number, TextNode[]>();
  for (const text of textNodes) {
    const size = text.fontSize as number;
    if (!sizeGroups.has(size)) sizeGroups.set(size, []);
    sizeGroups.get(size)!.push(text);
  }

  // Check for good hierarchy (at least 2 distinct sizes)
  if (sizeGroups.size < 2) {
    suggestions.push({
      nodeId: node.id,
      message: "All text is the same size. Consider adding visual hierarchy with different font sizes for headings vs body",
      priority: "medium",
    });
  }

  // Check for too many sizes (visual noise)
  if (sizeGroups.size > 4) {
    suggestions.push({
      nodeId: node.id,
      message: `${sizeGroups.size} different text sizes detected. Consider using 2-3 sizes for cleaner hierarchy`,
      priority: "low",
    });
  }
}

/**
 * Enforces 8-point grid on spacing and padding
 */
function enforceGridSpacing(node: FrameNode, changes: LayoutChange[]): void {
  // Snap item spacing
  const snappedSpacing = snapToGrid(node.itemSpacing);
  if (node.itemSpacing !== snappedSpacing) {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "itemSpacing",
      before: node.itemSpacing,
      after: snappedSpacing,
    });
    node.itemSpacing = snappedSpacing;
  }

  // Snap padding
  const snappedPaddingTop = snapToGrid(node.paddingTop);
  const snappedPaddingRight = snapToGrid(node.paddingRight);
  const snappedPaddingBottom = snapToGrid(node.paddingBottom);
  const snappedPaddingLeft = snapToGrid(node.paddingLeft);

  if (node.paddingTop !== snappedPaddingTop) {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "paddingTop",
      before: node.paddingTop,
      after: snappedPaddingTop,
    });
    node.paddingTop = snappedPaddingTop;
  }
  if (node.paddingRight !== snappedPaddingRight) {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "paddingRight",
      before: node.paddingRight,
      after: snappedPaddingRight,
    });
    node.paddingRight = snappedPaddingRight;
  }
  if (node.paddingBottom !== snappedPaddingBottom) {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "paddingBottom",
      before: node.paddingBottom,
      after: snappedPaddingBottom,
    });
    node.paddingBottom = snappedPaddingBottom;
  }
  if (node.paddingLeft !== snappedPaddingLeft) {
    changes.push({
      nodeId: node.id,
      nodeName: node.name,
      changeType: "paddingLeft",
      before: node.paddingLeft,
      after: snappedPaddingLeft,
    });
    node.paddingLeft = snappedPaddingLeft;
  }
}

// ============================================================================
// Main Handler
// ============================================================================

/**
 * Handles the SMART_LAYOUT action
 * Analyzes and optimizes layout of a node tree using AI-powered rules
 */
async function handleSmartLayout(params: Record<string, unknown>): Promise<SmartLayoutResult> {
  const nodeId = params.nodeId as string;
  const strategy = (params.strategy as LayoutStrategy) || "AUTO_DETECT";
  const options = params.options as
    | {
        enforceGrid?: boolean;
        autoGroup?: boolean;
        optimizeHierarchy?: boolean;
        targetPlatform?: "web" | "ios" | "android";
      }
    | undefined;

  const node = await getNodeOrThrow(nodeId);

  if (node.type !== "FRAME") {
    return {
      success: false,
      error: "Node not found or not a frame",
      changes: [],
      suggestions: [],
    };
  }

  const frame = node as FrameNode;
  const changes: LayoutChange[] = [];
  const suggestions: LayoutSuggestion[] = [];

  // Enable auto layout if not already
  if (frame.layoutMode === "NONE") {
    changes.push({
      nodeId: frame.id,
      nodeName: frame.name,
      changeType: "layoutMode",
      before: "NONE",
      after: "VERTICAL",
    });
    frame.layoutMode = "VERTICAL";
    frame.primaryAxisSizingMode = "AUTO";
    frame.counterAxisSizingMode = "AUTO";
  }

  // Determine strategy
  const effectiveStrategy: LayoutStrategy =
    strategy === "AUTO_DETECT" ? detectLayoutStrategy(frame) : strategy;

  // Apply strategy-specific optimizations
  switch (effectiveStrategy) {
    case "CARD_GRID":
      optimizeCardGrid(frame, changes, suggestions);
      break;
    case "FORM_LAYOUT":
      optimizeFormLayout(frame, changes, suggestions);
      break;
    case "NAVIGATION":
      optimizeNavigation(frame, changes, suggestions);
      break;
    case "CONTENT_STACK":
      optimizeContentStack(frame, changes, suggestions);
      break;
    case "HERO_SECTION":
      optimizeHeroSection(frame, changes, suggestions);
      break;
  }

  // Enforce grid if option enabled (default: true)
  if (options?.enforceGrid !== false) {
    enforceGridSpacing(frame, changes);
  }

  // Auto-group: recursively optimize child frames (default: true)
  if (options?.autoGroup !== false) {
    optimizeChildrenRecursively(frame, changes, suggestions);
  }

  // Validate touch targets for platform (always run)
  const platform = options?.targetPlatform || "web";
  validateTouchTargets(frame, changes, suggestions, platform);

  // Optimize visual hierarchy (default: true)
  if (options?.optimizeHierarchy !== false) {
    optimizeVisualHierarchy(frame, changes, suggestions);
  }

  // Add detected strategy to response
  suggestions.unshift({
    nodeId: frame.id,
    message: `Detected layout type: ${effectiveStrategy}`,
    priority: "low",
  });

  return {
    success: true,
    strategy: effectiveStrategy,
    changes,
    suggestions,
  };
}

// ============================================================================
// Exports
// ============================================================================

export { handleSmartLayout };
