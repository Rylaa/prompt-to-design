/**
 * Tool Registration Index
 * Registers all tool modules with the MCP server
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Import all tool registration functions
import { registerShapeTools } from "./shapes.js";
import { registerTextTools } from "./text.js";
import { registerComponentTools } from "./components.js";
import { registerDesignSystemTools } from "./design-system.js";
import { registerIconTools } from "./icons.js";
import { registerLayoutTools } from "./layout.js";
import { registerStylingTools } from "./styling.js";
import { registerManipulationTools } from "./manipulation.js";
import { registerQueryTools } from "./query.js";
import { registerComponentLibraryTools } from "./component-library.js";
import { registerStylesVariablesTools } from "./styles-variables.js";
import { registerExportTools } from "./export.js";
import { registerTransformTools } from "./transform.js";
import { registerMaskTools } from "./masks.js";
import { registerBooleanTools } from "./boolean.js";
import { registerPluginDataTools } from "./plugin-data.js";
import { registerPrototypeTools } from "./prototype.js";
import { registerFigjamTools } from "./figjam.js";
import { registerAnnotationTools } from "./annotations.js";
import { registerStorageTools } from "./storage.js";
import { registerMediaTools } from "./media.js";
import { registerViewportTools } from "./viewport.js";
import { registerPageTools } from "./pages.js";
import { registerThemeTools } from "./theme.js";
import { registerConnectionTools } from "./connection.js";
import { registerSessionTools } from "./session.js";

/**
 * Register all Figma tools with the MCP server
 */
export function registerAllTools(server: McpServer): void {
  // Core shape creation
  registerShapeTools(server);
  registerTextTools(server);

  // UI Components
  registerComponentTools(server);
  registerDesignSystemTools(server);
  registerIconTools(server);

  // Layout & Styling
  registerLayoutTools(server);
  registerStylingTools(server);
  registerTransformTools(server);

  // Node operations
  registerManipulationTools(server);
  registerQueryTools(server);
  registerMaskTools(server);
  registerBooleanTools(server);

  // Component system
  registerComponentLibraryTools(server);
  registerStylesVariablesTools(server);

  // Export
  registerExportTools(server);

  // Data storage
  registerPluginDataTools(server);
  registerStorageTools(server);

  // Prototyping
  registerPrototypeTools(server);

  // FigJam specific
  registerFigjamTools(server);

  // Dev Mode
  registerAnnotationTools(server);

  // Media
  registerMediaTools(server);

  // Navigation
  registerViewportTools(server);
  registerPageTools(server);

  // Configuration
  registerThemeTools(server);
  registerConnectionTools(server);

  // Session Management
  registerSessionTools(server);
}
