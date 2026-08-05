import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Profile } from "../../lib/types";
import { formatDate } from "../../lib/format";
import { Card, PageHeader, TableShell } from "../../components/admin/AdminUI";
import { Spinner } from "../../components/ui";

export default function UsersAdmin() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase.from("numa_profiles").select("*").order("created_at").then(({ data }) => {
      setProfiles((data as Profile[]) ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Users" subtitle="Team members with access to Numa Studio." />
      <TableShell head={["Email", "Name", "Role", "Added"]}>
        {profiles.map((p) => (
          <tr key={p.id}>
            <td className="px-4 py-3">{p.email}</td>
            <td className="px-4 py-3">{p.full_name ?? "—"}</td>
            <td className="px-4 py-3 capitalize">{p.role}</td>
            <td className="px-4 py-3 text-soft">{formatDate(p.created_at)}</td>
          </tr>
        ))}
      </TableShell>
      <Card className="mt-6">
        <h2 className="font-serif text-lg">Adding a team member</h2>
        <p className="mt-2 text-[14px] font-light leading-relaxed text-soft">
          For security, new studio users are created in the Supabase dashboard: Authentication → Users → “Add user”, then add a matching
          row in the <code className="bg-linen px-1">numa_profiles</code> table with their user id and email. Only emails present in
          <code className="bg-linen px-1"> numa_profiles</code> can access this studio — anyone else is signed out automatically.
        </p>
      </Card>
    </div>
  );
}
