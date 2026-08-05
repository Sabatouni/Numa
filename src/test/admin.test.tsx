import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { mockSupabase, authState, resetMockDb } from "./mockSupabase";
import { consoleErrors } from "./setup";

vi.mock("../lib/supabase", () => ({
  supabase: mockSupabase,
  MEDIA_BUCKET: "numa-media",
  mediaUrl: (p: string) => `https://storage.example/${p}`,
}));

import App from "../App";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

function expectNoConsoleErrors() {
  const real = consoleErrors.filter((e) => !e.includes("not wrapped in act"));
  expect(real).toEqual([]);
}

beforeEach(() => {
  resetMockDb();
  authState.session = null;
  authState.listeners.length = 0;
});

describe("admin auth", () => {
  it("unauthenticated /admin shows the login screen, not the dashboard", async () => {
    renderAt("/admin");
    expect(await screen.findByRole("button", { name: "Sign in" })).toBeTruthy();
    expect(screen.queryByText("Dashboard")).toBeNull();
    expectNoConsoleErrors();
  });

  it("login with valid profile reaches the dashboard; sign out returns to login", async () => {
    renderAt("/admin");
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Email"), "admin@numa.family");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeTruthy();
    expect(screen.getByText("Media Library")).toBeTruthy();
    // sign out
    await user.click(screen.getByRole("button", { name: /Sign out/ }));
    expect(await screen.findByRole("button", { name: "Sign in" })).toBeTruthy();
    expectNoConsoleErrors();
  });

  it("forgot password sends a reset email", async () => {
    renderAt("/admin");
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Email"), "admin@numa.family");
    await user.click(screen.getByRole("button", { name: "Forgot password?" }));
    expect(await screen.findByText(/Reset link sent/)).toBeTruthy();
    expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith("admin@numa.family", expect.objectContaining({ redirectTo: expect.stringContaining("/admin") }));
    expectNoConsoleErrors();
  });

  it("password recovery event shows the new-password form and saves", async () => {
    authState.session = { user: { id: "admin-1", email: "admin@numa.family" } };
    renderAt("/admin");
    await screen.findByRole("heading", { name: "Dashboard" });
    // simulate the recovery event Supabase fires after the email link
    authState.listeners.forEach((l) => l("PASSWORD_RECOVERY", authState.session));
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("New password"), "brand-new-pass-1");
    await user.type(screen.getByLabelText("Confirm password"), "brand-new-pass-1");
    await user.click(screen.getByRole("button", { name: "Save new password" }));
    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ password: "brand-new-pass-1" });
    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeTruthy();
    expectNoConsoleErrors();
  });

  it("session persists across a reload (getSession)", async () => {
    authState.session = { user: { id: "admin-1", email: "admin@numa.family" } };
    renderAt("/admin");
    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeTruthy();
    expectNoConsoleErrors();
  });
});

describe("admin sections render with data", () => {
  beforeEach(() => {
    authState.session = { user: { id: "admin-1", email: "admin@numa.family" } };
  });

  const cases: [string, RegExp][] = [
    ["/admin/orders", /Organic Muslin Romper/],
    ["/admin/products", /Heirloom Knit Blanket/],
    ["/admin/categories", /Newborn/],
    ["/admin/collections", /Kendwa Summer/],
    ["/admin/media", /romper\.jpg/],
    ["/admin/reviews", /Amina K\./],
    ["/admin/journal", /How to care for organic muslin/],
    ["/admin/homepage", /Gallery strip/],
    ["/admin/social", /instagram\.com/],
    ["/admin/settings", /Currency code/],
    ["/admin/users", /admin@numa\.family/],
  ];

  for (const [path, expected] of cases) {
    it(`${path} renders`, async () => {
      renderAt(path);
      expect(await screen.findByText(expected)).toBeTruthy();
      expectNoConsoleErrors();
    });
  }

  it("product editor loads an existing product with variants and images", async () => {
    renderAt("/admin/products/p1");
    expect(await screen.findByDisplayValue("Organic Muslin Romper")).toBeTruthy();
    expect((await screen.findAllByDisplayValue("0-3m")).length).toBe(2);
    expect(screen.getAllByLabelText(/Alt text for image/).length).toBe(2);
    expectNoConsoleErrors();
  });

  it("journal editor loads an existing post", async () => {
    renderAt("/admin/journal/j1");
    expect(await screen.findByDisplayValue("How to care for organic muslin")).toBeTruthy();
    expectNoConsoleErrors();
  });
});
