import { defineConfig } from 'vitest/config';

/**
 * DECISION: Vitest + Supertest for backend tests, finally settling the
 * open "[Jest / Supertest — confirm choice]" item in CLAUDE.md.
 *
 * Why Vitest over Jest: this project is ESM throughout (`"type": "module"`),
 * and Jest's ESM support still requires `--experimental-vm-modules` plus
 * extra config to work reliably — flagged as a risk back in the Phase 2
 * README. Vitest runs ESM natively with zero extra config, and its API
 * (describe/it/expect) is close enough to Jest's that this isn't a big
 * relearning cost.
 */
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    testTimeout: 15000, // AI-scoring tests can be slower than typical unit tests
    hookTimeout: 20000, // mongodb-memory-server's first boot downloads a binary — can be slow
  },
});