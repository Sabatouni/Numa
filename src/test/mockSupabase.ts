import { vi } from "vitest";
import { tables } from "./fixtures";

type Row = Record<string, unknown>;

export const inserted: Record<string, Row[]> = {};
export const updated: Record<string, { patch: Row; filters: [string, unknown][] }[]> = {};
export const deleted: Record<string, [string, unknown][][]> = {};

export function resetMockDb() {
  for (const k of Object.keys(inserted)) delete inserted[k];
  for (const k of Object.keys(updated)) delete updated[k];
  for (const k of Object.keys(deleted)) delete deleted[k];
}

function slicePath(row: Row, slug: string): boolean {
  return row.slug === slug;
}

class Builder implements PromiseLike<{ data: Row[] | Row | null; count: number | null; error: null }> {
  private rows: Row[];
  private table: string;
  private single = false;
  private headCount = false;
  private mode: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private pendingInsert: Row[] = [];
  private pendingPatch: Row = {};
  private filters: [string, unknown][] = [];
  private rangeArgs: [number, number] | null = null;

  constructor(table: string) {
    this.table = table;
    this.rows = [...((tables[table] as Row[]) ?? [])];
  }
  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    if (opts?.head) this.headCount = true;
    return this;
  }
  insert(values: Row | Row[]) {
    this.mode = "insert";
    this.pendingInsert = Array.isArray(values) ? values : [values];
    (inserted[this.table] ??= []).push(...this.pendingInsert);
    return this;
  }
  update(patch: Row) { this.mode = "update"; this.pendingPatch = patch; return this; }
  upsert(values: Row | Row[]) { return this.insert(values); }
  delete() { this.mode = "delete"; return this; }
  eq(col: string, val: unknown) {
    this.filters.push([col, val]);
    this.rows = this.rows.filter((r) => r[col] === val);
    return this;
  }
  neq(col: string, val: unknown) { this.rows = this.rows.filter((r) => r[col] !== val); return this; }
  in(col: string, vals: unknown[]) { this.rows = this.rows.filter((r) => vals.includes(r[col])); return this; }
  or(_expr: string) { return this; }
  ilike(col: string, pattern: string) {
    const needle = pattern.replace(/%/g, "").toLowerCase();
    this.rows = this.rows.filter((r) => String(r[col] ?? "").toLowerCase().includes(needle));
    return this;
  }
  lte(col: string, val: number) { this.rows = this.rows.filter((r) => Number(r[col]) <= val); return this; }
  order(col: string, opts?: { ascending?: boolean }) {
    const asc = opts?.ascending !== false;
    this.rows.sort((a, b) => (String(a[col] ?? "") < String(b[col] ?? "") ? (asc ? -1 : 1) : asc ? 1 : -1));
    return this;
  }
  range(from: number, to: number) { this.rangeArgs = [from, to]; return this; }
  limit(n: number) { this.rows = this.rows.slice(0, n); return this; }
  maybeSingle() { this.single = true; return this; }
   
  matchSlug(slug: string) { this.rows = this.rows.filter((r) => slicePath(r, slug)); return this; }

  private result() {
    if (this.mode === "update") {
      (updated[this.table] ??= []).push({ patch: this.pendingPatch, filters: this.filters });
      return { data: null, count: null, error: null };
    }
    if (this.mode === "delete") {
      (deleted[this.table] ??= []).push(this.filters);
      return { data: null, count: null, error: null };
    }
    if (this.mode === "insert") {
      const data = this.single ? (this.pendingInsert[0] ? { id: "new-id", ...this.pendingInsert[0] } : null) : this.pendingInsert;
      return { data, count: null, error: null };
    }
    const total = this.rows.length;
    let rows = this.rows;
    if (this.rangeArgs) rows = rows.slice(this.rangeArgs[0], this.rangeArgs[1] + 1);
    if (this.headCount) return { data: null, count: total, error: null };
    if (this.single) return { data: rows[0] ?? null, count: total, error: null };
    return { data: rows, count: total, error: null };
  }

  // `single` used by ProductsAdmin duplicate + ProductEdit insert
  // (alias of maybeSingle for the mock)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  then<T1 = unknown, T2 = never>(onfulfilled?: ((value: any) => T1 | PromiseLike<T1>) | null, onrejected?: ((reason: unknown) => T2 | PromiseLike<T2>) | null): PromiseLike<T1 | T2> {
    return Promise.resolve(this.result()).then(onfulfilled, onrejected);
  }
}

// add `.single()` alias
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Builder.prototype as any).single = function (this: Builder) { return (this as any).maybeSingle(); };

export const authState = {
  session: null as null | { user: { id: string; email: string } },
  listeners: [] as ((event: string, session: unknown) => void)[],
};

export const openedWindows: string[] = [];

export const mockSupabase = {
  from: (table: string) => new Builder(table),
  storage: {
    from: () => ({
      getPublicUrl: (path: string) => ({ data: { publicUrl: `https://storage.example/${path}` } }),
      upload: vi.fn().mockResolvedValue({ error: null }),
      remove: vi.fn().mockResolvedValue({ error: null }),
    }),
  },
  auth: {
    getSession: () => Promise.resolve({ data: { session: authState.session } }),
    onAuthStateChange: (cb: (event: string, session: unknown) => void) => {
      authState.listeners.push(cb);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: vi.fn().mockImplementation(({ email }: { email: string }) => {
      authState.session = { user: { id: "admin-1", email } };
      authState.listeners.forEach((l) => l("SIGNED_IN", authState.session));
      return Promise.resolve({ data: { session: authState.session }, error: null });
    }),
    signOut: vi.fn().mockImplementation(() => {
      authState.session = null;
      authState.listeners.forEach((l) => l("SIGNED_OUT", null));
      return Promise.resolve({ error: null });
    }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
  },
};
