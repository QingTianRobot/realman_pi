import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchRuntime, fetchStructure, openTree } from './client';

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
});
