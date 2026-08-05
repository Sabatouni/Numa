import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { mockSupabase, authState, resetMockDb, inserted } from "./mockSupabase";
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
  const real = consoleErrors.filter(
    (e) => !e.includes("not wrapped in act") && !e.includes("test was not wrapped")
  );
  expect(real).toEqual([]);
}

beforeEach(() => {
  resetMockDb();
  authState.session = null;
  authState.listeners.length = 0;
});

describe("public routes render without errors", () => {
  it("home page renders hero, collections, products, reviews, gallery", async () => {
    renderAt("/");
    expect(await screen.findByText(/Timeless essentials for little adventures/)).toBeTruthy();
    expect(await screen.findByText("Safari Collection")).toBeTruthy();
    expect(await screen.findByText("Organic Muslin Romper")).toBeTruthy();
    expect(await screen.findByText(/Unbelievably soft/)).toBeTruthy();
    expect(await screen.findByText(/Natural Fabrics/)).toBeTruthy();
    expectNoConsoleErrors();
  });

  it("shop renders products with filters and sorting", async () => {
    renderAt("/shop");
    expect(await screen.findByText("Organic Muslin Romper")).toBeTruthy();
    expect(await screen.findByText("Heirloom Knit Blanket")).toBeTruthy();
    expect(screen.getByLabelText("Sort")).toBeTruthy();
    expect(screen.getByText("Category")).toBeTruthy();
    expect(screen.getByText("Age")).toBeTruthy();
    expect(screen.getByText("Gender")).toBeTruthy();
    expectNoConsoleErrors();
  });

  it("new arrivals filters to new products", async () => {
    renderAt("/new-arrivals");
    expect(await screen.findByText("Organic Muslin Romper")).toBeTruthy();
    expect(screen.queryByText("Heirloom Knit Blanket")).toBeNull();
    expectNoConsoleErrors();
  });

  it("categories page renders all categories", async () => {
    renderAt("/categories");
    expect(await screen.findByText("Baby")).toBeTruthy();
    expect(await screen.findByText("Newborn")).toBeTruthy();
    expectNoConsoleErrors();
  });

  it("collections + collection detail render", async () => {
    renderAt("/collections/safari");
    expect(await screen.findByRole("heading", { name: "Safari Collection" })).toBeTruthy();
    expect(await screen.findByText("Organic Muslin Romper")).toBeTruthy();
    expectNoConsoleErrors();
  });

  it("product page renders all detail sections", async () => {
    renderAt("/product/organic-muslin-romper");
    expect(await screen.findByRole("heading", { name: "Organic Muslin Romper", level: 1 })).toBeTruthy();
    expect(screen.getByText(/100% organic cotton/)).toBeTruthy();
    expect(screen.getByText(/Machine wash cold/)).toBeTruthy();
    expect(screen.getByText("Size")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Order on WhatsApp/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Save to wishlist/ })).toBeTruthy();
    // sold-out size is disabled
    const soldOut = screen.getByRole("button", { name: "3-6m" });
    expect((soldOut as HTMLButtonElement).disabled).toBe(true);
    expectNoConsoleErrors();
  });

  it("journal list and post render", async () => {
    renderAt("/journal/care-for-organic-muslin");
    expect(await screen.findByRole("heading", { name: /How to care for organic muslin/ })).toBeTruthy();
    expect(await screen.findByText(/Wash cold on gentle/)).toBeTruthy();
    expectNoConsoleErrors();
  });

  it("gallery, reviews, faq, about, contact and policies render", async () => {
    const routes = ["/gallery", "/reviews", "/faq", "/about", "/contact", "/privacy-policy", "/shipping-policy", "/returns", "/wishlist"];
    for (const r of routes) {
      const { unmount } = renderAt(r);
      // each page shows its main heading
      expect(await screen.findByRole("heading", { level: 2 })).toBeTruthy();
      unmount();
    }
    expectNoConsoleErrors();
  });

  it("unknown route shows the 404 page", async () => {
    renderAt("/definitely-not-a-page");
    expect(await screen.findByText(/Gone for a little nap/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Back home/ })).toBeTruthy();
    expectNoConsoleErrors();
  });
});

describe("WhatsApp ordering", () => {
  it("builds a complete order message and logs the intent", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    renderAt("/product/organic-muslin-romper");
    await screen.findByRole("heading", { name: "Organic Muslin Romper", level: 1 });

    const user = userEvent.setup();
    // switch color to Sand, bump quantity, add a note
    await user.click(screen.getByRole("button", { name: "Color Sand" }));
    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    await user.type(screen.getByLabelText(/Notes for us/), "Gift wrap please");
    await user.click(screen.getByRole("button", { name: /Order on WhatsApp/ }));

    expect(open).toHaveBeenCalledTimes(1);
    const url = open.mock.calls[0][0] as string;
    expect(url.startsWith("https://wa.me/255700000000?text=")).toBe(true);
    const msg = decodeURIComponent(url.split("text=")[1]);
    expect(msg).toContain("Product: Organic Muslin Romper");
    expect(msg).toContain("Size: 0-3m");
    expect(msg).toContain("Color: Sand");
    expect(msg).toContain("Quantity: 2");
    expect(msg).toContain("TSh 96,000");
    expect(msg).toContain("/product/organic-muslin-romper");
    expect(msg).toContain("Notes: Gift wrap please");

    // order intent logged
    expect(inserted.numa_orders?.length).toBe(1);
    expect(inserted.numa_orders[0]).toMatchObject({ product_name: "Organic Muslin Romper", quantity: 2, color: "Sand" });
    expectNoConsoleErrors();
  });
});

describe("review flow popup", () => {
  it("offers Instagram DM and WhatsApp with correct links", async () => {
    renderAt("/reviews");
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Leave a review" }));
    const dialog = await screen.findByRole("dialog", { name: /Choose how to leave your review/ });
    const ig = within(dialog).getByRole("link", { name: /Instagram DM/ });
    const wa = within(dialog).getByRole("link", { name: /WhatsApp/ });
    expect(ig.getAttribute("href")).toBe("https://ig.me/m/numa.baby");
    expect(wa.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/255700000000\?text=/);
    expectNoConsoleErrors();
  });
});

describe("social buttons and floating WhatsApp", () => {
  it("footer renders every social link with the right URL and the floating button", async () => {
    renderAt("/about");
    await screen.findByText(/Numa began in Stone Town/);
    const social = await screen.findByRole("list", { name: "Social media" });
    const links = within(social).getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("https://instagram.com/numa.baby");
    expect(hrefs).toContain("https://facebook.com/numa.baby");
    expect(hrefs).toContain("https://tiktok.com/@numa.baby");
    expect(hrefs).toContain("https://pinterest.com/numababy");
    expect(hrefs).toContain("https://threads.net/@numa.baby");
    expect(hrefs).toContain("https://youtube.com/@numababy");
    // wa float
    const float = screen.getByRole("link", { name: /Chat with us on WhatsApp/ });
    expect(float.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/255700000000/);
    // external links safe
    links.forEach((l) => expect(l.getAttribute("rel")).toContain("noopener"));
    expectNoConsoleErrors();
  });
});

describe("wishlist", () => {
  it("persists to localStorage and shows saved items", async () => {
    localStorage.clear();
    renderAt("/shop");
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: /Add Organic Muslin Romper to wishlist/ }));
    expect(JSON.parse(localStorage.getItem("numa-wishlist") ?? "[]")).toEqual(["p1"]);
    expectNoConsoleErrors();
  });
});

describe("newsletter + contact forms", () => {
  it("newsletter subscribes", async () => {
    renderAt("/faq");
    const user = userEvent.setup();
    const input = await screen.findByLabelText("Email address");
    await user.type(input, "family@example.com");
    await user.click(screen.getByRole("button", { name: "Join" }));
    expect(await screen.findByText(/Joined/)).toBeTruthy();
    expect(inserted.numa_newsletter_subscribers[0]).toMatchObject({ email: "family@example.com" });
    expectNoConsoleErrors();
  });

  it("contact form submits", async () => {
    renderAt("/contact");
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Your name"), "Arif");
    await user.type(screen.getByLabelText("Email address", { selector: "#contact-email" }), "arif@example.com");
    await user.type(screen.getByLabelText("Message"), "Hello!");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByText(/Message sent/)).toBeTruthy();
    expect(inserted.numa_contact_messages[0]).toMatchObject({ name: "Arif", email: "arif@example.com", message: "Hello!" });
    expectNoConsoleErrors();
  });
});
