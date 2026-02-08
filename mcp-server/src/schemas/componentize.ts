// mcp-server/src/schemas/componentize.ts
import { z } from "zod";

export const ComponentizeScreenInputSchema = z.object({
  screenFrameId: z.string().describe("ID of the screen frame to componentize"),
  autoDetect: z.boolean().optional().default(true).describe("Auto-detect buttons, cards, cells"),
  createVariants: z.boolean().optional().default(false).describe("Generate state/size variants"),
  variantTypes: z.array(z.enum(["STATE", "SIZE", "THEME"])).optional().default(["STATE"]),
});

export type ComponentizeScreenInput = z.infer<typeof ComponentizeScreenInputSchema>;
