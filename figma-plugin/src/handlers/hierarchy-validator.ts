// figma-plugin/src/handlers/hierarchy-validator.ts
/**
 * Hierarchy Validator Handler
 *
 * Validates node hierarchy for design quality issues.
 * Rules:
 *   - MAX_NESTING_DEPTH: Recursive depth check
 *   - NO_EMPTY_CONTAINERS: Frame/group with no children
 *   - NO_SINGLE_CHILD_WRAPPER: Frame with only one child (exception: auto-layout padding frame)
 *   - NO_NESTED_INTERACTIVE: Button/input inside button/input
 */

import { getNode } from "./utils";

// ============================================================================
// Types
// ============================================================================

interface Violation {
  rule: string;
  severity: "error" | "warning";
  nodeId: string;
  nodeName: string;
  message: string;
}

interface ValidationResult {
  passed: boolean;
  score: number;
  totalNodes: number;
  maxDepthFound: number;
  violations: Violation[];
}

// ============================================================================
// Interactive element detection
// ============================================================================

const INTERACTIVE_PATTERNS = [
  /button/i,
  /btn/i,
  /input/i,
  /checkbox/i,
  /radio/i,
  /toggle/i,
  /switch/i,
  /select/i,
  /dropdown/i,
];

function isInteractive(node: BaseNode): boolean {
  return INTERACTIVE_PATTERNS.some((p) => p.test(node.name));
}

// ============================================================================
// Rule checkers
// ============================================================================

function checkMaxDepth(
  node: BaseNode,
  maxDepth: number,
  currentDepth: number,
  violations: Violation[],
  depthTracker: { max: number }
): void {
  if (currentDepth > depthTracker.max) {
    depthTracker.max = currentDepth;
  }

  if (currentDepth > maxDepth) {
    violations.push({
      rule: "MAX_NESTING_DEPTH",
      severity: "warning",
      nodeId: node.id,
      nodeName: node.name,
      message: `Nesting depth ${currentDepth} exceeds max ${maxDepth}`,
    });
  }

  if ("children" in node) {
    for (const child of (node as ChildrenMixin).children) {
      checkMaxDepth(child, maxDepth, currentDepth + 1, violations, depthTracker);
    }
  }
}

function checkEmptyContainers(
  node: BaseNode,
  violations: Violation[]
): void {
  if ("children" in node) {
    const children = (node as ChildrenMixin).children;
    if (
      children.length === 0 &&
      (node.type === "FRAME" || node.type === "GROUP")
    ) {
      violations.push({
        rule: "NO_EMPTY_CONTAINERS",
        severity: "warning",
        nodeId: node.id,
        nodeName: node.name,
        message: `Empty ${node.type.toLowerCase()} with no children`,
      });
    }
    for (const child of children) {
      checkEmptyContainers(child, violations);
    }
  }
}

function checkSingleChildWrapper(
  node: BaseNode,
  violations: Violation[]
): void {
  if ("children" in node) {
    const parent = node as FrameNode;
    const children = parent.children;

    if (
      node.type === "FRAME" &&
      children.length === 1
    ) {
      // Exception: auto-layout padding frames are OK
      const hasAutoLayout =
        "layoutMode" in parent && parent.layoutMode !== "NONE";
      const hasPadding =
        hasAutoLayout &&
        ("paddingTop" in parent &&
          ((parent.paddingTop || 0) > 0 ||
            (parent.paddingRight || 0) > 0 ||
            (parent.paddingBottom || 0) > 0 ||
            (parent.paddingLeft || 0) > 0));

      if (!hasPadding) {
        violations.push({
          rule: "NO_SINGLE_CHILD_WRAPPER",
          severity: "warning",
          nodeId: node.id,
          nodeName: node.name,
          message: `Frame wraps only one child "${children[0].name}" - consider removing wrapper`,
        });
      }
    }

    for (const child of children) {
      checkSingleChildWrapper(child, violations);
    }
  }
}

function checkNestedInteractive(
  node: BaseNode,
  violations: Violation[],
  parentInteractive: BaseNode | null = null
): void {
  if (isInteractive(node) && parentInteractive) {
    violations.push({
      rule: "NO_NESTED_INTERACTIVE",
      severity: "error",
      nodeId: node.id,
      nodeName: node.name,
      message: `Interactive element "${node.name}" nested inside interactive "${parentInteractive.name}"`,
    });
  }

  const currentInteractive = isInteractive(node) ? node : parentInteractive;

  if ("children" in node) {
    for (const child of (node as ChildrenMixin).children) {
      checkNestedInteractive(child, violations, currentInteractive);
    }
  }
}

function countNodes(node: BaseNode): number {
  let count = 1;
  if ("children" in node) {
    for (const child of (node as ChildrenMixin).children) {
      count += countNodes(child);
    }
  }
  return count;
}

// ============================================================================
// Main Handler
// ============================================================================

export async function handleValidateHierarchy(
  params: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const nodeId = params.nodeId as string;
  const rules = (params.rules as string[]) || [
    "MAX_NESTING_DEPTH",
    "NO_EMPTY_CONTAINERS",
    "NO_SINGLE_CHILD_WRAPPER",
    "NO_NESTED_INTERACTIVE",
  ];
  const maxDepth = (params.maxDepth as number) || 10;

  const node = await getNode(nodeId);
  if (!node) throw new Error(`Node not found: ${nodeId}`);

  const violations: Violation[] = [];
  const depthTracker = { max: 0 };

  if (rules.includes("MAX_NESTING_DEPTH")) {
    checkMaxDepth(node, maxDepth, 0, violations, depthTracker);
  }

  if (rules.includes("NO_EMPTY_CONTAINERS")) {
    checkEmptyContainers(node, violations);
  }

  if (rules.includes("NO_SINGLE_CHILD_WRAPPER")) {
    checkSingleChildWrapper(node, violations);
  }

  if (rules.includes("NO_NESTED_INTERACTIVE")) {
    checkNestedInteractive(node, violations);
  }

  const totalNodes = countNodes(node);
  const errorCount = violations.filter((v) => v.severity === "error").length;
  const warningCount = violations.filter((v) => v.severity === "warning").length;

  // Score: 100 - (errors * 10) - (warnings * 3), clamped to 0-100
  const score = Math.max(0, Math.min(100, 100 - errorCount * 10 - warningCount * 3));

  const result: ValidationResult = {
    passed: errorCount === 0,
    score,
    totalNodes,
    maxDepthFound: depthTracker.max,
    violations,
  };

  return result as unknown as Record<string, unknown>;
}
