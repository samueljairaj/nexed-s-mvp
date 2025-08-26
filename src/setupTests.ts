import '@testing-library/jest-dom/vitest';

// Polyfill ResizeObserver for tests (used by Radix UI components)
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  
  private callback: ResizeObserverCallback;
  
  observe() {
    // Mock implementation - do nothing
  }
  
  unobserve() {
    // Mock implementation - do nothing
  }
  
  disconnect() {
    // Mock implementation - do nothing
  }
};