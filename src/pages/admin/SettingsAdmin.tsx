import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { AboutSettings, ContactSettings, PolicySettings, SiteSettings } from "../../lib/types";
import { Card, Field, PageHeader, useToast } from "../../components/admin/AdminUI";
import { Spinner } from "../../components/ui";

export default function SettingsAdmin() {
  const toast = useToast();
  const [site, setSite] = useState<SiteSettings | null>(null);
  const [contact, setContact] = useState<ContactSettings | null>(null);
  const [policies, setPolicies] = useState<PolicySettings | null>(null);
  const [about, setAbout] = useState<AboutSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void supabase.from("numa_settings").select("key,value").then(({ data }) => {
      for (const row of data ?? []) {
        if (row.key === "site") setSite(row.value as SiteSettings);
        if (row.key === "contact") setContact(row.value as ContactSettings);
        if (row.key === "policies") setPolicies(row.value as PolicySettings);
        if (row.key === "about") setAbout(row.value as AboutSettings);
      }
    });
  }, []);

  async function saveAll() {
    if (!site || !contact || !policies || !about) return;
    setSaving(true);
    const updates = [
      { key: "site", value: site },
      { key: "contact", value: contact },
      { key: "policies", value: policies },
      { key: "about", value: about },
    ];
    const { error } = await supabase.from("numa_settings").upsert(updates.map((u) => ({ ...u, updated_at: new Date().toISOString() })));
    setSaving(false);
    if (error) toast(error.message, "err");
    else toast("Settings saved — refresh the storefront to see changes");
  }

  if (!site || !contact || !policies || !about) return <Spinner />;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Brand, contact, ordering and policy content." actions={<button type="button" className="btn-primary py-2.5" disabled={saving} onClick={() => void saveAll()}>{saving ? "Saving…" : "Save all settings"}</button>} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="font-serif text-xl">Brand</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Site name"><input className="input" value={site.name} onChange={(e) => setSite({ ...site, name: e.target.value })} /></Field>
            <Field label="Tagline"><input className="input" value={site.tagline} onChange={(e) => setSite({ ...site, tagline: e.target.value })} /></Field>
          </div>
          <Field label="Description"><textarea rows={2} className="input resize-none" value={site.description} onChange={(e) => setSite({ ...site, description: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Currency code"><input className="input" value={site.currency} onChange={(e) => setSite({ ...site, currency: e.target.value })} /></Field>
            <Field label="Currency symbol"><input className="input" value={site.currency_symbol} onChange={(e) => setSite({ ...site, currency_symbol: e.target.value })} /></Field>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-serif text-xl">Contact & ordering</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp number (digits only, with country code)" hint="Used for all Order buttons — e.g. 255712345678">
              <input className="input" value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value.replace(/[^0-9]/g, "") })} />
            </Field>
            <Field label="WhatsApp display"><input className="input" value={contact.whatsapp_display} onChange={(e) => setContact({ ...contact, whatsapp_display: e.target.value })} /></Field>
            <Field label="Phone"><input className="input" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></Field>
            <Field label="Email"><input className="input" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></Field>
          </div>
          <Field label="Address"><input className="input" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></Field>
          <Field label="Map search query" hint="What the embedded Google Map searches for"><input className="input" value={contact.map_query} onChange={(e) => setContact({ ...contact, map_query: e.target.value })} /></Field>
          <div>
            <span className="label">Business hours</span>
            {contact.business_hours.map((h, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input className="input" value={h.days} aria-label="Days" onChange={(e) => setContact({ ...contact, business_hours: contact.business_hours.map((x, xi) => (xi === i ? { ...x, days: e.target.value } : x)) })} />
                <input className="input" value={h.hours} aria-label="Hours" onChange={(e) => setContact({ ...contact, business_hours: contact.business_hours.map((x, xi) => (xi === i ? { ...x, hours: e.target.value } : x)) })} />
                <button type="button" className="btn-ghost text-claydeep" onClick={() => setContact({ ...contact, business_hours: contact.business_hours.filter((_, xi) => xi !== i) })}>×</button>
              </div>
            ))}
            <button type="button" className="btn-ghost -ml-4" onClick={() => setContact({ ...contact, business_hours: [...contact.business_hours, { days: "", hours: "" }] })}>Add row</button>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-serif text-xl">About page</h2>
          <Field label="Story" hint="Separate paragraphs with a blank line"><textarea rows={6} className="input resize-none" value={about.story} onChange={(e) => setAbout({ ...about, story: e.target.value })} /></Field>
          <div>
            <span className="label">Values (shown on homepage & about)</span>
            {about.values.map((v, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input className="input w-48" value={v.title} aria-label="Value title" onChange={(e) => setAbout({ ...about, values: about.values.map((x, xi) => (xi === i ? { ...x, title: e.target.value } : x)) })} />
                <input className="input" value={v.text} aria-label="Value text" onChange={(e) => setAbout({ ...about, values: about.values.map((x, xi) => (xi === i ? { ...x, text: e.target.value } : x)) })} />
                <button type="button" className="btn-ghost text-claydeep" onClick={() => setAbout({ ...about, values: about.values.filter((_, xi) => xi !== i) })}>×</button>
              </div>
            ))}
            <button type="button" className="btn-ghost -ml-4" onClick={() => setAbout({ ...about, values: [...about.values, { title: "", text: "" }] })}>Add value</button>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-serif text-xl">Policies</h2>
          <Field label="Privacy policy"><textarea rows={5} className="input resize-none" value={policies.privacy} onChange={(e) => setPolicies({ ...policies, privacy: e.target.value })} /></Field>
          <Field label="Shipping policy"><textarea rows={5} className="input resize-none" value={policies.shipping} onChange={(e) => setPolicies({ ...policies, shipping: e.target.value })} /></Field>
          <Field label="Returns policy"><textarea rows={5} className="input resize-none" value={policies.returns} onChange={(e) => setPolicies({ ...policies, returns: e.target.value })} /></Field>
        </Card>
      </div>
    </div>
  );
}
