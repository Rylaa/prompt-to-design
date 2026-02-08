/// <reference types="@figma/plugin-typings" />
/**
 * Figma Plugin - AI Design Assistant v2
 * Receives commands via WebSocket and creates designs in Figma
 * Async node operations and component library support
 * Extended with shadcn, iOS, macOS component libraries
 *
 * This file serves as the thin orchestrator (~250 lines)
 * All handler implementations are in ./handlers/ modules
 */

// ============================================================================
// Component Library Imports
// ============================================================================

import { themeManager, getColors, Theme, Platform, ThemeColors, createColorToken } from "./tokens";
import { createShadcnComponent, listShadcnComponents } from "./components/shadcn";
import { createIOSComponent, listIOSComponents } from "./components/apple-ios";
import { createMacOSComponent, listMacOSComponents } from "./components/apple-macos";
import { createLiquidGlassComponent, listLiquidGlassComponents } from "./components/liquid-glass";
import { listComponents, ComponentLibrary } from "./components";

// ============================================================================
// Handler Utilities
// ============================================================================

import {
  // Types
  type Command,
  type RGBColor,
  type GradientStop,
  type GradientConfig,
  type FillConfig,
  type ShadowConfig,
  type BlurConfig,
  type EffectConfig,
  type AutoLayoutConfig,
  type TextStyleConfig,
  type StrokeConfig,
  type FinalizeOptions,
  type CommandHandler,
  type NoParamsHandler,
  // Node helpers
  nodeRegistry,
  registerNode,
  getNode,
  getNodeOrThrow,
  attachToParentOrPage,
  setPosition,
  finalizeNode,
  // Paint helpers
  hexToRgb,
  parseColor,
  createSolidPaint,
  createStrokePaint,
  createGradientPaint,
  createFill,
  createEffect,
  applyAutoLayout,
  applyStroke,
  // Font helpers
  getFontStyle,
  loadFont,
} from "./handlers/utils";

// ============================================================================
// Core Layout System
// ============================================================================

import {
  createAutoLayout,
  setLayoutSizing,
  enableAutoLayout,
  resolveSpacing,
} from "./core";
import type {
  AutoLayoutConfig as CoreAutoLayoutConfig,
  LayoutSizingConfig,
  FillConfig as CoreFillConfig,
  SpacingConfig,
} from "./core/types";

// ============================================================================
// Spacing Tokens
// ============================================================================

import { pxToSpacingKey, pxToRadiusKey, spacing } from "./tokens/spacing";
import type { RadiusKey } from "./tokens/spacing";

// ============================================================================
// Handler Imports - All handlers from modular handler system
// ============================================================================

import {
  // Shapes
  handleCreateFrame,
  handleCreateRectangle,
  handleCreateEllipse,
  handleCreateLine,
  handleCreatePolygon,
  handleCreateStar,
  handleCreateVector,
  handleSetVectorPaths,
  // Text
  handleCreateText,
  handleSetTextContent,
  handleListAvailableFonts,
  // UI Components
  handleCreateButton,
  handleCreateInput,
  handleCreateCard,
  handleCreateKPICard,
  handleCreateUIComponent,
  handleCreateIcon,
  handleListIcons,
  // Design Systems
  handleSetTheme,
  handleSetThemeTokens,
  handleCreateShadcnComponent,
  handleCreateAppleComponent,
  handleCreateLiquidGlassComponent,
  handleListComponents,
  handleGetDesignTokens,
  // Layout
  handleSetAutoLayout,
  handleSetConstraints,
  handleSetLayoutSizing,
  handleSetLayoutGrid,
  handleGetLayoutGrid,
  handleReorderChildren,
  handleLintLayout,
  // Smart Layout
  handleSmartLayout,
  // Variant Generator
  handleGenerateVariants,
  // Styling
  handleSetFill,
  handleSetEffects,
  handleSetOpacity,
  handleSetStroke,
  handleSetCornerRadius,
  handleSetBlendMode,
  // Transform
  handleResizeNode,
  handleSetPosition,
  handleSetRotation,
  handleSetTransform,
  handleScaleNode,
  // Manipulation
  handleDeleteNode,
  handleCloneNode,
  handleModifyNode,
  handleMoveToParent,
  handleAppendChild,
  handleCreateGroup,
  handleUngroup,
  handleFlattenNode,
  handleSetVisibility,
  handleSetLocked,
  handleBooleanOperation,
  handleCreateMask,
  handleSetMask,
  // Component Library
  handleCreateComponent,
  handleCreateComponentInstance,
  handleGetLocalComponents,
  handleRegisterComponent,
  handleRegisterComponentSlot,
  handleCreateFromSlot,
  handleListComponentSlots,
  // Media
  handleCreateImage,
  handleSetImageFill,
  handleCreateVideo,
  handleSetVideoFill,
  handleCreateLinkPreview,
  // Styles
  handleGetLocalStyles,
  handleCreatePaintStyle,
  handleCreateTextStyle,
  handleCreateEffectStyle,
  handleApplyStyle,
  // Variables
  handleGetLocalVariables,
  handleGetVariableCollections,
  handleCreateVariable,
  handleCreateVariableCollection,
  handleBindVariable,
  // Query
  handleGetSelection,
  handleSelectNodes,
  handleGetNodeInfo,
  handleGetPageInfo,
  handleFindNodes,
  handleFindChildren,
  // Data Storage
  handleSetPluginData,
  handleGetPluginData,
  handleGetAllPluginData,
  handleDeletePluginData,
  handleClientStorageSet,
  handleClientStorageGet,
  handleClientStorageDelete,
  handleClientStorageKeys,
  handleSetSharedPluginData,
  handleGetSharedPluginData,
  handleGetSharedPluginDataKeys,
  // Viewport
  handleGetViewport,
  handleSetViewport,
  handleScrollToNode,
  handleZoomToFit,
  handleZoomToSelection,
  // Pages
  handleGetCurrentPage,
  handleSetCurrentPage,
  handleCreatePage,
  handleGetAllPages,
  // Editor
  handleGetEditorType,
  handleGetMode,
  // Debug
  handleToggleDebugMode,
  handleGetDebugInfo,
  // Export
  handleExportNode,
  handleExportMultiple,
  // Hierarchy Validator
  handleValidateHierarchy,
} from "./handlers";

// ============================================================================
// Plugin UI
// ============================================================================

figma.showUI(__html__, { width: 300, height: 400 });

// ============================================================================
// FigJam-specific Types (not in shared utils)
// ============================================================================

// FigJam connector magnet positions
type ConnectorMagnet = "AUTO" | "TOP" | "BOTTOM" | "LEFT" | "RIGHT" | "CENTER";

// FigJam connector line types
type ConnectorLineType = "STRAIGHT" | "ELBOWED" | "CURVED";

// FigJam code block languages
type CodeBlockLanguage = "TYPESCRIPT" | "JAVASCRIPT" | "PYTHON" | "RUBY" | "CSS" | "HTML" | "JSON" | "CPP" | "GO" | "BASH" | "SWIFT" | "KOTLIN" | "RUST" | "PLAINTEXT" | "GRAPHQL" | "SQL" | "DART";

// ============================================================================
// Component Library - Store and manage components by name
// ============================================================================

interface ComponentDefinition {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

const componentLibrary: Map<string, ComponentNode> = new Map();

// ============================================================================
// Component Slots - Reusable component slots with variant support
// ============================================================================

interface ComponentSlot {
  nodeId: string;
  variants?: Record<string, string>;
}

const componentSlots = new Map<string, ComponentSlot>();

// ============================================================================
// Command Router - Maps command actions to handlers
// ============================================================================

const commandHandlers: Record<string, CommandHandler | NoParamsHandler> = {
  // === Basic Shapes ===
  CREATE_FRAME: handleCreateFrame,
  CREATE_RECTANGLE: handleCreateRectangle,
  CREATE_ELLIPSE: handleCreateEllipse,
  CREATE_LINE: handleCreateLine,
  CREATE_POLYGON: handleCreatePolygon,
  CREATE_STAR: handleCreateStar,
  CREATE_VECTOR: handleCreateVector,

  // === Text ===
  CREATE_TEXT: handleCreateText,
  SET_TEXT_CONTENT: handleSetTextContent,
  LIST_AVAILABLE_FONTS: handleListAvailableFonts,

  // === UI Components ===
  CREATE_BUTTON: handleCreateButton,
  CREATE_INPUT: handleCreateInput,
  CREATE_CARD: handleCreateCard,
  CREATE_UI_COMPONENT: handleCreateUIComponent,
  CREATE_KPI_CARD: handleCreateKPICard,
  CREATE_ICON: handleCreateIcon,
  LIST_ICONS: handleListIcons,

  // === Design Systems ===
  SET_THEME: handleSetTheme,
  SET_THEME_TOKENS: handleSetThemeTokens,
  CREATE_SHADCN_COMPONENT: handleCreateShadcnComponent,
  CREATE_APPLE_COMPONENT: handleCreateAppleComponent,
  CREATE_LIQUID_GLASS_COMPONENT: handleCreateLiquidGlassComponent,
  LIST_COMPONENTS: handleListComponents,
  GET_DESIGN_TOKENS: handleGetDesignTokens,

  // === Layout ===
  SET_AUTOLAYOUT: handleSetAutoLayout,
  SET_CONSTRAINTS: handleSetConstraints,
  SET_LAYOUT_SIZING: handleSetLayoutSizing,
  SET_LAYOUT_GRID: handleSetLayoutGrid,
  GET_LAYOUT_GRID: handleGetLayoutGrid,
  REORDER_CHILDREN: handleReorderChildren,

  // === Styling ===
  SET_FILL: handleSetFill,
  SET_STROKE: handleSetStroke,
  SET_EFFECTS: handleSetEffects,
  SET_OPACITY: handleSetOpacity,
  SET_BLEND_MODE: handleSetBlendMode,
  SET_CORNER_RADIUS: handleSetCornerRadius,

  // === Transform ===
  SET_ROTATION: handleSetRotation,
  SET_TRANSFORM: handleSetTransform,
  SCALE_NODE: handleScaleNode,
  SET_POSITION: handleSetPosition,
  RESIZE_NODE: handleResizeNode,

  // === Node Operations ===
  DELETE_NODE: handleDeleteNode,
  CLONE_NODE: handleCloneNode,
  MODIFY_NODE: handleModifyNode,
  MOVE_TO_PARENT: handleMoveToParent,
  APPEND_CHILD: handleAppendChild,
  CREATE_GROUP: handleCreateGroup,
  UNGROUP: handleUngroup,
  FLATTEN_NODE: handleFlattenNode,
  SET_VISIBILITY: handleSetVisibility,
  SET_LOCKED: handleSetLocked,

  // === Components ===
  CREATE_COMPONENT: handleCreateComponent,
  CREATE_COMPONENT_INSTANCE: handleCreateComponentInstance,
  GET_LOCAL_COMPONENTS: handleGetLocalComponents,
  REGISTER_COMPONENT: handleRegisterComponent,

  // === Component Slots ===
  REGISTER_COMPONENT_SLOT: handleRegisterComponentSlot,
  CREATE_FROM_SLOT: handleCreateFromSlot,
  LIST_COMPONENT_SLOTS: handleListComponentSlots,

  // === Boolean & Mask ===
  BOOLEAN_OPERATION: handleBooleanOperation,
  CREATE_MASK: handleCreateMask,
  SET_MASK: handleSetMask,

  // === Image & Video ===
  CREATE_IMAGE: handleCreateImage,
  SET_IMAGE_FILL: handleSetImageFill,
  CREATE_VIDEO: handleCreateVideo,
  SET_VIDEO_FILL: handleSetVideoFill,
  CREATE_LINK_PREVIEW: handleCreateLinkPreview,
  SET_VECTOR_PATHS: handleSetVectorPaths,

  // === Styles ===
  GET_LOCAL_STYLES: handleGetLocalStyles,
  CREATE_PAINT_STYLE: handleCreatePaintStyle,
  CREATE_TEXT_STYLE: handleCreateTextStyle,
  CREATE_EFFECT_STYLE: handleCreateEffectStyle,
  APPLY_STYLE: handleApplyStyle,

  // === Variables ===
  GET_LOCAL_VARIABLES: handleGetLocalVariables,
  GET_VARIABLE_COLLECTIONS: handleGetVariableCollections,
  CREATE_VARIABLE: handleCreateVariable,
  CREATE_VARIABLE_COLLECTION: handleCreateVariableCollection,
  BIND_VARIABLE: handleBindVariable,

  // === Query & Selection ===
  GET_SELECTION: handleGetSelection,
  SELECT_NODES: handleSelectNodes,
  FIND_NODES: handleFindNodes,
  FIND_CHILDREN: handleFindChildren,
  GET_NODE_INFO: handleGetNodeInfo,
  GET_PAGE_INFO: handleGetPageInfo,

  // === Plugin Data ===
  SET_PLUGIN_DATA: handleSetPluginData,
  GET_PLUGIN_DATA: handleGetPluginData,
  GET_ALL_PLUGIN_DATA: handleGetAllPluginData,
  DELETE_PLUGIN_DATA: handleDeletePluginData,

  // === Shared Plugin Data ===
  SET_SHARED_PLUGIN_DATA: handleSetSharedPluginData,
  GET_SHARED_PLUGIN_DATA: handleGetSharedPluginData,
  GET_SHARED_PLUGIN_DATA_KEYS: handleGetSharedPluginDataKeys,

  // === Client Storage ===
  CLIENT_STORAGE_SET: handleClientStorageSet,
  CLIENT_STORAGE_GET: handleClientStorageGet,
  CLIENT_STORAGE_DELETE: handleClientStorageDelete,
  CLIENT_STORAGE_KEYS: handleClientStorageKeys,

  // === Viewport ===
  GET_VIEWPORT: handleGetViewport,
  SET_VIEWPORT: handleSetViewport,
  SCROLL_TO_NODE: handleScrollToNode,
  ZOOM_TO_FIT: handleZoomToFit,
  ZOOM_TO_SELECTION: handleZoomToSelection,

  // === Page Management ===
  GET_CURRENT_PAGE: handleGetCurrentPage,
  SET_CURRENT_PAGE: handleSetCurrentPage,
  CREATE_PAGE: handleCreatePage,
  GET_ALL_PAGES: handleGetAllPages,

  // === Editor Info ===
  GET_EDITOR_TYPE: handleGetEditorType,
  GET_MODE: handleGetMode,

  // === Layout Linting ===
  LINT_LAYOUT: handleLintLayout,

  // === Smart Layout ===
  SMART_LAYOUT: handleSmartLayout,

  // === Variant Generator ===
  GENERATE_VARIANTS: handleGenerateVariants,

  // === Visual Debug Mode ===
  TOGGLE_DEBUG_MODE: handleToggleDebugMode,
  GET_DEBUG_INFO: handleGetDebugInfo,

  // === Export ===
  EXPORT_NODE: handleExportNode,
  EXPORT_MULTIPLE: handleExportMultiple,

  // === Hierarchy Validation ===
  VALIDATE_HIERARCHY: handleValidateHierarchy,
};

// ============================================================================
// Command Handler
// ============================================================================

async function handleCommand(command: Command): Promise<Record<string, unknown>> {
  const { action, params } = command;

  // DEBUG: Log incoming params for specific actions
  if (action === "CREATE_FRAME" || action === "CREATE_TEXT" || action === "CREATE_ICON") {
    console.log(`[DEBUG] ${action} params:`, JSON.stringify(params, null, 2));
  }

  // Get handler from map
  const handler = commandHandlers[action];

  if (!handler) {
    throw new Error(`Unknown action: ${action}`);
  }

  // Call handler (with or without params)
  return await (handler as CommandHandler)(params);
}

// ============================================================================
// UI Message Handler
// ============================================================================

figma.ui.onmessage = async (msg: { type: string; data?: unknown; id?: string }) => {
  console.log("[Plugin] Received message:", msg.type);

  // Handle PING for health check
  if (msg.type === "PING") {
    console.log("[Plugin] Responding to PING");
    figma.ui.postMessage({
      type: "PONG",
      id: msg.id,
      success: true,
      timestamp: Date.now(),
    });
    return;
  }

  if (msg.type === "COMMAND" && msg.data) {
    const command = msg.data as Command;
    console.log("[Plugin] Processing command:", command.action);
    try {
      const result = await handleCommand(command);
      console.log("[Plugin] Command success:", command.action);
      figma.ui.postMessage({
        type: "RESPONSE",
        id: command.id,
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("[Plugin] Command error:", error);
      figma.ui.postMessage({
        type: "RESPONSE",
        id: command.id,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (msg.type === "CLOSE") {
    figma.closePlugin();
  }
};

// ============================================================================
// Plugin Ready Notification
// ============================================================================

figma.notify("AI Design Assistant v2 ready!", { timeout: 3000 });
