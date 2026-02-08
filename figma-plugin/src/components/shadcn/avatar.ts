/**
 * shadcn Avatar Component
 * Variants: image, fallback, with-status
 */

import {
  getShadcnColors,
  shadcnSpacing,
  shadcnTypography,
  getFigmaFontStyle,
  Theme,
} from "../../tokens";
import { hexToRgb, type ThemeColors } from "../../tokens/colors";
import { resolveThemeFromOptions } from "../../tokens/theme-helpers";

export type AvatarSize = "sm" | "default" | "lg";
export type AvatarStatus = "online" | "offline" | "away" | "busy" | "none";

export interface AvatarOptions {
  initials?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  theme?: Theme;
}

function getAvatarSize(size: AvatarSize): number {
  switch (size) {
    case "sm":
      return shadcnSpacing.avatarSm;
    case "lg":
      return shadcnSpacing.avatarLg;
    default:
      return shadcnSpacing.avatarDefault;
  }
}

function getStatusColor(status: AvatarStatus, colors: ThemeColors): string {
  switch (status) {
    case "online":
      return colors.statusSuccess.hex;
    case "offline":
      return colors.mutedForeground.hex;
    case "away":
      return colors.statusWarning.hex;
    case "busy":
      return colors.statusError.hex;
    default:
      return colors.statusSuccess.hex;
  }
}

export async function createShadcnAvatar(
  options: AvatarOptions = {}
): Promise<FrameNode> {
  const {
    initials = "AB",
    size = "default",
    status = "none",
    theme: rawTheme,
  } = options;
  const theme = resolveThemeFromOptions(rawTheme);

  const colors = getShadcnColors(theme);
  const avatarSize = getAvatarSize(size);

  // Create container for avatar + status
  const container = figma.createFrame();
  container.name = "Avatar";
  container.resize(avatarSize + (status !== "none" ? 4 : 0), avatarSize + (status !== "none" ? 4 : 0));
  container.fills = [];

  // Create avatar circle
  const avatar = figma.createFrame();
  avatar.name = "AvatarCircle";
  avatar.resize(avatarSize, avatarSize);
  avatar.cornerRadius = avatarSize / 2;
  avatar.fills = [{ type: "SOLID", color: colors.muted.rgb }];
  avatar.layoutMode = "HORIZONTAL";
  avatar.primaryAxisAlignItems = "CENTER";
  avatar.counterAxisAlignItems = "CENTER";

  // Add initials
  const text = figma.createText();
  const fontSize = size === "sm" ? 12 : size === "lg" ? 18 : 14;

  try {
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    text.fontName = { family: "Inter", style: "Medium" };
  } catch (e) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    text.fontName = { family: "Inter", style: "Regular" };
  }

  text.characters = initials.slice(0, 2).toUpperCase();
  text.fontSize = fontSize;
  text.fills = [{ type: "SOLID", color: colors.mutedForeground.rgb }];

  avatar.appendChild(text);
  container.appendChild(avatar);

  // Add status indicator
  if (status !== "none") {
    const statusSize = size === "sm" ? 8 : size === "lg" ? 14 : 10;
    const statusIndicator = figma.createEllipse();
    statusIndicator.name = "StatusIndicator";
    statusIndicator.resize(statusSize, statusSize);
    statusIndicator.fills = [
      { type: "SOLID", color: hexToRgb(getStatusColor(status, colors)) },
    ];
    statusIndicator.strokes = [{ type: "SOLID", color: colors.background.rgb }];
    statusIndicator.strokeWeight = 2;

    // Position at bottom-right
    statusIndicator.x = avatarSize - statusSize + 2;
    statusIndicator.y = avatarSize - statusSize + 2;

    container.appendChild(statusIndicator);
  }

  return container;
}

export async function createAvatarGroup(
  options: { count?: number; size?: AvatarSize; theme?: Theme } = {}
): Promise<FrameNode> {
  const { count = 3, size = "default", theme: rawTheme } = options;
  const theme = resolveThemeFromOptions(rawTheme);
  const avatarSize = getAvatarSize(size);
  const overlap = avatarSize * 0.3;

  const group = figma.createFrame();
  group.name = "AvatarGroup";
  group.layoutMode = "HORIZONTAL";
  group.itemSpacing = -overlap;
  group.primaryAxisSizingMode = "AUTO";
  group.counterAxisSizingMode = "AUTO";
  group.fills = [];

  const initials = ["AB", "CD", "EF", "GH", "IJ", "KL"];
  for (let i = 0; i < count; i++) {
    const avatar = await createShadcnAvatar({
      initials: initials[i % initials.length],
      size,
      theme,
    });
    group.appendChild(avatar);
  }

  return group;
}
