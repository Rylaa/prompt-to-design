/**
 * Schema Validation Tests
 * Validates Zod schemas accept valid input and reject invalid input
 */

import { describe, it, expect } from "vitest";
import {
  CreateFrameInputSchema,
  CreateRectangleInputSchema,
  CreateTextInputSchema,
  ExportNodeInputSchema,
  ExportMultipleInputSchema,
  ValidateHierarchyInputSchema,
  SetAutoLayoutInputSchema,
  SetFillInputSchema,
  DeleteNodeInputSchema,
  CloneNodeInputSchema,
  MoveNodeInputSchema,
} from "./index.js";
import { ColorSchema, FillSchema, EffectSchema, AutoLayoutSchema } from "./base.js";

// ============================================================================
// Base Schema Tests
// ============================================================================

describe("ColorSchema", () => {
  it("accepts valid hex color", () => {
    expect(ColorSchema.parse("#FF0000")).toBe("#FF0000");
    expect(ColorSchema.parse("#abc")).toBe("#abc");
  });

  it("rejects invalid hex color", () => {
    expect(() => ColorSchema.parse("#GGG")).toThrow();
    expect(() => ColorSchema.parse("red")).toThrow();
    expect(() => ColorSchema.parse("#12345")).toThrow();
  });

  it("accepts valid RGB color", () => {
    const result = ColorSchema.parse({ r: 1, g: 0, b: 0.5 });
    expect(result).toEqual({ r: 1, g: 0, b: 0.5, a: 1 });
  });

  it("rejects out-of-range RGB values", () => {
    expect(() => ColorSchema.parse({ r: 2, g: 0, b: 0 })).toThrow();
    expect(() => ColorSchema.parse({ r: -1, g: 0, b: 0 })).toThrow();
  });
});

describe("FillSchema", () => {
  it("accepts solid fill", () => {
    const result = FillSchema.parse({ type: "SOLID", color: "#FF0000" });
    expect(result).toEqual({ type: "SOLID", color: "#FF0000" });
  });

  it("accepts gradient fill", () => {
    const result = FillSchema.parse({
      type: "GRADIENT",
      gradient: {
        type: "LINEAR",
        stops: [
          { position: 0, color: "#FF0000" },
          { position: 1, color: "#0000FF" },
        ],
      },
    });
    expect(result.type).toBe("GRADIENT");
  });

  it("rejects gradient with less than 2 stops", () => {
    expect(() =>
      FillSchema.parse({
        type: "GRADIENT",
        gradient: {
          type: "LINEAR",
          stops: [{ position: 0, color: "#FF0000" }],
        },
      })
    ).toThrow();
  });
});

describe("EffectSchema", () => {
  it("accepts drop shadow", () => {
    const result = EffectSchema.parse({ type: "DROP_SHADOW", blur: 8 });
    expect(result.type).toBe("DROP_SHADOW");
  });

  it("accepts blur effect", () => {
    const result = EffectSchema.parse({ type: "LAYER_BLUR", radius: 10 });
    expect(result).toEqual({ type: "LAYER_BLUR", radius: 10 });
  });

  it("rejects negative blur radius", () => {
    expect(() => EffectSchema.parse({ type: "LAYER_BLUR", radius: -5 })).toThrow();
  });
});

describe("AutoLayoutSchema", () => {
  it("accepts valid auto layout", () => {
    const result = AutoLayoutSchema.parse({ mode: "VERTICAL", spacing: 16 });
    expect(result.mode).toBe("VERTICAL");
    expect(result.spacing).toBe(16);
  });

  it("applies defaults", () => {
    const result = AutoLayoutSchema.parse({ mode: "HORIZONTAL" });
    expect(result.spacing).toBe(0);
    expect(result.paddingTop).toBe(0);
    expect(result.primaryAxisAlign).toBe("MIN");
  });
});

// ============================================================================
// Tool Input Schema Tests
// ============================================================================

describe("CreateFrameInputSchema", () => {
  it("accepts minimal input with defaults", () => {
    const result = CreateFrameInputSchema.parse({});
    expect(result.name).toBe("Frame");
    expect(result.width).toBe(400);
    expect(result.height).toBe(300);
  });

  it("accepts full input", () => {
    const result = CreateFrameInputSchema.parse({
      name: "Container",
      width: 800,
      height: 600,
      x: 100,
      y: 200,
      parentId: "1:23",
      cornerRadius: 8,
      fill: { type: "SOLID", color: "#FF0000" },
    });
    expect(result.name).toBe("Container");
    expect(result.parentId).toBe("1:23");
  });

  it("rejects zero width", () => {
    expect(() => CreateFrameInputSchema.parse({ width: 0 })).toThrow();
  });

  it("rejects unknown properties (strict mode)", () => {
    expect(() =>
      CreateFrameInputSchema.parse({ unknownProp: "test" })
    ).toThrow();
  });
});

describe("CreateRectangleInputSchema", () => {
  it("applies correct defaults", () => {
    const result = CreateRectangleInputSchema.parse({});
    expect(result.name).toBe("Rectangle");
    expect(result.width).toBe(100);
    expect(result.height).toBe(100);
  });
});

describe("CreateTextInputSchema", () => {
  it("accepts text with content", () => {
    const result = CreateTextInputSchema.parse({ content: "Hello" });
    expect(result.content).toBe("Hello");
  });
});

describe("DeleteNodeInputSchema", () => {
  it("requires nodeId", () => {
    expect(() => DeleteNodeInputSchema.parse({})).toThrow();
  });

  it("accepts valid nodeId", () => {
    const result = DeleteNodeInputSchema.parse({ nodeId: "1:23" });
    expect(result.nodeId).toBe("1:23");
  });
});

describe("CloneNodeInputSchema", () => {
  it("accepts nodeId with optional position", () => {
    const result = CloneNodeInputSchema.parse({ nodeId: "1:23", x: 100, y: 200 });
    expect(result.nodeId).toBe("1:23");
    expect(result.x).toBe(100);
  });
});

describe("MoveNodeInputSchema", () => {
  it("requires nodeId and newParentId", () => {
    expect(() => MoveNodeInputSchema.parse({ nodeId: "1:23" })).toThrow();
  });

  it("accepts valid input", () => {
    const result = MoveNodeInputSchema.parse({ nodeId: "1:23", newParentId: "2:34" });
    expect(result.newParentId).toBe("2:34");
  });
});

describe("SetAutoLayoutInputSchema", () => {
  it("requires nodeId and layout object", () => {
    const result = SetAutoLayoutInputSchema.parse({
      nodeId: "1:23",
      layout: { mode: "VERTICAL", spacing: 16 },
    });
    expect(result.layout.mode).toBe("VERTICAL");
    expect(result.layout.spacing).toBe(16);
  });
});

describe("SetFillInputSchema", () => {
  it("accepts nodeId with solid fill", () => {
    const result = SetFillInputSchema.parse({
      nodeId: "1:23",
      fill: { type: "SOLID", color: "#00FF00" },
    });
    expect(result.fill.type).toBe("SOLID");
  });
});

// ============================================================================
// Export Schema Tests
// ============================================================================

describe("ExportNodeInputSchema", () => {
  it("applies correct defaults", () => {
    const result = ExportNodeInputSchema.parse({ nodeId: "1:23" });
    expect(result.format).toBe("PNG");
    expect(result.scale).toBe(1);
    expect(result.contentsOnly).toBe(true);
  });

  it("accepts all formats", () => {
    for (const format of ["PNG", "JPG", "SVG", "PDF"] as const) {
      const result = ExportNodeInputSchema.parse({ nodeId: "1:23", format });
      expect(result.format).toBe(format);
    }
  });

  it("rejects invalid scale", () => {
    expect(() =>
      ExportNodeInputSchema.parse({ nodeId: "1:23", scale: 5 })
    ).toThrow();
    expect(() =>
      ExportNodeInputSchema.parse({ nodeId: "1:23", scale: 0 })
    ).toThrow();
  });
});

describe("ExportMultipleInputSchema", () => {
  it("requires at least one nodeId", () => {
    expect(() => ExportMultipleInputSchema.parse({ nodeIds: [] })).toThrow();
  });

  it("accepts array of nodeIds", () => {
    const result = ExportMultipleInputSchema.parse({
      nodeIds: ["1:23", "2:34"],
    });
    expect(result.nodeIds).toHaveLength(2);
  });
});

// ============================================================================
// Hierarchy Validation Schema Tests
// ============================================================================

describe("ValidateHierarchyInputSchema", () => {
  it("applies default rules", () => {
    const result = ValidateHierarchyInputSchema.parse({ nodeId: "1:23" });
    expect(result.rules).toContain("MAX_NESTING_DEPTH");
    expect(result.rules).toContain("NO_EMPTY_CONTAINERS");
    expect(result.maxDepth).toBe(10);
  });

  it("accepts custom rules", () => {
    const result = ValidateHierarchyInputSchema.parse({
      nodeId: "1:23",
      rules: ["NO_EMPTY_CONTAINERS"],
      maxDepth: 5,
    });
    expect(result.rules).toHaveLength(1);
    expect(result.maxDepth).toBe(5);
  });

  it("rejects maxDepth > 20", () => {
    expect(() =>
      ValidateHierarchyInputSchema.parse({ nodeId: "1:23", maxDepth: 25 })
    ).toThrow();
  });
});
