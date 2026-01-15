/**
 * shadcn Table Component
 * A responsive table with headers and rows
 */

import {
  getShadcnColors,
  Theme,
} from "../../tokens";

export interface TableColumn {
  header: string;
  accessor: string;
  width?: number;
  align?: "left" | "center" | "right";
}

export interface TableOptions {
  columns?: TableColumn[];
  data?: Record<string, string>[];
  width?: number;
  striped?: boolean;
  bordered?: boolean;
  theme?: Theme;
}

export async function createShadcnTable(
  options: TableOptions = {}
): Promise<FrameNode> {
  const {
    columns = [
      { header: "Invoice", accessor: "invoice", width: 100 },
      { header: "Status", accessor: "status", width: 100 },
      { header: "Method", accessor: "method", width: 120 },
      { header: "Amount", accessor: "amount", width: 100, align: "right" },
    ],
    data = [
      { invoice: "INV001", status: "Paid", method: "Credit Card", amount: "$250.00" },
      { invoice: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
      { invoice: "INV003", status: "Unpaid", method: "Bank Transfer", amount: "$350.00" },
      { invoice: "INV004", status: "Paid", method: "Credit Card", amount: "$450.00" },
    ],
    width = 500,
    striped = true,
    bordered = true,
    theme = "light",
  } = options;

  const colors = getShadcnColors(theme);

  // Calculate column widths
  const totalSpecifiedWidth = columns.reduce((sum, col) => sum + (col.width || 0), 0);
  const unspecifiedCols = columns.filter(col => !col.width).length;
  const remainingWidth = Math.max(0, width - totalSpecifiedWidth);
  const defaultColWidth = unspecifiedCols > 0 ? remainingWidth / unspecifiedCols : 100;

  // Create table container
  const table = figma.createFrame();
  table.name = "Table";
  table.layoutMode = "VERTICAL";
  table.primaryAxisSizingMode = "AUTO";
  table.counterAxisSizingMode = "FIXED";
  table.resize(width, 200);
  table.cornerRadius = 8;
  table.fills = [{ type: "SOLID", color: colors.card.rgb }];
  if (bordered) {
    table.strokes = [{ type: "SOLID", color: colors.border.rgb }];
    table.strokeWeight = 1;
  }
  table.clipsContent = true;

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  // Create header row
  const headerRow = figma.createFrame();
  headerRow.name = "TableHeader";
  headerRow.layoutMode = "HORIZONTAL";
  headerRow.layoutSizingHorizontal = "FILL";
  headerRow.layoutSizingVertical = "HUG";
  headerRow.fills = [{ type: "SOLID", color: colors.muted.rgb }];

  for (const col of columns) {
    const headerCell = figma.createFrame();
    headerCell.name = `Header-${col.header}`;
    headerCell.layoutMode = "HORIZONTAL";
    headerCell.primaryAxisSizingMode = "FIXED";
    headerCell.counterAxisSizingMode = "AUTO";
    headerCell.resize(col.width || defaultColWidth, 40);
    headerCell.paddingLeft = 16;
    headerCell.paddingRight = 16;
    headerCell.paddingTop = 12;
    headerCell.paddingBottom = 12;
    headerCell.primaryAxisAlignItems = col.align === "right" ? "MAX" : col.align === "center" ? "CENTER" : "MIN";
    headerCell.counterAxisAlignItems = "CENTER";
    headerCell.fills = [];

    const headerText = figma.createText();
    headerText.fontName = { family: "Inter", style: "Medium" };
    headerText.characters = col.header;
    headerText.fontSize = 14;
    headerText.fills = [{ type: "SOLID", color: colors.mutedForeground.rgb }];
    headerCell.appendChild(headerText);

    headerRow.appendChild(headerCell);
  }

  table.appendChild(headerRow);
  headerRow.layoutSizingHorizontal = "FILL";

  // Create data rows
  for (let i = 0; i < data.length; i++) {
    const rowData = data[i];
    const isEven = i % 2 === 0;

    const dataRow = figma.createFrame();
    dataRow.name = `TableRow-${i}`;
    dataRow.layoutMode = "HORIZONTAL";
    dataRow.layoutSizingHorizontal = "FILL";
    dataRow.layoutSizingVertical = "HUG";

    if (striped && !isEven) {
      dataRow.fills = [{ type: "SOLID", color: colors.muted.rgb, opacity: 0.5 }];
    } else {
      dataRow.fills = [];
    }

    // Add bottom border except for last row
    if (bordered && i < data.length - 1) {
      dataRow.strokes = [{ type: "SOLID", color: colors.border.rgb }];
      dataRow.strokeWeight = 1;
      dataRow.strokeBottomWeight = 1;
      dataRow.strokeTopWeight = 0;
      dataRow.strokeLeftWeight = 0;
      dataRow.strokeRightWeight = 0;
    }

    for (const col of columns) {
      const cell = figma.createFrame();
      cell.name = `Cell-${col.accessor}`;
      cell.layoutMode = "HORIZONTAL";
      cell.primaryAxisSizingMode = "FIXED";
      cell.counterAxisSizingMode = "AUTO";
      cell.resize(col.width || defaultColWidth, 48);
      cell.paddingLeft = 16;
      cell.paddingRight = 16;
      cell.paddingTop = 16;
      cell.paddingBottom = 16;
      cell.primaryAxisAlignItems = col.align === "right" ? "MAX" : col.align === "center" ? "CENTER" : "MIN";
      cell.counterAxisAlignItems = "CENTER";
      cell.fills = [];

      const cellText = figma.createText();
      cellText.fontName = { family: "Inter", style: "Regular" };
      cellText.characters = rowData[col.accessor] || "";
      cellText.fontSize = 14;

      // Special styling for status column
      if (col.accessor === "status") {
        const status = rowData[col.accessor]?.toLowerCase();
        if (status === "paid") {
          cellText.fills = [{ type: "SOLID", color: { r: 0.13, g: 0.55, b: 0.13 } }];
        } else if (status === "pending") {
          cellText.fills = [{ type: "SOLID", color: { r: 0.85, g: 0.65, b: 0.13 } }];
        } else if (status === "unpaid") {
          cellText.fills = [{ type: "SOLID", color: colors.destructive.rgb }];
        } else {
          cellText.fills = [{ type: "SOLID", color: colors.foreground.rgb }];
        }
      } else {
        cellText.fills = [{ type: "SOLID", color: colors.foreground.rgb }];
      }

      cell.appendChild(cellText);
      dataRow.appendChild(cell);
    }

    table.appendChild(dataRow);
    dataRow.layoutSizingHorizontal = "FILL";
  }

  return table;
}

export interface DataTableOptions extends TableOptions {
  hasCheckbox?: boolean;
  hasActions?: boolean;
  hasSearch?: boolean;
  hasPagination?: boolean;
}

export async function createShadcnDataTable(
  options: DataTableOptions = {}
): Promise<FrameNode> {
  const {
    hasSearch = true,
    hasPagination = true,
    theme = "light",
    ...tableOptions
  } = options;

  const colors = getShadcnColors(theme);

  const container = figma.createFrame();
  container.name = "DataTable";
  container.layoutMode = "VERTICAL";
  container.primaryAxisSizingMode = "AUTO";
  container.counterAxisSizingMode = "AUTO";
  container.itemSpacing = 16;
  container.fills = [];

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  // Search bar
  if (hasSearch) {
    const searchBar = figma.createFrame();
    searchBar.name = "SearchBar";
    searchBar.layoutMode = "HORIZONTAL";
    searchBar.primaryAxisSizingMode = "FIXED";
    searchBar.counterAxisSizingMode = "FIXED";
    searchBar.resize(300, 40);
    searchBar.paddingLeft = 12;
    searchBar.paddingRight = 12;
    searchBar.counterAxisAlignItems = "CENTER";
    searchBar.itemSpacing = 8;
    searchBar.cornerRadius = 6;
    searchBar.fills = [{ type: "SOLID", color: colors.background.rgb }];
    searchBar.strokes = [{ type: "SOLID", color: colors.input.rgb }];
    searchBar.strokeWeight = 1;

    const searchIcon = figma.createText();
    searchIcon.fontName = { family: "Inter", style: "Regular" };
    searchIcon.characters = "🔍";
    searchIcon.fontSize = 14;
    searchIcon.fills = [{ type: "SOLID", color: colors.mutedForeground.rgb }];
    searchBar.appendChild(searchIcon);

    const searchPlaceholder = figma.createText();
    searchPlaceholder.fontName = { family: "Inter", style: "Regular" };
    searchPlaceholder.characters = "Filter emails...";
    searchPlaceholder.fontSize = 14;
    searchPlaceholder.fills = [{ type: "SOLID", color: colors.mutedForeground.rgb }];
    searchBar.appendChild(searchPlaceholder);

    container.appendChild(searchBar);
  }

  // Table
  const table = await createShadcnTable({ ...tableOptions, theme });
  container.appendChild(table);

  // Pagination
  if (hasPagination) {
    const pagination = figma.createFrame();
    pagination.name = "Pagination";
    pagination.layoutMode = "HORIZONTAL";
    pagination.primaryAxisSizingMode = "AUTO";
    pagination.counterAxisSizingMode = "AUTO";
    pagination.primaryAxisAlignItems = "SPACE_BETWEEN";
    pagination.counterAxisAlignItems = "CENTER";
    pagination.itemSpacing = 16;
    pagination.fills = [];

    const pageInfo = figma.createText();
    pageInfo.fontName = { family: "Inter", style: "Regular" };
    pageInfo.characters = "Page 1 of 10";
    pageInfo.fontSize = 14;
    pageInfo.fills = [{ type: "SOLID", color: colors.mutedForeground.rgb }];
    pagination.appendChild(pageInfo);

    const pageButtons = figma.createFrame();
    pageButtons.name = "PageButtons";
    pageButtons.layoutMode = "HORIZONTAL";
    pageButtons.primaryAxisSizingMode = "AUTO";
    pageButtons.counterAxisSizingMode = "AUTO";
    pageButtons.itemSpacing = 8;
    pageButtons.fills = [];

    const buttons = ["Previous", "Next"];
    for (const btnText of buttons) {
      const btn = figma.createFrame();
      btn.name = btnText;
      btn.layoutMode = "HORIZONTAL";
      btn.primaryAxisSizingMode = "AUTO";
      btn.counterAxisSizingMode = "AUTO";
      btn.paddingLeft = 12;
      btn.paddingRight = 12;
      btn.paddingTop = 8;
      btn.paddingBottom = 8;
      btn.cornerRadius = 6;
      btn.fills = [{ type: "SOLID", color: colors.secondary.rgb }];

      const btnLabel = figma.createText();
      btnLabel.fontName = { family: "Inter", style: "Regular" };
      btnLabel.characters = btnText;
      btnLabel.fontSize = 14;
      btnLabel.fills = [{ type: "SOLID", color: colors.secondaryForeground.rgb }];
      btn.appendChild(btnLabel);

      pageButtons.appendChild(btn);
    }

    pagination.appendChild(pageButtons);
    container.appendChild(pagination);
  }

  return container;
}
