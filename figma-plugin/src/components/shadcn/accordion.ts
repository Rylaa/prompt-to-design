/**
 * shadcn Accordion Component
 * Collapsible content panels
 */

import {
  getShadcnColors,
  Theme,
} from "../../tokens";
import { resolveThemeFromOptions } from "../../tokens/theme-helpers";

export interface AccordionItem {
  title: string;
  content: string;
  open?: boolean;
}

export interface AccordionOptions {
  items?: AccordionItem[];
  width?: number;
  type?: "single" | "multiple";
  theme?: Theme;
}

export async function createShadcnAccordion(
  options: AccordionOptions = {}
): Promise<FrameNode> {
  const {
    items = [
      {
        title: "Is it accessible?",
        content: "Yes. It adheres to the WAI-ARIA design pattern.",
        open: true,
      },
      {
        title: "Is it styled?",
        content: "Yes. It comes with default styles that match the other components' aesthetic.",
        open: false,
      },
      {
        title: "Is it animated?",
        content: "Yes. It's animated by default, but you can disable it if you prefer.",
        open: false,
      },
    ],
    width = 400,
    type = "single",
    theme: rawTheme,
  } = options;
  const theme = resolveThemeFromOptions(rawTheme);

  const colors = getShadcnColors(theme);

  const accordion = figma.createFrame();
  accordion.name = "Accordion";
  accordion.layoutMode = "VERTICAL";
  accordion.primaryAxisSizingMode = "AUTO";
  accordion.counterAxisSizingMode = "FIXED";
  accordion.resize(width, 200);
  accordion.fills = [];

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const accordionItem = figma.createFrame();
    accordionItem.name = `AccordionItem-${i}`;
    accordionItem.layoutMode = "VERTICAL";
    accordionItem.layoutSizingHorizontal = "FILL";
    accordionItem.layoutSizingVertical = "HUG";
    accordionItem.fills = [];

    // Add top border for first item, bottom border for all
    if (i === 0) {
      accordionItem.strokes = [{ type: "SOLID", color: colors.border.rgb }];
      accordionItem.strokeWeight = 1;
      accordionItem.strokeTopWeight = 1;
      accordionItem.strokeBottomWeight = 1;
      accordionItem.strokeLeftWeight = 0;
      accordionItem.strokeRightWeight = 0;
    } else {
      accordionItem.strokes = [{ type: "SOLID", color: colors.border.rgb }];
      accordionItem.strokeWeight = 1;
      accordionItem.strokeTopWeight = 0;
      accordionItem.strokeBottomWeight = 1;
      accordionItem.strokeLeftWeight = 0;
      accordionItem.strokeRightWeight = 0;
    }

    // Trigger/Header
    const trigger = figma.createFrame();
    trigger.name = "AccordionTrigger";
    trigger.layoutMode = "HORIZONTAL";
    trigger.layoutSizingHorizontal = "FILL";
    trigger.layoutSizingVertical = "HUG";
    trigger.paddingTop = 16;
    trigger.paddingBottom = 16;
    trigger.primaryAxisAlignItems = "SPACE_BETWEEN";
    trigger.counterAxisAlignItems = "CENTER";
    trigger.fills = [];

    const titleText = figma.createText();
    titleText.fontName = { family: "Inter", style: "Medium" };
    titleText.characters = item.title;
    titleText.fontSize = 14;
    titleText.fills = [{ type: "SOLID", color: colors.foreground.rgb }];
    trigger.appendChild(titleText);

    // Chevron icon
    const chevron = figma.createText();
    chevron.fontName = { family: "Inter", style: "Regular" };
    chevron.characters = item.open ? "▲" : "▼";
    chevron.fontSize = 12;
    chevron.fills = [{ type: "SOLID", color: colors.mutedForeground.rgb }];
    trigger.appendChild(chevron);

    accordionItem.appendChild(trigger);
    trigger.layoutSizingHorizontal = "FILL";

    // Content (only if open)
    if (item.open) {
      const content = figma.createFrame();
      content.name = "AccordionContent";
      content.layoutMode = "VERTICAL";
      content.layoutSizingHorizontal = "FILL";
      content.layoutSizingVertical = "HUG";
      content.paddingBottom = 16;
      content.fills = [];

      const contentText = figma.createText();
      contentText.fontName = { family: "Inter", style: "Regular" };
      contentText.characters = item.content;
      contentText.fontSize = 14;
      contentText.fills = [{ type: "SOLID", color: colors.mutedForeground.rgb }];
      contentText.textAutoResize = "HEIGHT";
      contentText.resize(width - 32, contentText.height);
      content.appendChild(contentText);

      accordionItem.appendChild(content);
      content.layoutSizingHorizontal = "FILL";
    }

    accordion.appendChild(accordionItem);
    accordionItem.layoutSizingHorizontal = "FILL";
  }

  return accordion;
}

export interface CollapsibleOptions {
  title?: string;
  content?: string;
  open?: boolean;
  width?: number;
  theme?: Theme;
}

export async function createShadcnCollapsible(
  options: CollapsibleOptions = {}
): Promise<FrameNode> {
  const {
    title = "@peduarte starred 3 repositories",
    content = "@radix-ui/primitives",
    open = true,
    width = 350,
    theme: rawTheme,
  } = options;
  const theme = resolveThemeFromOptions(rawTheme);

  const colors = getShadcnColors(theme);

  const collapsible = figma.createFrame();
  collapsible.name = open ? "Collapsible/Open" : "Collapsible/Closed";
  collapsible.layoutMode = "VERTICAL";
  collapsible.primaryAxisSizingMode = "AUTO";
  collapsible.counterAxisSizingMode = "FIXED";
  collapsible.resize(width, 100);
  collapsible.itemSpacing = 8;
  collapsible.fills = [];

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  // Header
  const header = figma.createFrame();
  header.name = "CollapsibleHeader";
  header.layoutMode = "HORIZONTAL";
  header.layoutSizingHorizontal = "FILL";
  header.layoutSizingVertical = "HUG";
  header.primaryAxisAlignItems = "SPACE_BETWEEN";
  header.counterAxisAlignItems = "CENTER";
  header.fills = [];

  const titleText = figma.createText();
  titleText.fontName = { family: "Inter", style: "Medium" };
  titleText.characters = title;
  titleText.fontSize = 14;
  titleText.fills = [{ type: "SOLID", color: colors.foreground.rgb }];
  header.appendChild(titleText);

  // Toggle button
  const toggleBtn = figma.createFrame();
  toggleBtn.name = "ToggleButton";
  toggleBtn.layoutMode = "HORIZONTAL";
  toggleBtn.primaryAxisSizingMode = "FIXED";
  toggleBtn.counterAxisSizingMode = "FIXED";
  toggleBtn.resize(32, 32);
  toggleBtn.primaryAxisAlignItems = "CENTER";
  toggleBtn.counterAxisAlignItems = "CENTER";
  toggleBtn.cornerRadius = 6;
  toggleBtn.fills = [{ type: "SOLID", color: colors.secondary.rgb }];

  const toggleIcon = figma.createText();
  toggleIcon.fontName = { family: "Inter", style: "Regular" };
  toggleIcon.characters = open ? "−" : "+";
  toggleIcon.fontSize = 16;
  toggleIcon.fills = [{ type: "SOLID", color: colors.secondaryForeground.rgb }];
  toggleBtn.appendChild(toggleIcon);

  header.appendChild(toggleBtn);
  collapsible.appendChild(header);
  header.layoutSizingHorizontal = "FILL";

  // Content (only if open)
  if (open) {
    const contentItems = [content, "@radix-ui/colors", "@stitches/react"];

    for (const item of contentItems) {
      const contentItem = figma.createFrame();
      contentItem.name = "CollapsibleItem";
      contentItem.layoutMode = "HORIZONTAL";
      contentItem.layoutSizingHorizontal = "FILL";
      contentItem.layoutSizingVertical = "HUG";
      contentItem.paddingLeft = 16;
      contentItem.paddingRight = 16;
      contentItem.paddingTop = 12;
      contentItem.paddingBottom = 12;
      contentItem.cornerRadius = 6;
      contentItem.fills = [{ type: "SOLID", color: colors.muted.rgb }];

      const itemText = figma.createText();
      itemText.fontName = { family: "Inter", style: "Regular" };
      itemText.characters = item;
      itemText.fontSize = 14;
      itemText.fills = [{ type: "SOLID", color: colors.foreground.rgb }];
      contentItem.appendChild(itemText);

      collapsible.appendChild(contentItem);
      contentItem.layoutSizingHorizontal = "FILL";
    }
  }

  return collapsible;
}
