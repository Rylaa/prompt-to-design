/**
 * Zod Schemas for Figma Design Commands
 */

import { z } from "zod";

// Import and re-export base schemas (primitives)
import {
  RGBColorSchema,
  HexColorSchema,
  ColorSchema,
  GradientStopSchema,
  GradientSchema,
  FillSchema,
  ShadowSchema,
  BlurSchema,
  EffectSchema,
  AutoLayoutSchema,
  ConstraintsSchema,
  TextStyleSchema,
  StrokeSchema,
  PositionSchema,
  ParentSchema,
  EmptyInputSchema,
} from "./base.js";

export {
  RGBColorSchema,
  HexColorSchema,
  ColorSchema,
  GradientStopSchema,
  GradientSchema,
  FillSchema,
  ShadowSchema,
  BlurSchema,
  EffectSchema,
  AutoLayoutSchema,
  ConstraintsSchema,
  TextStyleSchema,
  StrokeSchema,
  PositionSchema,
  ParentSchema,
  EmptyInputSchema,
};

// ============================================================================
// Tool Input Schemas
// ============================================================================

export const CreateFrameInputSchema = z.object({
  name: z.string().optional().default("Frame"),
  width: z.number().min(1).optional().default(400),
  height: z.number().min(1).optional().default(300),
  x: z.number().optional(),
  y: z.number().optional(),
  parentId: z.string().optional().describe("Parent frame to add element to"),
  fill: FillSchema.optional(),
  stroke: StrokeSchema.optional(),
  cornerRadius: z.number().min(0).optional(),
  autoLayout: AutoLayoutSchema.optional(),
  effects: z.array(EffectSchema).optional(),
  layoutSizingHorizontal: z.enum(["FIXED", "HUG", "FILL"]).optional().describe("Horizontal sizing mode when inside Auto Layout parent"),
  layoutSizingVertical: z.enum(["FIXED", "HUG", "FILL"]).optional().describe("Vertical sizing mode when inside Auto Layout parent"),
}).strict();

export const CreateRectangleInputSchema = z.object({
  name: z.string().optional().default("Rectangle"),
  width: z.number().min(1).optional().default(100),
  height: z.number().min(1).optional().default(100),
  x: z.number().optional(),
  y: z.number().optional(),
  parentId: z.string().optional().describe("Parent frame to add element to"),
  fill: FillSchema.optional(),
  stroke: StrokeSchema.optional(),
  cornerRadius: z.number().min(0).optional(),
  effects: z.array(EffectSchema).optional(),
}).strict();

export const CreateEllipseInputSchema = z.object({
  name: z.string().optional().default("Ellipse"),
  width: z.number().min(1).optional().default(100),
  height: z.number().min(1).optional().default(100),
  x: z.number().optional(),
  y: z.number().optional(),
  parentId: z.string().optional().describe("Parent frame to add element to"),
  fill: FillSchema.optional(),
  effects: z.array(EffectSchema).optional(),
}).strict();

export const CreateTextInputSchema = z.object({
  content: z.string().describe("Text content"),
  name: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  parentId: z.string().optional().describe("Parent frame to add element to"),
  width: z.number().min(1).optional(),
  style: TextStyleSchema.optional(),
  fill: FillSchema.optional(),
}).strict();

export const CreateButtonInputSchema = z.object({
  text: z.string().optional().default("Button"),
  name: z.string().optional(),
  parentId: z.string().optional().describe("Parent frame to add element to"),
  variant: z.enum(["primary", "secondary", "outline", "ghost"]).optional().default("primary"),
  size: z.enum(["sm", "md", "lg"]).optional().default("md"),
  fill: FillSchema.optional(),
  textColor: ColorSchema.optional(),
  cornerRadius: z.number().min(0).optional(),
  paddingX: z.number().min(0).optional(),
  paddingY: z.number().min(0).optional(),
  fullWidth: z.boolean().optional().default(false),
}).strict();

export const CreateInputInputSchema = z.object({
  placeholder: z.string().optional().default("Enter text..."),
  label: z.string().optional(),
  name: z.string().optional(),
  parentId: z.string().optional().describe("Parent frame to add element to"),
  width: z.number().min(1).optional().default(280),
  variant: z.enum(["default", "filled", "outline"]).optional().default("outline"),
}).strict();

export const CreateCardInputSchema = z.object({
  name: z.string().optional().default("Card"),
  width: z.number().min(1).optional().default(320),
  height: z.number().min(1).optional(),
  parentId: z.string().optional().describe("Parent frame to add element to"),
  padding: z.number().min(0).optional().default(24),
  cornerRadius: z.number().min(0).optional().default(12),
  fill: FillSchema.optional(),
  shadow: z.boolean().optional().default(true),
  children: z.array(z.record(z.unknown())).optional(),
}).strict();

export const SetAutoLayoutInputSchema = z.object({
  nodeId: z.string().describe("Target node ID"),
  layout: AutoLayoutSchema,
}).strict();

export const SetFillInputSchema = z.object({
  nodeId: z.string().describe("Target node ID"),
  fill: FillSchema,
}).strict();

export const SetEffectsInputSchema = z.object({
  nodeId: z.string().describe("Target node ID"),
  effects: z.array(EffectSchema),
}).strict();

export const ModifyNodeInputSchema = z.object({
  nodeId: z.string().describe("Target node ID"),
  properties: z.record(z.unknown()).describe("Properties to modify"),
}).strict();

export const CreateComponentInputSchema = z.object({
  nodeId: z.string().optional().describe("Node ID to convert to component"),
  name: z.string().optional(),
}).strict();

export const GetSelectionInputSchema = z.object({}).strict();

export const AppendChildInputSchema = z.object({
  parentId: z.string().describe("Parent node ID"),
  childType: z.enum(["frame", "rectangle", "ellipse", "text"]),
  properties: z.record(z.unknown()).optional(),
}).strict();

// ============================================================================
// Component Library Schemas
// ============================================================================

export const CreateComponentInstanceInputSchema = z.object({
  componentKey: z.string().optional().describe("Component library key (e.g., 'Button/primary')"),
  componentId: z.string().optional().describe("Component node ID"),
  parentId: z.string().optional().describe("Parent frame to add instance to"),
  x: z.number().optional(),
  y: z.number().optional(),
  name: z.string().optional(),
}).strict();

export const GetLocalComponentsInputSchema = z.object({}).strict();

export const RegisterComponentInputSchema = z.object({
  nodeId: z.string().describe("Component node ID to register"),
  libraryKey: z.string().describe("Key to register component under (e.g., 'MyButton')"),
}).strict();

export const CreateUIComponentInputSchema = z.object({
  type: z.enum([
    "button", "input", "card", "avatar", "badge",
    "icon-button", "checkbox", "toggle", "tab", "nav-item"
  ]).describe("Type of UI component to create"),
  variant: z.string().optional().default("default").describe("Component variant (e.g., 'primary', 'checked', 'active')"),
  parentId: z.string().optional().describe("Parent frame to add component to"),
  text: z.string().optional().describe("Text content for button, badge, tab, nav-item"),
  placeholder: z.string().optional().describe("Placeholder text for input"),
  icon: z.string().optional().describe("Icon character for icon-button, nav-item"),
  label: z.string().optional().describe("Label for checkbox"),
  initials: z.string().optional().describe("Initials for avatar"),
  width: z.number().optional().describe("Width for card"),
}).strict();

// ============================================================================
// Component Library Schemas - Extended
// ============================================================================

export const ThemeSchema = z.enum(["light", "dark"]).default("light");

export const SetThemeInputSchema = z.object({
  theme: ThemeSchema.describe("Theme to apply globally"),
  platform: z.enum(["shadcn", "ios", "macos", "liquid-glass"]).optional().describe("Platform for theme colors"),
}).strict();

export const SetThemeTokensInputSchema = z.object({
  colors: z.record(HexColorSchema).describe("Map of color token names to hex values (e.g., { background: '#000000', primary: '#FF0000' })"),
}).strict();

export const CreateShadcnComponentInputSchema = z.object({
  component: z.enum([
    "button", "input", "textarea", "card", "badge", "avatar", "avatar-group",
    "checkbox", "radio", "switch", "progress", "slider", "skeleton",
    "alert", "toast", "tabs", "separator", "dialog", "sheet",
    "select", "dropdown-menu", "tooltip", "popover", "table", "data-table", "accordion", "collapsible",
    "breadcrumb", "pagination"
  ]).describe("shadcn component to create"),
  variant: z.string().optional().describe("Component variant (e.g., 'default', 'destructive', 'outline')"),
  size: z.enum(["sm", "default", "lg", "icon"]).optional().describe("Component size"),
  theme: ThemeSchema.optional(),
  parentId: z.string().optional().describe("Parent frame to add component to"),
  // Component-specific options
  text: z.string().optional().describe("Text content for button, badge, alert"),
  placeholder: z.string().optional().describe("Placeholder for input, textarea"),
  label: z.string().optional().describe("Label for checkbox, radio, switch"),
  checked: z.boolean().optional().describe("Checked state for checkbox, radio, switch"),
  value: z.number().optional().describe("Value for progress, slider (0-100)"),
  title: z.string().optional().describe("Title for alert, dialog, card"),
  description: z.string().optional().describe("Description for alert, dialog"),
  initials: z.string().optional().describe("Initials for avatar"),
  items: z.array(z.string()).optional().describe("Items for tabs, avatar-group"),
  activeIndex: z.number().optional().describe("Active tab index"),
  width: z.number().optional().describe("Width for card, dialog, sheet"),
  height: z.number().optional().describe("Height for textarea, skeleton"),
}).strict();

export const CreateAppleComponentInputSchema = z.object({
  platform: z.enum(["ios", "macos"]).describe("Apple platform"),
  component: z.string().describe("Component name (e.g., 'button', 'navigation-bar', 'window')"),
  variant: z.string().optional().describe("Component variant"),
  theme: ThemeSchema.optional(),
  parentId: z.string().optional().describe("Parent frame to add component to"),
  // iOS-specific options
  text: z.string().optional().describe("Text for button, cell"),
  title: z.string().optional().describe("Title for navigation-bar, window"),
  style: z.string().optional().describe("Style variant (e.g., 'filled', 'tinted' for iOS button)"),
  items: z.array(z.object({
    icon: z.string(),
    label: z.string(),
    badge: z.number().optional(),
  })).optional().describe("Items for tab-bar"),
  cells: z.array(z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    value: z.string().optional(),
    hasChevron: z.boolean().optional(),
  })).optional().describe("Cells for iOS list"),
  // macOS-specific options
  hasToolbar: z.boolean().optional().describe("Include toolbar for macOS window"),
  hasSidebar: z.boolean().optional().describe("Include sidebar for macOS window"),
  sidebarItems: z.array(z.string()).optional().describe("Sidebar items for macOS window"),
  isDefault: z.boolean().optional().describe("Default button style for macOS"),
  width: z.number().optional().describe("Width for window, text-field"),
  height: z.number().optional().describe("Height for window"),
}).strict();

export const CreateLiquidGlassComponentInputSchema = z.object({
  component: z.enum([
    "button", "tab-bar", "navigation-bar", "card", "toggle",
    "sidebar", "floating-panel", "modal", "search-bar", "toolbar"
  ]).describe("Liquid Glass component to create"),
  variant: z.string().optional().describe("Component variant (e.g., 'primary', 'secondary')"),
  theme: ThemeSchema.optional(),
  parentId: z.string().optional().describe("Parent frame to add component to"),
  // Component-specific options
  text: z.string().optional().describe("Text content for button, navigation title"),
  title: z.string().optional().describe("Title for navigation-bar, modal"),
  size: z.enum(["small", "medium", "large"]).optional().describe("Component size"),
  material: z.enum(["thin", "regular", "thick", "ultraThin"]).optional().describe("Glass material thickness"),
  tint: z.string().optional().describe("Accent tint color (hex)"),
  items: z.array(z.object({
    icon: z.string(),
    label: z.string(),
    badge: z.number().optional(),
  })).optional().describe("Items for tab-bar, toolbar"),
  width: z.number().optional().describe("Width for card, modal, panel"),
  height: z.number().optional().describe("Height for card, modal, panel"),
  checked: z.boolean().optional().describe("Checked state for toggle"),
  showBackButton: z.boolean().optional().describe("Show back button in navigation-bar"),
}).strict();

export const ListComponentsInputSchema = z.object({
  library: z.enum(["shadcn", "ios", "macos", "liquid-glass"]).optional().describe("Filter by library (omit for all)"),
}).strict();

export const GetDesignTokensInputSchema = z.object({
  category: z.enum(["colors", "spacing", "typography", "shadows"]).optional().describe("Token category (omit for all)"),
  theme: ThemeSchema.optional(),
  platform: z.enum(["shadcn", "ios", "macos", "liquid-glass"]).optional(),
}).strict();

// ============================================================================
// Dashboard Blueprint Components
// ============================================================================

export const KPICardInputSchema = z.object({
  title: z.string().describe("Card title (e.g., 'Total Revenue')"),
  value: z.string().describe("Main value to display (e.g., '$45,231.89')"),
  change: z.string().optional().describe("Change indicator (e.g., '+20.1% from last month')"),
  changeType: z.enum(["positive", "negative", "neutral"]).optional().default("neutral").describe("Type of change for styling"),
  icon: z.string().optional().describe("Lucide icon name (e.g., 'dollar-sign')"),
  width: z.number().min(1).optional().default(280).describe("Card width in pixels"),
  theme: ThemeSchema.optional().describe("Light or dark theme"),
  parentId: z.string().optional().describe("Parent frame to add card to"),
}).strict();

export type KPICardInput = z.infer<typeof KPICardInputSchema>;

// ============================================================================
// Component Registry Schemas (Slot Pattern)
// ============================================================================

export const RegisterComponentSlotInputSchema = z.object({
  nodeId: z.string().describe("Component or ComponentSet node ID"),
  slotKey: z.string().describe("Unique key for this component (e.g., 'Button/primary')"),
  variants: z.record(z.string(), z.string()).optional().describe("Variant name to node ID mapping"),
}).strict();

export type RegisterComponentSlotInput = z.infer<typeof RegisterComponentSlotInputSchema>;

export const CreateFromSlotInputSchema = z.object({
  slotKey: z.string().describe("Registered component slot key"),
  variant: z.string().optional().describe("Variant to use"),
  parentId: z.string().optional().describe("Parent frame to add instance to"),
  overrides: z.record(z.string(), z.unknown()).optional().describe("Property overrides (text, fills, etc.)"),
}).strict();

export type CreateFromSlotInput = z.infer<typeof CreateFromSlotInputSchema>;

export const ListComponentSlotsInputSchema = z.object({
  filter: z.string().optional().describe("Filter by slot key prefix"),
}).strict();

export type ListComponentSlotsInput = z.infer<typeof ListComponentSlotsInputSchema>;

// ============================================================================
// Lucide Icon Schemas
// ============================================================================

export const CreateIconInputSchema = z.object({
  name: z.string().describe("Lucide icon name (e.g., 'chevron-left', 'user', 'search', 'home')"),
  size: z.number().min(1).optional().default(24).describe("Icon size in pixels (default: 24)"),
  color: HexColorSchema.optional().default("#000000").describe("Icon stroke color (hex)"),
  parentId: z.string().optional().describe("Parent frame to add icon to"),
  x: z.number().optional().describe("X position"),
  y: z.number().optional().describe("Y position"),
}).strict();

export const ListIconsInputSchema = z.object({}).strict();

// ============================================================================
// Node Manipulation Schemas (Missing from MCP)
// ============================================================================

export const DeleteNodeInputSchema = z.object({
  nodeId: z.string().describe("ID of the node to delete"),
}).strict();

export const CloneNodeInputSchema = z.object({
  nodeId: z.string().describe("ID of the node to clone"),
  x: z.number().optional().describe("X position for the clone"),
  y: z.number().optional().describe("Y position for the clone"),
  name: z.string().optional().describe("Name for the clone"),
}).strict();

export const MoveNodeInputSchema = z.object({
  nodeId: z.string().describe("ID of the node to move"),
  newParentId: z.string().describe("ID of the new parent frame"),
  index: z.number().optional().describe("Position index within the new parent (0 = first)"),
}).strict();

export const ResizeNodeInputSchema = z.object({
  nodeId: z.string().describe("ID of the node to resize"),
  width: z.number().min(1).describe("New width in pixels"),
  height: z.number().min(1).describe("New height in pixels"),
}).strict();

export const SetPositionInputSchema = z.object({
  nodeId: z.string().describe("ID of the node to position"),
  x: z.number().describe("X coordinate"),
  y: z.number().describe("Y coordinate"),
}).strict();

export const SetLayoutSizingInputSchema = z.object({
  nodeId: z.string().describe("ID of the node (must be child of auto-layout frame)"),
  horizontal: z.enum(["FIXED", "HUG", "FILL"]).optional().describe("Horizontal sizing mode"),
  vertical: z.enum(["FIXED", "HUG", "FILL"]).optional().describe("Vertical sizing mode"),
}).strict();

export const GetNodeInfoInputSchema = z.object({
  nodeId: z.string().describe("ID of the node to get info for"),
}).strict();

export const SetConstraintsInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
  horizontal: z.enum(["MIN", "CENTER", "MAX", "STRETCH", "SCALE"]).optional(),
  vertical: z.enum(["MIN", "CENTER", "MAX", "STRETCH", "SCALE"]).optional(),
}).strict();

export const ReorderChildrenInputSchema = z.object({
  parentId: z.string().describe("ID of the parent frame"),
  childId: z.string().describe("ID of the child to reorder"),
  newIndex: z.number().describe("New index position (0 = first/bottom, higher = top)"),
}).strict();

export const SetVisibilityInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
  visible: z.boolean().describe("Whether the node should be visible"),
}).strict();

export const SetOpacityInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
  opacity: z.number().min(0).max(1).describe("Opacity value (0-1)"),
}).strict();

export const SetStrokeInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
  color: ColorSchema.describe("Stroke color"),
  weight: z.number().min(0).optional().default(1).describe("Stroke weight"),
  align: z.enum(["INSIDE", "OUTSIDE", "CENTER"]).optional().default("INSIDE"),
}).strict();

export const CreateLineInputSchema = z.object({
  name: z.string().optional().default("Line"),
  startX: z.number().describe("Start X coordinate"),
  startY: z.number().describe("Start Y coordinate"),
  endX: z.number().describe("End X coordinate"),
  endY: z.number().describe("End Y coordinate"),
  parentId: z.string().optional().describe("Parent frame to add line to"),
  stroke: StrokeSchema.optional(),
}).strict();

export const CreateGroupInputSchema = z.object({
  nodeIds: z.array(z.string()).min(1).describe("IDs of nodes to group"),
  name: z.string().optional().default("Group"),
}).strict();

export const SetTextContentInputSchema = z.object({
  nodeId: z.string().describe("ID of the text node"),
  content: z.string().describe("New text content"),
}).strict();

export const SetCornerRadiusInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
  radius: z.number().min(0).describe("Corner radius value"),
  topLeft: z.number().min(0).optional().describe("Top-left corner radius"),
  topRight: z.number().min(0).optional().describe("Top-right corner radius"),
  bottomRight: z.number().min(0).optional().describe("Bottom-right corner radius"),
  bottomLeft: z.number().min(0).optional().describe("Bottom-left corner radius"),
}).strict();

export const GetPageInfoInputSchema = z.object({}).strict();

export const SelectNodesInputSchema = z.object({
  nodeIds: z.array(z.string()).describe("IDs of nodes to select"),
}).strict();

// ============================================================================
// Boolean Operations Schemas
// ============================================================================

export const BooleanOperationInputSchema = z.object({
  nodeIds: z.array(z.string()).min(2).describe("IDs of nodes to combine (minimum 2)"),
  operation: z.enum(["UNION", "SUBTRACT", "INTERSECT", "EXCLUDE"]).describe("Boolean operation type"),
  name: z.string().optional().default("Boolean").describe("Name for the resulting node"),
}).strict();

// ============================================================================
// Image Handling Schemas
// ============================================================================

export const CreateImageInputSchema = z.object({
  imageData: z.string().describe("Base64 encoded image data (without data:image prefix)"),
  name: z.string().optional().default("Image"),
  width: z.number().min(1).optional().describe("Target width (maintains aspect ratio if only one dimension)"),
  height: z.number().min(1).optional().describe("Target height"),
  x: z.number().optional(),
  y: z.number().optional(),
  parentId: z.string().optional().describe("Parent frame to add image to"),
}).strict();

export const SetImageFillInputSchema = z.object({
  nodeId: z.string().describe("ID of the node to fill with image"),
  imageData: z.string().describe("Base64 encoded image data"),
  scaleMode: z.enum(["FILL", "FIT", "CROP", "TILE"]).optional().default("FILL"),
  opacity: z.number().min(0).max(1).optional().default(1),
}).strict();

// ============================================================================
// Vector Operations Schemas
// ============================================================================

export const CreateVectorInputSchema = z.object({
  name: z.string().optional().default("Vector"),
  paths: z.array(z.object({
    data: z.string().describe("SVG path data (d attribute)"),
    windingRule: z.enum(["EVENODD", "NONZERO"]).optional().default("NONZERO"),
  })).min(1).describe("Array of path data"),
  x: z.number().optional(),
  y: z.number().optional(),
  parentId: z.string().optional(),
  fill: FillSchema.optional(),
  stroke: StrokeSchema.optional(),
}).strict();

export const SetVectorPathsInputSchema = z.object({
  nodeId: z.string().describe("ID of the vector node"),
  paths: z.array(z.object({
    data: z.string().describe("SVG path data"),
    windingRule: z.enum(["EVENODD", "NONZERO"]).optional(),
  })).min(1),
}).strict();

// ============================================================================
// Blend Mode Schemas
// ============================================================================

export const BlendModeSchema = z.enum([
  "PASS_THROUGH", "NORMAL", "DARKEN", "MULTIPLY", "LINEAR_BURN", "COLOR_BURN",
  "LIGHTEN", "SCREEN", "LINEAR_DODGE", "COLOR_DODGE", "OVERLAY", "SOFT_LIGHT",
  "HARD_LIGHT", "DIFFERENCE", "EXCLUSION", "HUE", "SATURATION", "COLOR", "LUMINOSITY"
]);

export const SetBlendModeInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
  blendMode: BlendModeSchema.describe("Blend mode to apply"),
}).strict();

// ============================================================================
// Style System Schemas
// ============================================================================

export const GetLocalStylesInputSchema = z.object({
  type: z.enum(["PAINT", "TEXT", "EFFECT", "GRID"]).optional().describe("Filter by style type (omit for all)"),
}).strict();

export const CreatePaintStyleInputSchema = z.object({
  name: z.string().describe("Style name (use / for folders, e.g., 'Colors/Primary')"),
  paint: FillSchema.describe("Paint definition"),
  description: z.string().optional(),
}).strict();

export const CreateTextStyleInputSchema = z.object({
  name: z.string().describe("Style name"),
  fontFamily: z.string().default("Inter"),
  fontSize: z.number().min(1).default(16),
  fontWeight: z.number().min(100).max(900).default(400),
  lineHeight: z.union([z.number(), z.object({ value: z.number(), unit: z.enum(["PIXELS", "PERCENT", "AUTO"]) })]).optional(),
  letterSpacing: z.union([z.number(), z.object({ value: z.number(), unit: z.enum(["PIXELS", "PERCENT"]) })]).optional(),
  textCase: z.enum(["ORIGINAL", "UPPER", "LOWER", "TITLE"]).optional(),
  textDecoration: z.enum(["NONE", "UNDERLINE", "STRIKETHROUGH"]).optional(),
  description: z.string().optional(),
}).strict();

export const CreateEffectStyleInputSchema = z.object({
  name: z.string().describe("Style name"),
  effects: z.array(EffectSchema).min(1),
  description: z.string().optional(),
}).strict();

export const ApplyStyleInputSchema = z.object({
  nodeId: z.string().describe("ID of the node to apply style to"),
  styleId: z.string().describe("ID of the style to apply"),
  styleType: z.enum(["PAINT", "TEXT", "EFFECT"]).describe("Type of style"),
}).strict();

// ============================================================================
// Variables API Schemas (Figma Variables)
// ============================================================================

export const GetLocalVariablesInputSchema = z.object({
  collectionId: z.string().optional().describe("Filter by collection ID"),
  resolvedType: z.enum(["BOOLEAN", "FLOAT", "STRING", "COLOR"]).optional().describe("Filter by variable type"),
}).strict();

export const GetVariableCollectionsInputSchema = z.object({}).strict();

export const CreateVariableInputSchema = z.object({
  collectionId: z.string().describe("ID of the variable collection"),
  name: z.string().describe("Variable name"),
  resolvedType: z.enum(["BOOLEAN", "FLOAT", "STRING", "COLOR"]).describe("Variable type"),
  value: z.union([z.boolean(), z.number(), z.string(), z.object({
    r: z.number().min(0).max(1),
    g: z.number().min(0).max(1),
    b: z.number().min(0).max(1),
    a: z.number().min(0).max(1).optional(),
  })]).describe("Variable value"),
  modeId: z.string().optional().describe("Mode ID for the value"),
  description: z.string().optional(),
}).strict();

export const CreateVariableCollectionInputSchema = z.object({
  name: z.string().describe("Collection name"),
  modes: z.array(z.string()).optional().describe("Mode names (default: ['Mode 1'])"),
}).strict();

export const BindVariableInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
  field: z.string().describe("Field to bind (e.g., 'fills', 'opacity', 'width')"),
  variableId: z.string().describe("ID of the variable to bind"),
}).strict();

// ============================================================================
// Export Schemas
// ============================================================================

export const ExportNodeInputSchema = z.object({
  nodeId: z.string().describe("ID of the node to export"),
  format: z.enum(["PNG", "JPG", "SVG", "PDF"]).default("PNG"),
  scale: z.number().min(0.01).max(4).optional().default(1).describe("Export scale (1x, 2x, etc.)"),
  quality: z.number().min(0).max(100).optional().describe("Quality for JPG (0-100)"),
  contentsOnly: z.boolean().optional().default(true).describe("Export contents without frame background"),
}).strict();

export const ExportMultipleInputSchema = z.object({
  nodeIds: z.array(z.string()).min(1).describe("IDs of nodes to export"),
  format: z.enum(["PNG", "JPG", "SVG", "PDF"]).default("PNG"),
  scale: z.number().min(0.01).max(4).optional().default(1),
}).strict();

// ============================================================================
// Hierarchy Validation Schemas
// ============================================================================

export const ValidateHierarchyInputSchema = z.object({
  nodeId: z.string().describe("Root node ID to validate"),
  rules: z.array(z.string()).optional().default(["MAX_NESTING_DEPTH", "NO_EMPTY_CONTAINERS", "NO_SINGLE_CHILD_WRAPPER", "NO_NESTED_INTERACTIVE"]),
  maxDepth: z.number().min(1).max(20).optional().default(10),
}).strict();

export type ValidateHierarchyInput = z.infer<typeof ValidateHierarchyInputSchema>;

// ============================================================================
// Transform Schemas
// ============================================================================

export const SetRotationInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
  rotation: z.number().describe("Rotation angle in degrees"),
}).strict();

export const SetTransformInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
  transform: z.tuple([
    z.tuple([z.number(), z.number(), z.number()]),
    z.tuple([z.number(), z.number(), z.number()]),
  ]).describe("2x3 transformation matrix [[a, b, tx], [c, d, ty]]"),
}).strict();

export const ScaleNodeInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
  scaleX: z.number().describe("Horizontal scale factor"),
  scaleY: z.number().optional().describe("Vertical scale factor (defaults to scaleX)"),
  origin: z.enum(["CENTER", "TOP_LEFT", "TOP_RIGHT", "BOTTOM_LEFT", "BOTTOM_RIGHT"]).optional().default("CENTER"),
}).strict();

// ============================================================================
// Mask Schemas
// ============================================================================

export const CreateMaskInputSchema = z.object({
  maskNodeId: z.string().describe("ID of the node to use as mask"),
  contentNodeIds: z.array(z.string()).min(1).describe("IDs of nodes to be masked"),
  name: z.string().optional().default("Masked Group"),
}).strict();

export const SetMaskInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
  isMask: z.boolean().describe("Whether the node should act as a mask"),
}).strict();

// ============================================================================
// Find/Query Schemas
// ============================================================================

export const FindNodesInputSchema = z.object({
  query: z.object({
    name: z.string().optional().describe("Match by name (supports regex with /pattern/)"),
    type: z.enum(["FRAME", "GROUP", "RECTANGLE", "ELLIPSE", "TEXT", "LINE", "VECTOR", "COMPONENT", "INSTANCE", "BOOLEAN_OPERATION"]).optional(),
    visible: z.boolean().optional(),
    locked: z.boolean().optional(),
  }).describe("Search criteria"),
  scope: z.enum(["PAGE", "SELECTION", "NODE"]).optional().default("PAGE").describe("Where to search"),
  scopeNodeId: z.string().optional().describe("Node ID if scope is NODE"),
  limit: z.number().min(1).max(1000).optional().default(100).describe("Maximum results"),
}).strict();

export const FindChildrenInputSchema = z.object({
  nodeId: z.string().describe("ID of the parent node"),
  query: z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    recursive: z.boolean().optional().default(false),
  }).optional(),
}).strict();

// ============================================================================
// Plugin Data Schemas
// ============================================================================

export const SetPluginDataInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
  key: z.string().describe("Data key"),
  value: z.string().describe("Data value (use JSON.stringify for objects)"),
}).strict();

export const GetPluginDataInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
  key: z.string().describe("Data key"),
}).strict();

export const GetAllPluginDataInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
}).strict();

export const DeletePluginDataInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
  key: z.string().describe("Data key to delete"),
}).strict();

// ============================================================================
// Layout Grid Schemas
// ============================================================================

export const SetLayoutGridInputSchema = z.object({
  nodeId: z.string().describe("ID of the frame"),
  grids: z.array(z.union([
    z.object({
      pattern: z.literal("COLUMNS"),
      count: z.number().min(1).optional(),
      gutterSize: z.number().min(0).optional(),
      offset: z.number().optional(),
      alignment: z.enum(["MIN", "CENTER", "MAX", "STRETCH"]).optional(),
      color: ColorSchema.optional(),
      visible: z.boolean().optional(),
    }),
    z.object({
      pattern: z.literal("ROWS"),
      count: z.number().min(1).optional(),
      gutterSize: z.number().min(0).optional(),
      offset: z.number().optional(),
      alignment: z.enum(["MIN", "CENTER", "MAX", "STRETCH"]).optional(),
      color: ColorSchema.optional(),
      visible: z.boolean().optional(),
    }),
    z.object({
      pattern: z.literal("GRID"),
      sectionSize: z.number().min(1).optional(),
      color: ColorSchema.optional(),
      visible: z.boolean().optional(),
    }),
  ])).describe("Array of layout grids"),
}).strict();

export const GetLayoutGridInputSchema = z.object({
  nodeId: z.string().describe("ID of the frame"),
}).strict();

// ============================================================================
// Additional Shapes Schemas
// ============================================================================

export const CreatePolygonInputSchema = z.object({
  name: z.string().optional().default("Polygon"),
  pointCount: z.number().min(3).max(100).default(6).describe("Number of points/sides"),
  width: z.number().min(1).default(100),
  height: z.number().min(1).default(100),
  x: z.number().optional(),
  y: z.number().optional(),
  parentId: z.string().optional(),
  fill: FillSchema.optional(),
  stroke: StrokeSchema.optional(),
}).strict();

export const CreateStarInputSchema = z.object({
  name: z.string().optional().default("Star"),
  pointCount: z.number().min(3).max(100).default(5).describe("Number of points"),
  innerRadius: z.number().min(0).max(1).default(0.4).describe("Inner radius ratio (0-1)"),
  width: z.number().min(1).default(100),
  height: z.number().min(1).default(100),
  x: z.number().optional(),
  y: z.number().optional(),
  parentId: z.string().optional(),
  fill: FillSchema.optional(),
  stroke: StrokeSchema.optional(),
}).strict();

// ============================================================================
// Flatten Schema
// ============================================================================

export const FlattenNodeInputSchema = z.object({
  nodeIds: z.array(z.string()).min(1).describe("IDs of nodes to flatten"),
  name: z.string().optional().default("Flattened"),
}).strict();

// ============================================================================
// Font Enumeration Schema
// ============================================================================

export const ListAvailableFontsInputSchema = z.object({
  filter: z.string().optional().describe("Filter fonts by name"),
}).strict();

// ============================================================================
// Ungroup Schema
// ============================================================================

export const UngroupInputSchema = z.object({
  nodeId: z.string().describe("ID of the group to ungroup"),
}).strict();

// ============================================================================
// Lock/Unlock Schema
// ============================================================================

export const SetLockedInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
  locked: z.boolean().describe("Whether to lock the node"),
}).strict();

// ============================================================================
// Prototype/Interactions Schemas
// ============================================================================

export const TriggerSchema = z.object({
  type: z.enum([
    "ON_CLICK",
    "ON_HOVER",
    "ON_PRESS",
    "ON_DRAG",
    "AFTER_TIMEOUT",
    "MOUSE_ENTER",
    "MOUSE_LEAVE",
    "MOUSE_UP",
    "MOUSE_DOWN",
    "ON_KEY_DOWN"
  ]).describe("Type of trigger"),
  timeout: z.number().optional().describe("Timeout in milliseconds (for AFTER_TIMEOUT)"),
  delay: z.number().optional().describe("Delay before action"),
  keyCodes: z.array(z.number()).optional().describe("Key codes (for ON_KEY_DOWN)"),
});

export const TransitionSchema = z.object({
  type: z.enum([
    "DISSOLVE",
    "SMART_ANIMATE",
    "MOVE_IN",
    "MOVE_OUT",
    "PUSH",
    "SLIDE_IN",
    "SLIDE_OUT",
    "SCROLL_ANIMATE"
  ]).describe("Transition type"),
  direction: z.enum(["LEFT", "RIGHT", "TOP", "BOTTOM"]).optional().describe("Direction for directional transitions"),
  duration: z.number().default(300).describe("Duration in milliseconds"),
  easing: z.enum([
    "LINEAR",
    "EASE_IN",
    "EASE_OUT",
    "EASE_IN_AND_OUT",
    "EASE_IN_BACK",
    "EASE_OUT_BACK",
    "EASE_IN_AND_OUT_BACK",
    "CUSTOM_BEZIER"
  ]).default("EASE_OUT").describe("Easing function"),
  customBezier: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional().describe("Custom bezier curve"),
});

export const NavigationSchema = z.enum([
  "NAVIGATE",
  "SWAP",
  "OVERLAY",
  "SCROLL_TO",
  "CHANGE_TO"
]).describe("Navigation type");

export const ActionSchema = z.object({
  type: z.enum([
    "BACK",
    "CLOSE",
    "URL",
    "NODE"
  ]).describe("Action type"),
  url: z.string().optional().describe("URL to open (for URL type)"),
  destinationId: z.string().optional().describe("Destination node ID (for NODE type)"),
  navigation: NavigationSchema.optional().describe("Navigation type (for NODE type)"),
  transition: TransitionSchema.optional().describe("Transition animation"),
  preserveScrollPosition: z.boolean().optional().describe("Preserve scroll position"),
  overlayRelativePosition: z.object({
    x: z.number(),
    y: z.number()
  }).optional().describe("Overlay position"),
});

export const ReactionSchema = z.object({
  trigger: TriggerSchema,
  actions: z.array(ActionSchema).describe("Actions to perform"),
});

export const SetReactionsInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
  reactions: z.array(ReactionSchema).describe("Array of reactions"),
}).strict();

export const GetReactionsInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
}).strict();

export const AddReactionInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
  trigger: TriggerSchema.describe("Trigger for the reaction"),
  actions: z.array(ActionSchema).describe("Actions to perform"),
}).strict();

export const RemoveReactionsInputSchema = z.object({
  nodeId: z.string().describe("ID of the node"),
}).strict();

export const SetFlowStartingPointInputSchema = z.object({
  nodeId: z.string().describe("ID of the frame to set as starting point"),
  name: z.string().optional().describe("Name for the flow"),
}).strict();

export const GetFlowStartingPointsInputSchema = z.object({}).strict();

export const RemoveFlowStartingPointInputSchema = z.object({
  nodeId: z.string().describe("ID of the frame to remove as starting point"),
}).strict();

// ============================================================================
// Client Storage API Schemas
// ============================================================================

export const ClientStorageSetInputSchema = z.object({
  key: z.string().describe("Storage key"),
  value: z.unknown().describe("Value to store (any JSON-serializable value)"),
}).strict();

export const ClientStorageGetInputSchema = z.object({
  key: z.string().describe("Storage key to retrieve"),
}).strict();

export const ClientStorageDeleteInputSchema = z.object({
  key: z.string().describe("Storage key to delete"),
}).strict();

export const ClientStorageKeysInputSchema = z.object({}).strict();

// ============================================================================
// Shared Plugin Data API Schemas
// ============================================================================

export const SetSharedPluginDataInputSchema = z.object({
  nodeId: z.string().describe("Node ID"),
  namespace: z.string().describe("Namespace for the data"),
  key: z.string().describe("Data key"),
  value: z.string().describe("Data value"),
}).strict();

export const GetSharedPluginDataInputSchema = z.object({
  nodeId: z.string().describe("Node ID"),
  namespace: z.string().describe("Namespace for the data"),
  key: z.string().describe("Data key"),
}).strict();

export const GetSharedPluginDataKeysInputSchema = z.object({
  nodeId: z.string().describe("Node ID"),
  namespace: z.string().describe("Namespace for the data"),
}).strict();

// ============================================================================
// Video/Media API Schemas
// ============================================================================

export const CreateVideoInputSchema = z.object({
  videoData: z.string().describe("Base64 encoded video data"),
  name: z.string().default("Video").describe("Video node name"),
  x: z.number().optional().describe("X position"),
  y: z.number().optional().describe("Y position"),
  width: z.number().default(400).describe("Video width"),
  height: z.number().default(300).describe("Video height"),
  parentId: z.string().optional().describe("Parent node ID"),
}).strict();

export const SetVideoFillInputSchema = z.object({
  nodeId: z.string().describe("Node ID"),
  videoData: z.string().describe("Base64 encoded video data"),
  scaleMode: z.enum(["FILL", "FIT", "CROP", "TILE"]).default("FILL").describe("Scale mode"),
}).strict();

// Link Preview / Embed
export const CreateLinkPreviewInputSchema = z.object({
  url: z.string().describe("URL to create preview for"),
  x: z.number().optional().describe("X position"),
  y: z.number().optional().describe("Y position"),
  parentId: z.string().optional().describe("Parent node ID"),
}).strict();

// ============================================================================
// Viewport Control API Schemas
// ============================================================================

export const GetViewportInputSchema = z.object({}).strict();

export const SetViewportInputSchema = z.object({
  x: z.number().describe("Center X position"),
  y: z.number().describe("Center Y position"),
  zoom: z.number().min(0.01).max(256).describe("Zoom level (0.01 to 256)"),
}).strict();

export const ScrollToNodeInputSchema = z.object({
  nodeId: z.string().describe("Node ID to scroll to"),
  zoom: z.number().optional().describe("Optional zoom level"),
}).strict();

export const ZoomToFitInputSchema = z.object({
  nodeIds: z.array(z.string()).optional().describe("Node IDs to fit in view (current selection if empty)"),
}).strict();

export const ZoomToSelectionInputSchema = z.object({}).strict();

// ============================================================================
// Additional Utility Schemas
// ============================================================================

export const GetCurrentPageInputSchema = z.object({}).strict();

export const SetCurrentPageInputSchema = z.object({
  pageId: z.string().optional().describe("Page ID to switch to"),
  pageName: z.string().optional().describe("Page name to switch to (alternative to pageId)"),
}).strict();

export const CreatePageInputSchema = z.object({
  name: z.string().default("New Page").describe("Page name"),
}).strict();

export const GetAllPagesInputSchema = z.object({}).strict();

export const GetEditorTypeInputSchema = z.object({}).strict();

export const GetModeInputSchema = z.object({}).strict();

// Connection
export const ConnectionStatusInputSchema = z.object({}).strict();

// ============================================================================
// Linter Schemas
// ============================================================================

export const LintLayoutInputSchema = z.object({
  nodeId: z.string().describe("Root node ID to lint"),
  rules: z.array(z.enum([
    // Existing rules
    "NO_ABSOLUTE_POSITION",
    "AUTO_LAYOUT_REQUIRED",
    "VALID_SIZING_MODE",
    "SPACING_TOKEN_ONLY",
    "FILL_REQUIRED_ON_ROOT",
    // New rules
    "VISUAL_HIERARCHY",        // Check heading > body > caption size order
    "CONSISTENT_SPACING",      // Detect inconsistent spacing patterns
    "PROXIMITY_GROUPING",      // Related items should be closer
    "ALIGNMENT_CONSISTENCY",   // Elements should align to grid
    "CONTRAST_RATIO",          // Text contrast check
    "TOUCH_TARGET_SIZE",       // Min 44x44 for interactive elements
  ])).optional().default([
    "NO_ABSOLUTE_POSITION",
    "AUTO_LAYOUT_REQUIRED",
    "VALID_SIZING_MODE"
  ]).describe("Rules to check"),
  recursive: z.boolean().optional().default(true).describe("Check children recursively"),
}).strict();

export type LintLayoutInput = z.infer<typeof LintLayoutInputSchema>;

export interface LintViolation {
  nodeId: string;
  nodeName: string;
  rule: string;
  message: string;
  severity: "error" | "warning";
}

export interface LintResult {
  passed: boolean;
  violations: LintViolation[];
  checkedNodes: number;
}

// ============================================================================
// Smart Layout Schemas
// ============================================================================

export const SmartLayoutInputSchema = z.object({
  nodeId: z.string().describe("Target node ID to optimize layout"),
  strategy: z.enum([
    "AUTO_DETECT",      // Analyze content and choose best layout
    "CARD_GRID",        // Optimize for card-based layouts
    "FORM_LAYOUT",      // Optimize for form inputs
    "NAVIGATION",       // Optimize for nav items
    "CONTENT_STACK",    // Optimize for content sections
    "HERO_SECTION",     // Optimize for hero/landing sections
  ]).optional().default("AUTO_DETECT").describe("Layout optimization strategy"),
  options: z.object({
    enforceGrid: z.boolean().optional().default(true).describe("Snap spacing to 8-point grid"),
    autoGroup: z.boolean().optional().default(true).describe("Auto-group related elements"),
    optimizeHierarchy: z.boolean().optional().default(true).describe("Optimize visual hierarchy"),
    targetPlatform: z.enum(["web", "ios", "android"]).optional().default("web"),
  }).optional(),
}).strict();

export type SmartLayoutInput = z.infer<typeof SmartLayoutInputSchema>;

export const SmartLayoutResultSchema = z.object({
  success: z.boolean(),
  changes: z.array(z.object({
    nodeId: z.string(),
    nodeName: z.string(),
    changeType: z.string(),
    before: z.unknown(),
    after: z.unknown(),
  })),
  suggestions: z.array(z.object({
    nodeId: z.string(),
    message: z.string(),
    priority: z.enum(["high", "medium", "low"]),
  })),
});

export type SmartLayoutResult = z.infer<typeof SmartLayoutResultSchema>;

// ============================================================================
// Auto Variant Generation Schemas
// ============================================================================

export const GenerateVariantsInputSchema = z.object({
  nodeId: z.string().describe("Component node ID to generate variants for"),
  variantTypes: z
    .array(
      z.enum([
        "STATE", // hover, active, disabled, focused
        "SIZE", // sm, md, lg, xl
        "THEME", // light, dark
        "DENSITY", // compact, comfortable, spacious
      ])
    )
    .optional()
    .default(["STATE"])
    .describe("Types of variants to generate"),
  options: z
    .object({
      includeHover: z.boolean().optional().default(true),
      includeDisabled: z.boolean().optional().default(true),
      includeFocused: z.boolean().optional().default(false),
      sizeScale: z
        .array(z.enum(["sm", "md", "lg", "xl"]))
        .optional()
        .default(["sm", "md", "lg"]),
      createComponentSet: z.boolean().optional().default(true).describe("Group variants into ComponentSet"),
    })
    .optional(),
}).strict();

export type GenerateVariantsInput = z.infer<typeof GenerateVariantsInputSchema>;

export const GeneratedVariantSchema = z.object({
  nodeId: z.string(),
  name: z.string(),
  variantProperties: z.record(z.string()),
});

export type GeneratedVariant = z.infer<typeof GeneratedVariantSchema>;

export const VariantGenerationResultSchema = z.object({
  success: z.boolean(),
  componentSetId: z.string().optional(),
  variants: z.array(GeneratedVariantSchema),
  error: z.string().optional(),
});

export type VariantGenerationResult = z.infer<typeof VariantGenerationResultSchema>;

// ============================================================================
// Visual Debug Mode Schemas
// ============================================================================

export const ToggleDebugModeInputSchema = z.object({
  enabled: z.boolean().describe("Enable or disable debug mode"),
  nodeId: z.string().optional().describe("Specific node to debug (defaults to all)"),
  options: z.object({
    showPadding: z.boolean().default(true).describe("Show padding overlay"),
    showSpacing: z.boolean().default(true).describe("Show item spacing"),
    showSizing: z.boolean().default(true).describe("Show FILL/HUG/FIXED labels"),
    showHierarchy: z.boolean().default(false).describe("Show parent-child lines"),
  }).optional().describe("Debug visualization options"),
}).strict();

export type ToggleDebugModeInput = z.infer<typeof ToggleDebugModeInputSchema>;

export const GetDebugInfoInputSchema = z.object({
  nodeId: z.string().describe("Node to get debug info for"),
  includeChildren: z.boolean().default(false).describe("Include children info"),
  format: z.enum(["json", "tree"]).default("json").describe("Output format"),
}).strict();

export type GetDebugInfoInput = z.infer<typeof GetDebugInfoInputSchema>;

// ============================================================================
// Type Exports
// ============================================================================

// Re-export base types
export type {
  RGBColor,
  HexColor,
  Color,
  GradientStop,
  Gradient,
  Fill,
  Shadow,
  Blur,
  Effect,
  AutoLayout,
  Constraints,
  TextStyle,
  Stroke,
  Position,
  Parent,
  EmptyInput,
} from "./base.js";

export type CreateFrameInput = z.infer<typeof CreateFrameInputSchema>;
export type CreateRectangleInput = z.infer<typeof CreateRectangleInputSchema>;
export type CreateEllipseInput = z.infer<typeof CreateEllipseInputSchema>;
export type CreateTextInput = z.infer<typeof CreateTextInputSchema>;
export type CreateButtonInput = z.infer<typeof CreateButtonInputSchema>;
export type CreateInputInput = z.infer<typeof CreateInputInputSchema>;
export type CreateCardInput = z.infer<typeof CreateCardInputSchema>;
export type SetAutoLayoutInput = z.infer<typeof SetAutoLayoutInputSchema>;
export type SetFillInput = z.infer<typeof SetFillInputSchema>;
export type SetEffectsInput = z.infer<typeof SetEffectsInputSchema>;
export type ModifyNodeInput = z.infer<typeof ModifyNodeInputSchema>;
export type CreateComponentInput = z.infer<typeof CreateComponentInputSchema>;
export type GetSelectionInput = z.infer<typeof GetSelectionInputSchema>;
export type AppendChildInput = z.infer<typeof AppendChildInputSchema>;
export type CreateComponentInstanceInput = z.infer<typeof CreateComponentInstanceInputSchema>;
export type GetLocalComponentsInput = z.infer<typeof GetLocalComponentsInputSchema>;
export type RegisterComponentInput = z.infer<typeof RegisterComponentInputSchema>;
export type CreateUIComponentInput = z.infer<typeof CreateUIComponentInputSchema>;
export type SetThemeInput = z.infer<typeof SetThemeInputSchema>;
export type SetThemeTokensInput = z.infer<typeof SetThemeTokensInputSchema>;
export type CreateShadcnComponentInput = z.infer<typeof CreateShadcnComponentInputSchema>;
export type CreateAppleComponentInput = z.infer<typeof CreateAppleComponentInputSchema>;
export type CreateLiquidGlassComponentInput = z.infer<typeof CreateLiquidGlassComponentInputSchema>;
export type ListComponentsInput = z.infer<typeof ListComponentsInputSchema>;
export type GetDesignTokensInput = z.infer<typeof GetDesignTokensInputSchema>;
export type CreateIconInput = z.infer<typeof CreateIconInputSchema>;
export type ListIconsInput = z.infer<typeof ListIconsInputSchema>;

// New manipulation types
export type DeleteNodeInput = z.infer<typeof DeleteNodeInputSchema>;
export type CloneNodeInput = z.infer<typeof CloneNodeInputSchema>;
export type MoveNodeInput = z.infer<typeof MoveNodeInputSchema>;
export type ResizeNodeInput = z.infer<typeof ResizeNodeInputSchema>;
export type SetPositionInput = z.infer<typeof SetPositionInputSchema>;
export type SetLayoutSizingInput = z.infer<typeof SetLayoutSizingInputSchema>;
export type GetNodeInfoInput = z.infer<typeof GetNodeInfoInputSchema>;
export type SetConstraintsInput = z.infer<typeof SetConstraintsInputSchema>;
export type ReorderChildrenInput = z.infer<typeof ReorderChildrenInputSchema>;
export type SetVisibilityInput = z.infer<typeof SetVisibilityInputSchema>;
export type SetOpacityInput = z.infer<typeof SetOpacityInputSchema>;
export type SetStrokeInput = z.infer<typeof SetStrokeInputSchema>;
export type CreateLineInput = z.infer<typeof CreateLineInputSchema>;
export type CreateGroupInput = z.infer<typeof CreateGroupInputSchema>;
export type SetTextContentInput = z.infer<typeof SetTextContentInputSchema>;
export type SetCornerRadiusInput = z.infer<typeof SetCornerRadiusInputSchema>;
export type GetPageInfoInput = z.infer<typeof GetPageInfoInputSchema>;
export type SelectNodesInput = z.infer<typeof SelectNodesInputSchema>;

// New feature types - Boolean Operations
export type BooleanOperationInput = z.infer<typeof BooleanOperationInputSchema>;

// New feature types - Image Handling
export type CreateImageInput = z.infer<typeof CreateImageInputSchema>;
export type SetImageFillInput = z.infer<typeof SetImageFillInputSchema>;

// New feature types - Vector Operations
export type CreateVectorInput = z.infer<typeof CreateVectorInputSchema>;
export type SetVectorPathsInput = z.infer<typeof SetVectorPathsInputSchema>;

// New feature types - Blend Modes
export type BlendMode = z.infer<typeof BlendModeSchema>;
export type SetBlendModeInput = z.infer<typeof SetBlendModeInputSchema>;

// New feature types - Style System
export type GetLocalStylesInput = z.infer<typeof GetLocalStylesInputSchema>;
export type CreatePaintStyleInput = z.infer<typeof CreatePaintStyleInputSchema>;
export type CreateTextStyleInput = z.infer<typeof CreateTextStyleInputSchema>;
export type CreateEffectStyleInput = z.infer<typeof CreateEffectStyleInputSchema>;
export type ApplyStyleInput = z.infer<typeof ApplyStyleInputSchema>;

// New feature types - Variables API
export type GetLocalVariablesInput = z.infer<typeof GetLocalVariablesInputSchema>;
export type GetVariableCollectionsInput = z.infer<typeof GetVariableCollectionsInputSchema>;
export type CreateVariableInput = z.infer<typeof CreateVariableInputSchema>;
export type CreateVariableCollectionInput = z.infer<typeof CreateVariableCollectionInputSchema>;
export type BindVariableInput = z.infer<typeof BindVariableInputSchema>;

// New feature types - Export
export type ExportNodeInput = z.infer<typeof ExportNodeInputSchema>;
export type ExportMultipleInput = z.infer<typeof ExportMultipleInputSchema>;

// New feature types - Transform
export type SetRotationInput = z.infer<typeof SetRotationInputSchema>;
export type SetTransformInput = z.infer<typeof SetTransformInputSchema>;
export type ScaleNodeInput = z.infer<typeof ScaleNodeInputSchema>;

// New feature types - Masks
export type CreateMaskInput = z.infer<typeof CreateMaskInputSchema>;
export type SetMaskInput = z.infer<typeof SetMaskInputSchema>;

// New feature types - Find/Query
export type FindNodesInput = z.infer<typeof FindNodesInputSchema>;
export type FindChildrenInput = z.infer<typeof FindChildrenInputSchema>;

// New feature types - Plugin Data
export type SetPluginDataInput = z.infer<typeof SetPluginDataInputSchema>;
export type GetPluginDataInput = z.infer<typeof GetPluginDataInputSchema>;
export type GetAllPluginDataInput = z.infer<typeof GetAllPluginDataInputSchema>;
export type DeletePluginDataInput = z.infer<typeof DeletePluginDataInputSchema>;

// New feature types - Layout Grid
export type SetLayoutGridInput = z.infer<typeof SetLayoutGridInputSchema>;
export type GetLayoutGridInput = z.infer<typeof GetLayoutGridInputSchema>;

// New feature types - Additional Shapes
export type CreatePolygonInput = z.infer<typeof CreatePolygonInputSchema>;
export type CreateStarInput = z.infer<typeof CreateStarInputSchema>;

// New feature types - Flatten
export type FlattenNodeInput = z.infer<typeof FlattenNodeInputSchema>;

// New feature types - Font Enumeration
export type ListAvailableFontsInput = z.infer<typeof ListAvailableFontsInputSchema>;

// New feature types - Ungroup
export type UngroupInput = z.infer<typeof UngroupInputSchema>;

// New feature types - Lock/Unlock
export type SetLockedInput = z.infer<typeof SetLockedInputSchema>;

// Prototype/Interactions types
export type Trigger = z.infer<typeof TriggerSchema>;
export type Transition = z.infer<typeof TransitionSchema>;
export type Navigation = z.infer<typeof NavigationSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type Reaction = z.infer<typeof ReactionSchema>;
export type SetReactionsInput = z.infer<typeof SetReactionsInputSchema>;
export type GetReactionsInput = z.infer<typeof GetReactionsInputSchema>;
export type AddReactionInput = z.infer<typeof AddReactionInputSchema>;
export type RemoveReactionsInput = z.infer<typeof RemoveReactionsInputSchema>;
export type SetFlowStartingPointInput = z.infer<typeof SetFlowStartingPointInputSchema>;
export type GetFlowStartingPointsInput = z.infer<typeof GetFlowStartingPointsInputSchema>;
export type RemoveFlowStartingPointInput = z.infer<typeof RemoveFlowStartingPointInputSchema>;

// Client Storage types
export type ClientStorageSetInput = z.infer<typeof ClientStorageSetInputSchema>;
export type ClientStorageGetInput = z.infer<typeof ClientStorageGetInputSchema>;
export type ClientStorageDeleteInput = z.infer<typeof ClientStorageDeleteInputSchema>;
export type ClientStorageKeysInput = z.infer<typeof ClientStorageKeysInputSchema>;

// Shared Plugin Data types
export type SetSharedPluginDataInput = z.infer<typeof SetSharedPluginDataInputSchema>;
export type GetSharedPluginDataInput = z.infer<typeof GetSharedPluginDataInputSchema>;
export type GetSharedPluginDataKeysInput = z.infer<typeof GetSharedPluginDataKeysInputSchema>;

// Video/Media types
export type CreateVideoInput = z.infer<typeof CreateVideoInputSchema>;
export type SetVideoFillInput = z.infer<typeof SetVideoFillInputSchema>;
export type CreateLinkPreviewInput = z.infer<typeof CreateLinkPreviewInputSchema>;

// Viewport Control types
export type GetViewportInput = z.infer<typeof GetViewportInputSchema>;
export type SetViewportInput = z.infer<typeof SetViewportInputSchema>;
export type ScrollToNodeInput = z.infer<typeof ScrollToNodeInputSchema>;
export type ZoomToFitInput = z.infer<typeof ZoomToFitInputSchema>;
export type ZoomToSelectionInput = z.infer<typeof ZoomToSelectionInputSchema>;

// Utility types
export type GetCurrentPageInput = z.infer<typeof GetCurrentPageInputSchema>;
export type SetCurrentPageInput = z.infer<typeof SetCurrentPageInputSchema>;
export type CreatePageInput = z.infer<typeof CreatePageInputSchema>;
export type GetAllPagesInput = z.infer<typeof GetAllPagesInputSchema>;
export type GetEditorTypeInput = z.infer<typeof GetEditorTypeInputSchema>;
export type GetModeInput = z.infer<typeof GetModeInputSchema>;
export type ConnectionStatusInput = z.infer<typeof ConnectionStatusInputSchema>;

// ============================================================================
// Screen Renderer Schema
// ============================================================================

export {
  ScreenSpecSchema,
  CreateScreenInputSchema,
} from "./screen.js";

export type {
  ScreenSpec,
  CreateScreenInput,
  ContentItem,
  TextItem,
  ButtonItem,
  TextFieldItem,
  CellItem,
  ListItem,
  RowItem,
  SectionItem,
  CardItem,
  SpacerItem,
  NavigationBarSpec,
  TabBarSpec,
} from "./screen.js";
