/**
 * shadcn Card Component
 * Parts: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
 */

import {
  getShadcnColors,
  shadcnSpacing,
  shadcnTypography,
  shadcnShadows,
  getFigmaFontStyle,
  shadowsToFigmaEffects,
  Theme,
} from "../../tokens";
import { resolveThemeFromOptions } from "../../tokens/theme-helpers";

export interface CardOptions {
  width?: number;
  height?: number;
  title?: string;
  description?: string;
  content?: string;
  footerContent?: string;
  hasShadow?: boolean;
  theme?: Theme;
}

export async function createShadcnCard(
  options: CardOptions = {}
): Promise<FrameNode> {
  const {
    width = 320,
    height,
    title,
    description,
    content,
    hasShadow = true,
    theme: rawTheme,
  } = options;
  const theme = resolveThemeFromOptions(rawTheme);

  const colors = getShadcnColors(theme);

  // Create card frame
  const card = figma.createFrame();
  card.name = "Card";
  card.layoutMode = "VERTICAL";
  card.primaryAxisSizingMode = height ? "FIXED" : "AUTO";
  card.counterAxisSizingMode = "FIXED";
  card.resize(width, height || 200);
  card.cornerRadius = 12;

  // Set background and border
  card.fills = [{ type: "SOLID", color: colors.card.rgb }];
  card.strokes = [{ type: "SOLID", color: colors.border.rgb }];
  card.strokeWeight = 1;

  // Add shadow
  if (hasShadow) {
    const shadowPreset = shadcnShadows.default;
    card.effects = shadowsToFigmaEffects(shadowPreset.shadows);
  }

  // Add header if title or description provided
  if (title || description) {
    const header = await createCardHeader({ title, description, theme });
    card.appendChild(header);
    // Set FILL after appending to auto-layout parent
    header.layoutSizingHorizontal = "FILL";
  }

  // Add content if provided
  if (content) {
    const contentFrame = await createCardContent({ content, theme });
    card.appendChild(contentFrame);
    // Set FILL after appending to auto-layout parent
    contentFrame.layoutSizingHorizontal = "FILL";
  }

  return card;
}

export async function createCardHeader(
  options: { title?: string; description?: string; theme?: Theme } = {}
): Promise<FrameNode> {
  const { title, description, theme: rawTheme } = options;
  const theme = resolveThemeFromOptions(rawTheme);
  const colors = getShadcnColors(theme);

  const header = figma.createFrame();
  header.name = "CardHeader";
  header.layoutMode = "VERTICAL";
  header.layoutSizingVertical = "HUG";
  // layoutSizingHorizontal = "FILL" is set after appendChild in parent
  header.layoutAlign = "STRETCH";
  header.paddingTop = shadcnSpacing.cardHeaderPadding;
  header.paddingBottom = 0;
  header.paddingLeft = shadcnSpacing.cardHeaderPadding;
  header.paddingRight = shadcnSpacing.cardHeaderPadding;
  header.itemSpacing = 6;
  header.fills = [];

  if (title) {
    const titleText = figma.createText();
    const titleStyle = shadcnTypography.large;

    try {
      await figma.loadFontAsync({
        family: titleStyle.family,
        style: getFigmaFontStyle(titleStyle.weight),
      });
      titleText.fontName = {
        family: titleStyle.family,
        style: getFigmaFontStyle(titleStyle.weight),
      };
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
      titleText.fontName = { family: "Inter", style: "Semi Bold" };
    }

    titleText.characters = title;
    titleText.fontSize = titleStyle.size;
    titleText.fills = [{ type: "SOLID", color: colors.cardForeground.rgb }];
    titleText.layoutAlign = "STRETCH";
    header.appendChild(titleText);
  }

  if (description) {
    const descText = figma.createText();
    const descStyle = shadcnTypography.muted;

    try {
      await figma.loadFontAsync({
        family: descStyle.family,
        style: getFigmaFontStyle(descStyle.weight),
      });
      descText.fontName = {
        family: descStyle.family,
        style: getFigmaFontStyle(descStyle.weight),
      };
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      descText.fontName = { family: "Inter", style: "Regular" };
    }

    descText.characters = description;
    descText.fontSize = descStyle.size;
    descText.fills = [{ type: "SOLID", color: colors.mutedForeground.rgb }];
    descText.layoutAlign = "STRETCH";
    header.appendChild(descText);
  }

  return header;
}

export async function createCardContent(
  options: { content?: string; theme?: Theme } = {}
): Promise<FrameNode> {
  const { content = "", theme: rawTheme } = options;
  const theme = resolveThemeFromOptions(rawTheme);
  const colors = getShadcnColors(theme);

  const contentFrame = figma.createFrame();
  contentFrame.name = "CardContent";
  contentFrame.layoutMode = "VERTICAL";
  contentFrame.layoutSizingVertical = "HUG";
  // layoutSizingHorizontal = "FILL" is set after appendChild in parent
  contentFrame.layoutAlign = "STRETCH";
  contentFrame.paddingTop = shadcnSpacing.cardPadding;
  contentFrame.paddingBottom = shadcnSpacing.cardPadding;
  contentFrame.paddingLeft = shadcnSpacing.cardPadding;
  contentFrame.paddingRight = shadcnSpacing.cardPadding;
  contentFrame.fills = [];

  if (content) {
    const textNode = figma.createText();
    const bodyStyle = shadcnTypography.p;

    try {
      await figma.loadFontAsync({
        family: bodyStyle.family,
        style: getFigmaFontStyle(bodyStyle.weight),
      });
      textNode.fontName = {
        family: bodyStyle.family,
        style: getFigmaFontStyle(bodyStyle.weight),
      };
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      textNode.fontName = { family: "Inter", style: "Regular" };
    }

    textNode.characters = content;
    textNode.fontSize = bodyStyle.size;
    textNode.fills = [{ type: "SOLID", color: colors.cardForeground.rgb }];
    textNode.layoutAlign = "STRETCH";
    textNode.textAutoResize = "HEIGHT";
    contentFrame.appendChild(textNode);
  }

  return contentFrame;
}

export async function createCardFooter(
  options: { theme?: Theme } = {}
): Promise<FrameNode> {
  const { theme: rawTheme } = options;
  const theme = resolveThemeFromOptions(rawTheme);

  const footer = figma.createFrame();
  footer.name = "CardFooter";
  footer.layoutMode = "HORIZONTAL";
  footer.layoutSizingHorizontal = "HUG";
  footer.layoutSizingVertical = "FILL";
  footer.layoutAlign = "STRETCH";
  footer.paddingTop = 0;
  footer.paddingBottom = shadcnSpacing.cardFooterPadding;
  footer.paddingLeft = shadcnSpacing.cardFooterPadding;
  footer.paddingRight = shadcnSpacing.cardFooterPadding;
  footer.itemSpacing = 8;
  footer.fills = [];
  footer.primaryAxisAlignItems = "SPACE_BETWEEN";
  footer.counterAxisAlignItems = "CENTER";

  return footer;
}
