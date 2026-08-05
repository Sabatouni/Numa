import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Logo } from "../../components/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError("Sign-in failed. Check your email and password.");
    setBusy(false);
  }

  async function forgotPassword() {
    if (!email.trim()) {
      setError("Enter your email above first, then tap “Forgot password?” again.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin`,
    });
    setBusy(false);
    if (err) setError("Could not send the reset email. Please try again.");
    else setNotice("Reset link sent — check your inbox and follow the link to choose a new password.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory p-4">
      <title>Numa Studio — Sign in</title>
      <div className="w-full max-w-sm border border-linen bg-cream p-8 shadow-sm sm:p-10">
        <Logo className="mx-auto h-6 w-auto text-ink" />
        <p className="mt-2 text-center text-[10px] uppercase tracking-[0.35em] text-soft">Studio access</p>
        <form onSubmit={signIn} className="mt-8 space-y-5">
          <div>
            <label htmlFor="admin-email" className="label">Email</label>
            <input id="admin-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
          </div>
          <div>
            <label htmlFor="admin-password" className="label">Password</label>
            <input id="admin-password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
          </div>
          <div aria-live="polite">
            {error && <p role="alert" className="text-[14px] text-claydeep">{error}</p>}
            {notice && <p className="text-[14px] text-olive">{notice}</p>}
          </div>
          <button type="submit" className="btn-primary w-full" disabled={busy}>{busy ? "Please wait…" : "Sign in"}</button>
        </form>
        <button type="button" onClick={() => void forgotPassword()} disabled={busy} className="btn-ghost mx-auto mt-4 block text-[12px]">
          Forgot password?
        </button>
        <p className="mt-4 text-center text-[12px] font-light text-soft">Access is limited to the Numa team.</p>
      </div>
    </div>
  );
}
