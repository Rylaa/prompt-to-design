/**
 * shadcn Progress Component
 */

import {
  getShadcnColors,
  shadcnSpacing,
  Theme,
} from "../../tokens";

export interface ProgressOptions {
  value?: number; // 0-100
  width?: number;
  theme?: Theme;
}

export async function createShadcnProgress(
  options: ProgressOptions = {}
): Promise<FrameNode> {
  const {
    value = 50,
    width = 200,
    theme = "light",
  } = options;

  const colors = getShadcnColors(theme);
  const height = shadcnSpacing.progressHeight;
  const clampedValue = Math.max(0, Math.min(100, value));

  // Create progress track
  const track = figma.createFrame();
  track.name = "Progress";
  track.resize(width, height);
  track.cornerRadius = height / 2;
  track.fills = [{ type: "SOLID", color: colors.secondary.rgb }];
  track.clipsContent = true;

  // Create progress indicator
  const indicator = figma.createFrame();
  indicator.name = "ProgressIndicator";
  indicator.resize((width * clampedValue) / 100, height);
  indicator.cornerRadius = height / 2;
  indicator.fills = [{ type: "SOLID", color: colors.primary.rgb }];
  indicator.x = 0;
  indicator.y = 0;

  track.appendChild(indicator);

  return track;
}

export async function createShadcnSlider(
  options: ProgressOptions = {}
): Promise<FrameNode> {
  const {
    value = 50,
    width = 200,
    theme = "light",
  } = options;

  const colors = getShadcnColors(theme);
  const trackHeight = shadcnSpacing.sliderTrackHeight;
  const thumbSize = shadcnSpacing.sliderThumbSize;
  const clampedValue = Math.max(0, Math.min(100, value));

  // Create container
  const container = figma.createFrame();
  container.name = "Slider";
  container.resize(width, thumbSize);
  container.fills = [];

  // Create track
  const track = figma.createFrame();
  track.name = "SliderTrack";
  track.resize(width, trackHeight);
  track.cornerRadius = trackHeight / 2;
  track.fills = [{ type: "SOLID", color: colors.secondary.rgb }];
  track.y = (thumbSize - trackHeight) / 2;

  // Create filled portion
  const filled = figma.createFrame();
  filled.name = "SliderFilled";
  filled.resize((width * clampedValue) / 100, trackHeight);
  filled.cornerRadius = trackHeight / 2;
  filled.fills = [{ type: "SOLID", color: colors.primary.rgb }];
  filled.x = 0;
  filled.y = 0;
  track.appendChild(filled);

  container.appendChild(track);

  // Create thumb
  const thumb = figma.createEllipse();
  thumb.name = "SliderThumb";
  thumb.resize(thumbSize, thumbSize);
  thumb.fills = [{ type: "SOLID", color: colors.background.rgb }];
  thumb.strokes = [{ type: "SOLID", color: colors.primary.rgb }];
  thumb.strokeWeight = 2;
  thumb.x = ((width - thumbSize) * clampedValue) / 100;
  thumb.y = 0;

  // Add shadow to thumb
  thumb.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 1 },
      radius: 2,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    },
  ];

  container.appendChild(thumb);

  return container;
}

export async function createShadcnSkeleton(
  options: { width?: number; height?: number; rounded?: boolean; theme?: Theme } = {}
): Promise<FrameNode> {
  const {
    width = 100,
    height = 20,
    rounded = false,
    theme = "light",
  } = options;

  const colors = getShadcnColors(theme);

  const skeleton = figma.createFrame();
  skeleton.name = "Skeleton";
  skeleton.resize(width, height);
  skeleton.cornerRadius = rounded ? height / 2 : 4;
  skeleton.fills = [{ type: "SOLID", color: colors.muted.rgb }];

  return skeleton;
}
