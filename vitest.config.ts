import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'core',
          include: ['tests/unit/**/*.test.ts'],
          typecheck: {
            enabled: true,
            include: ['tests/types/**/*.test-d.ts'],
            tsconfig: 'tests/types/tsconfig.json',
          },
        },
      },
      {
        // `@linagora/jmap-client-ts/linagora` imports the core types by package name
        resolve: {
          alias: {
            '@linagora/jmap-client-ts': fileURLToPath(new URL('src/index.ts', import.meta.url)),
          },
        },
        test: {
          name: 'linagora',
          include: ['tests/linagora/unit/**/*.test.ts'],
          typecheck: {
            enabled: true,
            include: ['tests/linagora/types/**/*.test-d.ts'],
            tsconfig: 'tests/linagora/tsconfig.json',
          },
        },
      },
    ],
  },
});
