import { describe, it, expect } from 'vitest';
import {
  ColorSchema,
  HexColorSchema,
  RGBColorSchema,
  FillSchema,
  EffectSchema,
  ShadowSchema,
  BlurSchema,
  GradientStopSchema,
  AutoLayoutSchema,
  StrokeSchema,
} from './base.js';

// ============================================================================
// ColorSchema Tests
// ============================================================================

describe('HexColorSchema', () => {
  it('should accept valid 6-digit hex colors', () => {
    expect(HexColorSchema.parse('#FF0000')).toBe('#FF0000');
    expect(HexColorSchema.parse('#00ff00')).toBe('#00ff00');
    expect(HexColorSchema.parse('#0000FF')).toBe('#0000FF');
  });

  it('should accept valid 3-digit hex colors', () => {
    expect(HexColorSchema.parse('#F00')).toBe('#F00');
    expect(HexColorSchema.parse('#abc')).toBe('#abc');
  });

  it('should reject invalid hex colors', () => {
    expect(() => HexColorSchema.parse('FF0000')).toThrow(); // missing #
    expect(() => HexColorSchema.parse('#GG0000')).toThrow(); // invalid chars
    expect(() => HexColorSchema.parse('#FF00')).toThrow(); // 4 digits
    expect(() => HexColorSchema.parse('#FF00000')).toThrow(); // 7 digits
    expect(() => HexColorSchema.parse('')).toThrow(); // empty
  });
});

describe('RGBColorSchema', () => {
  it('should accept valid RGB values (0-1 range)', () => {
    const result = RGBColorSchema.parse({ r: 0.5, g: 0.3, b: 0.8 });
    expect(result.r).toBe(0.5);
    expect(result.g).toBe(0.3);
    expect(result.b).toBe(0.8);
    expect(result.a).toBe(1); // default alpha
  });

  it('should accept alpha channel', () => {
    const result = RGBColorSchema.parse({ r: 1, g: 0, b: 0, a: 0.5 });
    expect(result.a).toBe(0.5);
  });

  it('should accept boundary values', () => {
    expect(() => RGBColorSchema.parse({ r: 0, g: 0, b: 0 })).not.toThrow();
    expect(() => RGBColorSchema.parse({ r: 1, g: 1, b: 1 })).not.toThrow();
  });

  it('should reject out-of-range RGB values', () => {
    expect(() => RGBColorSchema.parse({ r: 1.5, g: 0, b: 0 })).toThrow();
    expect(() => RGBColorSchema.parse({ r: -0.1, g: 0, b: 0 })).toThrow();
    expect(() => RGBColorSchema.parse({ r: 0, g: 255, b: 0 })).toThrow();
  });
});

describe('ColorSchema', () => {
  it('should accept hex color string', () => {
    expect(ColorSchema.parse('#FF0000')).toBe('#FF0000');
  });

  it('should accept RGB color object', () => {
    const result = ColorSchema.parse({ r: 1, g: 0, b: 0 });
    expect(result).toEqual({ r: 1, g: 0, b: 0, a: 1 });
  });

  it('should reject invalid types', () => {
    expect(() => ColorSchema.parse(123)).toThrow();
    expect(() => ColorSchema.parse('red')).toThrow();
  });
});

// ============================================================================
// FillSchema Tests
// ============================================================================

describe('FillSchema', () => {
  it('should accept solid fill with hex color', () => {
    const result = FillSchema.parse({ type: 'SOLID', color: '#FF0000' });
    expect(result).toEqual({ type: 'SOLID', color: '#FF0000' });
  });

  it('should accept solid fill with RGB color', () => {
    const result = FillSchema.parse({
      type: 'SOLID',
      color: { r: 1, g: 0, b: 0 },
    });
    expect(result.type).toBe('SOLID');
  });

  it('should accept solid fill with opacity', () => {
    const result = FillSchema.parse({
      type: 'SOLID',
      color: '#FF0000',
      opacity: 0.5,
    });
    expect(result).toEqual({ type: 'SOLID', color: '#FF0000', opacity: 0.5 });
  });

  it('should accept gradient fill', () => {
    const result = FillSchema.parse({
      type: 'GRADIENT',
      gradient: {
        type: 'LINEAR',
        stops: [
          { position: 0, color: '#FF0000' },
          { position: 1, color: '#0000FF' },
        ],
      },
    });
    expect(result.type).toBe('GRADIENT');
  });

  it('should reject gradient with fewer than 2 stops', () => {
    expect(() =>
      FillSchema.parse({
        type: 'GRADIENT',
        gradient: {
          type: 'LINEAR',
          stops: [{ position: 0, color: '#FF0000' }],
        },
      })
    ).toThrow();
  });
});

// ============================================================================
// EffectSchema Tests
// ============================================================================

describe('ShadowSchema', () => {
  it('should accept drop shadow with defaults', () => {
    const result = ShadowSchema.parse({});
    expect(result.type).toBe('DROP_SHADOW');
    expect(result.offsetY).toBe(4);
    expect(result.blur).toBe(8);
  });

  it('should accept inner shadow', () => {
    const result = ShadowSchema.parse({ type: 'INNER_SHADOW' });
    expect(result.type).toBe('INNER_SHADOW');
  });

  it('should reject negative blur', () => {
    expect(() => ShadowSchema.parse({ blur: -1 })).toThrow();
  });
});

describe('BlurSchema', () => {
  it('should accept layer blur', () => {
    const result = BlurSchema.parse({ radius: 10 });
    expect(result.type).toBe('LAYER_BLUR');
    expect(result.radius).toBe(10);
  });

  it('should accept background blur', () => {
    const result = BlurSchema.parse({ type: 'BACKGROUND_BLUR', radius: 20 });
    expect(result.type).toBe('BACKGROUND_BLUR');
  });

  it('should reject negative radius', () => {
    expect(() => BlurSchema.parse({ radius: -5 })).toThrow();
  });
});

describe('EffectSchema (union)', () => {
  it('should accept shadow effect', () => {
    const result = EffectSchema.parse({ type: 'DROP_SHADOW', blur: 10 });
    expect(result).toHaveProperty('type', 'DROP_SHADOW');
  });

  it('should accept blur effect', () => {
    const result = EffectSchema.parse({ type: 'LAYER_BLUR', radius: 5 });
    expect(result).toHaveProperty('type', 'LAYER_BLUR');
  });
});

// ============================================================================
// GradientStopSchema Tests
// ============================================================================

describe('GradientStopSchema', () => {
  it('should accept valid gradient stop', () => {
    const result = GradientStopSchema.parse({ position: 0.5, color: '#FF0000' });
    expect(result.position).toBe(0.5);
  });

  it('should reject position out of range', () => {
    expect(() => GradientStopSchema.parse({ position: 1.5, color: '#FF0000' })).toThrow();
    expect(() => GradientStopSchema.parse({ position: -0.1, color: '#FF0000' })).toThrow();
  });
});

// ============================================================================
// AutoLayoutSchema Tests
// ============================================================================

describe('AutoLayoutSchema', () => {
  it('should accept horizontal layout', () => {
    const result = AutoLayoutSchema.parse({ mode: 'HORIZONTAL' });
    expect(result.mode).toBe('HORIZONTAL');
    expect(result.spacing).toBe(0);
    expect(result.wrap).toBe(false);
  });

  it('should accept vertical layout with spacing', () => {
    const result = AutoLayoutSchema.parse({ mode: 'VERTICAL', spacing: 16 });
    expect(result.spacing).toBe(16);
  });

  it('should accept padding values', () => {
    const result = AutoLayoutSchema.parse({
      mode: 'HORIZONTAL',
      paddingTop: 10,
      paddingRight: 20,
      paddingBottom: 10,
      paddingLeft: 20,
    });
    expect(result.paddingTop).toBe(10);
    expect(result.paddingRight).toBe(20);
  });

  it('should reject negative spacing', () => {
    expect(() => AutoLayoutSchema.parse({ mode: 'HORIZONTAL', spacing: -1 })).toThrow();
  });
});

// ============================================================================
// StrokeSchema Tests
// ============================================================================

describe('StrokeSchema', () => {
  it('should accept stroke with defaults', () => {
    const result = StrokeSchema.parse({ color: '#000000' });
    expect(result.weight).toBe(1);
    expect(result.align).toBe('INSIDE');
  });

  it('should accept custom stroke', () => {
    const result = StrokeSchema.parse({
      color: '#FF0000',
      weight: 2,
      align: 'OUTSIDE',
    });
    expect(result.weight).toBe(2);
    expect(result.align).toBe('OUTSIDE');
  });
});
