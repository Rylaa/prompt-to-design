/// <reference types="@figma/plugin-typings" />
/**
 * Figma Plugin - AI Design Assistant v2
 * WebSocket üzerinden komut alır ve Figma'da tasarım oluşturur
 * Async node operations ve component library desteği
 * Extended with shadcn, iOS, macOS component libraries
 */

// Import component libraries
import { themeManager, getColors, Theme, Platform, ThemeColors, createColorToken } from "./tokens";
import { createShadcnComponent, listShadcnComponents } from "./components/shadcn";
import { createIOSComponent, listIOSComponents } from "./components/apple-ios";
import { createMacOSComponent, listMacOSComponents } from "./components/apple-macos";
import { createLiquidGlassComponent, listLiquidGlassComponents } from "./components/liquid-glass";
import { listComponents, ComponentLibrary } from "./components";
import { LUCIDE_ICONS, hasIcon, getAvailableIcons } from "./icons/lucide-svgs";

// Core layout system
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

// Spacing tokens
import { pxToSpacingKey, pxToRadiusKey, spacing } from "./tokens/spacing";
import type { RadiusKey } from "./tokens/spacing";

// UI'ı göster
figma.showUI(__html__, { width: 300, height: 400 });

// ============================================================================
// Tip Tanımlamaları
// ============================================================================

interface Command {
  type: "COMMAND";
  id: string;
  action: string;
  params: Record<string, unknown>;
}

interface RGBColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

interface GradientStop {
  position: number;
  color: string | RGBColor;
}

interface GradientConfig {
  type: "LINEAR" | "RADIAL" | "ANGULAR" | "DIAMOND";
  stops: GradientStop[];
  angle?: number;
}

interface FillConfig {
  type: "SOLID" | "GRADIENT";
  color?: string | RGBColor;
  opacity?: number;
  gradient?: GradientConfig;
}

interface ShadowConfig {
  type: "DROP_SHADOW" | "INNER_SHADOW";
  color?: string | RGBColor;
  offsetX?: number;
  offsetY?: number;
  blur?: number;
  spread?: number;
  opacity?: number;
}

interface BlurConfig {
  type: "LAYER_BLUR" | "BACKGROUND_BLUR";
  radius: number;
}

type EffectConfig = ShadowConfig | BlurConfig;

// FigJam connector magnet positions
type ConnectorMagnet = "AUTO" | "TOP" | "BOTTOM" | "LEFT" | "RIGHT" | "CENTER";

// FigJam connector line types
type ConnectorLineType = "STRAIGHT" | "ELBOWED" | "CURVED";

// FigJam code block languages
type CodeBlockLanguage = "TYPESCRIPT" | "JAVASCRIPT" | "PYTHON" | "RUBY" | "CSS" | "HTML" | "JSON" | "CPP" | "GO" | "BASH" | "SWIFT" | "KOTLIN" | "RUST" | "PLAINTEXT" | "GRAPHQL" | "SQL" | "DART";

interface AutoLayoutConfig {
  mode: "HORIZONTAL" | "VERTICAL";
  spacing?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  padding?: number;
  primaryAxisAlign?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  counterAxisAlign?: "MIN" | "CENTER" | "MAX" | "BASELINE";
  wrap?: boolean;
}

interface TextStyleConfig {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number | string;
  letterSpacing?: number;
  textAlign?: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
}

interface StrokeConfig {
  color: string | RGBColor;
  weight?: number;
  align?: "INSIDE" | "OUTSIDE" | "CENTER";
}

// ============================================================================
// Node Registry - Oluşturulan node'ları takip et
// ============================================================================

const nodeRegistry: Map<string, SceneNode> = new Map();

function registerNode(node: SceneNode): void {
  nodeRegistry.set(node.id, node);
}

// ============================================================================
// Component Library - Component'leri isimle sakla ve yönet
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
// Visual Debug Mode State
// ============================================================================

let debugModeEnabled = false;
const debugOverlayIds = new Set<string>();

// Debug overlay colors for different layout aspects
const DEBUG_COLORS = {
  padding: { r: 0.2, g: 0.6, b: 1, a: 0.2 },      // Blue for padding
  spacing: { r: 1, g: 0.6, b: 0.2, a: 0.2 },      // Orange for spacing
  sizingFill: { r: 0.2, g: 0.8, b: 0.4, a: 0.3 }, // Green for FILL sizing
  sizingHug: { r: 0.8, g: 0.2, b: 0.8, a: 0.3 },  // Purple for HUG sizing
  sizingFixed: { r: 0.8, g: 0.8, b: 0.2, a: 0.3 },// Yellow for FIXED sizing
};

async function getNode(nodeId: string): Promise<SceneNode | null> {
  // Önce registry'den bak
  if (nodeRegistry.has(nodeId)) {
    return nodeRegistry.get(nodeId) || null;
  }
  // Sonra async olarak Figma'dan al
  const node = await figma.getNodeByIdAsync(nodeId);
  if (node && "type" in node) {
    return node as SceneNode;
  }
  return null;
}

// ============================================================================
// Yardımcı Fonksiyonlar
// ============================================================================

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    };
  }
  // 3 karakter hex desteği
  const shortResult = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
  if (shortResult) {
    return {
      r: parseInt(shortResult[1] + shortResult[1], 16) / 255,
      g: parseInt(shortResult[2] + shortResult[2], 16) / 255,
      b: parseInt(shortResult[3] + shortResult[3], 16) / 255,
    };
  }
  return { r: 0, g: 0, b: 0 };
}

function parseColor(color: string | RGBColor): RGB {
  if (typeof color === "string") {
    return hexToRgb(color);
  }
  return { r: color.r, g: color.g, b: color.b };
}

function createSolidPaint(color: string | RGBColor, opacity?: number): SolidPaint {
  const rgb = parseColor(color);
  return {
    type: "SOLID",
    color: rgb,
    opacity: opacity !== undefined ? opacity : 1,
  };
}

function createStrokePaint(config: StrokeConfig): SolidPaint {
  const rgb = parseColor(config.color);
  return {
    type: "SOLID",
    color: rgb,
    opacity: 1,
  };
}

function createGradientPaint(config: GradientConfig): GradientPaint {
  const stops: ColorStop[] = config.stops.map((stop) => ({
    position: stop.position,
    color: { ...parseColor(stop.color), a: 1 },
  }));

  const angle = config.angle || 0;
  const radians = (angle * Math.PI) / 180;

  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return {
    type: "GRADIENT_LINEAR",
    gradientTransform: [
      [cos, sin, 0.5 - cos * 0.5 - sin * 0.5],
      [-sin, cos, 0.5 + sin * 0.5 - cos * 0.5],
    ],
    gradientStops: stops,
  };
}

function createFill(config: FillConfig): Paint {
  if (config.type === "SOLID" && config.color) {
    return createSolidPaint(config.color, config.opacity);
  }
  if (config.type === "GRADIENT" && config.gradient) {
    return createGradientPaint(config.gradient);
  }
  return createSolidPaint("#000000");
}

function createEffect(config: EffectConfig): Effect {
  if (config.type === "DROP_SHADOW" || config.type === "INNER_SHADOW") {
    const shadow = config as ShadowConfig;
    const color = shadow.color ? parseColor(shadow.color) : { r: 0, g: 0, b: 0 };
    return {
      type: shadow.type,
      color: { ...color, a: shadow.opacity !== undefined ? shadow.opacity : 0.25 },
      offset: {
        x: shadow.offsetX !== undefined ? shadow.offsetX : 0,
        y: shadow.offsetY !== undefined ? shadow.offsetY : 4
      },
      radius: shadow.blur !== undefined ? shadow.blur : 8,
      spread: shadow.spread !== undefined ? shadow.spread : 0,
      visible: true,
      blendMode: "NORMAL",
    };
  }

  const blur = config as BlurConfig;
  return {
    type: blur.type,
    radius: blur.radius,
    visible: true,
  } as BlurEffect;
}

function applyAutoLayout(node: FrameNode, config: AutoLayoutConfig): void {
  node.layoutMode = config.mode;
  node.itemSpacing = config.spacing !== undefined ? config.spacing : 0;

  const padding = config.padding !== undefined ? config.padding : 0;
  node.paddingTop = config.paddingTop !== undefined ? config.paddingTop : padding;
  node.paddingRight = config.paddingRight !== undefined ? config.paddingRight : padding;
  node.paddingBottom = config.paddingBottom !== undefined ? config.paddingBottom : padding;
  node.paddingLeft = config.paddingLeft !== undefined ? config.paddingLeft : padding;

  node.primaryAxisAlignItems = config.primaryAxisAlign || "MIN";
  node.counterAxisAlignItems = config.counterAxisAlign || "CENTER";

  if (config.wrap) {
    node.layoutWrap = "WRAP";
  }
}

function applyStroke(node: GeometryMixin & MinimalStrokesMixin, config: StrokeConfig): void {
  node.strokes = [createSolidPaint(config.color)];
  node.strokeWeight = config.weight !== undefined ? config.weight : 1;
  if ("strokeAlign" in node && config.align) {
    (node as FrameNode).strokeAlign = config.align;
  }
}

async function loadFont(fontFamily: string, fontWeight: number): Promise<FontName> {
  const fontName: FontName = {
    family: fontFamily,
    style: getFontStyle(fontWeight),
  };

  try {
    await figma.loadFontAsync(fontName);
    return fontName;
  } catch {
    const fallback: FontName = { family: "Inter", style: "Regular" };
    await figma.loadFontAsync(fallback);
    return fallback;
  }
}

function getFontStyle(weight: number): string {
  if (weight <= 100) return "Thin";
  if (weight <= 200) return "ExtraLight";
  if (weight <= 300) return "Light";
  if (weight <= 400) return "Regular";
  if (weight <= 500) return "Medium";
  if (weight <= 600) return "Semi Bold";
  if (weight <= 700) return "Bold";
  if (weight <= 800) return "ExtraBold";
  return "Black";
}

// ============================================================================
// Frame/Shape oluşturma yardımcıları
// ============================================================================

function applyCommonFrameProps(frame: FrameNode, params: Record<string, unknown>): void {
  frame.name = (params.name as string) || "Frame";

  const width = (params.width as number) || 100;
  const height = (params.height as number) || 100;
  frame.resize(width, height);

  if (params.x !== undefined) frame.x = params.x as number;
  if (params.y !== undefined) frame.y = params.y as number;

  if (params.fill) {
    frame.fills = [createFill(params.fill as FillConfig)];
  } else if (!params.parentId) {
    // Root frame (parentId olmayan) icin varsayilan dark theme background
    // #09090B = rgb(9, 9, 11) - beyaz text gorunsun diye
    frame.fills = [{ type: "SOLID", color: { r: 9 / 255, g: 9 / 255, b: 11 / 255 } }];
  } else {
    // Child frame'ler icin transparent (parent'in arka planini goster)
    // Figma varsayilan olarak beyaz fill verir, bu yuzden bos array ile transparent yapiyoruz
    frame.fills = [];
  }

  if (params.cornerRadius !== undefined) {
    frame.cornerRadius = params.cornerRadius as number;
  }

  if (params.stroke) {
    applyStroke(frame, params.stroke as StrokeConfig);
  }

  if (params.effects) {
    frame.effects = (params.effects as EffectConfig[]).map(createEffect);
  }

  if (params.autoLayout) {
    applyAutoLayout(frame, params.autoLayout as AutoLayoutConfig);
  }

  if (params.clipsContent !== undefined) {
    frame.clipsContent = params.clipsContent as boolean;
  }

  // Layout sizing
  if (params.layoutSizingHorizontal) {
    frame.layoutSizingHorizontal = params.layoutSizingHorizontal as "FIXED" | "HUG" | "FILL";
  }
  if (params.layoutSizingVertical) {
    frame.layoutSizingVertical = params.layoutSizingVertical as "FIXED" | "HUG" | "FILL";
  }
}

// ============================================================================
// Komut İşleyiciler
// ============================================================================

async function handleCreateFrame(params: Record<string, unknown>): Promise<{ nodeId: string; fill?: string; name?: string }> {
  // Parent'ı bul
  let parent: FrameNode | ComponentNode | undefined;
  if (params.parentId) {
    const parentNode = await getNode(params.parentId as string);
    if (parentNode && "appendChild" in parentNode) {
      parent = parentNode as FrameNode | ComponentNode;
    }
  }

  // Auto Layout config oluştur
  const config: CoreAutoLayoutConfig = {
    name: (params.name as string) || "Frame",
    direction: (params.autoLayout as { mode?: string })?.mode === "HORIZONTAL" ? "HORIZONTAL" : "VERTICAL",
    spacing: {
      gap: "4" as const, // Default 16px
      padding: "4" as const, // Default 16px
    },
    parent,
  };

  // Auto Layout params varsa override et
  if (params.autoLayout) {
    const al = params.autoLayout as Record<string, unknown>;

    // Spacing - raw number'ı en yakın token'a çevir
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

  // Fill - hex'i RGB'ye çevir
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
    // Root frame (parentId olmayan) icin varsayilan dark theme background
    // #09090B = rgb(9, 9, 11) - beyaz text gorunsun diye
    config.fill = { type: "SOLID", color: { r: 9 / 255, g: 9 / 255, b: 11 / 255 } };
  }
  // Child frame'ler icin fill belirtilmezse transparent (createAutoLayout varsayilani)

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

  // Frame oluştur (factory kullanarak)
  const frame = createAutoLayout(config);

  // x, y PARAMETRELERİ ARTIK GÖRMEZDEN GELİNİYOR
  // Auto Layout parent pozisyonu otomatik belirler
  // Eski kod: if (params.x !== undefined) frame.x = params.x; // KALDIRILDI

  // Stroke uygula (henüz factory'de desteklenmiyor)
  if (params.stroke) {
    applyStroke(frame, params.stroke as StrokeConfig);
  }

  // Effects uygula (henüz factory'de desteklenmiyor)
  if (params.effects) {
    frame.effects = (params.effects as EffectConfig[]).map(createEffect);
  }

  // Clips content - varsayilan TRUE (içerik frame dışına taşmasın)
  // Scrollable içerik için kritik - aksi halde içerik main frame dışına çıkar
  if (params.clipsContent !== undefined) {
    frame.clipsContent = params.clipsContent as boolean;
  } else {
    // Varsayılan olarak clipsContent = true
    frame.clipsContent = true;
  }

  registerNode(frame);

  if (!params.parentId) {
    figma.viewport.scrollAndZoomIntoView([frame]);
  }

  // Response'a fill bilgisi ekle - Claude ne renk olustugunu gorsun
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

async function handleCreateRectangle(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const rect = figma.createRectangle();
  rect.name = (params.name as string) || "Rectangle";
  rect.resize((params.width as number) || 100, (params.height as number) || 100);

  if (params.x !== undefined) rect.x = params.x as number;
  if (params.y !== undefined) rect.y = params.y as number;

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

  // Parent'a ekle
  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(rect);
    }
  } else {
    figma.currentPage.appendChild(rect);
  }

  registerNode(rect);
  return { nodeId: rect.id };
}

async function handleCreateEllipse(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const ellipse = figma.createEllipse();
  ellipse.name = (params.name as string) || "Ellipse";
  ellipse.resize((params.width as number) || 100, (params.height as number) || 100);

  if (params.x !== undefined) ellipse.x = params.x as number;
  if (params.y !== undefined) ellipse.y = params.y as number;

  if (params.fill) {
    ellipse.fills = [createFill(params.fill as FillConfig)];
  }

  if (params.effects) {
    ellipse.effects = (params.effects as EffectConfig[]).map(createEffect);
  }

  // Parent'a ekle
  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(ellipse);
    }
  } else {
    figma.currentPage.appendChild(ellipse);
  }

  registerNode(ellipse);
  return { nodeId: ellipse.id };
}

async function handleCreateText(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const text = figma.createText();
  const style = (params.style as TextStyleConfig) || {};

  const fontFamily = style.fontFamily || "Inter";
  const fontWeight = style.fontWeight || 400;
  const font = await loadFont(fontFamily, fontWeight);

  text.fontName = font;
  text.characters = (params.content as string) || "Text";
  text.fontSize = style.fontSize || 16;

  if (style.textAlign) {
    text.textAlignHorizontal = style.textAlign;
  }

  if (style.letterSpacing !== undefined) {
    text.letterSpacing = { value: style.letterSpacing, unit: "PIXELS" };
  }

  if (params.fill) {
    text.fills = [createFill(params.fill as FillConfig)];
  }

  if (params.width) {
    text.resize(params.width as number, text.height);
    text.textAutoResize = "HEIGHT";
  }

  if (params.x !== undefined) text.x = params.x as number;
  if (params.y !== undefined) text.y = params.y as number;

  text.name = (params.name as string) || text.characters.substring(0, 20);

  // Parent'a ekle
  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(text);
    }
  } else {
    figma.currentPage.appendChild(text);
  }

  registerNode(text);
  return { nodeId: text.id };
}

async function handleCreateButton(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const variant = (params.variant as string) || "primary";
  const size = (params.size as string) || "md";

  const sizes: Record<string, { paddingX: number; paddingY: number; fontSize: number }> = {
    sm: { paddingX: 12, paddingY: 6, fontSize: 14 },
    md: { paddingX: 16, paddingY: 10, fontSize: 16 },
    lg: { paddingX: 24, paddingY: 14, fontSize: 18 },
  };

  const variants: Record<string, { fill: string; textColor: string; stroke?: string }> = {
    primary: { fill: "#8B5CF6", textColor: "#FFFFFF" },
    secondary: { fill: "#27272A", textColor: "#FFFFFF" },
    outline: { fill: "transparent", textColor: "#8B5CF6", stroke: "#8B5CF6" },
    ghost: { fill: "transparent", textColor: "#A1A1AA" },
    destructive: { fill: "#EF4444", textColor: "#FFFFFF" },
  };

  const sizeConfig = sizes[size] || sizes.md;
  const variantConfig = variants[variant] || variants.primary;

  // Node'u oluştur - hata olursa temizle
  const button = figma.createFrame();
  try {
  button.name = (params.name as string) || "Button";
  button.layoutMode = "HORIZONTAL";
  button.primaryAxisSizingMode = "AUTO";
  button.counterAxisSizingMode = "AUTO";
  button.primaryAxisAlignItems = "CENTER";
  button.counterAxisAlignItems = "CENTER";

  const px = (params.paddingX as number) !== undefined ? (params.paddingX as number) : sizeConfig.paddingX;
  const py = (params.paddingY as number) !== undefined ? (params.paddingY as number) : sizeConfig.paddingY;
  button.paddingLeft = px;
  button.paddingRight = px;
  button.paddingTop = py;
  button.paddingBottom = py;
  button.cornerRadius = (params.cornerRadius as number) !== undefined ? (params.cornerRadius as number) : 8;

  if (params.fill) {
    button.fills = [createFill(params.fill as FillConfig)];
  } else if (variantConfig.fill === "transparent") {
    button.fills = [];
  } else {
    button.fills = [createSolidPaint(variantConfig.fill)];
  }

  if (variantConfig.stroke || variant === "outline") {
    button.strokes = [createSolidPaint(variantConfig.stroke || "#8B5CF6")];
    button.strokeWeight = 1;
  }

  const text = figma.createText();
  await loadFont("Inter", 500);
  text.fontName = { family: "Inter", style: "Medium" };
  text.characters = (params.text as string) || "Button";
  text.fontSize = sizeConfig.fontSize;

  const textColor = params.textColor
    ? parseColor(params.textColor as string | RGBColor)
    : parseColor(variantConfig.textColor);
  text.fills = [{ type: "SOLID", color: textColor }];

  button.appendChild(text);

  // Parent'a ÖNCE ekle (fullWidth için gerekli)
  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(button);

      // fullWidth sadece auto-layout parent içinde çalışır
      if (params.fullWidth) {
        const parentFrame = parent as FrameNode;
        if (parentFrame.layoutMode !== "NONE") {
          button.layoutSizingHorizontal = "FILL";
        } else {
          // Parent auto-layout değilse, genişliği manuel ayarla
          console.warn("fullWidth requires parent with auto-layout, using fixed width instead");
          button.resize(parentFrame.width - 32, button.height); // padding çıkar
        }
      }
    }
  } else {
    figma.currentPage.appendChild(button);
  }

  registerNode(button);
  return { nodeId: button.id };
  } catch (error) {
    // Hata olursa node'u temizle
    button.remove();
    throw error;
  }
}

async function handleCreateInput(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const width = (params.width as number) || 280;
  const variant = (params.variant as string) || "outline";

  const container = figma.createFrame();
  try {
  container.name = (params.name as string) || "Input";
  container.layoutMode = "VERTICAL";
  container.primaryAxisSizingMode = "AUTO";
  // Container genişliğini sabit tut, auto-layout parent'ta doğru çalışsın
  container.counterAxisSizingMode = "FIXED";
  container.resize(width, container.height);
  container.itemSpacing = 6;
  container.fills = [];

  if (params.label) {
    const label = figma.createText();
    await loadFont("Inter", 500);
    label.fontName = { family: "Inter", style: "Medium" };
    label.characters = params.label as string;
    label.fontSize = 14;
    label.fills = [createSolidPaint("#A1A1AA")];
    container.appendChild(label);
  }

  const input = figma.createFrame();
  input.name = "Input Field";
  input.resize(width, 44);
  input.layoutMode = "HORIZONTAL";
  // Genişliği sabit tut - auto-layout içinde shrink etmesin
  input.primaryAxisSizingMode = "FIXED";
  input.counterAxisSizingMode = "FIXED";
  input.primaryAxisAlignItems = "MIN";
  input.counterAxisAlignItems = "CENTER";
  input.paddingLeft = 12;
  input.paddingRight = 12;
  input.cornerRadius = 8;

  if (variant === "outline") {
    input.fills = [createSolidPaint("#18181B")];
    input.strokes = [createSolidPaint("#27272A")];
    input.strokeWeight = 1;
  } else if (variant === "filled") {
    input.fills = [createSolidPaint("#27272A")];
  }

  const placeholder = figma.createText();
  await loadFont("Inter", 400);
  placeholder.fontName = { family: "Inter", style: "Regular" };
  placeholder.characters = (params.placeholder as string) || "Enter text...";
  placeholder.fontSize = 15;
  placeholder.fills = [createSolidPaint("#52525B")];

  input.appendChild(placeholder);
  container.appendChild(input);

  // Parent'a ekle
  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(container);
    }
  } else {
    figma.currentPage.appendChild(container);
  }

  registerNode(container);
  return { nodeId: container.id };
  } catch (error) {
    // Hata olursa node'u temizle
    container.remove();
    throw error;
  }
}

async function handleCreateCard(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  // Auto Layout config
  const config: CoreAutoLayoutConfig = {
    name: (params.name as string) || "Card",
    direction: "VERTICAL",
    spacing: {
      padding: "6" as const, // 24px default
    },
    fill: {
      type: "SOLID",
      color: { r: 1, g: 1, b: 1 }, // White background
    },
    cornerRadius: "lg",
  };

  // Parent
  if (params.parentId) {
    const parentNode = await getNode(params.parentId as string);
    if (parentNode && "appendChild" in parentNode) {
      config.parent = parentNode as FrameNode | ComponentNode;
    }
  }

  // Custom fill
  if (params.fill) {
    const fillParam = params.fill as { type?: string; color?: string | { r: number; g: number; b: number } };
    if (fillParam.type === "SOLID" && fillParam.color) {
      if (typeof fillParam.color === "string") {
        config.fill = { type: "SOLID", color: hexToRgb(fillParam.color) };
      } else {
        config.fill = { type: "SOLID", color: fillParam.color };
      }
    }
  }

  // Dimensions - respect direction (VERTICAL)
  if (params.width) {
    config.width = params.width as number;
    config.counterAxisSizing = "FIXED"; // VERTICAL: width = counter axis
  }
  if (params.height) {
    config.height = params.height as number;
    config.primaryAxisSizing = "FIXED"; // VERTICAL: height = primary axis
  }

  const card = createAutoLayout(config);

  // Shadow efekti
  if (params.shadow !== false) {
    card.effects = [{
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 4 },
      radius: 8,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    }];
  }

  registerNode(card);
  return { nodeId: card.id };
}

// ============================================================================
// Node Manipülasyon İşleyicileri (Async)
// ============================================================================

async function handleSetAutoLayout(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const node = await getNode(nodeId);

  if (!node || node.type !== "FRAME") {
    throw new Error(`Node ${nodeId} not found or is not a frame`);
  }

  applyAutoLayout(node as FrameNode, params.layout as AutoLayoutConfig);
  return { success: true };
}

async function handleSetFill(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const node = await getNode(nodeId);

  if (!node || !("fills" in node)) {
    throw new Error(`Node ${nodeId} not found or cannot have fills`);
  }

  (node as GeometryMixin).fills = [createFill(params.fill as FillConfig)];
  return { success: true };
}

async function handleSetEffects(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const node = await getNode(nodeId);

  if (!node || !("effects" in node)) {
    throw new Error(`Node ${nodeId} not found or cannot have effects`);
  }

  (node as BlendMixin).effects = (params.effects as EffectConfig[]).map(createEffect);
  return { success: true };
}

async function handleModifyNode(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const node = await getNode(nodeId);

  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  const properties = params.properties as Record<string, unknown>;

  for (const [key, value] of Object.entries(properties)) {
    if (key === "fill" && "fills" in node) {
      (node as GeometryMixin).fills = [createFill(value as FillConfig)];
    } else if (key === "stroke" && "strokes" in node) {
      applyStroke(node as GeometryMixin & MinimalStrokesMixin, value as StrokeConfig);
    } else if (key === "effects" && "effects" in node) {
      (node as BlendMixin).effects = (value as EffectConfig[]).map(createEffect);
    } else if (key === "autoLayout" && node.type === "FRAME") {
      applyAutoLayout(node as FrameNode, value as AutoLayoutConfig);
    } else if (key in node) {
      (node as unknown as Record<string, unknown>)[key] = value;
    }
  }

  return { success: true };
}

async function handleAppendChild(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const parentId = params.parentId as string;
  const parent = await getNode(parentId);

  if (!parent || !("appendChild" in parent)) {
    throw new Error(`Parent ${parentId} not found or cannot have children`);
  }

  const childType = params.childType as string;
  const properties = (params.properties as Record<string, unknown>) || {};

  let child: SceneNode;

  switch (childType) {
    case "frame": {
      const frame = figma.createFrame();
      if (properties.name) frame.name = properties.name as string;
      if (properties.width && properties.height) {
        frame.resize(properties.width as number, properties.height as number);
      }
      if (properties.fill) {
        frame.fills = [createFill(properties.fill as FillConfig)];
      }
      if (properties.cornerRadius !== undefined) {
        frame.cornerRadius = properties.cornerRadius as number;
      }
      if (properties.autoLayout) {
        applyAutoLayout(frame, properties.autoLayout as AutoLayoutConfig);
      }
      child = frame;
      break;
    }
    case "rectangle": {
      const rect = figma.createRectangle();
      if (properties.name) rect.name = properties.name as string;
      if (properties.width && properties.height) {
        rect.resize(properties.width as number, properties.height as number);
      }
      if (properties.fill) {
        rect.fills = [createFill(properties.fill as FillConfig)];
      }
      if (properties.cornerRadius !== undefined) {
        rect.cornerRadius = properties.cornerRadius as number;
      }
      child = rect;
      break;
    }
    case "ellipse": {
      const ellipse = figma.createEllipse();
      if (properties.name) ellipse.name = properties.name as string;
      if (properties.width && properties.height) {
        ellipse.resize(properties.width as number, properties.height as number);
      }
      if (properties.fill) {
        ellipse.fills = [createFill(properties.fill as FillConfig)];
      }
      child = ellipse;
      break;
    }
    case "text": {
      const text = figma.createText();
      const style = (properties.style as TextStyleConfig) || {};
      await loadFont(style.fontFamily || "Inter", style.fontWeight || 400);
      text.fontName = {
        family: style.fontFamily || "Inter",
        style: getFontStyle(style.fontWeight || 400)
      };
      text.characters = (properties.content as string) || "Text";
      text.fontSize = style.fontSize || 16;
      if (properties.fill) {
        text.fills = [createFill(properties.fill as FillConfig)];
      }
      if (properties.name) text.name = properties.name as string;
      child = text;
      break;
    }
    default:
      throw new Error(`Unknown child type: ${childType}`);
  }

  (parent as FrameNode).appendChild(child);
  registerNode(child);
  return { nodeId: child.id };
}

async function handleMoveToParent(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const newParentId = params.newParentId as string;
  const index = params.index as number | undefined;

  const node = await getNode(nodeId);
  const newParent = await getNode(newParentId);

  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  if (!newParent || !("appendChild" in newParent)) {
    throw new Error(`New parent ${newParentId} not found or cannot have children`);
  }

  const parentFrame = newParent as FrameNode;

  if (index !== undefined && index >= 0 && index < parentFrame.children.length) {
    parentFrame.insertChild(index, node);
  } else {
    parentFrame.appendChild(node);
  }

  return { success: true };
}

async function handleCreateComponent(params: Record<string, unknown>): Promise<{ nodeId: string }> {
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

  // Component library'ye kaydet
  const libraryKey = (params.libraryKey as string) || component.name;
  componentLibrary.set(libraryKey, component);

  return { nodeId: component.id };
}

// ============================================================================
// Component Library Handlers
// ============================================================================

async function handleCreateComponentInstance(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const componentKey = params.componentKey as string;
  const componentId = params.componentId as string;

  let component: ComponentNode | null = null;

  // Önce library'den bak
  if (componentKey && componentLibrary.has(componentKey)) {
    component = componentLibrary.get(componentKey) || null;
  }

  // Sonra ID ile bak
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

  // Parent'a ekle
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

async function handleGetLocalComponents(): Promise<{ components: ComponentDefinition[] }> {
  const components: ComponentDefinition[] = [];

  // Library'deki component'leri ekle
  componentLibrary.forEach((comp, key) => {
    components.push({
      id: comp.id,
      name: key,
      description: comp.description,
    });
  });

  // Sayfadaki tüm component'leri tara
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

async function handleRegisterComponent(params: Record<string, unknown>): Promise<{ success: boolean }> {
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
// Component Slots - Register and instantiate reusable component slots
// ============================================================================

async function handleRegisterComponentSlot(params: Record<string, unknown>): Promise<{ success: boolean; slotKey: string; nodeId: string }> {
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

async function handleCreateFromSlot(params: Record<string, unknown>): Promise<{ nodeId: string; name: string }> {
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

function handleListComponentSlots(params: Record<string, unknown>): { slots: Array<{ slotKey: string; nodeId: string; variants?: Record<string, string> }> } {
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
// Pre-built UI Components - Hazır UI component'leri oluştur
// ============================================================================

async function handleCreateUIComponent(params: Record<string, unknown>): Promise<{ nodeId: string; componentKey: string }> {
  const componentType = params.type as string;
  const variant = (params.variant as string) || "default";

  let component: ComponentNode;
  let componentKey: string;

  switch (componentType) {
    case "button": {
      componentKey = `Button/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        if (params.parentId) {
          const parent = await getNode(params.parentId as string);
          if (parent && "appendChild" in parent) {
            (parent as FrameNode).appendChild(instance);
          }
        }
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createButtonComponent(variant, params);
      break;
    }
    case "input": {
      componentKey = `Input/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        if (params.parentId) {
          const parent = await getNode(params.parentId as string);
          if (parent && "appendChild" in parent) {
            (parent as FrameNode).appendChild(instance);
          }
        }
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createInputComponent(variant, params);
      break;
    }
    case "card": {
      componentKey = `Card/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        if (params.parentId) {
          const parent = await getNode(params.parentId as string);
          if (parent && "appendChild" in parent) {
            (parent as FrameNode).appendChild(instance);
          }
        }
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createCardComponent(variant, params);
      break;
    }
    case "avatar": {
      componentKey = `Avatar/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        if (params.parentId) {
          const parent = await getNode(params.parentId as string);
          if (parent && "appendChild" in parent) {
            (parent as FrameNode).appendChild(instance);
          }
        }
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createAvatarComponent(variant, params);
      break;
    }
    case "badge": {
      componentKey = `Badge/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        if (params.parentId) {
          const parent = await getNode(params.parentId as string);
          if (parent && "appendChild" in parent) {
            (parent as FrameNode).appendChild(instance);
          }
        }
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createBadgeComponent(variant, params);
      break;
    }
    case "icon-button": {
      componentKey = `IconButton/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        if (params.parentId) {
          const parent = await getNode(params.parentId as string);
          if (parent && "appendChild" in parent) {
            (parent as FrameNode).appendChild(instance);
          }
        }
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createIconButtonComponent(variant, params);
      break;
    }
    case "checkbox": {
      componentKey = `Checkbox/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        if (params.parentId) {
          const parent = await getNode(params.parentId as string);
          if (parent && "appendChild" in parent) {
            (parent as FrameNode).appendChild(instance);
          }
        }
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createCheckboxComponent(variant, params);
      break;
    }
    case "toggle": {
      componentKey = `Toggle/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        if (params.parentId) {
          const parent = await getNode(params.parentId as string);
          if (parent && "appendChild" in parent) {
            (parent as FrameNode).appendChild(instance);
          }
        }
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createToggleComponent(variant, params);
      break;
    }
    case "tab": {
      componentKey = `Tab/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        if (params.parentId) {
          const parent = await getNode(params.parentId as string);
          if (parent && "appendChild" in parent) {
            (parent as FrameNode).appendChild(instance);
          }
        }
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createTabComponent(variant, params);
      break;
    }
    case "nav-item": {
      componentKey = `NavItem/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        if (params.parentId) {
          const parent = await getNode(params.parentId as string);
          if (parent && "appendChild" in parent) {
            (parent as FrameNode).appendChild(instance);
          }
        }
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createNavItemComponent(variant, params);
      break;
    }
    default:
      throw new Error(`Unknown UI component type: ${componentType}`);
  }

  componentLibrary.set(componentKey, component);
  figma.currentPage.appendChild(component);
  registerNode(component);

  return { nodeId: component.id, componentKey };
}

// Button Component Creator
async function createButtonComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `Button/${variant}`;

  component.layoutMode = "HORIZONTAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.primaryAxisAlignItems = "CENTER";
  component.counterAxisAlignItems = "CENTER";
  component.paddingLeft = 16;
  component.paddingRight = 16;
  component.paddingTop = 10;
  component.paddingBottom = 10;
  component.cornerRadius = 8;
  component.itemSpacing = 8;

  const variants: Record<string, { bg: string; text: string; border?: string }> = {
    primary: { bg: "#8B5CF6", text: "#FFFFFF" },
    secondary: { bg: "#27272A", text: "#FFFFFF" },
    outline: { bg: "#00000000", text: "#8B5CF6", border: "#8B5CF6" },
    ghost: { bg: "#00000000", text: "#A1A1AA" },
    destructive: { bg: "#EF4444", text: "#FFFFFF" },
    success: { bg: "#10B981", text: "#FFFFFF" },
  };

  const style = variants[variant] || variants.primary;

  if (style.bg === "#00000000") {
    component.fills = [];
  } else {
    component.fills = [createSolidPaint(style.bg)];
  }

  if (style.border) {
    component.strokes = [createSolidPaint(style.border)];
    component.strokeWeight = 1;
  }

  const text = figma.createText();
  await loadFont("Inter", 500);
  text.fontName = { family: "Inter", style: "Medium" };
  text.characters = (params.text as string) || "Button";
  text.fontSize = 14;
  text.fills = [createSolidPaint(style.text)];

  component.appendChild(text);

  return component;
}

// Input Component Creator
async function createInputComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `Input/${variant}`;

  component.layoutMode = "HORIZONTAL";
  component.primaryAxisAlignItems = "MIN";
  component.counterAxisAlignItems = "CENTER";
  component.resize(280, 44);
  component.paddingLeft = 12;
  component.paddingRight = 12;
  component.cornerRadius = 8;

  if (variant === "filled") {
    component.fills = [createSolidPaint("#27272A")];
  } else {
    component.fills = [createSolidPaint("#18181B")];
    component.strokes = [createSolidPaint("#3F3F46")];
    component.strokeWeight = 1;
  }

  const placeholder = figma.createText();
  await loadFont("Inter", 400);
  placeholder.fontName = { family: "Inter", style: "Regular" };
  placeholder.characters = (params.placeholder as string) || "Enter text...";
  placeholder.fontSize = 14;
  placeholder.fills = [createSolidPaint("#71717A")];

  component.appendChild(placeholder);

  return component;
}

// Card Component Creator
async function createCardComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `Card/${variant}`;

  const width = (params.width as number) || 320;
  component.resize(width, 200);

  component.layoutMode = "VERTICAL";
  component.primaryAxisSizingMode = "AUTO";
  component.paddingTop = 24;
  component.paddingRight = 24;
  component.paddingBottom = 24;
  component.paddingLeft = 24;
  component.itemSpacing = 16;
  component.cornerRadius = 16;

  if (variant === "elevated") {
    component.fills = [createSolidPaint("#18181B")];
    component.effects = [{
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.4 },
      offset: { x: 0, y: 8 },
      radius: 24,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    }];
  } else if (variant === "outlined") {
    component.fills = [createSolidPaint("#0A0A0A")];
    component.strokes = [createSolidPaint("#27272A")];
    component.strokeWeight = 1;
  } else {
    component.fills = [createSolidPaint("#18181B")];
    component.strokes = [createSolidPaint("#27272A")];
    component.strokeWeight = 1;
  }

  return component;
}

// Avatar Component Creator
async function createAvatarComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `Avatar/${variant}`;

  const sizes: Record<string, number> = { sm: 32, md: 40, lg: 56, xl: 72 };
  const size = sizes[variant] || sizes.md;

  component.resize(size, size);
  component.cornerRadius = size / 2;
  component.fills = [createSolidPaint("#3F3F46")];
  component.layoutMode = "HORIZONTAL";
  component.primaryAxisAlignItems = "CENTER";
  component.counterAxisAlignItems = "CENTER";

  const initials = figma.createText();
  await loadFont("Inter", 500);
  initials.fontName = { family: "Inter", style: "Medium" };
  initials.characters = (params.initials as string) || "AB";
  initials.fontSize = size * 0.4;
  initials.fills = [createSolidPaint("#FFFFFF")];

  component.appendChild(initials);

  return component;
}

// Badge Component Creator
async function createBadgeComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `Badge/${variant}`;

  component.layoutMode = "HORIZONTAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.paddingLeft = 8;
  component.paddingRight = 8;
  component.paddingTop = 4;
  component.paddingBottom = 4;
  component.cornerRadius = 9999;

  const variants: Record<string, { bg: string; text: string }> = {
    default: { bg: "#27272A", text: "#FFFFFF" },
    primary: { bg: "#8B5CF6", text: "#FFFFFF" },
    success: { bg: "#10B981", text: "#FFFFFF" },
    warning: { bg: "#F59E0B", text: "#18181B" },
    error: { bg: "#EF4444", text: "#FFFFFF" },
    info: { bg: "#3B82F6", text: "#FFFFFF" },
  };

  const style = variants[variant] || variants.default;
  component.fills = [createSolidPaint(style.bg)];

  const text = figma.createText();
  await loadFont("Inter", 500);
  text.fontName = { family: "Inter", style: "Medium" };
  text.characters = (params.text as string) || "Badge";
  text.fontSize = 12;
  text.fills = [createSolidPaint(style.text)];

  component.appendChild(text);

  return component;
}

// IconButton Component Creator
async function createIconButtonComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `IconButton/${variant}`;

  const sizes: Record<string, number> = { sm: 32, md: 40, lg: 48 };
  const size = sizes[variant] || sizes.md;

  component.resize(size, size);
  component.cornerRadius = 8;
  component.layoutMode = "HORIZONTAL";
  component.primaryAxisAlignItems = "CENTER";
  component.counterAxisAlignItems = "CENTER";
  component.fills = [createSolidPaint("#27272A")];

  const icon = figma.createText();
  await loadFont("Inter", 400);
  icon.fontName = { family: "Inter", style: "Regular" };
  icon.characters = (params.icon as string) || "★";
  icon.fontSize = size * 0.5;
  icon.fills = [createSolidPaint("#FFFFFF")];

  component.appendChild(icon);

  return component;
}

// Checkbox Component Creator
async function createCheckboxComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `Checkbox/${variant}`;

  component.layoutMode = "HORIZONTAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.itemSpacing = 8;
  component.counterAxisAlignItems = "CENTER";
  component.fills = [];

  const box = figma.createFrame();
  box.name = "checkbox-box";
  box.resize(20, 20);
  box.cornerRadius = 4;

  if (variant === "checked") {
    box.fills = [createSolidPaint("#8B5CF6")];
    const check = figma.createText();
    await loadFont("Inter", 700);
    check.fontName = { family: "Inter", style: "Bold" };
    check.characters = "✓";
    check.fontSize = 14;
    check.fills = [createSolidPaint("#FFFFFF")];
    box.layoutMode = "HORIZONTAL";
    box.primaryAxisAlignItems = "CENTER";
    box.counterAxisAlignItems = "CENTER";
    box.appendChild(check);
  } else {
    box.fills = [createSolidPaint("#18181B")];
    box.strokes = [createSolidPaint("#3F3F46")];
    box.strokeWeight = 2;
  }

  component.appendChild(box);

  if (params.label) {
    const label = figma.createText();
    await loadFont("Inter", 400);
    label.fontName = { family: "Inter", style: "Regular" };
    label.characters = params.label as string;
    label.fontSize = 14;
    label.fills = [createSolidPaint("#FFFFFF")];
    component.appendChild(label);
  }

  return component;
}

// Toggle Component Creator
async function createToggleComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `Toggle/${variant}`;

  component.resize(44, 24);
  component.cornerRadius = 12;
  component.layoutMode = "HORIZONTAL";
  component.paddingLeft = 2;
  component.paddingRight = 2;
  component.counterAxisAlignItems = "CENTER";

  if (variant === "on") {
    component.fills = [createSolidPaint("#8B5CF6")];
    component.primaryAxisAlignItems = "MAX";
  } else {
    component.fills = [createSolidPaint("#3F3F46")];
    component.primaryAxisAlignItems = "MIN";
  }

  const knob = figma.createEllipse();
  knob.name = "knob";
  knob.resize(20, 20);
  knob.fills = [createSolidPaint("#FFFFFF")];

  component.appendChild(knob);

  return component;
}

// Tab Component Creator
async function createTabComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `Tab/${variant}`;

  component.layoutMode = "HORIZONTAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.paddingLeft = 16;
  component.paddingRight = 16;
  component.paddingTop = 12;
  component.paddingBottom = 12;
  component.fills = [];

  const text = figma.createText();
  await loadFont("Inter", variant === "active" ? 500 : 400);
  text.fontName = { family: "Inter", style: variant === "active" ? "Medium" : "Regular" };
  text.characters = (params.text as string) || "Tab";
  text.fontSize = 14;
  text.fills = [createSolidPaint(variant === "active" ? "#FFFFFF" : "#71717A")];

  component.appendChild(text);

  if (variant === "active") {
    component.strokes = [createSolidPaint("#8B5CF6")];
    component.strokeWeight = 2;
    component.strokeAlign = "INSIDE";
    // Bottom border only
    component.strokeTopWeight = 0;
    component.strokeLeftWeight = 0;
    component.strokeRightWeight = 0;
    component.strokeBottomWeight = 2;
  }

  return component;
}

// NavItem Component Creator
async function createNavItemComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `NavItem/${variant}`;

  component.layoutMode = "HORIZONTAL";
  component.primaryAxisSizingMode = "FIXED";
  component.counterAxisSizingMode = "AUTO";
  component.resize(220, 44);
  component.primaryAxisAlignItems = "MIN";
  component.counterAxisAlignItems = "CENTER";
  component.paddingLeft = 12;
  component.paddingRight = 12;
  component.itemSpacing = 12;
  component.cornerRadius = 8;

  if (variant === "active") {
    component.fills = [createSolidPaint("#8B5CF6")];
  } else {
    component.fills = [];
  }

  const icon = figma.createText();
  await loadFont("Inter", 400);
  icon.fontName = { family: "Inter", style: "Regular" };
  icon.characters = (params.icon as string) || "○";
  icon.fontSize = 16;
  icon.fills = [createSolidPaint(variant === "active" ? "#FFFFFF" : "#A1A1AA")];
  component.appendChild(icon);

  const text = figma.createText();
  await loadFont("Inter", variant === "active" ? 500 : 400);
  text.fontName = { family: "Inter", style: variant === "active" ? "Medium" : "Regular" };
  text.characters = (params.text as string) || "Nav Item";
  text.fontSize = 14;
  text.fills = [createSolidPaint(variant === "active" ? "#FFFFFF" : "#A1A1AA")];
  component.appendChild(text);

  return component;
}

async function handleGetSelection(): Promise<{ selection: Array<{ id: string; name: string; type: string }> }> {
  const selection = figma.currentPage.selection.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
  }));

  return { selection };
}

async function handleSetThemeTokens(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const colors = params.colors as Record<string, string>;
  const partialTokens: Partial<ThemeColors> = {};

  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === "string") {
      // Assuming value is hex string
      partialTokens[key as keyof ThemeColors] = createColorToken(value);
    }
  }

  themeManager.setCustomColors(partialTokens);
  return { success: true };
}

// ============================================================================
// Extended Component Library Handlers
// ============================================================================

async function handleSetTheme(params: Record<string, unknown>): Promise<{ success: boolean; theme: string; platform: string }> {
  const theme = (params.theme as Theme) || "light";
  const platform = params.platform as Platform | undefined;

  themeManager.setTheme(theme);
  if (platform) {
    themeManager.setPlatform(platform);
  }

  return {
    success: true,
    theme: themeManager.getTheme(),
    platform: themeManager.getPlatform(),
  };
}

async function handleCreateShadcnComponent(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const componentName = params.component as string;
  const theme = (params.theme as Theme) || themeManager.getTheme();
  const options = { ...params, theme };

  const node = await createShadcnComponent(componentName, options);

  if (!node) {
    throw new Error(`Failed to create shadcn component: ${componentName}`);
  }

  // Add to parent if specified
  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(node);
    }
  } else {
    figma.currentPage.appendChild(node);
    figma.viewport.scrollAndZoomIntoView([node]);
  }

  registerNode(node);
  return { nodeId: node.id };
}

async function handleCreateAppleComponent(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const platform = params.platform as "ios" | "macos";
  const componentName = params.component as string;
  const theme = (params.theme as Theme) || themeManager.getTheme();
  const options = { ...params, theme };

  let node: SceneNode | null = null;

  if (platform === "ios") {
    node = await createIOSComponent(componentName, options);
  } else if (platform === "macos") {
    node = await createMacOSComponent(componentName, options);
  }

  if (!node) {
    throw new Error(`Failed to create ${platform} component: ${componentName}`);
  }

  // Add to parent if specified
  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(node);
    }
  } else {
    figma.currentPage.appendChild(node);
    figma.viewport.scrollAndZoomIntoView([node]);
  }

  registerNode(node);
  return { nodeId: node.id };
}

// ============================================================================
// iOS 26 Liquid Glass Component Handler
// ============================================================================

async function handleCreateLiquidGlassComponent(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const componentName = params.component as string;
  const theme = (params.theme as Theme) || themeManager.getTheme();
  const options = { ...params, theme };

  const node = await createLiquidGlassComponent(componentName, options);

  if (!node) {
    throw new Error(`Failed to create Liquid Glass component: ${componentName}. Available: ${listLiquidGlassComponents().join(", ")}`);
  }

  // Add to parent if specified
  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(node);
    }
  } else {
    figma.currentPage.appendChild(node);
    figma.viewport.scrollAndZoomIntoView([node]);
  }

  registerNode(node);
  return { nodeId: node.id };
}

async function handleListComponents(params: Record<string, unknown>): Promise<{ components: Record<string, string[]> }> {
  const library = params.library as ComponentLibrary | undefined;
  const components = listComponents(library);
  return { components };
}

async function handleGetDesignTokens(params: Record<string, unknown>): Promise<{ tokens: Record<string, unknown> }> {
  const category = params.category as string | undefined;
  const theme = (params.theme as Theme) || themeManager.getTheme();
  const platform = (params.platform as Platform) || themeManager.getPlatform();

  // Temporarily set theme/platform for getting colors
  const originalTheme = themeManager.getTheme();
  const originalPlatform = themeManager.getPlatform();
  themeManager.setTheme(theme);
  themeManager.setPlatform(platform);

  const tokens: Record<string, unknown> = {};

  if (!category || category === "colors") {
    tokens.colors = getColors();
  }

  if (!category || category === "typography") {
    const { shadcnTypography, iosTypography, macOSTypography } = await import("./tokens/typography");
    tokens.typography = platform === "ios" ? iosTypography : platform === "macos" ? macOSTypography : shadcnTypography;
  }

  if (!category || category === "spacing") {
    // Import spacing dynamically based on platform
    const { spacing, radius, iosSpacing, macOSSpacing, shadcnSpacing } = await import("./tokens/spacing");
    tokens.spacing = {
      base: spacing,
      radius,
      platform: platform === "ios" ? iosSpacing : platform === "macos" ? macOSSpacing : shadcnSpacing,
    };
  }

  if (!category || category === "shadows") {
    const { shadcnShadows, iosShadowsLight, iosShadowsDark, macOSShadowsLight, macOSShadowsDark } = await import("./tokens/shadows");

    if (platform === "ios") {
      tokens.shadows = theme === "light" ? iosShadowsLight : iosShadowsDark;
    } else if (platform === "macos") {
      tokens.shadows = theme === "light" ? macOSShadowsLight : macOSShadowsDark;
    } else {
      tokens.shadows = shadcnShadows;
    }
  }

  // Restore original theme/platform
  themeManager.setTheme(originalTheme);
  themeManager.setPlatform(originalPlatform);

  return { tokens };
}

async function handleDeleteNode(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const node = await getNode(nodeId);

  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  node.remove();
  nodeRegistry.delete(nodeId);
  return { success: true };
}

async function handleCloneNode(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const nodeId = params.nodeId as string;
  const node = await getNode(nodeId);

  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  const clone = node.clone();

  if (params.x !== undefined) clone.x = params.x as number;
  if (params.y !== undefined) clone.y = params.y as number;
  if (params.name) clone.name = params.name as string;

  registerNode(clone);
  return { nodeId: clone.id };
}

// ============================================================================
// Node Manipulation Handlers
// ============================================================================

async function handleResizeNode(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const width = params.width as number;
  const height = params.height as number;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  if ("resize" in node) {
    (node as FrameNode | RectangleNode | EllipseNode).resize(width, height);
  } else {
    throw new Error(`Node ${nodeId} does not support resize`);
  }

  return { success: true };
}

/**
 * @deprecated Use Auto Layout for positioning instead.
 * Child node positions are automatically determined by their parent's Auto Layout configuration.
 * @throws {Error} Always throws - this operation is no longer supported
 */
async function handleSetPosition(params: Record<string, unknown>): Promise<{ success: boolean }> {
  // Setting x, y coordinates is now forbidden - Auto Layout determines position
  console.warn("SET_POSITION is deprecated. Auto Layout determines position automatically.");

  throw new Error(
    "SET_POSITION is no longer supported. Use Auto Layout parent with proper spacing instead. " +
    "Child position is determined by parent's Auto Layout configuration."
  );
}

async function handleSetLayoutSizing(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const horizontal = params.horizontal as "FIXED" | "HUG" | "FILL" | undefined;
  const vertical = params.vertical as "FIXED" | "HUG" | "FILL" | undefined;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  if (!("layoutSizingHorizontal" in node)) {
    throw new Error(`Node ${nodeId} does not support layout sizing`);
  }

  const layoutNode = node as FrameNode;

  if (horizontal) {
    layoutNode.layoutSizingHorizontal = horizontal;
  }
  if (vertical) {
    layoutNode.layoutSizingVertical = vertical;
  }

  return { success: true };
}

async function handleGetNodeInfo(params: Record<string, unknown>): Promise<{ data: Record<string, unknown> }> {
  const nodeId = params.nodeId as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  const info: Record<string, unknown> = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible,
    x: node.x,
    y: node.y,
  };

  if ("width" in node) {
    info.width = (node as FrameNode).width;
    info.height = (node as FrameNode).height;
  }

  if ("children" in node) {
    const children = (node as FrameNode).children;
    info.childCount = children.length;
    info.children = children.map((child) => ({
      id: child.id,
      name: child.name,
      type: child.type,
    }));
  }

  if ("layoutMode" in node) {
    const layoutNode = node as FrameNode;
    info.layoutMode = layoutNode.layoutMode;
    info.primaryAxisSizingMode = layoutNode.primaryAxisSizingMode;
    info.counterAxisSizingMode = layoutNode.counterAxisSizingMode;
    info.layoutSizingHorizontal = layoutNode.layoutSizingHorizontal;
    info.layoutSizingVertical = layoutNode.layoutSizingVertical;
    info.itemSpacing = layoutNode.itemSpacing;
    info.paddingTop = layoutNode.paddingTop;
    info.paddingRight = layoutNode.paddingRight;
    info.paddingBottom = layoutNode.paddingBottom;
    info.paddingLeft = layoutNode.paddingLeft;
  }

  if ("fills" in node) {
    info.fills = (node as FrameNode).fills;
  }

  if ("strokes" in node) {
    info.strokes = (node as FrameNode).strokes;
    info.strokeWeight = (node as FrameNode).strokeWeight;
  }

  if ("cornerRadius" in node) {
    info.cornerRadius = (node as RectangleNode).cornerRadius;
  }

  if ("opacity" in node) {
    info.opacity = (node as FrameNode).opacity;
  }

  if ("constraints" in node) {
    info.constraints = (node as FrameNode).constraints;
  }

  return { data: info };
}

async function handleSetConstraints(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const horizontal = params.horizontal as "MIN" | "CENTER" | "MAX" | "STRETCH" | "SCALE" | undefined;
  const vertical = params.vertical as "MIN" | "CENTER" | "MAX" | "STRETCH" | "SCALE" | undefined;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  if (!("constraints" in node)) {
    throw new Error(`Node ${nodeId} does not support constraints`);
  }

  const constrainableNode = node as FrameNode;
  const newConstraints = { ...constrainableNode.constraints };

  if (horizontal) {
    newConstraints.horizontal = horizontal;
  }
  if (vertical) {
    newConstraints.vertical = vertical;
  }

  constrainableNode.constraints = newConstraints;
  return { success: true };
}

async function handleReorderChildren(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const parentId = params.parentId as string;
  const childId = params.childId as string;
  const newIndex = params.newIndex as number;

  const parent = await getNode(parentId);
  const child = await getNode(childId);

  if (!parent || !("children" in parent)) {
    throw new Error(`Parent ${parentId} not found or has no children`);
  }

  if (!child) {
    throw new Error(`Child ${childId} not found`);
  }

  const parentFrame = parent as FrameNode;
  const clampedIndex = Math.max(0, Math.min(newIndex, parentFrame.children.length - 1));
  parentFrame.insertChild(clampedIndex, child);

  return { success: true };
}

async function handleSetVisibility(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const visible = params.visible as boolean;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  node.visible = visible;
  return { success: true };
}

async function handleSetOpacity(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const opacity = params.opacity as number;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  if (!("opacity" in node)) {
    throw new Error(`Node ${nodeId} does not support opacity`);
  }

  (node as FrameNode).opacity = opacity;
  return { success: true };
}

async function handleSetStroke(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const color = params.color as string | RGBColor;
  const weight = (params.weight as number) ?? 1;
  const align = (params.align as "INSIDE" | "OUTSIDE" | "CENTER") ?? "INSIDE";

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  if (!("strokes" in node)) {
    throw new Error(`Node ${nodeId} does not support strokes`);
  }

  const strokeNode = node as FrameNode | RectangleNode | EllipseNode;
  strokeNode.strokes = [createSolidPaint(color)];
  strokeNode.strokeWeight = weight;
  strokeNode.strokeAlign = align;

  return { success: true };
}

async function handleCreateLine(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const name = (params.name as string) ?? "Line";
  const startX = params.startX as number;
  const startY = params.startY as number;
  const endX = params.endX as number;
  const endY = params.endY as number;
  const strokeConfig = params.stroke as StrokeConfig | undefined;

  const line = figma.createLine();
  line.name = name;

  // Calculate length and rotation
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  line.x = startX;
  line.y = startY;
  line.resize(length, 0);
  line.rotation = -angle;

  if (strokeConfig) {
    line.strokes = [createSolidPaint(strokeConfig.color)];
    line.strokeWeight = strokeConfig.weight ?? 1;
  } else {
    line.strokes = [createSolidPaint("#000000")];
    line.strokeWeight = 1;
  }

  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(line);
    }
  }

  registerNode(line);
  return { nodeId: line.id };
}

async function handleCreateGroup(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const nodeIds = params.nodeIds as string[];
  const name = (params.name as string) ?? "Group";

  if (!nodeIds || nodeIds.length === 0) {
    throw new Error("No nodes provided for grouping");
  }

  const nodes: SceneNode[] = [];
  for (const id of nodeIds) {
    const node = await getNode(id);
    if (node) {
      nodes.push(node);
    }
  }

  if (nodes.length === 0) {
    throw new Error("No valid nodes found for grouping");
  }

  // All nodes must have the same parent
  const parent = nodes[0].parent;
  if (!parent || !("insertChild" in parent)) {
    throw new Error("Cannot group nodes without a common parent");
  }

  const group = figma.group(nodes, parent as FrameNode | PageNode);
  group.name = name;

  registerNode(group);
  return { nodeId: group.id };
}

async function handleSetTextContent(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const content = params.content as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node ${nodeId} is not a text node`);
  }

  const textNode = node as TextNode;

  // Load font before changing characters
  const fontName = textNode.fontName as FontName;
  await figma.loadFontAsync(fontName);

  textNode.characters = content;
  return { success: true };
}

async function handleSetCornerRadius(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const radius = params.radius as number;
  const topLeft = params.topLeft as number | undefined;
  const topRight = params.topRight as number | undefined;
  const bottomRight = params.bottomRight as number | undefined;
  const bottomLeft = params.bottomLeft as number | undefined;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  if (!("cornerRadius" in node)) {
    throw new Error(`Node ${nodeId} does not support corner radius`);
  }

  const roundedNode = node as FrameNode | RectangleNode;

  // If individual corners are specified, use them
  if (topLeft !== undefined || topRight !== undefined || bottomRight !== undefined || bottomLeft !== undefined) {
    roundedNode.topLeftRadius = topLeft ?? radius;
    roundedNode.topRightRadius = topRight ?? radius;
    roundedNode.bottomRightRadius = bottomRight ?? radius;
    roundedNode.bottomLeftRadius = bottomLeft ?? radius;
  } else {
    roundedNode.cornerRadius = radius;
  }

  return { success: true };
}

async function handleGetPageInfo(): Promise<{ data: Record<string, unknown> }> {
  const currentPage = figma.currentPage;

  const topLevelNodes = currentPage.children.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
    x: node.x,
    y: node.y,
    width: "width" in node ? (node as FrameNode).width : undefined,
    height: "height" in node ? (node as FrameNode).height : undefined,
  }));

  return {
    data: {
      pageId: currentPage.id,
      pageName: currentPage.name,
      nodeCount: topLevelNodes.length,
      nodes: topLevelNodes,
    },
  };
}

async function handleSelectNodes(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeIds = params.nodeIds as string[];

  if (!nodeIds || nodeIds.length === 0) {
    figma.currentPage.selection = [];
    return { success: true };
  }

  const nodes: SceneNode[] = [];
  for (const id of nodeIds) {
    const node = await getNode(id);
    if (node) {
      nodes.push(node);
    }
  }

  figma.currentPage.selection = nodes;

  // Scroll to first selected node
  if (nodes.length > 0) {
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  return { success: true };
}

// ============================================================================
// Lucide Icon Handler
// ============================================================================

async function handleCreateIcon(params: Record<string, unknown>): Promise<{ nodeId: string; availableIcons?: string[] }> {
  const iconName = params.name as string;

  console.log("[DEBUG] handleCreateIcon called with:", { iconName, color: params.color, size: params.size, parentId: params.parentId });

  // If no icon name provided, return available icons
  if (!iconName) {
    console.log("[DEBUG] No icon name provided, returning available icons list");
    return {
      nodeId: "",
      availableIcons: getAvailableIcons(),
    };
  }

  // Check if icon exists
  if (!hasIcon(iconName)) {
    const available = getAvailableIcons();
    const errorMsg = `Icon "${iconName}" not found. Available icons: ${available.slice(0, 20).join(", ")}...`;
    console.error("[DEBUG] Icon not found:", iconName);
    throw new Error(errorMsg);
  }

  const svgString = LUCIDE_ICONS[iconName];
  console.log("[DEBUG] SVG string found for icon:", iconName, "length:", svgString?.length);

  // Create SVG node using Figma's createNodeFromSvg API
  let icon: FrameNode;
  try {
    icon = figma.createNodeFromSvg(svgString);
    console.log("[DEBUG] SVG node created successfully, id:", icon.id);
  } catch (svgError) {
    const errorMsg = `Failed to create SVG node for icon "${iconName}": ${svgError instanceof Error ? svgError.message : String(svgError)}`;
    console.error("[DEBUG] createNodeFromSvg failed:", errorMsg);
    throw new Error(errorMsg);
  }

  icon.name = `icon-${iconName}`;

  // Apply size (default 24px)
  const size = (params.size as number) || 24;
  try {
    icon.resize(size, size);
    console.log("[DEBUG] Icon resized to:", size);
  } catch (resizeError) {
    console.error("[DEBUG] resize failed:", resizeError);
    // Continue anyway, size error is not critical
  }

  // Apply color to stroke paths
  const color = (params.color as string) || "#000000";
  const rgb = hexToRgb(color);
  console.log("[DEBUG] Applying color:", color, "RGB:", rgb);

  // Recursive function to apply color to all nested children
  const applyColorRecursive = (node: SceneNode, depth: number = 0): number => {
    let count = 0;
    const indent = "  ".repeat(depth);

    // Apply stroke color if node has strokes
    if ("strokes" in node) {
      try {
        const vectorNode = node as VectorNode;
        if (vectorNode.strokes && vectorNode.strokes.length > 0) {
          vectorNode.strokes = [{
            type: "SOLID",
            color: rgb,
          }];
          count++;
          console.log(`[DEBUG] ${indent}Applied stroke to:`, node.type, node.name);
        }
      } catch (strokeErr) {
        console.warn(`[DEBUG] ${indent}Failed to apply stroke to:`, node.type, strokeErr);
      }
    }

    // Some SVG elements might use fills instead of strokes
    if ("fills" in node) {
      try {
        const fillNode = node as GeometryMixin & SceneNode;
        const fills = fillNode.fills as readonly Paint[];
        // Only update if fills exist and are not empty/none
        if (fills && fills.length > 0 && fills[0].type === "SOLID") {
          fillNode.fills = [{
            type: "SOLID",
            color: rgb,
          }];
          console.log(`[DEBUG] ${indent}Applied fill to:`, node.type, node.name);
        }
      } catch (fillErr) {
        console.warn(`[DEBUG] ${indent}Failed to apply fill to:`, node.type, fillErr);
      }
    }

    // Recursively process children if node has them
    if ("children" in node) {
      const containerNode = node as FrameNode | GroupNode;
      console.log(`[DEBUG] ${indent}Processing ${containerNode.children.length} children of:`, node.type, node.name);
      for (const child of containerNode.children) {
        count += applyColorRecursive(child, depth + 1);
      }
    }

    return count;
  };

  // Update stroke/fill color for all vector children (including nested)
  try {
    let totalApplied = 0;
    for (const child of icon.children) {
      totalApplied += applyColorRecursive(child, 0);
    }
    console.log("[DEBUG] Color applied to", totalApplied, "nodes (recursive)");
  } catch (colorError) {
    console.error("[DEBUG] Color application failed:", colorError instanceof Error ? colorError.message : String(colorError));
    // Continue anyway - color is not critical
  }

  // Position
  if (params.x !== undefined) icon.x = params.x as number;
  if (params.y !== undefined) icon.y = params.y as number;

  // Add to parent if specified
  if (params.parentId) {
    try {
      const parent = await getNode(params.parentId as string);
      if (parent && "appendChild" in parent) {
        (parent as FrameNode).appendChild(icon);
        console.log("[DEBUG] Icon appended to parent:", params.parentId);
      } else {
        console.warn("[DEBUG] Parent not found or invalid:", params.parentId);
      }
    } catch (parentError) {
      const errorMsg = `Failed to add icon to parent "${params.parentId}": ${parentError instanceof Error ? parentError.message : String(parentError)}`;
      console.error("[DEBUG] appendChild failed:", errorMsg);
      throw new Error(errorMsg);
    }
  } else {
    figma.currentPage.appendChild(icon);
    console.log("[DEBUG] Icon appended to current page");
  }

  registerNode(icon);
  console.log("[DEBUG] Icon created successfully:", { nodeId: icon.id, name: icon.name });
  return { nodeId: icon.id };
}

async function handleListIcons(): Promise<{ icons: string[] }> {
  return { icons: getAvailableIcons() };
}

// ============================================================================
// Boolean Operations Handlers
// ============================================================================

async function handleBooleanOperation(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const nodeIds = params.nodeIds as string[];
  const operation = params.operation as "UNION" | "SUBTRACT" | "INTERSECT" | "EXCLUDE";
  const name = (params.name as string) || `Boolean ${operation}`;

  if (!nodeIds || nodeIds.length < 2) {
    throw new Error("Boolean operation requires at least 2 nodes");
  }

  const nodes: SceneNode[] = [];
  for (const id of nodeIds) {
    const node = await getNode(id);
    if (node) {
      nodes.push(node);
    }
  }

  if (nodes.length < 2) {
    throw new Error("Could not find enough nodes for boolean operation");
  }

  let result: BooleanOperationNode;
  switch (operation) {
    case "UNION":
      result = figma.union(nodes, figma.currentPage);
      break;
    case "SUBTRACT":
      result = figma.subtract(nodes, figma.currentPage);
      break;
    case "INTERSECT":
      result = figma.intersect(nodes, figma.currentPage);
      break;
    case "EXCLUDE":
      result = figma.exclude(nodes, figma.currentPage);
      break;
    default:
      throw new Error(`Unknown boolean operation: ${operation}`);
  }

  result.name = name;

  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(result);
    }
  }

  registerNode(result);
  return { nodeId: result.id };
}

// ============================================================================
// Image Handlers
// ============================================================================

async function handleCreateImage(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const imageData = params.imageData as string; // base64 encoded
  const width = (params.width as number) || 100;
  const height = (params.height as number) || 100;
  const name = (params.name as string) || "Image";

  // Create a rectangle to hold the image
  const rect = figma.createRectangle();
  rect.name = name;
  rect.resize(width, height);

  if (imageData) {
    // Decode base64 and create image
    const bytes = figma.base64Decode(imageData);
    const image = figma.createImage(bytes);

    rect.fills = [{
      type: "IMAGE",
      imageHash: image.hash,
      scaleMode: (params.scaleMode as "FILL" | "FIT" | "CROP" | "TILE") || "FILL",
    }];
  }

  // Position
  if (params.x !== undefined) rect.x = params.x as number;
  if (params.y !== undefined) rect.y = params.y as number;

  // Add to parent
  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(rect);
    }
  } else {
    figma.currentPage.appendChild(rect);
  }

  registerNode(rect);
  return { nodeId: rect.id };
}

async function handleSetImageFill(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const imageData = params.imageData as string;
  const scaleMode = (params.scaleMode as "FILL" | "FIT" | "CROP" | "TILE") || "FILL";

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if (!("fills" in node)) {
    throw new Error("Node does not support fills");
  }

  const bytes = figma.base64Decode(imageData);
  const image = figma.createImage(bytes);

  (node as GeometryMixin).fills = [{
    type: "IMAGE",
    imageHash: image.hash,
    scaleMode,
  }];

  return { success: true };
}

// ============================================================================
// Vector Operations Handlers
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

  // Position and size
  if (params.x !== undefined) vector.x = params.x as number;
  if (params.y !== undefined) vector.y = params.y as number;
  if (params.width !== undefined && params.height !== undefined) {
    vector.resize(params.width as number, params.height as number);
  }

  // Add to parent
  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(vector);
    }
  } else {
    figma.currentPage.appendChild(vector);
  }

  registerNode(vector);
  return { nodeId: vector.id };
}

async function handleSetVectorPaths(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const paths = params.paths as Array<{ windingRule?: string; data: string }>;

  const node = await getNode(nodeId);
  if (!node || node.type !== "VECTOR") {
    throw new Error(`Vector node not found: ${nodeId}`);
  }

  const vectorPaths: VectorPath[] = paths.map(p => ({
    windingRule: (p.windingRule as "NONZERO" | "EVENODD") || "NONZERO",
    data: p.data,
  }));

  (node as VectorNode).vectorPaths = vectorPaths;

  return { success: true };
}

// ============================================================================
// Blend Mode Handler
// ============================================================================

async function handleSetBlendMode(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const blendMode = params.blendMode as BlendMode;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if ("blendMode" in node) {
    (node as SceneNode & BlendMixin).blendMode = blendMode;
  } else {
    throw new Error("Node does not support blend modes");
  }

  return { success: true };
}

// ============================================================================
// Style System Handlers
// ============================================================================

async function handleGetLocalStyles(params: Record<string, unknown>): Promise<{ styles: Array<{ id: string; name: string; type: string }> }> {
  const styleType = params.type as "PAINT" | "TEXT" | "EFFECT" | "GRID" | undefined;

  const styles: Array<{ id: string; name: string; type: string }> = [];

  if (!styleType || styleType === "PAINT") {
    const paintStyles = await figma.getLocalPaintStylesAsync();
    for (const style of paintStyles) {
      styles.push({ id: style.id, name: style.name, type: "PAINT" });
    }
  }

  if (!styleType || styleType === "TEXT") {
    const textStyles = await figma.getLocalTextStylesAsync();
    for (const style of textStyles) {
      styles.push({ id: style.id, name: style.name, type: "TEXT" });
    }
  }

  if (!styleType || styleType === "EFFECT") {
    const effectStyles = await figma.getLocalEffectStylesAsync();
    for (const style of effectStyles) {
      styles.push({ id: style.id, name: style.name, type: "EFFECT" });
    }
  }

  if (!styleType || styleType === "GRID") {
    const gridStyles = await figma.getLocalGridStylesAsync();
    for (const style of gridStyles) {
      styles.push({ id: style.id, name: style.name, type: "GRID" });
    }
  }

  return { styles };
}

async function handleCreatePaintStyle(params: Record<string, unknown>): Promise<{ styleId: string }> {
  const name = params.name as string;
  const paints = params.paints as FillConfig[];

  const style = figma.createPaintStyle();
  style.name = name;

  if (paints && paints.length > 0) {
    style.paints = paints.map(p => createFill(p));
  }

  return { styleId: style.id };
}

async function handleCreateTextStyle(params: Record<string, unknown>): Promise<{ styleId: string }> {
  const name = params.name as string;

  const style = figma.createTextStyle();
  style.name = name;

  // Apply text properties
  if (params.fontFamily) {
    const fontWeight = (params.fontWeight as number) || 400;
    const fontStyle = fontWeight >= 500 ? "Medium" : "Regular";
    await figma.loadFontAsync({ family: params.fontFamily as string, style: fontStyle });
    style.fontName = { family: params.fontFamily as string, style: fontStyle };
  }
  if (params.fontSize) style.fontSize = params.fontSize as number;
  if (params.letterSpacing) style.letterSpacing = { value: params.letterSpacing as number, unit: "PIXELS" };
  if (params.lineHeight) {
    const lh = params.lineHeight;
    if (typeof lh === "number") {
      style.lineHeight = { value: lh, unit: "PIXELS" };
    } else if (lh === "AUTO") {
      style.lineHeight = { unit: "AUTO" };
    }
  }

  return { styleId: style.id };
}

async function handleCreateEffectStyle(params: Record<string, unknown>): Promise<{ styleId: string }> {
  const name = params.name as string;
  const effects = params.effects as EffectConfig[];

  const style = figma.createEffectStyle();
  style.name = name;

  if (effects && effects.length > 0) {
    style.effects = effects.map(e => createEffect(e));
  }

  return { styleId: style.id };
}

async function handleApplyStyle(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const styleId = params.styleId as string;
  const styleType = params.styleType as "fill" | "stroke" | "text" | "effect";

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  const style = await figma.getStyleByIdAsync(styleId);
  if (!style) {
    throw new Error(`Style not found: ${styleId}`);
  }

  switch (styleType) {
    case "fill":
      if ("fillStyleId" in node) {
        (node as GeometryMixin).fillStyleId = styleId;
      }
      break;
    case "stroke":
      if ("strokeStyleId" in node) {
        (node as GeometryMixin).strokeStyleId = styleId;
      }
      break;
    case "text":
      if (node.type === "TEXT") {
        (node as TextNode).textStyleId = styleId;
      }
      break;
    case "effect":
      if ("effectStyleId" in node) {
        (node as BlendMixin).effectStyleId = styleId;
      }
      break;
  }

  return { success: true };
}

// ============================================================================
// Variables API Handlers
// ============================================================================

async function handleGetLocalVariables(params: Record<string, unknown>): Promise<{ variables: Array<{ id: string; name: string; resolvedType: string }> }> {
  const collectionId = params.collectionId as string | undefined;

  const localVariables = await figma.variables.getLocalVariablesAsync();

  const variables = localVariables
    .filter(v => !collectionId || v.variableCollectionId === collectionId)
    .map(v => ({
      id: v.id,
      name: v.name,
      resolvedType: v.resolvedType,
    }));

  return { variables };
}

async function handleGetVariableCollections(): Promise<{ collections: Array<{ id: string; name: string; modes: Array<{ modeId: string; name: string }> }> }> {
  const localCollections = await figma.variables.getLocalVariableCollectionsAsync();

  const collections = localCollections.map(c => ({
    id: c.id,
    name: c.name,
    modes: c.modes.map(m => ({ modeId: m.modeId, name: m.name })),
  }));

  return { collections };
}

async function handleCreateVariable(params: Record<string, unknown>): Promise<{ variableId: string }> {
  const name = params.name as string;
  const collectionId = params.collectionId as string;
  const resolvedType = params.resolvedType as VariableResolvedDataType;
  const value = params.value;
  const modeId = params.modeId as string | undefined;

  const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
  if (!collection) {
    throw new Error(`Variable collection not found: ${collectionId}`);
  }

  const variable = figma.variables.createVariable(name, collection, resolvedType);

  // Set value for the mode
  if (value !== undefined) {
    const targetModeId = modeId || collection.defaultModeId;

    // Convert value based on type
    if (resolvedType === "COLOR" && typeof value === "string") {
      const rgb = hexToRgb(value);
      variable.setValueForMode(targetModeId, { r: rgb.r, g: rgb.g, b: rgb.b, a: 1 });
    } else {
      variable.setValueForMode(targetModeId, value as VariableValue);
    }
  }

  return { variableId: variable.id };
}

async function handleCreateVariableCollection(params: Record<string, unknown>): Promise<{ collectionId: string }> {
  const name = params.name as string;

  const collection = figma.variables.createVariableCollection(name);

  // Add modes if specified
  const modes = params.modes as string[] | undefined;
  if (modes && modes.length > 0) {
    // Rename default mode to first mode name
    collection.renameMode(collection.defaultModeId, modes[0]);

    // Add additional modes
    for (let i = 1; i < modes.length; i++) {
      collection.addMode(modes[i]);
    }
  }

  return { collectionId: collection.id };
}

async function handleBindVariable(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const variableId = params.variableId as string;
  const field = params.field as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  const variable = await figma.variables.getVariableByIdAsync(variableId);
  if (!variable) {
    throw new Error(`Variable not found: ${variableId}`);
  }

  // Bind variable to field
  if ("setBoundVariable" in node) {
    (node as SceneNode & MinimalFillsMixin).setBoundVariable(field as VariableBindableNodeField, variable);
  } else {
    throw new Error("Node does not support variable binding");
  }

  return { success: true };
}

// ============================================================================
// Export Handlers
// ============================================================================

async function handleExportNode(params: Record<string, unknown>): Promise<{ data: string; format: string }> {
  const nodeId = params.nodeId as string;
  const format = (params.format as "PNG" | "JPG" | "SVG" | "PDF") || "PNG";
  const scale = (params.scale as number) || 1;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if (!("exportAsync" in node)) {
    throw new Error("Node does not support export");
  }

  const exportSettings: ExportSettings = {
    format,
    ...(format !== "SVG" && format !== "PDF" ? { scale } : {}),
  } as ExportSettings;

  const bytes = await (node as SceneNode & ExportMixin).exportAsync(exportSettings);
  const base64 = figma.base64Encode(bytes);

  return { data: base64, format };
}

async function handleExportMultiple(params: Record<string, unknown>): Promise<{ exports: Array<{ nodeId: string; data: string; format: string }> }> {
  const nodeIds = params.nodeIds as string[];
  const format = (params.format as "PNG" | "JPG" | "SVG" | "PDF") || "PNG";
  const scale = (params.scale as number) || 1;

  const exports: Array<{ nodeId: string; data: string; format: string }> = [];

  for (const nodeId of nodeIds) {
    const node = await getNode(nodeId);
    if (node && "exportAsync" in node) {
      const exportSettings: ExportSettings = {
        format,
        ...(format !== "SVG" && format !== "PDF" ? { scale } : {}),
      } as ExportSettings;

      const bytes = await (node as SceneNode & ExportMixin).exportAsync(exportSettings);
      const base64 = figma.base64Encode(bytes);
      exports.push({ nodeId, data: base64, format });
    }
  }

  return { exports };
}

// ============================================================================
// Transform Handlers
// ============================================================================

async function handleSetRotation(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const rotation = params.rotation as number;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if ("rotation" in node) {
    (node as SceneNode & LayoutMixin).rotation = rotation;
  } else {
    throw new Error("Node does not support rotation");
  }

  return { success: true };
}

async function handleSetTransform(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const transform = params.transform as [[number, number, number], [number, number, number]];

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if ("relativeTransform" in node) {
    (node as SceneNode & LayoutMixin).relativeTransform = transform;
  } else {
    throw new Error("Node does not support transforms");
  }

  return { success: true };
}

async function handleScaleNode(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const scale = params.scale as number;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if ("rescale" in node) {
    (node as SceneNode & LayoutMixin).rescale(scale);
  } else if ("resize" in node) {
    const currentWidth = (node as SceneNode & LayoutMixin).width;
    const currentHeight = (node as SceneNode & LayoutMixin).height;
    (node as SceneNode & LayoutMixin).resize(currentWidth * scale, currentHeight * scale);
  } else {
    throw new Error("Node does not support scaling");
  }

  return { success: true };
}

// ============================================================================
// Mask Handlers
// ============================================================================

async function handleCreateMask(params: Record<string, unknown>): Promise<{ groupId: string }> {
  const maskNodeId = params.maskNodeId as string;
  const contentNodeIds = params.contentNodeIds as string[];

  const maskNode = await getNode(maskNodeId);
  if (!maskNode) {
    throw new Error(`Mask node not found: ${maskNodeId}`);
  }

  const contentNodes: SceneNode[] = [];
  for (const id of contentNodeIds) {
    const node = await getNode(id);
    if (node) {
      contentNodes.push(node);
    }
  }

  if (contentNodes.length === 0) {
    throw new Error("No content nodes found");
  }

  // Set mask node as mask
  if ("isMask" in maskNode) {
    (maskNode as SceneNode & BlendMixin).isMask = true;
  }

  // Group mask and content
  const allNodes = [maskNode, ...contentNodes];
  const group = figma.group(allNodes, figma.currentPage);
  group.name = (params.name as string) || "Masked Group";

  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(group);
    }
  }

  registerNode(group);
  return { groupId: group.id };
}

async function handleSetMask(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const isMask = params.isMask as boolean;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if ("isMask" in node) {
    (node as SceneNode & BlendMixin).isMask = isMask;
  } else {
    throw new Error("Node does not support mask property");
  }

  return { success: true };
}

// ============================================================================
// Find/Query Handlers
// ============================================================================

async function handleFindNodes(params: Record<string, unknown>): Promise<{ nodes: Array<{ id: string; name: string; type: string }> }> {
  const criteria = params.criteria as {
    types?: string[];
    name?: string;
    namePattern?: string;
  };

  const allNodes = figma.currentPage.findAll();

  const filteredNodes = allNodes.filter(node => {
    // Filter by type
    if (criteria.types && criteria.types.length > 0) {
      if (!criteria.types.includes(node.type)) {
        return false;
      }
    }

    // Filter by exact name
    if (criteria.name && node.name !== criteria.name) {
      return false;
    }

    // Filter by name pattern (regex)
    if (criteria.namePattern) {
      const regex = new RegExp(criteria.namePattern);
      if (!regex.test(node.name)) {
        return false;
      }
    }

    return true;
  });

  const nodes = filteredNodes.map(n => ({
    id: n.id,
    name: n.name,
    type: n.type,
  }));

  return { nodes };
}

async function handleFindChildren(params: Record<string, unknown>): Promise<{ nodes: Array<{ id: string; name: string; type: string }> }> {
  const parentId = params.parentId as string;
  const criteria = params.criteria as {
    types?: string[];
    name?: string;
    namePattern?: string;
    recursive?: boolean;
  };

  const parent = await getNode(parentId);
  if (!parent) {
    throw new Error(`Parent node not found: ${parentId}`);
  }

  if (!("children" in parent)) {
    throw new Error("Node does not have children");
  }

  const parentNode = parent as FrameNode | GroupNode | ComponentNode;

  let childNodes: SceneNode[];
  if (criteria.recursive) {
    childNodes = parentNode.findAll();
  } else {
    childNodes = [...parentNode.children];
  }

  const filteredNodes = childNodes.filter(node => {
    if (criteria.types && criteria.types.length > 0) {
      if (!criteria.types.includes(node.type)) {
        return false;
      }
    }

    if (criteria.name && node.name !== criteria.name) {
      return false;
    }

    if (criteria.namePattern) {
      const regex = new RegExp(criteria.namePattern);
      if (!regex.test(node.name)) {
        return false;
      }
    }

    return true;
  });

  const nodes = filteredNodes.map(n => ({
    id: n.id,
    name: n.name,
    type: n.type,
  }));

  return { nodes };
}

// ============================================================================
// Plugin Data Handlers
// ============================================================================

async function handleSetPluginData(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const key = params.key as string;
  const value = params.value as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  node.setPluginData(key, value);

  return { success: true };
}

async function handleGetPluginData(params: Record<string, unknown>): Promise<{ value: string | null }> {
  const nodeId = params.nodeId as string;
  const key = params.key as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  const value = node.getPluginData(key);

  return { value: value || null };
}

async function handleGetAllPluginData(params: Record<string, unknown>): Promise<{ data: Record<string, string> }> {
  const nodeId = params.nodeId as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  const keys = node.getPluginDataKeys();
  const data: Record<string, string> = {};

  for (const key of keys) {
    data[key] = node.getPluginData(key);
  }

  return { data };
}

async function handleDeletePluginData(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const key = params.key as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  node.setPluginData(key, ""); // Setting empty string removes the data

  return { success: true };
}

// ============================================================================
// Layout Grid Handlers
// ============================================================================

async function handleSetLayoutGrid(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const grids = params.grids as Array<{
    pattern: "COLUMNS" | "ROWS" | "GRID";
    sectionSize?: number;
    count?: number;
    offset?: number;
    gutterSize?: number;
    alignment?: "MIN" | "CENTER" | "MAX" | "STRETCH";
    color?: string | RGBColor;
  }>;

  const node = await getNode(nodeId);
  if (!node || node.type !== "FRAME") {
    throw new Error(`Frame not found: ${nodeId}`);
  }

  const layoutGrids: LayoutGrid[] = grids.map(g => {
    const baseGrid = {
      visible: true,
      color: g.color ? { ...parseColor(g.color), a: 0.1 } : { r: 1, g: 0, b: 0, a: 0.1 },
    };

    if (g.pattern === "GRID") {
      return {
        ...baseGrid,
        pattern: "GRID" as const,
        sectionSize: g.sectionSize || 10,
      };
    } else {
      return {
        ...baseGrid,
        pattern: g.pattern,
        count: g.count || 12,
        sectionSize: g.sectionSize || 60,
        offset: g.offset || 0,
        gutterSize: g.gutterSize || 20,
        alignment: g.alignment || "STRETCH",
      };
    }
  });

  (node as FrameNode).layoutGrids = layoutGrids;

  return { success: true };
}

async function handleGetLayoutGrid(params: Record<string, unknown>): Promise<{ grids: LayoutGrid[] }> {
  const nodeId = params.nodeId as string;

  const node = await getNode(nodeId);
  if (!node || node.type !== "FRAME") {
    throw new Error(`Frame not found: ${nodeId}`);
  }

  return { grids: [...(node as FrameNode).layoutGrids] };
}

// ============================================================================
// Additional Shapes Handlers
// ============================================================================

async function handleCreatePolygon(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const name = (params.name as string) || "Polygon";
  const pointCount = (params.pointCount as number) || 6;
  const width = (params.width as number) || 100;
  const height = (params.height as number) || 100;

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

  // Position
  if (params.x !== undefined) polygon.x = params.x as number;
  if (params.y !== undefined) polygon.y = params.y as number;

  // Add to parent
  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(polygon);
    }
  } else {
    figma.currentPage.appendChild(polygon);
  }

  registerNode(polygon);
  return { nodeId: polygon.id };
}

async function handleCreateStar(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const name = (params.name as string) || "Star";
  const pointCount = (params.pointCount as number) || 5;
  const innerRadius = (params.innerRadius as number) || 0.4;
  const width = (params.width as number) || 100;
  const height = (params.height as number) || 100;

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

  // Position
  if (params.x !== undefined) star.x = params.x as number;
  if (params.y !== undefined) star.y = params.y as number;

  // Add to parent
  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(star);
    }
  } else {
    figma.currentPage.appendChild(star);
  }

  registerNode(star);
  return { nodeId: star.id };
}

// ============================================================================
// Flatten Handler
// ============================================================================

async function handleFlattenNode(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const nodeId = params.nodeId as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  const flattenedNode = figma.flatten([node], figma.currentPage);
  flattenedNode.name = (params.name as string) || `${node.name} (flattened)`;

  registerNode(flattenedNode);
  return { nodeId: flattenedNode.id };
}

// ============================================================================
// Font Enumeration Handler
// ============================================================================

async function handleListAvailableFonts(params: Record<string, unknown>): Promise<{ fonts: Array<{ family: string; styles: string[] }> }> {
  const availableFonts = await figma.listAvailableFontsAsync();

  // Group by family
  const fontMap = new Map<string, Set<string>>();

  for (const font of availableFonts) {
    if (!fontMap.has(font.fontName.family)) {
      fontMap.set(font.fontName.family, new Set());
    }
    fontMap.get(font.fontName.family)!.add(font.fontName.style);
  }

  // Apply filter if specified
  const filter = params.filter as string | undefined;

  const fonts: Array<{ family: string; styles: string[] }> = [];
  for (const [family, styles] of fontMap) {
    if (!filter || family.toLowerCase().includes(filter.toLowerCase())) {
      fonts.push({ family, styles: Array.from(styles) });
    }
  }

  // Limit results
  const limit = (params.limit as number) || 100;
  return { fonts: fonts.slice(0, limit) };
}

// ============================================================================
// Ungroup Handler
// ============================================================================

async function handleUngroup(params: Record<string, unknown>): Promise<{ nodeIds: string[] }> {
  const nodeId = params.nodeId as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if (node.type !== "GROUP") {
    throw new Error("Node is not a group");
  }

  const group = node as GroupNode;
  const parent = group.parent;
  const children = [...group.children];
  const nodeIds: string[] = [];

  // Move children to parent
  for (const child of children) {
    if (parent && "appendChild" in parent) {
      (parent as FrameNode | PageNode).appendChild(child);
    } else {
      figma.currentPage.appendChild(child);
    }
    nodeIds.push(child.id);
  }

  // Remove empty group
  group.remove();

  return { nodeIds };
}

// ============================================================================
// Lock/Unlock Handler
// ============================================================================

async function handleSetLocked(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const locked = params.locked as boolean;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if ("locked" in node) {
    (node as SceneNode).locked = locked;
  } else {
    throw new Error("Node does not support locking");
  }

  return { success: true };
}

// ============================================================================
// Prototype/Interactions Handlers
// ============================================================================

async function handleSetReactions(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const reactions = params.reactions as Array<{
    trigger: { type: string; timeout?: number; delay?: number; keyCodes?: number[] };
    action: {
      type: string;
      destinationId?: string;
      navigation?: string;
      transition?: { type: string; direction?: string; duration?: number; easing?: string };
      url?: string;
      openInNewTab?: boolean;
      preserveScrollPosition?: boolean;
      overlayRelativePosition?: { x: number; y: number };
    };
  }>;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if (!("reactions" in node)) {
    throw new Error("Node does not support reactions");
  }

  const figmaReactions = reactions.map(r => {
    const trigger: Record<string, unknown> = { type: r.trigger.type };
    if (r.trigger.timeout !== undefined) trigger.timeout = r.trigger.timeout;
    if (r.trigger.delay !== undefined) trigger.delay = r.trigger.delay;

    const transition = r.action.transition ? {
      type: r.action.transition.type,
      direction: r.action.transition.direction || "LEFT",
      duration: r.action.transition.duration || 300,
      easing: { type: r.action.transition.easing || "EASE_OUT" },
      matchLayers: false,
    } : null;

    return {
      trigger,
      actions: [{
        type: r.action.type,
        destinationId: r.action.destinationId || null,
        navigation: r.action.navigation || "NAVIGATE",
        transition,
        preserveScrollPosition: r.action.preserveScrollPosition || false,
        overlayRelativePosition: r.action.overlayRelativePosition ?? undefined,
        resetVideoPosition: false,
        resetScrollPosition: false,
        resetInteractiveComponents: false,
      }],
    };
  }) as unknown as Reaction[];

  (node as SceneNode & ReactionMixin).reactions = figmaReactions;
  return { success: true };
}

async function handleGetReactions(params: Record<string, unknown>): Promise<{ reactions: Reaction[] }> {
  const nodeId = params.nodeId as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if (!("reactions" in node)) {
    throw new Error("Node does not support reactions");
  }

  return { reactions: [...(node as SceneNode & ReactionMixin).reactions] };
}

async function handleAddReaction(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const trigger = params.trigger as { type: string; timeout?: number; delay?: number };
  const action = params.action as {
    type: string;
    destinationId?: string;
    navigation?: string;
    transition?: { type: string; direction?: string; duration?: number; easing?: string };
  };

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if (!("reactions" in node)) {
    throw new Error("Node does not support reactions");
  }

  const reactionNode = node as SceneNode & ReactionMixin;
  const existingReactions = [...reactionNode.reactions];

  // Build trigger with proper typing
  const triggerObj: Record<string, unknown> = { type: trigger.type };
  if (trigger.timeout !== undefined) triggerObj.timeout = trigger.timeout;
  if (trigger.delay !== undefined) triggerObj.delay = trigger.delay;

  // Build transition if provided
  const transitionObj = action.transition ? {
    type: action.transition.type,
    direction: action.transition.direction || "LEFT",
    duration: action.transition.duration || 300,
    easing: { type: action.transition.easing || "EASE_OUT" },
    matchLayers: false,
  } : null;

  const newReaction = {
    trigger: triggerObj,
    actions: [{
      type: action.type,
      destinationId: action.destinationId || null,
      navigation: action.navigation || "NAVIGATE",
      transition: transitionObj,
      preserveScrollPosition: false,
      overlayRelativePosition: undefined,
      resetVideoPosition: false,
      resetScrollPosition: false,
      resetInteractiveComponents: false,
    }],
  } as unknown as Reaction;

  existingReactions.push(newReaction);
  reactionNode.reactions = existingReactions;

  return { success: true };
}

async function handleRemoveReactions(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const triggerType = params.triggerType as string | undefined;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if (!("reactions" in node)) {
    throw new Error("Node does not support reactions");
  }

  const reactionNode = node as SceneNode & ReactionMixin;

  if (triggerType) {
    // Remove specific trigger type
    reactionNode.reactions = reactionNode.reactions.filter(r => r.trigger?.type !== triggerType);
  } else {
    // Remove all reactions
    reactionNode.reactions = [];
  }

  return { success: true };
}

async function handleSetFlowStartingPoint(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const name = params.name as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if (node.type !== "FRAME") {
    throw new Error("Flow starting points can only be set on frames");
  }

  const frame = node as FrameNode;

  // Create flow starting point
  frame.setPluginData("flowStartingPoint", JSON.stringify({ name, nodeId }));

  // Note: True flow starting points require figma.currentPage.flowStartingPoints API
  // which needs special handling

  return { success: true };
}

async function handleGetFlowStartingPoints(): Promise<{ flowStartingPoints: Array<{ nodeId: string; name: string }> }> {
  const flowStartingPoints = figma.currentPage.flowStartingPoints;

  return {
    flowStartingPoints: flowStartingPoints.map(fp => ({
      nodeId: fp.nodeId,
      name: fp.name,
    })),
  };
}

async function handleRemoveFlowStartingPoint(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;

  const currentFlowStartingPoints = figma.currentPage.flowStartingPoints;
  figma.currentPage.flowStartingPoints = currentFlowStartingPoints.filter(fp => fp.nodeId !== nodeId);

  return { success: true };
}

// ============================================================================
// New Node Types Handlers (FigJam & Design)
// ============================================================================

async function handleCreateSticky(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  // Check if we're in FigJam mode
  if (figma.editorType !== "figjam") {
    throw new Error("Sticky notes can only be created in FigJam files");
  }

  const sticky = figma.createSticky();
  sticky.text.characters = (params.text as string) || "";

  if (params.x !== undefined) sticky.x = params.x as number;
  if (params.y !== undefined) sticky.y = params.y as number;

  // Apply fill color if specified
  if (params.fill) {
    const fillConfig = params.fill as FillConfig;
    if (fillConfig.type === "SOLID" && fillConfig.color) {
      // Sticky notes have limited color options in FigJam
      sticky.fills = [createSolidPaint(fillConfig.color as string | RGBColor, fillConfig.opacity)];
    }
  }

  if (params.authorVisible !== undefined) {
    sticky.authorVisible = params.authorVisible as boolean;
  }

  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(sticky);
    }
  }

  registerNode(sticky);
  return { nodeId: sticky.id };
}

async function handleCreateSection(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  // Check if we're in FigJam mode
  if (figma.editorType !== "figjam") {
    throw new Error("Sections can only be created in FigJam files");
  }

  const section = figma.createSection();
  section.name = (params.name as string) || "Section";

  if (params.x !== undefined) section.x = params.x as number;
  if (params.y !== undefined) section.y = params.y as number;

  const width = (params.width as number) || 500;
  const height = (params.height as number) || 500;
  section.resizeWithoutConstraints(width, height);

  if (params.fill) {
    const fillConfig = params.fill as FillConfig;
    if (fillConfig.type === "SOLID" && fillConfig.color) {
      section.fills = [createSolidPaint(fillConfig.color as string | RGBColor, fillConfig.opacity)];
    }
  }

  registerNode(section);
  return { nodeId: section.id };
}

async function handleSetSectionContentsHidden(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const hidden = params.hidden as boolean;

  const node = await getNode(nodeId);
  if (!node || node.type !== "SECTION") {
    throw new Error(`Section not found: ${nodeId}`);
  }

  (node as SectionNode).devStatus = hidden ? { type: "READY_FOR_DEV" } : null;

  return { success: true };
}

async function handleCreateConnector(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  // Check if we're in FigJam mode
  if (figma.editorType !== "figjam") {
    throw new Error("Connectors can only be created in FigJam files");
  }

  const connector = figma.createConnector();

  // Set start endpoint
  const start = params.start as { endpointNodeId?: string; position?: { x: number; y: number }; magnet?: string };
  if (start.endpointNodeId) {
    const startNode = await getNode(start.endpointNodeId);
    if (startNode) {
      connector.connectorStart = {
        endpointNodeId: start.endpointNodeId,
        magnet: start.magnet as ConnectorMagnet || "AUTO",
      };
    }
  } else if (start.position) {
    connector.connectorStart = {
      position: start.position,
    };
  }

  // Set end endpoint
  const end = params.end as { endpointNodeId?: string; position?: { x: number; y: number }; magnet?: string };
  if (end.endpointNodeId) {
    const endNode = await getNode(end.endpointNodeId);
    if (endNode) {
      connector.connectorEnd = {
        endpointNodeId: end.endpointNodeId,
        magnet: end.magnet as ConnectorMagnet || "AUTO",
      };
    }
  } else if (end.position) {
    connector.connectorEnd = {
      position: end.position,
    };
  }

  // Apply stroke
  if (params.stroke) {
    const strokeConfig = params.stroke as StrokeConfig;
    connector.strokes = [createSolidPaint(strokeConfig.color)];
    if (strokeConfig.weight) connector.strokeWeight = strokeConfig.weight;
  }

  if (params.connectorLineType) {
    connector.connectorLineType = params.connectorLineType as ConnectorLineType;
  }

  registerNode(connector);
  return { nodeId: connector.id };
}

async function handleUpdateConnector(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;

  const node = await getNode(nodeId);
  if (!node || node.type !== "CONNECTOR") {
    throw new Error(`Connector not found: ${nodeId}`);
  }

  const connector = node as ConnectorNode;

  if (params.start) {
    const start = params.start as { endpointNodeId?: string; position?: { x: number; y: number }; magnet?: string };
    if (start.endpointNodeId) {
      connector.connectorStart = {
        endpointNodeId: start.endpointNodeId,
        magnet: start.magnet as ConnectorMagnet || "AUTO",
      };
    } else if (start.position) {
      connector.connectorStart = {
        position: start.position,
      };
    }
  }

  if (params.end) {
    const end = params.end as { endpointNodeId?: string; position?: { x: number; y: number }; magnet?: string };
    if (end.endpointNodeId) {
      connector.connectorEnd = {
        endpointNodeId: end.endpointNodeId,
        magnet: end.magnet as ConnectorMagnet || "AUTO",
      };
    } else if (end.position) {
      connector.connectorEnd = {
        position: end.position,
      };
    }
  }

  if (params.connectorLineType) {
    connector.connectorLineType = params.connectorLineType as ConnectorLineType;
  }

  if (params.stroke) {
    const strokeConfig = params.stroke as StrokeConfig;
    connector.strokes = [createSolidPaint(strokeConfig.color)];
    if (strokeConfig.weight) connector.strokeWeight = strokeConfig.weight;
  }

  return { success: true };
}

async function handleCreateSlice(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const slice = figma.createSlice();
  slice.name = (params.name as string) || "Slice";

  const width = (params.width as number) || 100;
  const height = (params.height as number) || 100;
  slice.resize(width, height);

  if (params.x !== undefined) slice.x = params.x as number;
  if (params.y !== undefined) slice.y = params.y as number;

  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(slice);
    }
  }

  registerNode(slice);
  return { nodeId: slice.id };
}

async function handleCreateCodeBlock(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  // Check if we're in FigJam mode
  if (figma.editorType !== "figjam") {
    throw new Error("Code blocks can only be created in FigJam files");
  }

  const codeBlock = figma.createCodeBlock();
  codeBlock.code = (params.code as string) || "";
  codeBlock.codeLanguage = (params.language as CodeBlockLanguage) || "PLAINTEXT";

  if (params.x !== undefined) codeBlock.x = params.x as number;
  if (params.y !== undefined) codeBlock.y = params.y as number;

  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(codeBlock);
    }
  }

  registerNode(codeBlock);
  return { nodeId: codeBlock.id };
}

async function handleUpdateCodeBlock(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;

  const node = await getNode(nodeId);
  if (!node || node.type !== "CODE_BLOCK") {
    throw new Error(`Code block not found: ${nodeId}`);
  }

  const codeBlock = node as CodeBlockNode;

  if (params.code !== undefined) {
    codeBlock.code = params.code as string;
  }

  if (params.language !== undefined) {
    codeBlock.codeLanguage = params.language as CodeBlockLanguage;
  }

  return { success: true };
}

async function handleCreateTable(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  // Check if we're in FigJam mode
  if (figma.editorType !== "figjam") {
    throw new Error("Tables can only be created in FigJam files");
  }

  const rows = (params.rows as number) || 3;
  const columns = (params.columns as number) || 3;

  const table = figma.createTable(rows, columns);
  table.name = (params.name as string) || "Table";

  if (params.x !== undefined) table.x = params.x as number;
  if (params.y !== undefined) table.y = params.y as number;

  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(table);
    }
  }

  registerNode(table);
  return { nodeId: table.id };
}

async function handleUpdateTable(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;

  const node = await getNode(nodeId);
  if (!node || node.type !== "TABLE") {
    throw new Error(`Table not found: ${nodeId}`);
  }

  const table = node as TableNode;

  if (params.insertRows) {
    const { index, count } = params.insertRows as { index: number; count: number };
    for (let i = 0; i < count; i++) {
      table.insertRow(index);
    }
  }

  if (params.insertColumns) {
    const { index, count } = params.insertColumns as { index: number; count: number };
    for (let i = 0; i < count; i++) {
      table.insertColumn(index);
    }
  }

  if (params.removeRows) {
    const { index, count } = params.removeRows as { index: number; count: number };
    for (let i = 0; i < count; i++) {
      table.removeRow(index);
    }
  }

  if (params.removeColumns) {
    const { index, count } = params.removeColumns as { index: number; count: number };
    for (let i = 0; i < count; i++) {
      table.removeColumn(index);
    }
  }

  return { success: true };
}

async function handleSetTableCell(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const row = params.row as number;
  const column = params.column as number;
  const text = params.text as string;

  const node = await getNode(nodeId);
  if (!node || node.type !== "TABLE") {
    throw new Error(`Table not found: ${nodeId}`);
  }

  const table = node as TableNode;
  const cell = table.cellAt(row, column);

  if (cell && cell.type === "TABLE_CELL") {
    // TableCellNode doesn't have direct children access in TypeScript types
    // Use type assertion to access the cell's text content
    const cellNode = cell as unknown as { text: TextSublayerNode };
    if (cellNode.text) {
      const textNode = cellNode.text;
      await figma.loadFontAsync(textNode.fontName as FontName);
      textNode.characters = text;
    }
  }

  return { success: true };
}

// ============================================================================
// Annotations API Handlers (Dev Mode)
// ============================================================================

async function handleCreateAnnotation(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const label = params.label as string;
  const labelPosition = params.labelPosition as string | undefined;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  // Annotations are stored as plugin data
  const annotations = JSON.parse(node.getPluginData("annotations") || "[]");

  annotations.push({
    id: `annotation-${Date.now()}`,
    label,
    labelPosition: labelPosition || "TOP",
    properties: params.properties || [],
    createdAt: new Date().toISOString(),
  });

  node.setPluginData("annotations", JSON.stringify(annotations));

  return { success: true };
}

async function handleGetAnnotations(params: Record<string, unknown>): Promise<{ annotations: unknown[] }> {
  const nodeId = params.nodeId as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  const annotations = JSON.parse(node.getPluginData("annotations") || "[]");

  return { annotations };
}

async function handleUpdateAnnotation(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const annotationId = params.annotationId as string;
  const updates = params.updates as Record<string, unknown>;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  const annotations = JSON.parse(node.getPluginData("annotations") || "[]");
  const index = annotations.findIndex((a: { id: string }) => a.id === annotationId);

  if (index === -1) {
    throw new Error(`Annotation not found: ${annotationId}`);
  }

  annotations[index] = { ...annotations[index], ...updates };
  node.setPluginData("annotations", JSON.stringify(annotations));

  return { success: true };
}

async function handleRemoveAnnotation(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const annotationId = params.annotationId as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  const annotations = JSON.parse(node.getPluginData("annotations") || "[]");
  const filtered = annotations.filter((a: { id: string }) => a.id !== annotationId);

  node.setPluginData("annotations", JSON.stringify(filtered));

  return { success: true };
}

async function handleSetDevStatus(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const status = params.status as { type: string; description?: string } | null;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if (!("devStatus" in node)) {
    throw new Error("Node does not support dev status");
  }

  if (status === null) {
    (node as FrameNode | ComponentNode | InstanceNode).devStatus = null;
  } else {
    (node as FrameNode | ComponentNode | InstanceNode).devStatus = {
      type: status.type as "READY_FOR_DEV" | "COMPLETED",
      description: status.description,
    };
  }

  return { success: true };
}

// ============================================================================
// Client Storage API Handlers
// ============================================================================

async function handleClientStorageSet(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const key = params.key as string;
  const value = params.value;

  await figma.clientStorage.setAsync(key, value);

  return { success: true };
}

async function handleClientStorageGet(params: Record<string, unknown>): Promise<{ value: unknown }> {
  const key = params.key as string;

  const value = await figma.clientStorage.getAsync(key);

  return { value };
}

async function handleClientStorageDelete(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const key = params.key as string;

  await figma.clientStorage.deleteAsync(key);

  return { success: true };
}

async function handleClientStorageKeys(): Promise<{ keys: string[] }> {
  const keys = await figma.clientStorage.keysAsync();

  return { keys };
}

// ============================================================================
// Shared Plugin Data API Handlers
// ============================================================================

async function handleSetSharedPluginData(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const namespace = params.namespace as string;
  const key = params.key as string;
  const value = params.value as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  node.setSharedPluginData(namespace, key, value);

  return { success: true };
}

async function handleGetSharedPluginData(params: Record<string, unknown>): Promise<{ value: string }> {
  const nodeId = params.nodeId as string;
  const namespace = params.namespace as string;
  const key = params.key as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  const value = node.getSharedPluginData(namespace, key);

  return { value };
}

async function handleGetSharedPluginDataKeys(params: Record<string, unknown>): Promise<{ keys: string[] }> {
  const nodeId = params.nodeId as string;
  const namespace = params.namespace as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  const keys = node.getSharedPluginDataKeys(namespace);

  return { keys };
}

// ============================================================================
// Video/Media Support Handlers
// ============================================================================

async function handleCreateVideo(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const name = (params.name as string) || "Video";
  const width = (params.width as number) || 320;
  const height = (params.height as number) || 180;

  // Create a frame as video container
  const videoFrame = figma.createFrame();
  videoFrame.name = name;
  videoFrame.resize(width, height);

  if (params.x !== undefined) videoFrame.x = params.x as number;
  if (params.y !== undefined) videoFrame.y = params.y as number;

  // Apply placeholder fill
  videoFrame.fills = [createSolidPaint("#1a1a1a")];

  // Store video metadata as plugin data
  if (params.videoData) {
    videoFrame.setPluginData("videoData", params.videoData as string);
  }

  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(videoFrame);
    }
  } else {
    figma.currentPage.appendChild(videoFrame);
  }

  registerNode(videoFrame);
  return { nodeId: videoFrame.id };
}

async function handleSetVideoFill(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const videoData = params.videoData as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  // Store video data
  node.setPluginData("videoData", videoData);
  node.setPluginData("isVideo", "true");

  return { success: true };
}

async function handleCreateLinkPreview(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  // Check if we're in FigJam mode
  if (figma.editorType !== "figjam") {
    throw new Error("Link previews can only be created in FigJam files");
  }

  const url = (params.url as string) || "https://example.com";
  const linkPreview = await figma.createLinkPreviewAsync(url);

  if (params.x !== undefined) linkPreview.x = params.x as number;
  if (params.y !== undefined) linkPreview.y = params.y as number;

  if (params.parentId) {
    const parent = await getNode(params.parentId as string);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(linkPreview);
    }
  }

  registerNode(linkPreview);
  return { nodeId: linkPreview.id };
}

// ============================================================================
// Viewport Control API Handlers
// ============================================================================

async function handleGetViewport(): Promise<{ viewport: { center: { x: number; y: number }; zoom: number; bounds: { x: number; y: number; width: number; height: number } } }> {
  const viewport = figma.viewport;

  return {
    viewport: {
      center: viewport.center,
      zoom: viewport.zoom,
      bounds: viewport.bounds,
    },
  };
}

async function handleSetViewport(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const x = params.x as number;
  const y = params.y as number;
  const zoom = params.zoom as number;

  figma.viewport.center = { x, y };
  figma.viewport.zoom = zoom;

  return { success: true };
}

async function handleScrollToNode(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  figma.viewport.scrollAndZoomIntoView([node]);

  return { success: true };
}

async function handleZoomToFit(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeIds = params.nodeIds as string[] | undefined;

  if (nodeIds && nodeIds.length > 0) {
    const nodes: SceneNode[] = [];
    for (const id of nodeIds) {
      const node = await getNode(id);
      if (node) {
        nodes.push(node);
      }
    }
    if (nodes.length > 0) {
      figma.viewport.scrollAndZoomIntoView(nodes);
    }
  } else {
    // Zoom to fit all page content
    if (figma.currentPage.children.length > 0) {
      figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
    }
  }

  return { success: true };
}

async function handleZoomToSelection(): Promise<{ success: boolean }> {
  const selection = figma.currentPage.selection;

  if (selection.length > 0) {
    figma.viewport.scrollAndZoomIntoView(selection);
  }

  return { success: true };
}

// ============================================================================
// Page Management Handlers
// ============================================================================

async function handleGetCurrentPage(): Promise<{ page: { id: string; name: string } }> {
  return {
    page: {
      id: figma.currentPage.id,
      name: figma.currentPage.name,
    },
  };
}

async function handleSetCurrentPage(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const pageId = params.pageId as string;

  const page = figma.root.children.find(p => p.id === pageId);
  if (!page) {
    throw new Error(`Page not found: ${pageId}`);
  }

  figma.currentPage = page;

  return { success: true };
}

async function handleCreatePage(params: Record<string, unknown>): Promise<{ pageId: string }> {
  const name = (params.name as string) || "New Page";

  const page = figma.createPage();
  page.name = name;

  return { pageId: page.id };
}

async function handleGetAllPages(): Promise<{ pages: Array<{ id: string; name: string }> }> {
  const pages = figma.root.children.map(p => ({
    id: p.id,
    name: p.name,
  }));

  return { pages };
}

// ============================================================================
// Editor Info Handlers
// ============================================================================

async function handleGetEditorType(): Promise<{ editorType: string }> {
  return { editorType: figma.editorType };
}

async function handleGetMode(): Promise<{ mode: string }> {
  return { mode: figma.mode };
}

// Valid spacing tokens from design system
const VALID_SPACING_TOKENS: number[] = Object.values(spacing);

interface LintViolation {
  nodeId: string;
  nodeName: string;
  rule: string;
  message: string;
  severity: "error" | "warning";
}

interface LintLayoutResult {
  passed: boolean;
  violations: LintViolation[];
  checkedNodes: number;
}

async function handleLintLayout(params: Record<string, unknown>): Promise<LintLayoutResult> {
  const { nodeId, rules, recursive } = params as {
    nodeId: string;
    rules: string[];
    recursive: boolean;
  };

  const violations: LintViolation[] = [];
  let checkedNodes = 0;

  function lintNode(node: SceneNode, rootNodeId: string): void {
    checkedNodes++;

    // NO_ABSOLUTE_POSITION check
    if (rules.includes("NO_ABSOLUTE_POSITION")) {
      if ("x" in node && "y" in node) {
        const parent = node.parent;
        // Skip if parent is PageNode (top-level nodes are always absolute)
        if (parent && parent.type !== "PAGE" && "layoutMode" in parent && parent.layoutMode === "NONE") {
          violations.push({
            nodeId: node.id,
            nodeName: node.name,
            rule: "NO_ABSOLUTE_POSITION",
            message: `Node uses absolute positioning (x: ${node.x}, y: ${node.y}) instead of Auto Layout`,
            severity: "error",
          });
        }
      }
    }

    // AUTO_LAYOUT_REQUIRED check
    if (rules.includes("AUTO_LAYOUT_REQUIRED")) {
      if (node.type === "FRAME" || node.type === "COMPONENT") {
        const frameNode = node as FrameNode;
        if (frameNode.layoutMode === "NONE" && frameNode.children.length > 0) {
          violations.push({
            nodeId: node.id,
            nodeName: node.name,
            rule: "AUTO_LAYOUT_REQUIRED",
            message: `Frame has children but no Auto Layout enabled`,
            severity: "error",
          });
        }
      }
    }

    // VALID_SIZING_MODE check - checks both horizontal and vertical sizing
    if (rules.includes("VALID_SIZING_MODE")) {
      if ("layoutSizingHorizontal" in node) {
        const frameNode = node as FrameNode;
        const validModes = ["FIXED", "HUG", "FILL"];

        // Check horizontal sizing
        if (!validModes.includes(frameNode.layoutSizingHorizontal)) {
          violations.push({
            nodeId: node.id,
            nodeName: node.name,
            rule: "VALID_SIZING_MODE",
            message: `Invalid horizontal sizing mode: ${frameNode.layoutSizingHorizontal}`,
            severity: "warning",
          });
        }

        // Check vertical sizing
        if (!validModes.includes(frameNode.layoutSizingVertical)) {
          violations.push({
            nodeId: node.id,
            nodeName: node.name,
            rule: "VALID_SIZING_MODE",
            message: `Invalid vertical sizing mode: ${frameNode.layoutSizingVertical}`,
            severity: "warning",
          });
        }
      }
    }

    // SPACING_TOKEN_ONLY check - uses spacing tokens from design system
    if (rules.includes("SPACING_TOKEN_ONLY")) {
      if ("itemSpacing" in node) {
        const frameNode = node as FrameNode;
        if (!VALID_SPACING_TOKENS.includes(frameNode.itemSpacing)) {
          violations.push({
            nodeId: node.id,
            nodeName: node.name,
            rule: "SPACING_TOKEN_ONLY",
            message: `Item spacing ${frameNode.itemSpacing}px is not a valid token (valid tokens: 0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, ...)`,
            severity: "warning",
          });
        }
      }
    }

    // FILL_REQUIRED_ON_ROOT check (only for root node)
    if (rules.includes("FILL_REQUIRED_ON_ROOT") && node.id === rootNodeId) {
      if ("fills" in node) {
        const fills = node.fills as readonly Paint[];
        if (!fills || fills.length === 0) {
          violations.push({
            nodeId: node.id,
            nodeName: node.name,
            rule: "FILL_REQUIRED_ON_ROOT",
            message: `Root frame has no fill - content may be invisible`,
            severity: "error",
          });
        }
      }
    }

    // Recursive check
    if (recursive && "children" in node) {
      for (const child of node.children) {
        lintNode(child, rootNodeId);
      }
    }
  }

  const rootNode = figma.getNodeById(nodeId);
  if (!rootNode) {
    throw new Error(`Node ${nodeId} not found`);
  }

  lintNode(rootNode as SceneNode, nodeId);

  return {
    passed: violations.filter(v => v.severity === "error").length === 0,
    violations,
    checkedNodes,
  };
}

// ============================================================================
// Visual Debug Mode Handlers
// ============================================================================

interface DebugModeOptions {
  showPadding?: boolean;
  showSizing?: boolean;
  showSpacing?: boolean;
}

interface DebugNodeInfo {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  layoutMode: string;
  primaryAxisSizing: string;
  counterAxisSizing: string;
  layoutSizingHorizontal: string;
  layoutSizingVertical: string;
  itemSpacing: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  width: number;
  height: number;
  children?: DebugNodeInfo[];
}

/**
 * Remove all debug overlay nodes from the canvas
 */
async function clearDebugOverlays(): Promise<number> {
  let removedCount = 0;
  for (const overlayId of debugOverlayIds) {
    const node = figma.getNodeById(overlayId);
    if (node) {
      node.remove();
      removedCount++;
    }
  }
  debugOverlayIds.clear();
  return removedCount;
}

/**
 * Create a text label annotation for sizing mode
 */
async function createSizingLabel(
  parent: FrameNode | GroupNode,
  text: string,
  x: number,
  y: number,
  color: RGBA
): Promise<TextNode> {
  const label = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  label.characters = text;
  label.fontSize = 10;
  label.fontName = { family: "Inter", style: "Bold" };
  label.fills = [{ type: "SOLID", color: { r: color.r, g: color.g, b: color.b } }];
  label.x = x;
  label.y = y;
  label.name = `[DEBUG] ${text}`;

  // Add to page at root level for visibility
  figma.currentPage.appendChild(label);
  debugOverlayIds.add(label.id);

  return label;
}

/**
 * Create visual debug overlays for a node showing layout info
 */
async function createDebugOverlaysForNode(
  node: SceneNode,
  options: DebugModeOptions
): Promise<number> {
  let createdCount = 0;

  if (!("layoutMode" in node)) {
    return createdCount;
  }

  const frameNode = node as FrameNode;
  const bounds = frameNode.absoluteBoundingBox;
  if (!bounds) return createdCount;

  // Create sizing mode label
  if (options.showSizing) {
    const hSizing = frameNode.layoutSizingHorizontal || "FIXED";
    const vSizing = frameNode.layoutSizingVertical || "FIXED";
    const layoutMode = frameNode.layoutMode || "NONE";

    const labelText = `${layoutMode} | H:${hSizing} V:${vSizing}`;
    const labelColor = hSizing === "FILL" ? DEBUG_COLORS.sizingFill :
                       hSizing === "HUG" ? DEBUG_COLORS.sizingHug :
                       DEBUG_COLORS.sizingFixed;

    await createSizingLabel(
      frameNode,
      labelText,
      bounds.x,
      bounds.y - 14,
      labelColor
    );
    createdCount++;
  }

  // Create padding indicator rectangles
  if (options.showPadding && frameNode.layoutMode !== "NONE") {
    const { paddingTop, paddingRight, paddingBottom, paddingLeft } = frameNode;

    if (paddingTop > 0 || paddingRight > 0 || paddingBottom > 0 || paddingLeft > 0) {
      // Create a group for padding indicators
      const paddingLabel = await createSizingLabel(
        frameNode,
        `P: ${paddingTop}/${paddingRight}/${paddingBottom}/${paddingLeft}`,
        bounds.x,
        bounds.y + bounds.height + 2,
        DEBUG_COLORS.padding
      );
      createdCount++;
    }
  }

  // Create spacing indicator
  if (options.showSpacing && frameNode.layoutMode !== "NONE" && frameNode.itemSpacing > 0) {
    const spacingLabel = await createSizingLabel(
      frameNode,
      `Gap: ${frameNode.itemSpacing}px`,
      bounds.x + bounds.width + 4,
      bounds.y,
      DEBUG_COLORS.spacing
    );
    createdCount++;
  }

  return createdCount;
}

/**
 * Handle TOGGLE_DEBUG_MODE action
 */
async function handleToggleDebugMode(params: Record<string, unknown>): Promise<{
  enabled: boolean;
  affectedNodes: number;
}> {
  const enabled = params.enabled as boolean;
  const nodeId = params.nodeId as string | undefined;
  const options = (params.options as DebugModeOptions) || {
    showPadding: true,
    showSizing: true,
    showSpacing: true,
  };

  // If disabling, clear all overlays
  if (!enabled) {
    const removedCount = await clearDebugOverlays();
    debugModeEnabled = false;
    return { enabled: false, affectedNodes: removedCount };
  }

  // Clear existing overlays before creating new ones
  await clearDebugOverlays();

  debugModeEnabled = true;
  let affectedNodes = 0;

  // Get target nodes
  let targetNodes: SceneNode[] = [];

  if (nodeId) {
    const node = await getNode(nodeId);
    if (node) {
      targetNodes = [node];
    }
  } else {
    // Use current selection or all frames on page
    targetNodes = figma.currentPage.selection.length > 0
      ? [...figma.currentPage.selection]
      : figma.currentPage.findAll(n => n.type === "FRAME");
  }

  // Create overlays for each target node
  for (const node of targetNodes) {
    const count = await createDebugOverlaysForNode(node, options);
    affectedNodes += count > 0 ? 1 : 0;

    // Also process children if it's a frame with children
    if ("children" in node) {
      for (const child of node.children) {
        const childCount = await createDebugOverlaysForNode(child, options);
        affectedNodes += childCount > 0 ? 1 : 0;
      }
    }
  }

  return { enabled: true, affectedNodes };
}

/**
 * Get layout debug info for a single node
 */
function getNodeDebugInfo(node: SceneNode): DebugNodeInfo {
  const info: DebugNodeInfo = {
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    layoutMode: "NONE",
    primaryAxisSizing: "FIXED",
    counterAxisSizing: "FIXED",
    layoutSizingHorizontal: "FIXED",
    layoutSizingVertical: "FIXED",
    itemSpacing: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    width: "width" in node ? (node as FrameNode).width : 0,
    height: "height" in node ? (node as FrameNode).height : 0,
  };

  if ("layoutMode" in node) {
    const frameNode = node as FrameNode;
    info.layoutMode = frameNode.layoutMode || "NONE";
    info.primaryAxisSizing = frameNode.primaryAxisSizingMode || "FIXED";
    info.counterAxisSizing = frameNode.counterAxisSizingMode || "FIXED";
    info.layoutSizingHorizontal = frameNode.layoutSizingHorizontal || "FIXED";
    info.layoutSizingVertical = frameNode.layoutSizingVertical || "FIXED";
    info.itemSpacing = frameNode.itemSpacing || 0;
    info.paddingTop = frameNode.paddingTop || 0;
    info.paddingRight = frameNode.paddingRight || 0;
    info.paddingBottom = frameNode.paddingBottom || 0;
    info.paddingLeft = frameNode.paddingLeft || 0;
  }

  return info;
}

/**
 * Generate ASCII tree representation of debug info
 */
function generateDebugTree(info: DebugNodeInfo, indent: string = "", isLast: boolean = true): string {
  const prefix = indent + (isLast ? "└── " : "├── ");
  const childIndent = indent + (isLast ? "    " : "│   ");

  let line = `${prefix}${info.nodeName} (${info.nodeType})`;

  if (info.layoutMode !== "NONE") {
    line += `\n${childIndent}Layout: ${info.layoutMode}`;
    line += `\n${childIndent}Sizing: H=${info.layoutSizingHorizontal}, V=${info.layoutSizingVertical}`;
    line += `\n${childIndent}Axis: primary=${info.primaryAxisSizing}, counter=${info.counterAxisSizing}`;
    if (info.itemSpacing > 0) {
      line += `\n${childIndent}Spacing: ${info.itemSpacing}px`;
    }
    if (info.paddingTop > 0 || info.paddingRight > 0 || info.paddingBottom > 0 || info.paddingLeft > 0) {
      line += `\n${childIndent}Padding: ${info.paddingTop}/${info.paddingRight}/${info.paddingBottom}/${info.paddingLeft}`;
    }
  } else {
    line += ` [No Auto Layout]`;
  }

  line += `\n${childIndent}Size: ${Math.round(info.width)}x${Math.round(info.height)}`;

  if (info.children && info.children.length > 0) {
    for (let i = 0; i < info.children.length; i++) {
      const isChildLast = i === info.children.length - 1;
      line += "\n" + generateDebugTree(info.children[i], childIndent, isChildLast);
    }
  }

  return line;
}

/**
 * Handle GET_DEBUG_INFO action
 */
async function handleGetDebugInfo(params: Record<string, unknown>): Promise<{
  data: DebugNodeInfo | string;
}> {
  const nodeId = params.nodeId as string;
  const includeChildren = (params.includeChildren as boolean) ?? false;
  const format = (params.format as string) ?? "json";

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  const info = getNodeDebugInfo(node);

  // Include children's info if requested
  if (includeChildren && "children" in node) {
    info.children = [];
    for (const child of (node as FrameNode).children) {
      const childInfo = getNodeDebugInfo(child);

      // Recursively get children's children
      if ("children" in child) {
        childInfo.children = [];
        for (const grandchild of (child as FrameNode).children) {
          childInfo.children.push(getNodeDebugInfo(grandchild));
        }
      }

      info.children.push(childInfo);
    }
  }

  // Return as tree string if requested
  if (format === "tree") {
    const treeStr = generateDebugTree(info);
    return { data: treeStr };
  }

  return { data: info };
}

// ============================================================================
// Komut Yönlendirici
// ============================================================================

async function handleCommand(command: Command): Promise<Record<string, unknown>> {
  const { action, params } = command;

  // DEBUG: Gelen parametreleri logla
  if (action === "CREATE_FRAME" || action === "CREATE_TEXT" || action === "CREATE_ICON") {
    console.log(`[DEBUG] ${action} params:`, JSON.stringify(params, null, 2));
  }

  switch (action) {
    case "CREATE_FRAME":
      return handleCreateFrame(params);
    case "CREATE_RECTANGLE":
      return handleCreateRectangle(params);
    case "CREATE_ELLIPSE":
      return handleCreateEllipse(params);
    case "CREATE_TEXT":
      return handleCreateText(params);
    case "CREATE_BUTTON":
      return handleCreateButton(params);
    case "CREATE_INPUT":
      return handleCreateInput(params);
    case "CREATE_CARD":
      return handleCreateCard(params);
    case "SET_AUTOLAYOUT":
      return handleSetAutoLayout(params);
    case "SET_FILL":
      return handleSetFill(params);
    case "SET_EFFECTS":
      return handleSetEffects(params);
    case "MODIFY_NODE":
      return handleModifyNode(params);
    case "CREATE_COMPONENT":
      return handleCreateComponent(params);
    case "CREATE_COMPONENT_INSTANCE":
      return handleCreateComponentInstance(params);
    case "GET_LOCAL_COMPONENTS":
      return handleGetLocalComponents();
    case "REGISTER_COMPONENT":
      return handleRegisterComponent(params);
    case "CREATE_UI_COMPONENT":
      return handleCreateUIComponent(params);
    case "GET_SELECTION":
      return handleGetSelection();
    case "APPEND_CHILD":
      return handleAppendChild(params);
    case "MOVE_TO_PARENT":
      return handleMoveToParent(params);
    case "DELETE_NODE":
      return handleDeleteNode(params);
    case "CLONE_NODE":
      return handleCloneNode(params);
    // Node manipulation actions
    case "RESIZE_NODE":
      return handleResizeNode(params);
    case "SET_POSITION":
      return handleSetPosition(params);
    case "SET_LAYOUT_SIZING":
      return handleSetLayoutSizing(params);
    case "GET_NODE_INFO":
      return handleGetNodeInfo(params);
    case "SET_CONSTRAINTS":
      return handleSetConstraints(params);
    case "REORDER_CHILDREN":
      return handleReorderChildren(params);
    case "SET_VISIBILITY":
      return handleSetVisibility(params);
    case "SET_OPACITY":
      return handleSetOpacity(params);
    case "SET_STROKE":
      return handleSetStroke(params);
    case "CREATE_LINE":
      return handleCreateLine(params);
    case "CREATE_GROUP":
      return handleCreateGroup(params);
    case "SET_TEXT_CONTENT":
      return handleSetTextContent(params);
    case "SET_CORNER_RADIUS":
      return handleSetCornerRadius(params);
    case "GET_PAGE_INFO":
      return handleGetPageInfo();
    case "SELECT_NODES":
      return handleSelectNodes(params);
    // Extended component library actions
    case "SET_THEME":
      return handleSetTheme(params);
    case "SET_THEME_TOKENS":
      return handleSetThemeTokens(params);
    case "CREATE_SHADCN_COMPONENT":
      return handleCreateShadcnComponent(params);
    case "CREATE_APPLE_COMPONENT":
      return handleCreateAppleComponent(params);
    case "CREATE_LIQUID_GLASS_COMPONENT":
      return handleCreateLiquidGlassComponent(params);
    case "LIST_COMPONENTS":
      return handleListComponents(params);
    case "GET_DESIGN_TOKENS":
      return handleGetDesignTokens(params);
    // Lucide Icon actions
    case "CREATE_ICON":
      return handleCreateIcon(params);
    case "LIST_ICONS":
      return handleListIcons();
    // New feature actions - Boolean Operations
    case "BOOLEAN_OPERATION":
      return handleBooleanOperation(params);
    // Image handling
    case "CREATE_IMAGE":
      return handleCreateImage(params);
    case "SET_IMAGE_FILL":
      return handleSetImageFill(params);
    // Vector operations
    case "CREATE_VECTOR":
      return handleCreateVector(params);
    case "SET_VECTOR_PATHS":
      return handleSetVectorPaths(params);
    // Blend modes
    case "SET_BLEND_MODE":
      return handleSetBlendMode(params);
    // Style system
    case "GET_LOCAL_STYLES":
      return handleGetLocalStyles(params);
    case "CREATE_PAINT_STYLE":
      return handleCreatePaintStyle(params);
    case "CREATE_TEXT_STYLE":
      return handleCreateTextStyle(params);
    case "CREATE_EFFECT_STYLE":
      return handleCreateEffectStyle(params);
    case "APPLY_STYLE":
      return handleApplyStyle(params);
    // Variables API
    case "GET_LOCAL_VARIABLES":
      return handleGetLocalVariables(params);
    case "GET_VARIABLE_COLLECTIONS":
      return handleGetVariableCollections();
    case "CREATE_VARIABLE":
      return handleCreateVariable(params);
    case "CREATE_VARIABLE_COLLECTION":
      return handleCreateVariableCollection(params);
    case "BIND_VARIABLE":
      return handleBindVariable(params);
    // Export
    case "EXPORT_NODE":
      return handleExportNode(params);
    case "EXPORT_MULTIPLE":
      return handleExportMultiple(params);
    // Transform
    case "SET_ROTATION":
      return handleSetRotation(params);
    case "SET_TRANSFORM":
      return handleSetTransform(params);
    case "SCALE_NODE":
      return handleScaleNode(params);
    // Masks
    case "CREATE_MASK":
      return handleCreateMask(params);
    case "SET_MASK":
      return handleSetMask(params);
    // Find/Query
    case "FIND_NODES":
      return handleFindNodes(params);
    case "FIND_CHILDREN":
      return handleFindChildren(params);
    // Plugin Data
    case "SET_PLUGIN_DATA":
      return handleSetPluginData(params);
    case "GET_PLUGIN_DATA":
      return handleGetPluginData(params);
    case "GET_ALL_PLUGIN_DATA":
      return handleGetAllPluginData(params);
    case "DELETE_PLUGIN_DATA":
      return handleDeletePluginData(params);
    // Layout Grid
    case "SET_LAYOUT_GRID":
      return handleSetLayoutGrid(params);
    case "GET_LAYOUT_GRID":
      return handleGetLayoutGrid(params);
    // Additional Shapes
    case "CREATE_POLYGON":
      return handleCreatePolygon(params);
    case "CREATE_STAR":
      return handleCreateStar(params);
    // Flatten
    case "FLATTEN_NODE":
      return handleFlattenNode(params);
    // Font Enumeration
    case "LIST_AVAILABLE_FONTS":
      return handleListAvailableFonts(params);
    // Ungroup
    case "UNGROUP":
      return handleUngroup(params);
    // Lock/Unlock
    case "SET_LOCKED":
      return handleSetLocked(params);
    // Prototype/Interactions
    case "SET_REACTIONS":
      return handleSetReactions(params);
    case "GET_REACTIONS":
      return handleGetReactions(params);
    case "ADD_REACTION":
      return handleAddReaction(params);
    case "REMOVE_REACTIONS":
      return handleRemoveReactions(params);
    case "SET_FLOW_STARTING_POINT":
      return handleSetFlowStartingPoint(params);
    case "GET_FLOW_STARTING_POINTS":
      return handleGetFlowStartingPoints();
    case "REMOVE_FLOW_STARTING_POINT":
      return handleRemoveFlowStartingPoint(params);
    // New Node Types (FigJam & Design)
    case "CREATE_STICKY":
      return handleCreateSticky(params);
    case "CREATE_SECTION":
      return handleCreateSection(params);
    case "SET_SECTION_CONTENTS_HIDDEN":
      return handleSetSectionContentsHidden(params);
    case "CREATE_CONNECTOR":
      return handleCreateConnector(params);
    case "UPDATE_CONNECTOR":
      return handleUpdateConnector(params);
    case "CREATE_SLICE":
      return handleCreateSlice(params);
    case "CREATE_CODE_BLOCK":
      return handleCreateCodeBlock(params);
    case "UPDATE_CODE_BLOCK":
      return handleUpdateCodeBlock(params);
    case "CREATE_TABLE":
      return handleCreateTable(params);
    case "UPDATE_TABLE":
      return handleUpdateTable(params);
    case "SET_TABLE_CELL":
      return handleSetTableCell(params);
    // Annotations API (Dev Mode)
    case "CREATE_ANNOTATION":
      return handleCreateAnnotation(params);
    case "GET_ANNOTATIONS":
      return handleGetAnnotations(params);
    case "UPDATE_ANNOTATION":
      return handleUpdateAnnotation(params);
    case "REMOVE_ANNOTATION":
      return handleRemoveAnnotation(params);
    case "SET_DEV_STATUS":
      return handleSetDevStatus(params);
    // Client Storage API
    case "CLIENT_STORAGE_SET":
      return handleClientStorageSet(params);
    case "CLIENT_STORAGE_GET":
      return handleClientStorageGet(params);
    case "CLIENT_STORAGE_DELETE":
      return handleClientStorageDelete(params);
    case "CLIENT_STORAGE_KEYS":
      return handleClientStorageKeys();
    // Shared Plugin Data API
    case "SET_SHARED_PLUGIN_DATA":
      return handleSetSharedPluginData(params);
    case "GET_SHARED_PLUGIN_DATA":
      return handleGetSharedPluginData(params);
    case "GET_SHARED_PLUGIN_DATA_KEYS":
      return handleGetSharedPluginDataKeys(params);
    // Video/Media Support
    case "CREATE_VIDEO":
      return handleCreateVideo(params);
    case "SET_VIDEO_FILL":
      return handleSetVideoFill(params);
    case "CREATE_LINK_PREVIEW":
      return handleCreateLinkPreview(params);
    // Viewport Control
    case "GET_VIEWPORT":
      return handleGetViewport();
    case "SET_VIEWPORT":
      return handleSetViewport(params);
    case "SCROLL_TO_NODE":
      return handleScrollToNode(params);
    case "ZOOM_TO_FIT":
      return handleZoomToFit(params);
    case "ZOOM_TO_SELECTION":
      return handleZoomToSelection();
    // Page Management
    case "GET_CURRENT_PAGE":
      return handleGetCurrentPage();
    case "SET_CURRENT_PAGE":
      return handleSetCurrentPage(params);
    case "CREATE_PAGE":
      return handleCreatePage(params);
    case "GET_ALL_PAGES":
      return handleGetAllPages();
    // Editor Info
    case "GET_EDITOR_TYPE":
      return handleGetEditorType();
    case "GET_MODE":
      return handleGetMode();

    // Layout Linting
    case "LINT_LAYOUT":
      return handleLintLayout(params);

    // Visual Debug Mode
    case "TOGGLE_DEBUG_MODE":
      return handleToggleDebugMode(params);
    case "GET_DEBUG_INFO":
      return handleGetDebugInfo(params);

    // Component Slots - Register and instantiate reusable component slots
    case "REGISTER_COMPONENT_SLOT":
      return handleRegisterComponentSlot(params);
    case "CREATE_FROM_SLOT":
      return handleCreateFromSlot(params);
    case "LIST_COMPONENT_SLOTS":
      return handleListComponentSlots(params);

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

// ============================================================================
// UI Mesaj İşleyici
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

figma.notify("AI Design Assistant v2 ready!", { timeout: 3000 });
