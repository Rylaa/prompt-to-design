/**
 * Apple macOS Control Components
 * Toolbar, Segmented Control, Pop-up Button, Radio, Slider, Table View
 */

import {
  getMacOSColors,
  macOSSpacing,
  Theme,
} from "../../tokens";

export interface ToolbarOptions {
  items?: { icon: string; label?: string; active?: boolean }[];
  width?: number;
  theme?: Theme;
}

export async function createMacOSToolbar(
  options: ToolbarOptions = {}
): Promise<FrameNode> {
  const {
    items = [
      { icon: "◀", label: "Back" },
      { icon: "▶", label: "Forward" },
      { icon: "📁", label: "Open" },
      { icon: "💾", label: "Save" },
      { icon: "🔍", label: "Search", active: true },
    ],
    width = 500,
    theme = "light",
  } = options;

  const colors = getMacOSColors(theme);

  const toolbar = figma.createFrame();
  toolbar.name = "macOS Toolbar";
  toolbar.layoutMode = "HORIZONTAL";
  toolbar.primaryAxisSizingMode = "FIXED";
  toolbar.counterAxisSizingMode = "FIXED";
  toolbar.resize(width, 38);
  toolbar.paddingLeft = 8;
  toolbar.paddingRight = 8;
  toolbar.itemSpacing = 4;
  toolbar.counterAxisAlignItems = "CENTER";
  toolbar.fills = [
    {
      type: "SOLID",
      color: theme === "light"
        ? { r: 0.95, g: 0.95, b: 0.95 }
        : colors.secondarySystemBackground.rgb,
    },
  ];
  toolbar.strokes = [{ type: "SOLID", color: colors.separator.rgb }];
  toolbar.strokeWeight = 0.5;
  toolbar.strokeBottomWeight = 0.5;
  toolbar.strokeTopWeight = 0;
  toolbar.strokeLeftWeight = 0;
  toolbar.strokeRightWeight = 0;

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  for (const item of items) {
    const btn = figma.createFrame();
    btn.name = `ToolbarItem-${item.label || item.icon}`;
    btn.layoutMode = "HORIZONTAL";
    btn.primaryAxisSizingMode = "AUTO";
    btn.counterAxisSizingMode = "FIXED";
    btn.resize(50, 26);
    btn.paddingLeft = 8;
    btn.paddingRight = 8;
    btn.itemSpacing = 4;
    btn.primaryAxisAlignItems = "CENTER";
    btn.counterAxisAlignItems = "CENTER";
    btn.cornerRadius = 5;

    if (item.active) {
      btn.fills = [{ type: "SOLID", color: colors.systemBlue.rgb, opacity: 0.15 }];
    } else {
      btn.fills = [];
    }

    const icon = figma.createText();
    icon.fontName = { family: "Inter", style: "Regular" };
    icon.characters = item.icon;
    icon.fontSize = 14;
    icon.fills = [
      {
        type: "SOLID",
        color: item.active ? colors.systemBlue.rgb : colors.label.rgb,
      },
    ];
    btn.appendChild(icon);

    if (item.label) {
      const label = figma.createText();
      label.fontName = { family: "Inter", style: "Regular" };
      label.characters = item.label;
      label.fontSize = 12;
      label.fills = [
        {
          type: "SOLID",
          color: item.active ? colors.systemBlue.rgb : colors.label.rgb,
        },
      ];
      btn.appendChild(label);
    }

    toolbar.appendChild(btn);
  }

  return toolbar;
}

export interface MacOSSegmentedControlOptions {
  segments?: string[];
  selectedIndex?: number;
  style?: "automatic" | "separated";
  width?: number;
  theme?: Theme;
}

export async function createMacOSSegmentedControl(
  options: MacOSSegmentedControlOptions = {}
): Promise<FrameNode> {
  const {
    segments = ["Day", "Week", "Month", "Year"],
    selectedIndex = 1,
    style = "automatic",
    width = 280,
    theme = "light",
  } = options;

  const colors = getMacOSColors(theme);
  const segmentWidth = width / segments.length;

  const control = figma.createFrame();
  control.name = `macOS SegmentedControl/${style}`;
  control.layoutMode = "HORIZONTAL";
  control.primaryAxisSizingMode = "FIXED";
  control.counterAxisSizingMode = "FIXED";
  control.resize(width, 22);

  if (style === "automatic") {
    control.cornerRadius = 5;
    control.fills = [{ type: "SOLID", color: colors.systemGray6.rgb }];
    control.strokes = [{ type: "SOLID", color: colors.separator.rgb }];
    control.strokeWeight = 0.5;
  } else {
    control.fills = [];
    control.itemSpacing = 4;
  }

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  for (let i = 0; i < segments.length; i++) {
    const isSelected = i === selectedIndex;

    const segment = figma.createFrame();
    segment.name = `Segment-${segments[i]}`;
    segment.layoutMode = "HORIZONTAL";
    segment.primaryAxisAlignItems = "CENTER";
    segment.counterAxisAlignItems = "CENTER";

    if (style === "automatic") {
      segment.primaryAxisSizingMode = "FIXED";
      segment.counterAxisSizingMode = "AUTO";
      segment.resize(segmentWidth, 22);
      segment.fills = isSelected
        ? [{ type: "SOLID", color: colors.systemBackground.rgb }]
        : [];

      // Add divider
      if (i < segments.length - 1 && !isSelected && selectedIndex !== i + 1) {
        segment.strokes = [{ type: "SOLID", color: colors.separator.rgb }];
        segment.strokeWeight = 0.5;
        segment.strokeRightWeight = 0.5;
        segment.strokeLeftWeight = 0;
        segment.strokeTopWeight = 0;
        segment.strokeBottomWeight = 0;
      }
    } else {
      segment.primaryAxisSizingMode = "AUTO";
      segment.counterAxisSizingMode = "AUTO";
      segment.paddingLeft = 12;
      segment.paddingRight = 12;
      segment.paddingTop = 4;
      segment.paddingBottom = 4;
      segment.cornerRadius = 5;
      segment.fills = isSelected
        ? [{ type: "SOLID", color: colors.systemBlue.rgb }]
        : [{ type: "SOLID", color: colors.systemGray6.rgb }];
      segment.strokes = isSelected
        ? []
        : [{ type: "SOLID", color: colors.separator.rgb }];
      segment.strokeWeight = 0.5;
    }

    const label = figma.createText();
    label.fontName = isSelected
      ? { family: "Inter", style: "Medium" }
      : { family: "Inter", style: "Regular" };
    label.characters = segments[i];
    label.fontSize = 12;

    if (style === "separated" && isSelected) {
      label.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    } else {
      label.fills = [{ type: "SOLID", color: colors.label.rgb }];
    }

    segment.appendChild(label);
    control.appendChild(segment);
  }

  return control;
}

export interface PopUpButtonOptions {
  options?: string[];
  selectedIndex?: number;
  width?: number;
  theme?: Theme;
}

export async function createMacOSPopUpButton(
  options: PopUpButtonOptions = {}
): Promise<FrameNode> {
  const {
    options: menuOptions = ["Option 1", "Option 2", "Option 3"],
    selectedIndex = 0,
    width = 150,
    theme = "light",
  } = options;

  const colors = getMacOSColors(theme);

  const button = figma.createFrame();
  button.name = "macOS PopUpButton";
  button.layoutMode = "HORIZONTAL";
  button.primaryAxisSizingMode = "FIXED";
  button.counterAxisSizingMode = "FIXED";
  button.resize(width, 22);
  button.paddingLeft = 8;
  button.paddingRight = 6;
  button.primaryAxisAlignItems = "SPACE_BETWEEN";
  button.counterAxisAlignItems = "CENTER";
  button.cornerRadius = 5;
  button.fills = [{ type: "SOLID", color: colors.systemGray6.rgb }];
  button.strokes = [{ type: "SOLID", color: colors.separator.rgb }];
  button.strokeWeight = 0.5;
  button.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.05 },
      offset: { x: 0, y: 0.5 },
      radius: 1,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    },
  ];

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  // Selected value
  const value = figma.createText();
  value.fontName = { family: "Inter", style: "Regular" };
  value.characters = menuOptions[selectedIndex] || "";
  value.fontSize = 12;
  value.fills = [{ type: "SOLID", color: colors.label.rgb }];
  button.appendChild(value);

  // Chevron
  const chevron = figma.createFrame();
  chevron.name = "Chevrons";
  chevron.layoutMode = "VERTICAL";
  chevron.primaryAxisSizingMode = "AUTO";
  chevron.counterAxisSizingMode = "AUTO";
  chevron.itemSpacing = -2;
  chevron.fills = [];

  const upChevron = figma.createText();
  upChevron.fontName = { family: "Inter", style: "Regular" };
  upChevron.characters = "▲";
  upChevron.fontSize = 6;
  upChevron.fills = [{ type: "SOLID", color: colors.secondaryLabel.rgb }];
  chevron.appendChild(upChevron);

  const downChevron = figma.createText();
  downChevron.fontName = { family: "Inter", style: "Regular" };
  downChevron.characters = "▼";
  downChevron.fontSize = 6;
  downChevron.fills = [{ type: "SOLID", color: colors.secondaryLabel.rgb }];
  chevron.appendChild(downChevron);

  button.appendChild(chevron);

  return button;
}

export interface MacOSRadioOptions {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  theme?: Theme;
}

export async function createMacOSRadio(
  options: MacOSRadioOptions = {}
): Promise<FrameNode> {
  const {
    label = "Option",
    checked = false,
    disabled = false,
    theme = "light",
  } = options;

  const colors = getMacOSColors(theme);

  const radio = figma.createFrame();
  radio.name = checked ? "macOS Radio/Checked" : "macOS Radio";
  radio.layoutMode = "HORIZONTAL";
  radio.primaryAxisSizingMode = "AUTO";
  radio.counterAxisSizingMode = "AUTO";
  radio.itemSpacing = 6;
  radio.counterAxisAlignItems = "CENTER";
  radio.fills = [];

  if (disabled) {
    radio.opacity = 0.5;
  }

  // Radio circle
  const circle = figma.createEllipse();
  circle.name = "RadioCircle";
  circle.resize(14, 14);
  circle.fills = checked
    ? [{ type: "SOLID", color: colors.systemBlue.rgb }]
    : [{ type: "SOLID", color: colors.systemGray6.rgb }];
  circle.strokes = checked
    ? []
    : [{ type: "SOLID", color: colors.separator.rgb }];
  circle.strokeWeight = 0.5;

  const circleContainer = figma.createFrame();
  circleContainer.name = "CircleContainer";
  circleContainer.resize(14, 14);
  circleContainer.fills = [];
  circleContainer.appendChild(circle);

  // Inner dot for checked state
  if (checked) {
    const dot = figma.createEllipse();
    dot.name = "Dot";
    dot.resize(6, 6);
    dot.x = 4;
    dot.y = 4;
    dot.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    circleContainer.appendChild(dot);
  }

  radio.appendChild(circleContainer);

  // Label
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  const labelText = figma.createText();
  labelText.fontName = { family: "Inter", style: "Regular" };
  labelText.characters = label;
  labelText.fontSize = 13;
  labelText.fills = [{ type: "SOLID", color: colors.label.rgb }];
  radio.appendChild(labelText);

  return radio;
}

export interface MacOSSliderOptions {
  value?: number;
  min?: number;
  max?: number;
  width?: number;
  showTicks?: boolean;
  theme?: Theme;
}

export async function createMacOSSlider(
  options: MacOSSliderOptions = {}
): Promise<FrameNode> {
  const {
    value = 50,
    min = 0,
    max = 100,
    width = 200,
    showTicks = false,
    theme = "light",
  } = options;

  const colors = getMacOSColors(theme);
  const percentage = ((value - min) / (max - min)) * 100;
  const trackHeight = 4;
  const thumbSize = 18;

  const slider = figma.createFrame();
  slider.name = "macOS Slider";
  slider.resize(width, thumbSize);
  slider.fills = [];

  // Track
  const track = figma.createFrame();
  track.name = "Track";
  track.resize(width, trackHeight);
  track.y = (thumbSize - trackHeight) / 2;
  track.cornerRadius = trackHeight / 2;
  track.fills = [{ type: "SOLID", color: colors.systemGray5.rgb }];
  track.strokes = [{ type: "SOLID", color: colors.separator.rgb }];
  track.strokeWeight = 0.5;
  slider.appendChild(track);

  // Filled track
  const filledWidth = (percentage / 100) * width;
  const filledTrack = figma.createFrame();
  filledTrack.name = "FilledTrack";
  filledTrack.resize(Math.max(1, filledWidth), trackHeight);
  filledTrack.y = (thumbSize - trackHeight) / 2;
  filledTrack.cornerRadius = trackHeight / 2;
  filledTrack.fills = [{ type: "SOLID", color: colors.systemBlue.rgb }];
  slider.appendChild(filledTrack);

  // Thumb
  const thumb = figma.createEllipse();
  thumb.name = "Thumb";
  thumb.resize(thumbSize, thumbSize);
  thumb.x = Math.max(0, Math.min(filledWidth - thumbSize / 2, width - thumbSize));
  thumb.y = 0;
  thumb.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  thumb.strokes = [{ type: "SOLID", color: colors.separator.rgb }];
  thumb.strokeWeight = 0.5;
  thumb.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.15 },
      offset: { x: 0, y: 1 },
      radius: 2,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    },
  ];
  slider.appendChild(thumb);

  return slider;
}

export interface TableViewColumn {
  header: string;
  width?: number;
}

export interface TableViewOptions {
  columns?: TableViewColumn[];
  rows?: string[][];
  selectedRow?: number;
  width?: number;
  theme?: Theme;
}

export async function createMacOSTableView(
  options: TableViewOptions = {}
): Promise<FrameNode> {
  const {
    columns = [
      { header: "Name", width: 150 },
      { header: "Date Modified", width: 120 },
      { header: "Size", width: 80 },
      { header: "Kind", width: 100 },
    ],
    rows = [
      ["Documents", "Today, 10:30 AM", "--", "Folder"],
      ["Downloads", "Yesterday", "--", "Folder"],
      ["report.pdf", "Dec 15, 2024", "2.4 MB", "PDF"],
      ["photo.jpg", "Dec 14, 2024", "1.2 MB", "JPEG"],
      ["notes.txt", "Dec 13, 2024", "4 KB", "Text"],
    ],
    selectedRow = 2,
    width = 500,
    theme = "light",
  } = options;

  const colors = getMacOSColors(theme);
  const rowHeight = 22;
  const headerHeight = 20;

  const tableView = figma.createFrame();
  tableView.name = "macOS TableView";
  tableView.layoutMode = "VERTICAL";
  tableView.primaryAxisSizingMode = "AUTO";
  tableView.counterAxisSizingMode = "FIXED";
  tableView.resize(width, 200);
  tableView.cornerRadius = 6;
  tableView.fills = [{ type: "SOLID", color: colors.systemBackground.rgb }];
  tableView.strokes = [{ type: "SOLID", color: colors.separator.rgb }];
  tableView.strokeWeight = 0.5;
  tableView.clipsContent = true;

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  // Calculate column widths
  const specifiedWidth = columns.reduce((sum, col) => sum + (col.width || 0), 0);
  const unspecifiedCols = columns.filter(col => !col.width).length;
  const remainingWidth = Math.max(0, width - specifiedWidth);
  const defaultColWidth = unspecifiedCols > 0 ? remainingWidth / unspecifiedCols : 100;

  // Header row
  const header = figma.createFrame();
  header.name = "Header";
  header.layoutMode = "HORIZONTAL";
  header.primaryAxisSizingMode = "FIXED";
  header.counterAxisSizingMode = "FIXED";
  header.resize(width, headerHeight);
  header.fills = [
    {
      type: "SOLID",
      color: theme === "light"
        ? { r: 0.96, g: 0.96, b: 0.96 }
        : colors.secondarySystemBackground.rgb,
    },
  ];
  header.strokes = [{ type: "SOLID", color: colors.separator.rgb }];
  header.strokeWeight = 0.5;
  header.strokeBottomWeight = 0.5;
  header.strokeTopWeight = 0;
  header.strokeLeftWeight = 0;
  header.strokeRightWeight = 0;

  for (const col of columns) {
    const colWidth = col.width || defaultColWidth;

    const headerCell = figma.createFrame();
    headerCell.name = `Header-${col.header}`;
    headerCell.layoutMode = "HORIZONTAL";
    headerCell.primaryAxisSizingMode = "FIXED";
    headerCell.counterAxisSizingMode = "AUTO";
    headerCell.resize(colWidth, headerHeight);
    headerCell.paddingLeft = 8;
    headerCell.paddingRight = 8;
    headerCell.counterAxisAlignItems = "CENTER";
    headerCell.fills = [];

    const headerText = figma.createText();
    headerText.fontName = { family: "Inter", style: "Medium" };
    headerText.characters = col.header;
    headerText.fontSize = 11;
    headerText.fills = [{ type: "SOLID", color: colors.secondaryLabel.rgb }];
    headerCell.appendChild(headerText);

    header.appendChild(headerCell);
  }

  tableView.appendChild(header);
  header.layoutSizingHorizontal = "FILL";

  // Data rows
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const rowData = rows[rowIndex];
    const isSelected = rowIndex === selectedRow;

    const row = figma.createFrame();
    row.name = `Row-${rowIndex}`;
    row.layoutMode = "HORIZONTAL";
    row.primaryAxisSizingMode = "FIXED";
    row.counterAxisSizingMode = "FIXED";
    row.resize(width, rowHeight);
    row.fills = isSelected
      ? [{ type: "SOLID", color: colors.systemBlue.rgb }]
      : rowIndex % 2 === 1
        ? [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.98 } }]
        : [];

    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const col = columns[colIndex];
      const colWidth = col.width || defaultColWidth;
      const cellData = rowData[colIndex] || "";

      const cell = figma.createFrame();
      cell.name = `Cell-${rowIndex}-${colIndex}`;
      cell.layoutMode = "HORIZONTAL";
      cell.primaryAxisSizingMode = "FIXED";
      cell.counterAxisSizingMode = "AUTO";
      cell.resize(colWidth, rowHeight);
      cell.paddingLeft = 8;
      cell.paddingRight = 8;
      cell.counterAxisAlignItems = "CENTER";
      cell.fills = [];

      const cellText = figma.createText();
      cellText.fontName = { family: "Inter", style: "Regular" };
      cellText.characters = cellData;
      cellText.fontSize = 12;
      cellText.fills = [
        {
          type: "SOLID",
          color: isSelected ? { r: 1, g: 1, b: 1 } : colors.label.rgb,
        },
      ];
      cell.appendChild(cellText);

      row.appendChild(cell);
    }

    tableView.appendChild(row);
    row.layoutSizingHorizontal = "FILL";
  }

  return tableView;
}
