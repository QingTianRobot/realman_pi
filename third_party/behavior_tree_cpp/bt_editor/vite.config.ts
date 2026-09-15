// Vite discovers this entry here; settings live in repository-root config/.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { frontendConfig } from '../../../config/behavior-tree/frontend';

export default defineConfig(() => {
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  return {
    plugins: [react()],
    ...frontendConfig(runtime.process?.env?.BT_BACKEND_URL || 'http://localhost:8080'),
  };
});
