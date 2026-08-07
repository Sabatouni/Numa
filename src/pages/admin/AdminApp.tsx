import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { BrandLoader } from "../../components/ui";
import { ToastProvider } from "../../components/admin/AdminUI";
import { IconExternal, IconLogout, IconMenu, IconClose } from "../../components/Icons";
import { Logo } from "../../components/Logo";
import { AuthProvider, useAuth } from "../../context/AuthContext";
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

const baseNav = [
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
];
// Team/role management is Owner-only -- an Admin can run the studio day to
// day but shouldn't be able to grant or revoke access. Hidden entirely
// rather than shown-and-disabled.
const ownerOnlyNav = [{ to: "/admin/users", label: "Users" }];

export default function AdminApp() {
  return (
    <AuthProvider>
      <AdminAppInner />
    </AuthProvider>
  );
}

function AdminAppInner() {
  const { session, user, ready, hasAccess, isOwner, signOut: authSignOut } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const navigate = useNavigate();

  // Recovery-link detection is a UI concern independent of the permission
  // fetch in AuthProvider -- kept as its own light subscription.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <BrandLoader label="Checking access" />
      </div>
    );
  }
  if (recovery && session) return <ResetPassword onDone={() => setRecovery(false)} />;
  if (!session) return <Login />;
  if (!hasAccess) return <AccessDenied email={user?.email} onSignOut={authSignOut} />;

  async function signOut() {
    await authSignOut();
    navigate("/admin");
  }

  const nav = isOwner ? [...baseNav, ...ownerOnlyNav] : baseNav;

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
              <p className="mb-3 truncate font-light text-soft">{user?.email}</p>
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
              {/* Also route-guarded, not just nav-hidden: typing /admin/users
                  directly does not bypass the Owner check. */}
              <Route path="users" element={isOwner ? <UsersAdmin /> : <AccessDenied email={user?.email} onSignOut={authSignOut} reason="This page is Owner-only." />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

function AccessDenied({ email, onSignOut, reason }: { email?: string | null; onSignOut: () => void | Promise<void>; reason?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ivory p-6 text-center">
      <title>Numa Studio — Access denied</title>
      <Logo className="mb-6 h-6 w-auto text-ink" />
      <h1 className="font-serif text-2xl text-ink">No studio access on this account</h1>
      <p className="mt-3 max-w-sm text-[14px] font-light leading-relaxed text-soft">
        {reason ?? (
          <>
            {email} is signed in, but doesn't have a role in Numa Studio yet. Ask an existing Owner to grant
            access, then sign in again.
          </>
        )}
      </p>
      <button type="button" onClick={() => void onSignOut()} className="btn-secondary mt-7">
        Sign out
      </button>
    </div>
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
