// figma-plugin/src/handlers/utils/index.ts
/**
 * Re-export all utilities
 */

// Types
export * from "./types";

// Node helpers
export {
  nodeRegistry,
  registerNode,
  unregisterNode,
  getNode,
  getNodeOrThrow,
  attachToParentOrPage,
  setPosition,
  finalizeNode,
  canHaveChildren,
  getParentNodeOrThrow,
} from "./node-helpers";

// Paint helpers
export {
  hexToRgb,
  parseColor,
  convertGradientAngleToTransform,
  createSolidPaint,
  createStrokePaint,
  createGradientPaint,
  convertToFigmaPaint,
  convertToFigmaEffect,
  createFill,
  createEffect,
  applyAutoLayout,
  applyStroke,
} from "./paint-helpers";

// Font helpers
export {
  getFontStyle,
  loadFont,
} from "./font-helpers";
