/**
 * Smart Positioning Types
 */

export interface LayoutContext {
  parentWidth: number;
  parentHeight: number;
  parentPadding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  siblings: SiblingInfo[];
  parentLayoutMode: "NONE" | "HORIZONTAL" | "VERTICAL";
  parentItemSpacing: number;
}

export interface SiblingInfo {
  nodeId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  order: number;
}

export interface PositionRequest {
  width: number;
  height: number;
  region?: "header" | "content" | "footer";
  alignment?: "start" | "center" | "end" | "stretch";
  offset?: { x?: number; y?: number };
}

export interface PositionResult {
  x: number;
  y: number;
  width: number;
  height: number;
  layoutSizing?: {
    horizontal: "FIXED" | "HUG" | "FILL";
    vertical: "FIXED" | "HUG" | "FILL";
  };
}

export interface RegionBounds {
  header: { y: number; height: number };
  content: { y: number; height: number };
  footer: { y: number; height: number };
}
