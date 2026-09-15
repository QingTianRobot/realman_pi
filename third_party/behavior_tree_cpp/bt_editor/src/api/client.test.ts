import { afterEach, describe, expect, it, vi } from 'vitest';

import { openTree } from './client';

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
