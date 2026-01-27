// figma-plugin/src/handlers/pages.ts
/**
 * Pages Handlers Module
 *
 * Handles page management operations including:
 * - Getting current page info
 * - Switching between pages
 * - Creating new pages
 * - Listing all pages
 */

// ============================================================================
// Types
// ============================================================================

interface PageInfo {
  id: string;
  name: string;
}

// ============================================================================
// GetCurrentPage Handler
// ============================================================================

/**
 * Gets the current page information.
 * @returns Current page ID and name
 */
export async function handleGetCurrentPage(): Promise<{ page: PageInfo }> {
  return {
    page: {
      id: figma.currentPage.id,
      name: figma.currentPage.name,
    },
  };
}

// ============================================================================
// SetCurrentPage Handler
// ============================================================================

/**
 * Switches to a different page by ID.
 * @param params - Object containing pageId
 * @returns Success confirmation
 */
export async function handleSetCurrentPage(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const pageId = params.pageId as string;

  const page = figma.root.children.find(p => p.id === pageId);
  if (!page) {
    throw new Error(`Page not found: ${pageId}`);
  }

  figma.currentPage = page;

  return { success: true };
}

// ============================================================================
// CreatePage Handler
// ============================================================================

/**
 * Creates a new page in the document.
 * @param params - Object containing optional name
 * @returns Page ID of the created page
 */
export async function handleCreatePage(
  params: Record<string, unknown>
): Promise<{ pageId: string }> {
  const name = (params.name as string) || "New Page";

  const page = figma.createPage();
  page.name = name;

  return { pageId: page.id };
}

// ============================================================================
// GetAllPages Handler
// ============================================================================

/**
 * Gets all pages in the document.
 * @returns Array of page objects with ID and name
 */
export async function handleGetAllPages(): Promise<{ pages: PageInfo[] }> {
  const pages = figma.root.children.map(p => ({
    id: p.id,
    name: p.name,
  }));

  return { pages };
}
