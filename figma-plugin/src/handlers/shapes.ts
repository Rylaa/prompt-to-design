// figma-plugin/src/handlers/shapes.ts
/**
 * Shape creation handlers
 * Handles: Frame, Rectangle, Ellipse, Line, Polygon, Star, Vector
 */

// Handler utilities
import {
  // Types
  type FillConfig,
  type StrokeConfig,
  type EffectConfig,
  // Node helpers
  registerNode,
  getNode,
  attachToParentOrPage,
  setPosition,
  // Paint helpers
  hexToRgb,
  createSolidPaint,
  createStrokePaint,
  createFill,
  createEffect,
  applyStroke,
} from "./utils";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_SHAPE_SIZE = 100;
const DEFAULT_STROKE_COLOR = "#000000";
const RADIANS_TO_DEGREES = 180 / Math.PI;

// Core layout system
import { createAutoLayout } from "../core";
import type { AutoLayoutConfig as CoreAutoLayoutConfig } from "../core/types";

// Spacing tokens
import { pxToSpacingKey, pxToRadiusKey } from "../tokens/spacing";

// ============================================================================
// Frame Handler
// ============================================================================

async function handleCreateFrame(params: Record<string, unknown>): Promise<{ nodeId: string; fill?: string; name?: string }> {
  // Find parent node if specified
  let parent: FrameNode | ComponentNode | undefined;
  if (params.parentId) {
    const parentNode = await getNode(params.parentId as string);
    if (parentNode && "appendChild" in parentNode) {
      parent = parentNode as FrameNode | ComponentNode;
    }
  }

  // Create Auto Layout config with defaults
  const config: CoreAutoLayoutConfig = {
    name: (params.name as string) || "Frame",
    direction: (params.autoLayout as { mode?: string })?.mode === "HORIZONTAL" ? "HORIZONTAL" : "VERTICAL",
    spacing: {
      gap: "4" as const, // Default 16px
      padding: "4" as const, // Default 16px
    },
    parent,
  };

  // Override with Auto Layout params if provided
  if (params.autoLayout) {
    const al = params.autoLayout as Record<string, unknown>;

    // Spacing - convert raw number to nearest token
    if (typeof al.spacing === "number") {
      config.spacing.gap = pxToSpacingKey(al.spacing as number);
    }
    if (typeof al.padding === "number") {
      const paddingKey = pxToSpacingKey(al.padding as number);
      config.spacing.padding = paddingKey;
    }
    if (typeof al.paddingTop === "number") {
      config.spacing.paddingTop = pxToSpacingKey(al.paddingTop as number);
    }
    if (typeof al.paddingRight === "number") {
      config.spacing.paddingRight = pxToSpacingKey(al.paddingRight as number);
    }
    if (typeof al.paddingBottom === "number") {
      config.spacing.paddingBottom = pxToSpacingKey(al.paddingBottom as number);
    }
    if (typeof al.paddingLeft === "number") {
      config.spacing.paddingLeft = pxToSpacingKey(al.paddingLeft as number);
    }

    // Alignment
    if (al.primaryAxisAlign) {
      config.primaryAxisAlign = al.primaryAxisAlign as "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
    }
    if (al.counterAxisAlign) {
      config.counterAxisAlign = al.counterAxisAlign as "MIN" | "CENTER" | "MAX" | "BASELINE";
    }
  }

  // Fill - convert hex to RGB
  if (params.fill) {
    const fillParam = params.fill as { type?: string; color?: string | { r: number; g: number; b: number } };
    if (fillParam.type === "SOLID" && fillParam.color) {
      if (typeof fillParam.color === "string") {
        const rgb = hexToRgb(fillParam.color);
        config.fill = { type: "SOLID", color: rgb };
      } else {
        config.fill = { type: "SOLID", color: fillParam.color };
      }
    }
  } else if (!params.parentId) {
    // Root frames (no parentId) get dark theme background by default
    // #09090B = rgb(9, 9, 11) - ensures white text is visible
    config.fill = { type: "SOLID", color: { r: 9 / 255, g: 9 / 255, b: 11 / 255 } };
  }
  // Child frames remain transparent if fill not specified (createAutoLayout default)

  // Corner radius
  if (typeof params.cornerRadius === "number") {
    config.cornerRadius = pxToRadiusKey(params.cornerRadius);
  }

  // Explicit dimensions - respect direction
  const direction = config.direction;
  if (params.width) {
    config.width = params.width as number;
    if (direction === "HORIZONTAL") {
      config.primaryAxisSizing = "FIXED";
    } else {
      config.counterAxisSizing = "FIXED";
    }
  }
  if (params.height) {
    config.height = params.height as number;
    if (direction === "VERTICAL") {
      config.primaryAxisSizing = "FIXED";
    } else {
      config.counterAxisSizing = "FIXED";
    }
  }

  // Create frame using factory
  const frame = createAutoLayout(config);

  // NOTE: x, y parameters are now ignored
  // Auto Layout parent determines position automatically

  // Apply stroke (not yet supported in factory)
  if (params.stroke) {
    applyStroke(frame, params.stroke as StrokeConfig);
  }

  // Apply effects (not yet supported in factory)
  if (params.effects) {
    frame.effects = (params.effects as EffectConfig[]).map(createEffect);
  }

  // Clips content - default TRUE (content should not overflow frame)
  // Critical for scrollable content - otherwise content extends beyond main frame
  if (params.clipsContent !== undefined) {
    frame.clipsContent = params.clipsContent as boolean;
  } else {
    // Default to clipsContent = true
    frame.clipsContent = true;
  }

  // Layout sizing - determines behavior inside Auto Layout parent
  // FILL: Fill parent width/height
  // HUG: Size based on content
  // FIXED: Fixed size
  if (params.layoutSizingHorizontal) {
    frame.layoutSizingHorizontal = params.layoutSizingHorizontal as "FIXED" | "HUG" | "FILL";
  }
  if (params.layoutSizingVertical) {
    frame.layoutSizingVertical = params.layoutSizingVertical as "FIXED" | "HUG" | "FILL";
  }

  registerNode(frame);

  if (!params.parentId) {
    figma.viewport.scrollAndZoomIntoView([frame]);
  }

  // Add fill info to response - so Claude can see what color was created
  const fills = frame.fills as readonly Paint[];
  let fillInfo: string | null = null;
  if (fills.length > 0 && fills[0].type === "SOLID") {
    const solid = fills[0] as SolidPaint;
    const r = Math.round(solid.color.r * 255);
    const g = Math.round(solid.color.g * 255);
    const b = Math.round(solid.color.b * 255);
    fillInfo = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
  }

  return { nodeId: frame.id, fill: fillInfo ?? undefined, name: frame.name };
}

// ============================================================================
// Rectangle Handler
// ============================================================================

async function handleCreateRectangle(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const rect = figma.createRectangle();
  rect.name = (params.name as string) || "Rectangle";
  rect.resize(
    (params.width as number) || DEFAULT_SHAPE_SIZE,
    (params.height as number) || DEFAULT_SHAPE_SIZE
  );

  if (params.fill) {
    rect.fills = [createFill(params.fill as FillConfig)];
  }

  if (params.cornerRadius !== undefined) {
    rect.cornerRadius = params.cornerRadius as number;
  }

  if (params.stroke) {
    applyStroke(rect, params.stroke as StrokeConfig);
  }

  if (params.effects) {
    rect.effects = (params.effects as EffectConfig[]).map(createEffect);
  }

  // Attach to parent and set position
  await attachToParentOrPage(rect, params.parentId as string | undefined);
  setPosition(rect, params.x as number | undefined, params.y as number | undefined);

  registerNode(rect);
  return { nodeId: rect.id };
}

// ============================================================================
// Ellipse Handler
// ============================================================================

async function handleCreateEllipse(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const ellipse = figma.createEllipse();
  ellipse.name = (params.name as string) || "Ellipse";
  ellipse.resize(
    (params.width as number) || DEFAULT_SHAPE_SIZE,
    (params.height as number) || DEFAULT_SHAPE_SIZE
  );

  if (params.fill) {
    ellipse.fills = [createFill(params.fill as FillConfig)];
  }

  if (params.effects) {
    ellipse.effects = (params.effects as EffectConfig[]).map(createEffect);
  }

  // Attach to parent and set position
  await attachToParentOrPage(ellipse, params.parentId as string | undefined);
  setPosition(ellipse, params.x as number | undefined, params.y as number | undefined);

  registerNode(ellipse);
  return { nodeId: ellipse.id };
}

// ============================================================================
// Line Handler
// ============================================================================

async function handleCreateLine(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const name = (params.name as string) ?? "Line";
  const startX = params.startX as number;
  const startY = params.startY as number;
  const endX = params.endX as number;
  const endY = params.endY as number;
  const strokeConfig = params.stroke as StrokeConfig | undefined;

  const line = figma.createLine();
  line.name = name;

  // Calculate length and rotation from start/end points
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * RADIANS_TO_DEGREES;

  // Line position is set by start point (not using setPosition helper)
  line.x = startX;
  line.y = startY;
  line.resize(length, 0);
  line.rotation = -angle;

  // Apply stroke
  if (strokeConfig) {
    line.strokes = [createSolidPaint(strokeConfig.color)];
    line.strokeWeight = strokeConfig.weight ?? 1;
  } else {
    line.strokes = [createSolidPaint(DEFAULT_STROKE_COLOR)];
    line.strokeWeight = 1;
  }

  // Attach to parent (line doesn't need fallback to page since it starts at specific coords)
  await attachToParentOrPage(line, params.parentId as string | undefined);

  registerNode(line);
  return { nodeId: line.id };
}

// ============================================================================
// Vector Handler
// ============================================================================

async function handleCreateVector(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const name = (params.name as string) || "Vector";
  const pathData = params.pathData as string;

  const vector = figma.createVector();
  vector.name = name;

  // Set vector paths if provided
  if (pathData) {
    vector.vectorPaths = [{
      windingRule: "NONZERO",
      data: pathData,
    }];
  }

  // Apply fill
  if (params.fill) {
    const fillConfig = params.fill as FillConfig;
    vector.fills = [createFill(fillConfig)];
  }

  // Apply stroke
  if (params.stroke) {
    const strokeConfig = params.stroke as StrokeConfig;
    vector.strokes = [createStrokePaint(strokeConfig)];
    if (strokeConfig.weight) vector.strokeWeight = strokeConfig.weight;
  }

  // Set size if both dimensions provided
  if (params.width !== undefined && params.height !== undefined) {
    vector.resize(params.width as number, params.height as number);
  }

  // Attach to parent and set position
  await attachToParentOrPage(vector, params.parentId as string | undefined);
  setPosition(vector, params.x as number | undefined, params.y as number | undefined);

  registerNode(vector);
  return { nodeId: vector.id };
}

// ============================================================================
// Polygon Handler
// ============================================================================

async function handleCreatePolygon(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const name = (params.name as string) || "Polygon";
  const pointCount = (params.pointCount as number) || 6;
  const width = (params.width as number) || DEFAULT_SHAPE_SIZE;
  const height = (params.height as number) || DEFAULT_SHAPE_SIZE;

  const polygon = figma.createPolygon();
  polygon.name = name;
  polygon.pointCount = pointCount;
  polygon.resize(width, height);

  // Apply fill
  if (params.fill) {
    const fillConfig = params.fill as FillConfig;
    polygon.fills = [createFill(fillConfig)];
  }

  // Apply stroke
  if (params.stroke) {
    const strokeConfig = params.stroke as StrokeConfig;
    polygon.strokes = [createStrokePaint(strokeConfig)];
    if (strokeConfig.weight) polygon.strokeWeight = strokeConfig.weight;
  }

  // Attach to parent and set position
  await attachToParentOrPage(polygon, params.parentId as string | undefined);
  setPosition(polygon, params.x as number | undefined, params.y as number | undefined);

  registerNode(polygon);
  return { nodeId: polygon.id };
}

// ============================================================================
// Star Handler
// ============================================================================

async function handleCreateStar(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const name = (params.name as string) || "Star";
  const pointCount = (params.pointCount as number) || 5;
  const innerRadius = (params.innerRadius as number) || 0.4;
  const width = (params.width as number) || DEFAULT_SHAPE_SIZE;
  const height = (params.height as number) || DEFAULT_SHAPE_SIZE;

  const star = figma.createStar();
  star.name = name;
  star.pointCount = pointCount;
  star.innerRadius = innerRadius;
  star.resize(width, height);

  // Apply fill
  if (params.fill) {
    const fillConfig = params.fill as FillConfig;
    star.fills = [createFill(fillConfig)];
  }

  // Apply stroke
  if (params.stroke) {
    const strokeConfig = params.stroke as StrokeConfig;
    star.strokes = [createStrokePaint(strokeConfig)];
    if (strokeConfig.weight) star.strokeWeight = strokeConfig.weight;
  }

  // Attach to parent and set position
  await attachToParentOrPage(star, params.parentId as string | undefined);
  setPosition(star, params.x as number | undefined, params.y as number | undefined);

  registerNode(star);
  return { nodeId: star.id };
}

// ============================================================================
// Exports
// ============================================================================

export {
  handleCreateFrame,
  handleCreateRectangle,
  handleCreateEllipse,
  handleCreateLine,
  handleCreatePolygon,
  handleCreateStar,
  handleCreateVector,
};
