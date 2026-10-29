import '@testing-library/jest-dom/vitest'

// Radix popovers measure their anchor.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
