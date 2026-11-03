import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Oldest browsers to support. The installation runs on iPads, so go back to
    // iOS 15 (the last release for the iPad Air 2 and iPad mini 4) rather than
    // Vite's default of iOS 16.4.
    target: ['chrome100', 'firefox100', 'safari15', 'ios15'],
  },
});
