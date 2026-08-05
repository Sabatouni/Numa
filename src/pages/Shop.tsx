import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Category, Product } from "../lib/types";
import { useStore } from "../context/StoreContext";
import { money } from "../lib/format";
import Seo from "../components/Seo";
import ProductCard from "../components/ProductCard";
import QuickView from "../components/QuickView";
import { EmptyState, SectionHeading, Skeleton, Spinner } from "../components/ui";
import { IconChevronDown } from "../components/Icons";

const PAGE_SIZE = 12;
const AGES = ["0-3m", "0-6m", "0-12m", "3-6m", "6-12m", "12-24m", "24-36m"];
const GENDERS = [
  { value: "", label: "All" },
  { value: "girls", label: "Girls" },
  { value: "boys", label: "Boys" },
  { value: "unisex", label: "Unisex" },
];
const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

export default function Shop({ newArrivals = false }: { newArrivals?: boolean }) {
  const { site } = useStore();
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [quick, setQuick] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const age = params.get("age") ?? "";
  const gender = params.get("gender") ?? "";
  const maxPrice = params.get("max") ?? "";
  const sort = params.get("sort") ?? "newest";

  const setParam = useCallback(
    (key: string, value: string) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      }, { replace: true });
    },
    [setParams]
  );

  useEffect(() => {
    void supabase.from("numa_categories").select("*").eq("active", true).order("sort_order")
      .then(({ data }) => setCategories((data as Category[]) ?? []));
  }, []);

  const buildQuery = useCallback(
    (from: number, to: number) => {
      let query = supabase
        .from("numa_products")
        .select("*, numa_product_images(*), numa_product_variants(*)", { count: "exact" })
        .eq("status", "active")
        .range(from, to);
      if (newArrivals) query = query.eq("new_arrival", true);
      if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
      if (gender) query = query.eq("gender", gender);
      if (age) query = query.eq("age_range", age);
      if (maxPrice) query = query.lte("price", Number(maxPrice));
      if (category) {
        const cat = categories.find((c) => c.slug === category);
        if (cat) query = query.eq("category_id", cat.id);
      }
      if (sort === "price-asc") query = query.order("price", { ascending: true });
      else if (sort === "price-desc") query = query.order("price", { ascending: false });
      else if (sort === "name") query = query.order("name", { ascending: true });
      else query = query.order("created_at", { ascending: false });
      return query;
    },
    [newArrivals, q, gender, age, maxPrice, category, categories, sort]
  );

  useEffect(() => {
    if (category && categories.length === 0) return;
    let cancelled = false;
    setLoading(true);
    setPage(0);
    void buildQuery(0, PAGE_SIZE - 1).then(({ data, count }) => {
      if (cancelled) return;
      setProducts((data as Product[]) ?? []);
      setTotal(count ?? 0);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [buildQuery, category, categories.length]);

  const hasMore = products.length < total;

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data } = await buildQuery(nextPage * PAGE_SIZE, nextPage * PAGE_SIZE + PAGE_SIZE - 1);
    setProducts((prev) => [...prev, ...((data as Product[]) ?? [])]);
    setPage(nextPage);
    setLoadingMore(false);
  }, [buildQuery, page, hasMore, loadingMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) void loadMore();
    }, { rootMargin: "400px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  const activeFilters = useMemo(
    () => [category && "category", age && "age", gender && "gender", maxPrice && "price"].filter(Boolean).length,
    [category, age, gender, maxPrice]
  );

  const title = newArrivals ? "New Arrivals" : q ? `Search: “${q}”` : "Shop";

  return (
    <div className="container-page pt-8 sm:pt-12">
      <Seo title={`${title} | Numa Baby Essentials`} description="Shop timeless baby & kids essentials in natural fabrics. Rompers, swaddles, knits and gifts — order easily on WhatsApp." />
      <SectionHeading
        eyebrow={newArrivals ? "Just landed" : "The full collection"}
        title={newArrivals ? "New arrivals" : q ? `Results for “${q}”` : "Shop all essentials"}
        subtitle={`${total} piece${total === 1 ? "" : "s"}`}
      />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          className="btn-ghost -ml-4 lg:hidden"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((v) => !v)}
        >
          Filters {activeFilters > 0 ? `(${activeFilters})` : ""} <IconChevronDown width={15} height={15} className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
        </button>
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="sort" className="text-[12px] uppercase tracking-[0.15em] text-soft">Sort</label>
          <select id="sort" value={sort} onChange={(e) => setParam("sort", e.target.value)} className="input w-auto py-2 text-[14px]">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`} aria-label="Product filters">
          <div className="space-y-8 border border-linen bg-ivory/60 p-6 lg:sticky lg:top-28">
            <fieldset>
              <legend className="label">Category</legend>
              <div className="space-y-2">
                <FilterRadio name="category" checked={!category} label="All categories" onChange={() => setParam("category", "")} />
                {categories.map((c) => (
                  <FilterRadio key={c.id} name="category" checked={category === c.slug} label={c.name} onChange={() => setParam("category", c.slug)} />
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="label">Age</legend>
              <div className="flex flex-wrap gap-2">
                <FilterChip active={!age} label="All" onClick={() => setParam("age", "")} />
                {AGES.map((a) => <FilterChip key={a} active={age === a} label={a} onClick={() => setParam("age", a)} />)}
              </div>
            </fieldset>
            <fieldset>
              <legend className="label">Gender</legend>
              <div className="flex flex-wrap gap-2">
                {GENDERS.map((g) => <FilterChip key={g.value} active={gender === g.value} label={g.label} onClick={() => setParam("gender", g.value)} />)}
              </div>
            </fieldset>
            <fieldset>
              <legend className="label">Max price {maxPrice ? `— ${money(Number(maxPrice), site.currency_symbol)}` : ""}</legend>
              <input
                type="range"
                min={20000}
                max={150000}
                step={5000}
                value={maxPrice || 150000}
                onChange={(e) => setParam("max", e.target.value === "150000" ? "" : e.target.value)}
                className="w-full accent-olive"
                aria-label="Maximum price"
              />
              <div className="mt-1 flex justify-between text-[11px] text-soft">
                <span>{money(20000, site.currency_symbol)}</span>
                <span>{money(150000, site.currency_symbol)}</span>
              </div>
            </fieldset>
            {activeFilters > 0 && (
              <button type="button" className="btn-ghost -ml-4" onClick={() => setParams(q ? { q } : {}, { replace: true })}>
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5]" />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState title="Nothing here yet" subtitle="Try adjusting your filters or search — or browse the full collection." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 xl:grid-cols-3">
                {products.map((p, i) => <ProductCard key={p.id} product={p} onQuickView={setQuick} priority={i < 3} />)}
              </div>
              <div ref={sentinelRef} aria-hidden />
              {loadingMore && <Spinner label="Loading more products" />}
              {!hasMore && products.length > PAGE_SIZE && (
                <p className="py-12 text-center text-[13px] uppercase tracking-[0.18em] text-soft">You've seen everything ✦</p>
              )}
            </>
          )}
        </div>
      </div>

      <QuickView product={quick} onClose={() => setQuick(null)} />
    </div>
  );
}

function FilterRadio({ name, checked, label, onChange }: { name: string; checked: boolean; label: string; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[14px] font-light text-ink/80 transition-colors hover:text-ink">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="accent-olive" />
      {label}
    </label>
  );
}

function FilterChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border px-3 py-1.5 text-[12px] tracking-wide transition-all duration-300 ${active ? "border-olive bg-olive text-cream" : "border-pebble text-soft hover:border-olive hover:text-ink"}`}
    >
      {label}
    </button>
  );
}
