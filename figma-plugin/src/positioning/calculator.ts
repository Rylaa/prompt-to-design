/**
 * Smart Position Calculator
 * Mobil frame icinde akilli pozisyon hesaplama
 */

import type {
  LayoutContext,
  PositionRequest,
  PositionResult,
  RegionBounds,
  SiblingInfo,
} from "./types";

// Standart mobil region yukseklikleri
const REGION_HEIGHTS = {
  header: 60,
  footer: 80,
  tabBar: 83,
  navigationBar: 96,
  statusBar: 47,
  homeIndicator: 34,
};

/**
 * Frame icindeki region sinirlarini hesaplar
 */
export function calculateRegionBounds(
  frameHeight: number,
  hasHeader: boolean = true,
  hasFooter: boolean = true,
  headerHeight: number = REGION_HEIGHTS.header,
  footerHeight: number = REGION_HEIGHTS.footer
): RegionBounds {
  const header = {
    y: 0,
    height: hasHeader ? headerHeight : 0,
  };

  const footer = {
    y: hasFooter ? frameHeight - footerHeight : frameHeight,
    height: hasFooter ? footerHeight : 0,
  };

  const content = {
    y: header.height,
    height: frameHeight - header.height - footer.height,
  };

  return { header, content, footer };
}

/**
 * Siblings arasindaki bos alani bulur
 */
export function findNextAvailableY(
  siblings: SiblingInfo[],
  startY: number,
  endY: number,
  spacing: number = 16
): number {
  if (siblings.length === 0) return startY;

  // Siblings'i y pozisyonuna gore sirala
  const sorted = [...siblings].sort((a, b) => a.y - b.y);

  // Son sibling'in altindan basla
  const lastSibling = sorted[sorted.length - 1];
  const nextY = lastSibling.y + lastSibling.height + spacing;

  return Math.min(nextY, endY);
}

/**
 * Yatay hizalama pozisyonunu hesaplar
 */
export function calculateHorizontalPosition(
  parentWidth: number,
  elementWidth: number,
  alignment: "start" | "center" | "end" | "stretch",
  padding: { left: number; right: number }
): { x: number; width: number } {
  const availableWidth = parentWidth - padding.left - padding.right;

  switch (alignment) {
    case "start":
      return { x: padding.left, width: elementWidth };
    case "center":
      return {
        x: padding.left + (availableWidth - elementWidth) / 2,
        width: elementWidth,
      };
    case "end":
      return {
        x: parentWidth - padding.right - elementWidth,
        width: elementWidth,
      };
    case "stretch":
      return { x: padding.left, width: availableWidth };
    default:
      return { x: padding.left, width: elementWidth };
  }
}

/**
 * Ana pozisyon hesaplama fonksiyonu
 */
export function calculatePosition(
  context: LayoutContext,
  request: PositionRequest
): PositionResult {
  const { parentWidth, parentHeight, parentPadding, siblings, parentLayoutMode } = context;
  const { width, height, region = "content", alignment = "stretch", offset } = request;

  // Auto-layout parent ise farkli davran
  if (parentLayoutMode !== "NONE") {
    return {
      x: 0,
      y: 0,
      width: alignment === "stretch" ? parentWidth - parentPadding.left - parentPadding.right : width,
      height,
      layoutSizing: {
        horizontal: alignment === "stretch" ? "FILL" : "FIXED",
        vertical: "FIXED",
      },
    };
  }

  // Region sinirlarini hesapla
  const bounds = calculateRegionBounds(
    parentHeight,
    region !== "header", // header region'inda header yok
    region !== "footer"  // footer region'inda footer yok
  );

  // Region'a gore Y pozisyonu
  const regionBound = bounds[region];

  // Region icindeki siblings'i filtrele
  const regionSiblings = siblings.filter(s =>
    s.y >= regionBound.y && s.y < regionBound.y + regionBound.height
  );

  // Sonraki bos Y pozisyonunu bul
  const y = findNextAvailableY(
    regionSiblings,
    regionBound.y + parentPadding.top,
    regionBound.y + regionBound.height - parentPadding.bottom
  );

  // X pozisyonu ve genislik
  const horizontal = calculateHorizontalPosition(
    parentWidth,
    width,
    alignment,
    { left: parentPadding.left, right: parentPadding.right }
  );

  return {
    x: horizontal.x + (offset?.x || 0),
    y: y + (offset?.y || 0),
    width: horizontal.width,
    height,
  };
}

/**
 * Parent frame'den layout context olusturur (Figma Plugin API icin)
 */
export function getLayoutContextFromNode(parent: {
  width: number;
  height: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  layoutMode?: "NONE" | "HORIZONTAL" | "VERTICAL";
  itemSpacing?: number;
  children: ReadonlyArray<{
    id: string;
    name: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }>;
}): LayoutContext {
  const siblings: SiblingInfo[] = [];

  parent.children.forEach((child, index) => {
    if (
      child.x !== undefined &&
      child.y !== undefined &&
      child.width !== undefined &&
      child.height !== undefined
    ) {
      siblings.push({
        nodeId: child.id,
        name: child.name,
        x: child.x,
        y: child.y,
        width: child.width,
        height: child.height,
        order: index,
      });
    }
  });

  return {
    parentWidth: parent.width,
    parentHeight: parent.height,
    parentPadding: {
      top: parent.paddingTop || 0,
      right: parent.paddingRight || 0,
      bottom: parent.paddingBottom || 0,
      left: parent.paddingLeft || 0,
    },
    siblings,
    parentLayoutMode: parent.layoutMode || "NONE",
    parentItemSpacing: parent.itemSpacing || 0,
  };
}

export { REGION_HEIGHTS };
