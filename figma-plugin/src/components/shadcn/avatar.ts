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

function getStatusColor(status: AvatarStatus): string {
  switch (status) {
    case "online":
      return "#22C55E"; // green
    case "offline":
      return "#71717A"; // gray
    case "away":
      return "#F59E0B"; // amber
    case "busy":
      return "#EF4444"; // red
    default:
      return "#22C55E";
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
}

export async function createShadcnAvatar(
  options: AvatarOptions = {}
): Promise<FrameNode> {
  const {
    initials = "AB",
    size = "default",
    status = "none",
    theme = "light",
  } = options;

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
      { type: "SOLID", color: hexToRgb(getStatusColor(status)) },
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
  const { count = 3, size = "default", theme = "light" } = options;
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
