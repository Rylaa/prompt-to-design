// figma-plugin/src/handlers/editor.ts
/**
 * Editor Handlers Module
 *
 * Handles editor-level operations including:
 * - Getting editor type (figma vs figjam)
 * - Getting current mode (design vs dev)
 */

// ============================================================================
// GetEditorType Handler
// ============================================================================

/**
 * Gets the current editor type.
 * @returns Editor type: "figma" for Figma files, "figjam" for FigJam files
 */
export async function handleGetEditorType(): Promise<{ editorType: string }> {
  return { editorType: figma.editorType };
}

// ============================================================================
// GetMode Handler
// ============================================================================

/**
 * Gets the current Figma mode.
 * @returns Mode: "design" or "dev" (Dev Mode)
 */
export async function handleGetMode(): Promise<{ mode: string }> {
  return { mode: figma.mode };
}
