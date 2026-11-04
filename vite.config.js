import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default defineConfig({
  define: {
    // Shown in the info drawer.
    __APP_VERSION__: JSON.stringify(version),
  },
  build: {
    // Oldest browsers to support. The installation runs on iPads, so go back to
    // iOS 15 (the last release for the iPad Air 2 and iPad mini 4) rather than
    // Vite's default of iOS 16.4.
    target: ['chrome100', 'firefox100', 'safari15', 'ios15'],
  },
});
