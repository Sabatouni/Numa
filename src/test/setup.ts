import { vi, beforeEach, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
Object.defineProperty(window, "IntersectionObserver", { writable: true, value: MockIntersectionObserver });
Object.defineProperty(window, "scrollTo", { writable: true, value: () => {} });
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
  }),
});
Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) } });

export const consoleErrors: string[] = [];
export const consoleWarnings: string[] = [];
const origError = console.error.bind(console);

beforeEach(() => {
  consoleErrors.length = 0;
  consoleWarnings.length = 0;
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    consoleErrors.push(args.map(String).join(" "));
    origError(...args);
  });
  vi.spyOn(console, "warn").mockImplementation((...args: unknown[]) => {
    consoleWarnings.push(args.map(String).join(" "));
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
