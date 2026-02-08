// figma-plugin/src/handlers/index.ts
/**
 * Handlers Index Module
 *
 * Central barrel export for all handler modules.
 * Provides clean imports for code.ts orchestrator.
 */

// ============================================================================
// Shapes Handlers
// ============================================================================

export {
  handleCreateFrame,
  handleCreateRectangle,
  handleCreateEllipse,
  handleCreateLine,
  handleCreatePolygon,
  handleCreateStar,
  handleCreateVector,
  handleSetVectorPaths,
} from "./shapes";

// ============================================================================
// Text Handlers
// ============================================================================

export { handleCreateText, handleSetTextContent, handleListAvailableFonts } from "./text";

// ============================================================================
// UI Components Handlers
// ============================================================================

export {
  handleCreateButton,
  handleCreateInput,
  handleCreateCard,
  handleCreateKPICard,
  handleCreateUIComponent,
  handleCreateIcon,
  handleListIcons,
} from "./components";

// ============================================================================
// Design System Handlers
// ============================================================================

export {
  handleSetTheme,
  handleSetThemeTokens,
  handleCreateShadcnComponent,
  handleCreateAppleComponent,
  handleCreateLiquidGlassComponent,
  handleListComponents,
  handleGetDesignTokens,
} from "./design-system";

// ============================================================================
// Layout Handlers
// ============================================================================

export {
  handleSetAutoLayout,
  handleSetConstraints,
  handleSetLayoutSizing,
  handleSetLayoutGrid,
  handleGetLayoutGrid,
  handleReorderChildren,
  handleLintLayout,
} from "./layout";

// ============================================================================
// Smart Layout Handlers
// ============================================================================

export { handleSmartLayout } from "./smart-layout";

// ============================================================================
// Variant Generator Handlers
// ============================================================================

export { handleGenerateVariants } from "./variant-generator";

// ============================================================================
// Styling Handlers
// ============================================================================

export {
  handleSetFill,
  handleSetEffects,
  handleSetOpacity,
  handleSetStroke,
  handleSetCornerRadius,
  handleSetBlendMode,
} from "./styling";

// ============================================================================
// Transform Handlers
// ============================================================================

export {
  handleResizeNode,
  handleSetPosition,
  handleSetRotation,
  handleSetTransform,
  handleScaleNode,
} from "./transform";

// ============================================================================
// Manipulation Handlers
// ============================================================================

export {
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
} from "./manipulation";

// ============================================================================
// Component Library Handlers
// ============================================================================

export {
  handleCreateComponent,
  handleCreateComponentInstance,
  handleGetLocalComponents,
  handleRegisterComponent,
  handleRegisterComponentSlot,
  handleCreateFromSlot,
  handleListComponentSlots,
} from "./component-lib";

// ============================================================================
// Media Handlers
// ============================================================================

export {
  handleCreateImage,
  handleSetImageFill,
  handleCreateVideo,
  handleSetVideoFill,
  handleCreateLinkPreview,
} from "./media";

// ============================================================================
// Styles Handlers
// ============================================================================

export {
  handleGetLocalStyles,
  handleCreatePaintStyle,
  handleCreateTextStyle,
  handleCreateEffectStyle,
  handleApplyStyle,
} from "./styles";

// ============================================================================
// Variables Handlers
// ============================================================================

export {
  handleGetLocalVariables,
  handleGetVariableCollections,
  handleCreateVariable,
  handleCreateVariableCollection,
  handleBindVariable,
} from "./variables";

// ============================================================================
// Query Handlers
// ============================================================================

export {
  handleGetSelection,
  handleSelectNodes,
  handleGetNodeInfo,
  handleGetPageInfo,
  handleFindNodes,
  handleFindChildren,
} from "./query";

// ============================================================================
// Data Storage Handlers
// ============================================================================

export {
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
} from "./data";

// ============================================================================
// Viewport Handlers
// ============================================================================

export {
  handleGetViewport,
  handleSetViewport,
  handleScrollToNode,
  handleZoomToFit,
  handleZoomToSelection,
} from "./viewport";

// ============================================================================
// Pages Handlers
// ============================================================================

export {
  handleGetCurrentPage,
  handleSetCurrentPage,
  handleCreatePage,
  handleGetAllPages,
} from "./pages";

// ============================================================================
// Editor Handlers
// ============================================================================

export { handleGetEditorType, handleGetMode } from "./editor";

// ============================================================================
// Debug Handlers
// ============================================================================

export {
  handleToggleDebugMode,
  handleGetDebugInfo,
  isDebugModeEnabled,
  getDebugOverlayCount,
} from "./debug";

// ============================================================================
// Export Handlers
// ============================================================================

export {
  handleExportNode,
  handleExportMultiple,
} from "./export";

// ============================================================================
// Hierarchy Validator Handlers
// ============================================================================

export { handleValidateHierarchy } from "./hierarchy-validator";

// ============================================================================
// Screen Renderer Handlers
// ============================================================================

export { handleCreateScreen } from "./screen-renderer";

// ============================================================================
// Style Initializer Handlers
// ============================================================================

export { initializeDesignStyles } from "./style-initializer";

// ============================================================================
// Screen Componentizer Handlers
// ============================================================================

export { handleComponentizeScreen } from "./screen-componentizer";

// ============================================================================
// Utils Re-export (for convenience)
// ============================================================================

export * from "./utils";
