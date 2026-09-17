import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchRuntime, fetchRuntimeResponse, fetchStructure, openTree } from './client';

describe('openTree', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('encodes the tree name in the request and parses the XML response', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ xml: '<root />' }), { status: 200 }),
      );

    await expect(openTree('arm move.xml')).resolves.toEqual({ xml: '<root />' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/tree/open?name=arm%20move.xml',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });
});

describe('runtime reads', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reads the missing-executor IDLE response without a mutation', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"state":"IDLE","root_status":"IDLE","nodes":[]}'));
    await expect(fetchRuntime()).resolves.toEqual({ state: 'IDLE', root_status: 'IDLE', nodes: [] });
    expect(fetch.mock.calls[0][0]).toBe('/api/runtime');
    expect(fetch.mock.calls[0][1]?.method ?? 'GET').toBe('GET');
  });

  it('reads the server structure using its read-only endpoint', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"nodes":[]}'));
    await expect(fetchStructure()).resolves.toEqual({ nodes: [] });
    expect(fetch.mock.calls[0][0]).toBe('/api/tree/structure');
    expect(fetch.mock.calls[0][1]?.method ?? 'GET').toBe('GET');
  });

  it('reports unavailable snapshots instead of displaying them as current data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"error":"unavailable"}', { status: 503 }));
    await expect(fetchRuntime()).rejects.toThrow('503');
  });

  it('returns ETag metadata and accepts a not-modified runtime response', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('{"root_status":"RUNNING","nodes":[]}', { status: 200, headers: { ETag: '"7"' } }))
      .mockResolvedValueOnce(new Response(null, { status: 304 }));
    await expect(fetchRuntimeResponse(undefined)).resolves.toMatchObject({ etag: '"7"', notModified: false });
    await expect(fetchRuntimeResponse(undefined, '"7"')).resolves.toMatchObject({ etag: '"7"', notModified: true, snapshot: null });
    expect(fetchMock.mock.calls[1][1]).toEqual(expect.objectContaining({ headers: expect.objectContaining({ 'If-None-Match': '"7"' }) }));
  });

  it('reads a complete diagnostics snapshot', async () => {
    const snapshot = {
      schema_version: 2,
      root_status: 'FAILURE',
      nodes: [],
      tick_stats: { running: 3, success: 5, failure: 2, total: 10 },
      events: [{
        timestamp_ms: 1726473600000,
        severity: 'ERROR',
        source: 'EXECUTOR',
        interface_name: 'realman_bt_executor',
        phase: 'exception',
        detail: 'tick failed',
      }],
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(snapshot)));

    await expect(fetchRuntime()).resolves.toEqual(snapshot);
  });

  it.each([
    ['non-numeric tick statistics', {
      root_status: 'RUNNING',
      nodes: [],
      tick_stats: { running: 1, success: 0, failure: 0, total: '1' },
    }],
    ['negative tick statistics', {
      root_status: 'RUNNING',
      nodes: [],
      tick_stats: { running: -1, success: 0, failure: 0, total: 0 },
    }],
    ['fractional tick statistics', {
      root_status: 'RUNNING',
      nodes: [],
      tick_stats: { running: 1.5, success: 0, failure: 0, total: 2 },
    }],
    ['an unknown event severity', {
      root_status: 'RUNNING',
      nodes: [],
      events: [{
        timestamp_ms: 1726473600000,
        severity: 'DEBUG',
        source: 'ACTION',
        interface_name: '/r/execute_motion',
        phase: 'result',
        detail: 'ignored',
      }],
    }],
    ['an unknown event source', {
      root_status: 'RUNNING',
      nodes: [],
      events: [{
        timestamp_ms: 1726473600000,
        severity: 'INFO',
        source: 'UNKNOWN',
        interface_name: 'realman_bt_executor',
        phase: 'tick',
        detail: 'ignored',
      }],
    }],
    ['a negative event timestamp', {
      root_status: 'RUNNING',
      nodes: [],
      events: [{
        timestamp_ms: -1,
        severity: 'INFO',
        source: 'EXECUTOR',
        interface_name: 'realman_bt_executor',
        phase: 'tick',
        detail: 'ignored',
      }],
    }],
    ['a fractional event timestamp', {
      root_status: 'RUNNING',
      nodes: [],
      events: [{
        timestamp_ms: 1726473600000.5,
        severity: 'INFO',
        source: 'EXECUTOR',
        interface_name: 'realman_bt_executor',
        phase: 'tick',
        detail: 'ignored',
      }],
    }],
  ])('rejects %s without replacing a previously accepted snapshot', async (_, malformed) => {
    const accepted = { root_status: 'IDLE', nodes: [] } as const;
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(accepted)))
      .mockResolvedValueOnce(new Response(JSON.stringify(malformed)));

    const prior = await fetchRuntime();
    await expect(fetchRuntime()).rejects.toThrow('运行态快照格式无效');
    expect(prior).toEqual(accepted);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('accepts legacy snapshots that omit diagnostics fields', async () => {
    const legacy = { root_status: 'SUCCESS', nodes: [] };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(legacy)));

    await expect(fetchRuntimeResponse()).resolves.toMatchObject({
      snapshot: legacy,
      notModified: false,
    });
  });
});
