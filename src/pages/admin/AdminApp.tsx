import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import type { Profile } from "../../lib/types";
import { BrandLoader } from "../../components/ui";
import { ToastProvider } from "../../components/admin/AdminUI";
import { IconExternal, IconLogout, IconMenu, IconClose } from "../../components/Icons";
import { Logo } from "../../components/Logo";
import Login from "./Login";
import Dashboard from "./Dashboard";
import OrdersAdmin from "./OrdersAdmin";
import ProductsAdmin from "./ProductsAdmin";
import ProductEdit from "./ProductEdit";
import CategoriesAdmin from "./CategoriesAdmin";
import CollectionsAdmin from "./CollectionsAdmin";
import MediaLibrary from "./MediaLibrary";
import ReviewsAdmin from "./ReviewsAdmin";
import JournalAdmin from "./JournalAdmin";
import JournalEdit from "./JournalEdit";
import HomepageEditor from "./HomepageEditor";
import SocialLinksAdmin from "./SocialLinksAdmin";
import SettingsAdmin from "./SettingsAdmin";
import UsersAdmin from "./UsersAdmin";

const nav = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/collections", label: "Collections" },
  { to: "/admin/media", label: "Media Library" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/journal", label: "Journal" },
  { to: "/admin/homepage", label: "Homepage" },
  { to: "/admin/social", label: "Social Links" },
  { to: "/admin/settings", label: "Settings" },
  { to: "/admin/users", label: "Users" },
];

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checking, setChecking] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      if (!s) { setProfile(null); setChecking(false); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    setChecking(true);
    void supabase
      .from("numa_profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (cancelled) return;
        if (!data) {
          await supabase.auth.signOut();
          setProfile(null);
        } else {
          setProfile(data as Profile);
        }
        setChecking(false);
      });
    return () => { cancelled = true; };
  }, [session]);

  if (checking) return <div className="flex min-h-screen items-center justify-center bg-ivory"><BrandLoader label="Checking access" /></div>;
  if (recovery && session) return <ResetPassword onDone={() => setRecovery(false)} />;
  if (!session || !profile) return <Login />;

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/admin");
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2.5 text-[13px] uppercase tracking-[0.14em] transition-colors duration-200 ${isActive ? "bg-olive text-cream" : "text-soft hover:bg-linen hover:text-ink"}`;

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-ivory">
        <aside className={`fixed inset-y-0 left-0 z-40 w-60 transform border-r border-linen bg-cream transition-transform duration-300 lg:static lg:translate-x-0 ${navOpen ? "translate-x-0" : "-translate-x-full"}`} aria-label="Admin navigation">
          <div className="flex h-full flex-col">
            <div className="border-b border-linen p-5">
              <Logo className="h-5 w-auto text-ink" />
              <p className="mt-1.5 text-[10px] uppercase tracking-[0.3em] text-soft">Studio</p>
            </div>
            <nav className="flex-1 overflow-y-auto py-3">
              {nav.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.end} className={linkClass} onClick={() => setNavOpen(false)}>
                  {n.label}
                </NavLink>
              ))}
            </nav>
            <div className="border-t border-linen p-4 text-[13px]">
              <p className="mb-3 truncate font-light text-soft">{profile.email}</p>
              <div className="flex items-center justify-between">
                <a href="/" target="_blank" rel="noopener noreferrer" className="btn-ghost -ml-3 gap-1.5 text-[12px]"><IconExternal width={14} height={14} /> View site</a>
                <button type="button" onClick={() => void signOut()} className="btn-ghost -mr-3 gap-1.5 text-[12px]"><IconLogout width={14} height={14} /> Sign out</button>
              </div>
            </div>
          </div>
        </aside>

        {navOpen && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-30 bg-ink/20 lg:hidden" onClick={() => setNavOpen(false)} />}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-linen bg-cream/90 px-4 backdrop-blur lg:hidden">
            <button type="button" className="btn-ghost -ml-2 px-2" aria-label={navOpen ? "Close menu" : "Open menu"} onClick={() => setNavOpen((v) => !v)}>
              {navOpen ? <IconClose /> : <IconMenu />}
            </button>
            <Logo className="h-4 w-auto text-ink" title="Numa Studio" />
          </header>
          <main className="p-5 sm:p-8 lg:p-10">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<OrdersAdmin />} />
              <Route path="products" element={<ProductsAdmin />} />
              <Route path="products/new" element={<ProductEdit />} />
              <Route path="products/:id" element={<ProductEdit />} />
              <Route path="categories" element={<CategoriesAdmin />} />
              <Route path="collections" element={<CollectionsAdmin />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="reviews" element={<ReviewsAdmin />} />
              <Route path="journal" element={<JournalAdmin />} />
              <Route path="journal/new" element={<JournalEdit />} />
              <Route path="journal/:id" element={<JournalEdit />} />
              <Route path="homepage" element={<HomepageEditor />} />
              <Route path="social" element={<SocialLinksAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
              <Route path="users" element={<UsersAdmin />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

function ResetPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("Use at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) setError(err.message);
    else onDone();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory p-4">
      <title>Numa Studio — Choose a new password</title>
      <div className="w-full max-w-sm border border-linen bg-cream p-8 shadow-sm sm:p-10">
        <Logo className="mx-auto h-6 w-auto text-ink" />
        <p className="mt-2 text-center text-[10px] uppercase tracking-[0.35em] text-soft">Choose a new password</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="new-password" className="label">New password</label>
            <input id="new-password" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
          </div>
          <div>
            <label htmlFor="confirm-password" className="label">Confirm password</label>
            <input id="confirm-password" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input" />
          </div>
          <div aria-live="polite">{error && <p role="alert" className="text-[14px] text-claydeep">{error}</p>}</div>
          <button type="submit" className="btn-primary w-full" disabled={busy}>{busy ? "Saving…" : "Save new password"}</button>
        </form>
      </div>
    </div>
  );
}
