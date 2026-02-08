import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createToolHandler, DEFAULT_ANNOTATIONS, READONLY_ANNOTATIONS, DESTRUCTIVE_ANNOTATIONS } from './handler-factory.js';

// Mock sendToFigma
vi.mock('../embedded-ws-server.js', () => ({
  sendToFigma: vi.fn(),
}));

import { sendToFigma } from '../embedded-ws-server.js';

const mockedSendToFigma = vi.mocked(sendToFigma);

describe('createToolHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send correct action to Figma', async () => {
    mockedSendToFigma.mockResolvedValueOnce({ nodeId: '1:23' });

    const handler = createToolHandler<{ width: number }>('CREATE_FRAME');
    await handler({ width: 400 });

    expect(mockedSendToFigma).toHaveBeenCalledWith({
      action: 'CREATE_FRAME',
      params: { width: 400 },
    });
  });

  it('should return success response with JSON content', async () => {
    const mockResponse = { nodeId: '1:23', name: 'Frame' };
    mockedSendToFigma.mockResolvedValueOnce(mockResponse);

    const handler = createToolHandler<{ name: string }>('CREATE_FRAME');
    const result = await handler({ name: 'Test' });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(JSON.parse(result.content[0].text)).toEqual(mockResponse);
    expect(result.isError).toBeUndefined();
  });

  it('should return isError flag on failure', async () => {
    mockedSendToFigma.mockRejectedValueOnce(new Error('Connection lost'));

    const handler = createToolHandler<Record<string, unknown>>('INVALID_ACTION');
    const result = await handler({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Connection lost');
  });

  it('should handle non-Error thrown objects', async () => {
    mockedSendToFigma.mockRejectedValueOnce('string error');

    const handler = createToolHandler<Record<string, unknown>>('TEST');
    const result = await handler({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Unknown error');
  });

  it('should pass all params to sendToFigma', async () => {
    mockedSendToFigma.mockResolvedValueOnce({ success: true });

    const handler = createToolHandler<{ a: string; b: number; c: boolean }>('MULTI_PARAM');
    await handler({ a: 'hello', b: 42, c: true });

    expect(mockedSendToFigma).toHaveBeenCalledWith({
      action: 'MULTI_PARAM',
      params: { a: 'hello', b: 42, c: true },
    });
  });
});

describe('Annotations', () => {
  it('DEFAULT_ANNOTATIONS should be non-destructive and non-readonly', () => {
    expect(DEFAULT_ANNOTATIONS.readOnlyHint).toBe(false);
    expect(DEFAULT_ANNOTATIONS.destructiveHint).toBe(false);
    expect(DEFAULT_ANNOTATIONS.idempotentHint).toBe(false);
  });

  it('READONLY_ANNOTATIONS should be read-only and idempotent', () => {
    expect(READONLY_ANNOTATIONS.readOnlyHint).toBe(true);
    expect(READONLY_ANNOTATIONS.destructiveHint).toBe(false);
    expect(READONLY_ANNOTATIONS.idempotentHint).toBe(true);
  });

  it('DESTRUCTIVE_ANNOTATIONS should be destructive', () => {
    expect(DESTRUCTIVE_ANNOTATIONS.readOnlyHint).toBe(false);
    expect(DESTRUCTIVE_ANNOTATIONS.destructiveHint).toBe(true);
    expect(DESTRUCTIVE_ANNOTATIONS.idempotentHint).toBe(false);
  });
});
