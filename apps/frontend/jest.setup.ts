import '@testing-library/jest-dom';

// jsdom doesn't implement the object-URL APIs; components that preview
// selected files (FileUploadField) call these directly.
if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = jest.fn(() => 'blob:mock-url');
}
if (typeof URL.revokeObjectURL !== 'function') {
  URL.revokeObjectURL = jest.fn();
}

// jsdom doesn't implement ResizeObserver; Recharts' ResponsiveContainer
// requires it to measure its container.
if (typeof globalThis.ResizeObserver !== 'function') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}
