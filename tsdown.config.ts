import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: { index: 'src/index.ts', linagora: 'src/linagora/index.ts' },
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  dts: { tsconfig: 'src/linagora/tsconfig.json' },
  external: ['@linagora/jmap-client-ts'],
  sourcemap: false,
  clean: true,
});
