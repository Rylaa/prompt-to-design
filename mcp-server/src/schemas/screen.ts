// mcp-server/src/schemas/screen.ts
import { z } from "zod";

// ============================================================================
// Device Presets
// ============================================================================

const DeviceSchema = z.enum([
  "iphone-15",        // 393x852
  "iphone-15-pro",    // 393x852
  "iphone-15-pro-max", // 430x932
  "iphone-se",        // 375x667
  "ipad-pro-11",      // 834x1194
  "ipad-pro-13",      // 1024x1366
]).default("iphone-15");

const ThemeSchema = z.enum(["light", "dark"]).default("light");

// ============================================================================
// Content Item Schemas (Semantic Components)
// ============================================================================

const TextItemSchema = z.object({
  type: z.literal("text"),
  value: z.string(),
  style: z.enum([
    "largeTitle", "title1", "title2", "title3",
    "headline", "subheadline", "body", "callout",
    "footnote", "caption1", "caption2"
  ]).default("body"),
  color: z.enum(["primary", "secondary", "tertiary", "accent", "destructive", "custom"]).optional(),
  customColor: z.string().optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  weight: z.enum(["regular", "medium", "semibold", "bold"]).optional(),
});

const ButtonItemSchema = z.object({
  type: z.literal("button"),
  text: z.string(),
  style: z.enum(["filled", "tinted", "gray", "plain"]).default("filled"),
  size: z.enum(["small", "medium", "large"]).default("medium"),
  icon: z.string().optional(),
  disabled: z.boolean().optional(),
  fullWidth: z.boolean().optional().default(false),
});

const TextFieldItemSchema = z.object({
  type: z.literal("text-field"),
  placeholder: z.string().optional().default(""),
  value: z.string().optional(),
  label: z.string().optional(),
  secure: z.boolean().optional().default(false),
  style: z.enum(["default", "rounded"]).optional().default("rounded"),
});

const CellItemSchema = z.object({
  type: z.literal("cell"),
  title: z.string(),
  subtitle: z.string().optional(),
  value: z.string().optional(),
  icon: z.string().optional(),
  hasChevron: z.boolean().optional().default(false),
  hasToggle: z.boolean().optional().default(false),
  toggleValue: z.boolean().optional(),
  style: z.enum(["default", "subtitle", "value"]).optional().default("default"),
});

const ListItemSchema = z.object({
  type: z.literal("list"),
  header: z.string().optional(),
  footer: z.string().optional(),
  style: z.enum(["plain", "inset", "grouped"]).optional().default("inset"),
  cells: z.array(CellItemSchema.omit({ type: true })),
});

const ToggleItemSchema = z.object({
  type: z.literal("toggle"),
  label: z.string(),
  value: z.boolean().optional().default(false),
});

const SearchBarItemSchema = z.object({
  type: z.literal("search-bar"),
  placeholder: z.string().optional().default("Search"),
});

const SegmentedControlItemSchema = z.object({
  type: z.literal("segmented-control"),
  segments: z.array(z.string()).min(2),
  selectedIndex: z.number().optional().default(0),
});

const ImagePlaceholderItemSchema = z.object({
  type: z.literal("image"),
  width: z.number().optional(),
  height: z.number().default(200),
  cornerRadius: z.number().optional().default(0),
  aspectRatio: z.enum(["1:1", "4:3", "16:9", "3:2"]).optional(),
});

const SpacerItemSchema = z.object({
  type: z.literal("spacer"),
  size: z.enum(["xs", "sm", "md", "lg", "xl", "fill"]).default("md"),
});

const DividerItemSchema = z.object({
  type: z.literal("divider"),
});

const IconItemSchema = z.object({
  type: z.literal("icon"),
  name: z.string(),
  size: z.number().optional().default(24),
  color: z.enum(["primary", "secondary", "tertiary", "accent"]).optional().default("primary"),
});

// ============================================================================
// Layout Containers
// ============================================================================

// Forward declaration for recursive types
const ContentItemSchema: z.ZodType<any> = z.lazy(() =>
  z.discriminatedUnion("type", [
    TextItemSchema,
    ButtonItemSchema,
    TextFieldItemSchema,
    CellItemSchema,
    ListItemSchema,
    ToggleItemSchema,
    SearchBarItemSchema,
    SegmentedControlItemSchema,
    ImagePlaceholderItemSchema,
    SpacerItemSchema,
    DividerItemSchema,
    IconItemSchema,
    RowItemSchema,
    SectionItemSchema,
    CardItemSchema,
  ])
);

const RowItemSchema = z.object({
  type: z.literal("row"),
  children: z.array(ContentItemSchema),
  spacing: z.number().optional().default(12),
  align: z.enum(["top", "center", "bottom", "stretch"]).optional().default("center"),
  distribute: z.enum(["start", "center", "end", "space-between", "equal"]).optional().default("start"),
});

const SectionItemSchema = z.object({
  type: z.literal("section"),
  title: z.string().optional(),
  children: z.array(ContentItemSchema),
  spacing: z.number().optional().default(8),
  padding: z.number().optional(),
});

const CardItemSchema = z.object({
  type: z.literal("card"),
  children: z.array(ContentItemSchema),
  padding: z.number().optional().default(16),
  cornerRadius: z.number().optional().default(12),
  shadow: z.boolean().optional().default(true),
});

// ============================================================================
// Screen-Level Components
// ============================================================================

const StatusBarSchema = z.object({
  style: z.enum(["light", "dark"]).optional(),
  hidden: z.boolean().optional().default(false),
});

const NavigationBarSchema = z.object({
  title: z.string(),
  variant: z.enum(["large", "inline"]).optional().default("inline"),
  leftButton: z.string().optional(),
  rightButton: z.string().optional(),
  hasSearchBar: z.boolean().optional().default(false),
});

const TabBarSchema = z.object({
  items: z.array(z.object({
    icon: z.string(),
    label: z.string(),
    badge: z.number().optional(),
  })).min(2).max(5),
  activeIndex: z.number().optional().default(0),
});

// ============================================================================
// Main Screen Schema
// ============================================================================

export const ScreenSpecSchema = z.object({
  device: DeviceSchema,
  theme: ThemeSchema,
  statusBar: StatusBarSchema.optional(),
  navigationBar: NavigationBarSchema.optional(),
  content: z.array(ContentItemSchema),
  tabBar: TabBarSchema.optional(),
  // Screen metadata
  name: z.string().optional().default("Screen"),
  backgroundColor: z.string().optional(),
});

export type ScreenSpec = z.infer<typeof ScreenSpecSchema>;

// Re-export sub-types for use in renderer
export type ContentItem = z.infer<typeof ContentItemSchema>;
export type TextItem = z.infer<typeof TextItemSchema>;
export type ButtonItem = z.infer<typeof ButtonItemSchema>;
export type TextFieldItem = z.infer<typeof TextFieldItemSchema>;
export type CellItem = z.infer<typeof CellItemSchema>;
export type ListItem = z.infer<typeof ListItemSchema>;
export type RowItem = z.infer<typeof RowItemSchema>;
export type SectionItem = z.infer<typeof SectionItemSchema>;
export type CardItem = z.infer<typeof CardItemSchema>;
export type SpacerItem = z.infer<typeof SpacerItemSchema>;
export type NavigationBarSpec = z.infer<typeof NavigationBarSchema>;
export type TabBarSpec = z.infer<typeof TabBarSchema>;

// MCP Tool input schema
export const CreateScreenInputSchema = z.object({
  screen: ScreenSpecSchema,
});

export type CreateScreenInput = z.infer<typeof CreateScreenInputSchema>;
