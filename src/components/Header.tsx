import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../context/StoreContext";
import { IconClose, IconHeart, IconMenu, IconSearch } from "./Icons";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/new-arrivals", label: "New Arrivals" },
  { to: "/collections", label: "Collections" },
  { to: "/journal", label: "Journal" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const { site, wishlist } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    setMenuOpen(false);
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
    setQuery("");
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-[12px] uppercase tracking-[0.18em] transition-colors duration-300 ${isActive ? "text-ink" : "text-soft hover:text-ink"}`;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ease-soft ${scrolled ? "bg-cream/90 shadow-[0_1px_0_rgba(61,53,41,0.08)] backdrop-blur-md" : "bg-cream"}`}>
      <div className="container-page">
        <div className="flex h-20 items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-6">
            <button type="button" className="btn-ghost -ml-3 px-3 lg:hidden" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
              <IconMenu />
            </button>
            <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
              {nav.slice(0, 4).map((n) => (
                <NavLink key={n.to} to={n.to} className={linkClass}>{n.label}</NavLink>
              ))}
            </nav>
          </div>

          <Link to="/" className="group flex flex-col items-center" aria-label={`${site.name} — home`}>
            <span className="font-serif text-2xl sm:text-[1.9rem] leading-none tracking-[0.28em] sm:tracking-[0.35em] text-ink pl-1">{site.name.toUpperCase()}</span>
            <span className="mt-1 text-[9px] uppercase tracking-[0.45em] text-soft pl-1">{site.tagline}</span>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
            <nav aria-label="Secondary" className="mr-4 hidden items-center gap-6 lg:flex">
              {nav.slice(4).map((n) => (
                <NavLink key={n.to} to={n.to} className={linkClass}>{n.label}</NavLink>
              ))}
            </nav>
            <button type="button" className="btn-ghost px-2.5" aria-label="Search products" onClick={() => setSearchOpen((v) => !v)}>
              <IconSearch />
            </button>
            <Link to="/wishlist" className="btn-ghost relative px-2.5" aria-label={`Wishlist, ${wishlist.length} items`}>
              <IconHeart />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-[9px] font-normal text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.25, 0.6, 0.3, 1] }} className="overflow-hidden border-t border-linen bg-cream">
            <form onSubmit={submitSearch} className="container-page flex items-center gap-3 py-4" role="search">
              <IconSearch className="text-soft" />
              <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search rompers, swaddles, gifts…" aria-label="Search products" className="w-full bg-transparent font-light text-ink outline-none placeholder:text-soft/60" />
              <button type="submit" className="btn-ghost">Search</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-ink/30 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)}>
            <motion.nav
              aria-label="Mobile"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.25, 0.6, 0.3, 1] }}
              className="flex h-full w-[85%] max-w-sm flex-col bg-cream p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-10 flex items-center justify-between">
                <span className="font-serif text-2xl tracking-[0.3em]">{site.name.toUpperCase()}</span>
                <button type="button" className="btn-ghost -mr-3 px-3" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                  <IconClose />
                </button>
              </div>
              <div className="flex flex-col gap-6">
                {nav.map((n, i) => (
                  <motion.div key={n.to} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.05 }}>
                    <NavLink to={n.to} onClick={() => setMenuOpen(false)} className="font-serif text-2xl text-ink transition-colors hover:text-olive">
                      {n.label}
                    </NavLink>
                  </motion.div>
                ))}
              </div>
              <div className="mt-auto flex flex-col gap-3 border-t border-linen pt-6">
                <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-[0.15em] text-soft">Wishlist ({wishlist.length})</Link>
                <Link to="/reviews" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-[0.15em] text-soft">Reviews</Link>
                <Link to="/faq" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-[0.15em] text-soft">FAQ</Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
