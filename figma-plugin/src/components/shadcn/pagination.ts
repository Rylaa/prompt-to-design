/**
 * shadcn Pagination Component
 * Prev/Next buttons with page numbers
 */

import {
  getShadcnColors,
  shadcnTypography,
  getFigmaFontStyle,
  Theme,
} from "../../tokens";
import { hexToRgb } from "../../tokens/colors";

export interface PaginationOptions {
  currentPage?: number;
  totalPages?: number;
  theme?: Theme;
}

export async function createShadcnPagination(
  options: PaginationOptions = {}
): Promise<FrameNode> {
  const {
    currentPage = 1,
    totalPages = 5,
    theme = "light",
  } = options;

  const colors = getShadcnColors(theme);

  // Create pagination container
  const container = figma.createFrame();
  container.name = "Pagination";
  container.layoutMode = "HORIZONTAL";
  container.primaryAxisSizingMode = "AUTO";
  container.counterAxisSizingMode = "AUTO";
  container.primaryAxisAlignItems = "CENTER";
  container.counterAxisAlignItems = "CENTER";
  container.itemSpacing = 4;
  container.fills = [];

  // Helper to create a pagination button
  async function createPageButton(
    label: string,
    isActive: boolean,
    isDisabled: boolean
  ): Promise<FrameNode> {
    const btn = figma.createFrame();
    btn.name = `Page-${label}`;
    btn.layoutMode = "HORIZONTAL";
    btn.primaryAxisAlignItems = "CENTER";
    btn.counterAxisAlignItems = "CENTER";
    btn.primaryAxisSizingMode = "FIXED";
    btn.counterAxisSizingMode = "FIXED";
    btn.resize(36, 36);
    btn.cornerRadius = 6;

    if (isActive) {
      btn.fills = [{ type: "SOLID", color: colors.primary.rgb }];
    } else {
      btn.fills = [];
    }

    // Border for non-active, non-disabled
    if (!isActive && !isDisabled) {
      btn.strokes = [{ type: "SOLID", color: colors.border.rgb }];
      btn.strokeWeight = 1;
    }

    const textNode = figma.createText();
    const typo = shadcnTypography.small;

    try {
      const fontStyle = isActive
        ? getFigmaFontStyle(500)
        : getFigmaFontStyle(typo.weight);
      await figma.loadFontAsync({ family: typo.family, style: fontStyle });
      textNode.fontName = { family: typo.family, style: fontStyle };
    } catch {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      textNode.fontName = { family: "Inter", style: "Regular" };
    }

    textNode.characters = label;
    textNode.fontSize = typo.size;

    if (isActive) {
      textNode.fills = [{ type: "SOLID", color: colors.primaryForeground.rgb }];
    } else if (isDisabled) {
      textNode.fills = [{ type: "SOLID", color: colors.mutedForeground.rgb }];
    } else {
      textNode.fills = [{ type: "SOLID", color: colors.foreground.rgb }];
    }

    btn.appendChild(textNode);
    return btn;
  }

  // Previous button
  const prevBtn = await createPageButton("‹", false, currentPage === 1);
  prevBtn.name = "Prev";
  container.appendChild(prevBtn);

  // Page number buttons
  const pagesToShow = generatePageNumbers(currentPage, totalPages);

  for (const page of pagesToShow) {
    if (page === "...") {
      const ellipsis = figma.createText();
      try {
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
        ellipsis.fontName = { family: "Inter", style: "Regular" };
      } catch {
        // fallback already loaded
      }
      ellipsis.characters = "...";
      ellipsis.fontSize = 14;
      ellipsis.fills = [{ type: "SOLID", color: colors.mutedForeground.rgb }];
      container.appendChild(ellipsis);
    } else {
      const pageNum = page as number;
      const isActive = pageNum === currentPage;
      const btn = await createPageButton(String(pageNum), isActive, false);
      container.appendChild(btn);
    }
  }

  // Next button
  const nextBtn = await createPageButton("›", false, currentPage === totalPages);
  nextBtn.name = "Next";
  container.appendChild(nextBtn);

  return container;
}

/**
 * Generate page numbers to display, with ellipsis for large ranges
 */
function generatePageNumbers(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) {
    pages.push("...");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  pages.push(total);

  return pages;
}
