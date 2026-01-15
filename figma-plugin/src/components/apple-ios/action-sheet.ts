/**
 * Apple iOS Action Sheet Component
 * Modal bottom sheet with actions
 */

import {
  getIOSColors,
  iosSpacing,
  Theme,
} from "../../tokens";

export interface ActionSheetAction {
  title: string;
  style?: "default" | "destructive" | "cancel";
}

export interface ActionSheetOptions {
  title?: string;
  message?: string;
  actions?: ActionSheetAction[];
  width?: number;
  theme?: Theme;
}

export async function createIOSActionSheet(
  options: ActionSheetOptions = {}
): Promise<FrameNode> {
  const {
    title,
    message,
    actions = [
      { title: "Share", style: "default" },
      { title: "Add to Favorites", style: "default" },
      { title: "Delete", style: "destructive" },
      { title: "Cancel", style: "cancel" },
    ],
    width = 358,
    theme = "light",
  } = options;

  const colors = getIOSColors(theme);

  const sheet = figma.createFrame();
  sheet.name = "iOS ActionSheet";
  sheet.layoutMode = "VERTICAL";
  sheet.primaryAxisSizingMode = "AUTO";
  sheet.counterAxisSizingMode = "FIXED";
  sheet.resize(width, 200);
  sheet.itemSpacing = 8;
  sheet.fills = [];

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  // Main actions container
  const mainContainer = figma.createFrame();
  mainContainer.name = "MainActions";
  mainContainer.layoutMode = "VERTICAL";
  mainContainer.primaryAxisSizingMode = "AUTO";
  mainContainer.counterAxisSizingMode = "FIXED";
  mainContainer.resize(width, 100);
  mainContainer.cornerRadius = 14;
  mainContainer.fills = [
    {
      type: "SOLID",
      color: theme === "light"
        ? { r: 0.95, g: 0.95, b: 0.97 }
        : colors.secondarySystemBackground.rgb,
      opacity: 0.95,
    },
  ];
  mainContainer.clipsContent = true;

  // Header (title + message)
  if (title || message) {
    const header = figma.createFrame();
    header.name = "Header";
    header.layoutMode = "VERTICAL";
    header.primaryAxisSizingMode = "AUTO";
    header.counterAxisSizingMode = "FIXED";
    header.resize(width, 50);
    header.paddingTop = 16;
    header.paddingBottom = 16;
    header.paddingLeft = 16;
    header.paddingRight = 16;
    header.itemSpacing = 4;
    header.counterAxisAlignItems = "CENTER";
    header.fills = [];

    if (title) {
      const titleText = figma.createText();
      titleText.fontName = { family: "Inter", style: "Medium" };
      titleText.characters = title;
      titleText.fontSize = 13;
      titleText.fills = [{ type: "SOLID", color: colors.secondaryLabel.rgb }];
      titleText.textAlignHorizontal = "CENTER";
      header.appendChild(titleText);
    }

    if (message) {
      const messageText = figma.createText();
      messageText.fontName = { family: "Inter", style: "Regular" };
      messageText.characters = message;
      messageText.fontSize = 13;
      messageText.fills = [{ type: "SOLID", color: colors.secondaryLabel.rgb }];
      messageText.textAlignHorizontal = "CENTER";
      messageText.textAutoResize = "HEIGHT";
      messageText.resize(width - 32, messageText.height);
      header.appendChild(messageText);
    }

    mainContainer.appendChild(header);
    header.layoutSizingHorizontal = "FILL";

    // Separator after header
    const sep = figma.createFrame();
    sep.name = "Separator";
    sep.resize(width, 0.5);
    sep.fills = [{ type: "SOLID", color: colors.separator.rgb }];
    mainContainer.appendChild(sep);
  }

  // Actions (except cancel)
  const nonCancelActions = actions.filter(a => a.style !== "cancel");
  const cancelAction = actions.find(a => a.style === "cancel");

  for (let i = 0; i < nonCancelActions.length; i++) {
    const action = nonCancelActions[i];

    const actionBtn = figma.createFrame();
    actionBtn.name = `Action-${action.title}`;
    actionBtn.layoutMode = "HORIZONTAL";
    actionBtn.primaryAxisSizingMode = "FIXED";
    actionBtn.counterAxisSizingMode = "FIXED";
    actionBtn.resize(width, 57);
    actionBtn.primaryAxisAlignItems = "CENTER";
    actionBtn.counterAxisAlignItems = "CENTER";
    actionBtn.fills = [];

    const actionText = figma.createText();
    actionText.fontName = { family: "Inter", style: "Regular" };
    actionText.characters = action.title;
    actionText.fontSize = 20;

    if (action.style === "destructive") {
      actionText.fills = [{ type: "SOLID", color: colors.systemRed.rgb }];
    } else {
      actionText.fills = [{ type: "SOLID", color: colors.systemBlue.rgb }];
    }

    actionBtn.appendChild(actionText);
    mainContainer.appendChild(actionBtn);
    actionBtn.layoutSizingHorizontal = "FILL";

    // Add separator between actions
    if (i < nonCancelActions.length - 1) {
      const sep = figma.createFrame();
      sep.name = "Separator";
      sep.resize(width, 0.5);
      sep.fills = [{ type: "SOLID", color: colors.separator.rgb }];
      mainContainer.appendChild(sep);
    }
  }

  sheet.appendChild(mainContainer);
  mainContainer.layoutSizingHorizontal = "FILL";

  // Cancel button (separate)
  if (cancelAction) {
    const cancelBtn = figma.createFrame();
    cancelBtn.name = "CancelButton";
    cancelBtn.layoutMode = "HORIZONTAL";
    cancelBtn.primaryAxisSizingMode = "FIXED";
    cancelBtn.counterAxisSizingMode = "FIXED";
    cancelBtn.resize(width, 57);
    cancelBtn.primaryAxisAlignItems = "CENTER";
    cancelBtn.counterAxisAlignItems = "CENTER";
    cancelBtn.cornerRadius = 14;
    cancelBtn.fills = [
      {
        type: "SOLID",
        color: colors.systemBackground.rgb,
        opacity: 0.95,
      },
    ];

    const cancelText = figma.createText();
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
      cancelText.fontName = { family: "Inter", style: "Semi Bold" };
    } catch (e) {
      cancelText.fontName = { family: "Inter", style: "Medium" };
    }
    cancelText.characters = cancelAction.title;
    cancelText.fontSize = 20;
    cancelText.fills = [{ type: "SOLID", color: colors.systemBlue.rgb }];

    cancelBtn.appendChild(cancelText);
    sheet.appendChild(cancelBtn);
    cancelBtn.layoutSizingHorizontal = "FILL";
  }

  return sheet;
}

export interface AlertDialogOptions {
  title?: string;
  message?: string;
  buttons?: { title: string; style?: "default" | "cancel" | "destructive" }[];
  style?: "alert" | "actionSheet";
  width?: number;
  theme?: Theme;
}

export async function createIOSAlert(
  options: AlertDialogOptions = {}
): Promise<FrameNode> {
  const {
    title = "Alert Title",
    message = "This is an alert message that provides important information to the user.",
    buttons = [
      { title: "Cancel", style: "cancel" },
      { title: "OK", style: "default" },
    ],
    width = 270,
    theme = "light",
  } = options;

  const colors = getIOSColors(theme);

  const alert = figma.createFrame();
  alert.name = "iOS Alert";
  alert.layoutMode = "VERTICAL";
  alert.primaryAxisSizingMode = "AUTO";
  alert.counterAxisSizingMode = "FIXED";
  alert.resize(width, 150);
  alert.cornerRadius = 14;
  alert.fills = [
    {
      type: "SOLID",
      color: theme === "light"
        ? { r: 0.97, g: 0.97, b: 0.98 }
        : colors.secondarySystemBackground.rgb,
      opacity: 0.95,
    },
  ];
  alert.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.2 },
      offset: { x: 0, y: 4 },
      radius: 24,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    },
  ];
  alert.clipsContent = true;

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  // Content
  const content = figma.createFrame();
  content.name = "Content";
  content.layoutMode = "VERTICAL";
  content.primaryAxisSizingMode = "AUTO";
  content.counterAxisSizingMode = "FIXED";
  content.resize(width, 50);
  content.paddingTop = 20;
  content.paddingBottom = 20;
  content.paddingLeft = 16;
  content.paddingRight = 16;
  content.itemSpacing = 4;
  content.counterAxisAlignItems = "CENTER";
  content.fills = [];

  // Title
  const titleText = figma.createText();
  try {
    await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
    titleText.fontName = { family: "Inter", style: "Semi Bold" };
  } catch (e) {
    titleText.fontName = { family: "Inter", style: "Medium" };
  }
  titleText.characters = title;
  titleText.fontSize = 17;
  titleText.fills = [{ type: "SOLID", color: colors.label.rgb }];
  titleText.textAlignHorizontal = "CENTER";
  content.appendChild(titleText);

  // Message
  if (message) {
    const messageText = figma.createText();
    messageText.fontName = { family: "Inter", style: "Regular" };
    messageText.characters = message;
    messageText.fontSize = 13;
    messageText.fills = [{ type: "SOLID", color: colors.label.rgb }];
    messageText.textAlignHorizontal = "CENTER";
    messageText.textAutoResize = "HEIGHT";
    messageText.resize(width - 32, messageText.height);
    content.appendChild(messageText);
  }

  alert.appendChild(content);
  content.layoutSizingHorizontal = "FILL";

  // Separator
  const sep = figma.createFrame();
  sep.name = "Separator";
  sep.resize(width, 0.5);
  sep.fills = [{ type: "SOLID", color: colors.separator.rgb }];
  alert.appendChild(sep);

  // Buttons
  const buttonsContainer = figma.createFrame();
  buttonsContainer.name = "Buttons";
  buttonsContainer.layoutMode = buttons.length <= 2 ? "HORIZONTAL" : "VERTICAL";
  buttonsContainer.primaryAxisSizingMode = "AUTO";
  buttonsContainer.counterAxisSizingMode = "FIXED";
  buttonsContainer.resize(width, 44);
  buttonsContainer.fills = [];

  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];

    const button = figma.createFrame();
    button.name = `Button-${btn.title}`;
    button.layoutMode = "HORIZONTAL";
    button.primaryAxisSizingMode = "FIXED";
    button.counterAxisSizingMode = "FIXED";
    button.resize(buttons.length <= 2 ? width / buttons.length : width, 44);
    button.primaryAxisAlignItems = "CENTER";
    button.counterAxisAlignItems = "CENTER";
    button.fills = [];

    const buttonText = figma.createText();
    if (btn.style === "cancel") {
      try {
        await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
        buttonText.fontName = { family: "Inter", style: "Semi Bold" };
      } catch (e) {
        buttonText.fontName = { family: "Inter", style: "Medium" };
      }
    } else {
      buttonText.fontName = { family: "Inter", style: "Regular" };
    }
    buttonText.characters = btn.title;
    buttonText.fontSize = 17;

    if (btn.style === "destructive") {
      buttonText.fills = [{ type: "SOLID", color: colors.systemRed.rgb }];
    } else {
      buttonText.fills = [{ type: "SOLID", color: colors.systemBlue.rgb }];
    }

    button.appendChild(buttonText);
    buttonsContainer.appendChild(button);

    if (buttons.length <= 2) {
      button.layoutSizingHorizontal = "FILL";
    } else {
      button.layoutSizingHorizontal = "FILL";
    }

    // Add vertical separator between horizontal buttons
    if (buttons.length <= 2 && i < buttons.length - 1) {
      const vSep = figma.createFrame();
      vSep.name = "VSeparator";
      vSep.resize(0.5, 44);
      vSep.fills = [{ type: "SOLID", color: colors.separator.rgb }];
      buttonsContainer.appendChild(vSep);
    }

    // Add horizontal separator between vertical buttons
    if (buttons.length > 2 && i < buttons.length - 1) {
      const hSep = figma.createFrame();
      hSep.name = "HSeparator";
      hSep.resize(width, 0.5);
      hSep.fills = [{ type: "SOLID", color: colors.separator.rgb }];
      buttonsContainer.appendChild(hSep);
    }
  }

  alert.appendChild(buttonsContainer);
  buttonsContainer.layoutSizingHorizontal = "FILL";

  return alert;
}
