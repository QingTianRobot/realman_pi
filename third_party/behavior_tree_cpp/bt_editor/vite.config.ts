/**
 * @author lovelyyoshino
 * @date 2026-06-30
 * @version v1.1.0
 * @last_modified 2026-07-13
 * @changelog
 *   - v1.1.0 (2026-07-13): 让生产预览也可代理真实 bt_server，供 live E2E 使用
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// 开发服务器与生产预览共用一个代理契约，避免 live E2E 验证到不同拓扑。
export default defineConfig(() => {
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  const backendUrl =
    runtime.process?.env?.BT_BACKEND_URL || 'http://localhost:8080';
  const apiProxy = {
    '/api': {
      target: backendUrl,
      changeOrigin: true,
    },
  };

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: apiProxy,
    },
    preview: {
      proxy: apiProxy,
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.ts'],
    },
  };
});
