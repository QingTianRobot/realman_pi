/** Shared dev/preview API proxy; BT_BACKEND_URL selects the observable server. */
export function frontendConfig(backendUrl: string) {
  const proxy = { '/api': { target: backendUrl, changeOrigin: true } };
  return {
    server: { port: 5173, proxy },
    preview: { proxy },
    test: {
      environment: 'jsdom',
      // Include mounted React monitor tests as well as utility tests.
      include: ['src/**/*.test.{ts,tsx}'],
    },
  };
}
