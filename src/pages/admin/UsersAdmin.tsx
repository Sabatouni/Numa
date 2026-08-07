import { useEffect, useState } from "react";
import { fetchApplicationMembers, grantRoleByEmail, revokeRole, type ApplicationMember } from "../../lib/permissions";
import { formatDate } from "../../lib/format";
import { Card, PageHeader, TableShell, useToast, ConfirmButton } from "../../components/admin/AdminUI";
import { Spinner } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

const APP_SLUG = "numa-web";
const ROLES = ["admin", "owner"] as const; // no Worker tier for numa-web

export default function UsersAdmin() {
  const { user } = useAuth();
  const toast = useToast();
  const [members, setMembers] = useState<ApplicationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("admin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setMembers(await fetchApplicationMembers(APP_SLUG));
    } catch (err) {
      toast((err as Error).message, "err");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function submitGrant(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return;
    setBusy(true);
    try {
      await grantRoleByEmail(email.trim(), APP_SLUG, role);
      setEmail("");
      await load();
      toast("Access granted ✓", "ok");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRevoke(userId: string) {
    try {
      await revokeRole(userId, APP_SLUG);
      await load();
      toast("Access revoked", "ok");
    } catch (err) {
      toast((err as Error).message, "err");
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Users" subtitle="Team members with access to Numa Studio." />

      <TableShell head={["Email", "Name", "Role", "Added", ""]}>
        {members.map((m) => (
          <tr key={m.user_id}>
            <td className="px-4 py-3">{m.email}</td>
            <td className="px-4 py-3">{m.full_name ?? "—"}</td>
            <td className="px-4 py-3 capitalize">{m.role_slug}</td>
            <td className="px-4 py-3 text-soft">{formatDate(m.granted_at)}</td>
            <td className="px-4 py-3 text-right">
              {m.user_id !== user?.id && (
                <ConfirmButton onConfirm={() => void handleRevoke(m.user_id)}>Revoke</ConfirmButton>
              )}
            </td>
          </tr>
        ))}
        {members.length === 0 && (
          <tr>
            <td colSpan={5} className="px-4 py-6 text-center text-soft">No team members yet.</td>
          </tr>
        )}
      </TableShell>

      <Card className="mt-6 max-w-lg">
        <h2 className="font-serif text-lg">Grant access</h2>
        <p className="mt-2 text-[14px] font-light leading-relaxed text-soft">
          Enter the email of an existing account (they must already have signed up, or been created in
          Supabase Auth) and choose a role. Granting a role a second time replaces their existing one.
        </p>
        <form onSubmit={submitGrant} className="mt-5 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="grant-email" className="label">Email</label>
            <input
              id="grant-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="teammate@numa.co"
            />
          </div>
          <div>
            <label htmlFor="grant-role" className="label">Role</label>
            <select id="grant-role" value={role} onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])} className="input">
              {ROLES.map((r) => (
                <option key={r} value={r}>{r[0].toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? "Granting…" : "Grant access"}
          </button>
        </form>
        {error && <p role="alert" className="mt-3 text-[14px] text-claydeep">{error}</p>}
      </Card>
    </div>
  );
}
