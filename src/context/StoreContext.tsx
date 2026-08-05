import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { AboutSettings, ContactSettings, PolicySettings, SiteSettings, SocialLink } from "../lib/types";

interface StoreState {
  site: SiteSettings;
  contact: ContactSettings;
  policies: PolicySettings;
  about: AboutSettings;
  socials: SocialLink[];
  loaded: boolean;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  reviewModalOpen: boolean;
  setReviewModalOpen: (open: boolean) => void;
}

const env = import.meta.env;

/** Build-time fallbacks — used only until (or unless) values exist in the numa_settings /
 *  numa_social_links tables, which are editable from the admin studio and always win. */
const envWhatsapp = (env.VITE_WHATSAPP_NUMBER as string | undefined)?.replace(/[^0-9]/g, "") ?? "";
const envSocials: SocialLink[] = (
  [
    ["instagram", env.VITE_INSTAGRAM],
    ["facebook", env.VITE_FACEBOOK],
    ["tiktok", env.VITE_TIKTOK],
    ["pinterest", env.VITE_PINTEREST],
    ["threads", env.VITE_THREADS],
    ["youtube", env.VITE_YOUTUBE],
  ] as [string, string | undefined][]
)
  .filter((entry): entry is [string, string] => Boolean(entry[1]))
  .map(([platform, url], i) => ({
    id: `env-${platform}`,
    platform,
    url,
    label: platform.charAt(0).toUpperCase() + platform.slice(1),
    sort_order: i,
    active: true,
  }));

const defaults: Omit<StoreState, "toggleWishlist" | "isWishlisted" | "setReviewModalOpen"> = {
  site: { name: "Numa", tagline: "Baby Essentials", description: "", currency: "TZS", currency_symbol: "TSh" },
  contact: {
    whatsapp: envWhatsapp || "255700000000",
    whatsapp_display: "+255 700 000 000",
    phone: "+255 700 000 000",
    email: "hello@numa.family",
    address: "Stone Town, Zanzibar",
    map_query: "Stone Town, Zanzibar",
    business_hours: [],
  },
  policies: { privacy: "", shipping: "", returns: "" },
  about: { story: "", values: [] },
  socials: [],
  loaded: false,
  wishlist: [],
  reviewModalOpen: false,
};

const StoreContext = createContext<StoreState | null>(null);
const WISHLIST_KEY = "numa-wishlist";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState(defaults.site);
  const [contact, setContact] = useState(defaults.contact);
  const [policies, setPolicies] = useState(defaults.policies);
  const [about, setAbout] = useState(defaults.about);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]") as string[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [settingsRes, socialsRes] = await Promise.all([
        supabase.from("numa_settings").select("key,value"),
        supabase.from("numa_social_links").select("*").eq("active", true).order("sort_order"),
      ]);
      if (cancelled) return;
      for (const row of settingsRes.data ?? []) {
        if (row.key === "site") setSite((s) => ({ ...s, ...(row.value as SiteSettings) }));
        if (row.key === "contact") setContact((c) => ({ ...c, ...(row.value as ContactSettings) }));
        if (row.key === "policies") setPolicies((p) => ({ ...p, ...(row.value as PolicySettings) }));
        if (row.key === "about") setAbout((a) => ({ ...a, ...(row.value as AboutSettings) }));
      }
      const dbSocials = (socialsRes.data as SocialLink[]) ?? [];
      setSocials(dbSocials.length > 0 ? dbSocials : envSocials);
      setLoaded(true);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      const next = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isWishlisted = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const value = useMemo<StoreState>(
    () => ({ site, contact, policies, about, socials, loaded, wishlist, toggleWishlist, isWishlisted, reviewModalOpen, setReviewModalOpen }),
    [site, contact, policies, about, socials, loaded, wishlist, toggleWishlist, isWishlisted, reviewModalOpen]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
