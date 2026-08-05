import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { supabase } from "../lib/supabase";
import { waLink } from "../lib/whatsapp";
import Seo from "../components/Seo";
import { FadeIn, SectionHeading } from "../components/ui";
import { IconClock, IconInstagram, IconMail, IconMapPin, IconPhone, IconWhatsApp } from "../components/Icons";

export default function Contact() {
  const { contact, site, socials } = useStore();
  const instagram = socials.find((s) => s.platform === "instagram");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const { error } = await supabase.from("numa_contact_messages").insert(form);
    setState(error ? "error" : "done");
    if (!error) setForm({ name: "", email: "", message: "" });
  }

  return (
    <div className="container-page pt-8 sm:pt-12">
      <Seo title="Contact | Numa Baby Essentials" description="Reach Numa on WhatsApp, email, phone or Instagram — or visit us in Stone Town, Zanzibar." />
      <SectionHeading eyebrow="We'd love to hear from you" title="Get in touch" />
      <div className="grid gap-12 lg:grid-cols-2">
        <FadeIn>
          <form onSubmit={submit} className="space-y-5" aria-label="Contact form">
            <div>
              <label htmlFor="contact-name" className="label">Your name</label>
              <input id="contact-name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" autoComplete="name" />
            </div>
            <div>
              <label htmlFor="contact-email" className="label">Email address</label>
              <input id="contact-email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input" autoComplete="email" />
            </div>
            <div>
              <label htmlFor="contact-message" className="label">Message</label>
              <textarea id="contact-message" required rows={5} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="input resize-none" />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={state === "busy" || state === "done"}>
              {state === "done" ? "Message sent — thank you ✓" : state === "busy" ? "Sending…" : "Send message"}
            </button>
            <div aria-live="polite">
              {state === "error" && <p role="alert" className="text-[14px] text-claydeep">Something went wrong — please try again or reach us on WhatsApp.</p>}
              {state === "done" && <p className="text-[14px] text-olive">We'll reply within one business day.</p>}
            </div>
          </form>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <a href={waLink(contact.whatsapp, `Hello ${site.name}!`)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 border border-linen bg-ivory/60 p-5 transition-all duration-300 hover:border-sage">
                <IconWhatsApp width={22} height={22} className="text-[#5b7052]" />
                <div><p className="text-[12px] uppercase tracking-[0.15em] text-soft">WhatsApp</p><p className="text-[15px] font-light">{contact.whatsapp_display}</p></div>
              </a>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-4 border border-linen bg-ivory/60 p-5 transition-all duration-300 hover:border-sage">
                <IconPhone width={20} height={20} className="text-olive" />
                <div><p className="text-[12px] uppercase tracking-[0.15em] text-soft">Phone</p><p className="text-[15px] font-light">{contact.phone}</p></div>
              </a>
              <a href={`mailto:${contact.email}`} className="flex items-center gap-4 border border-linen bg-ivory/60 p-5 transition-all duration-300 hover:border-sage">
                <IconMail width={20} height={20} className="text-olive" />
                <div><p className="text-[12px] uppercase tracking-[0.15em] text-soft">Email</p><p className="text-[15px] font-light break-all">{contact.email}</p></div>
              </a>
              {instagram && (
                <a href={instagram.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 border border-linen bg-ivory/60 p-5 transition-all duration-300 hover:border-sage">
                  <IconInstagram width={20} height={20} className="text-claydeep" />
                  <div><p className="text-[12px] uppercase tracking-[0.15em] text-soft">Instagram</p><p className="text-[15px] font-light">@{instagram.url.replace(/\/$/, "").split("/").pop()}</p></div>
                </a>
              )}
            </div>

            <div className="border border-linen bg-ivory/60 p-5">
              <div className="flex items-start gap-4">
                <IconClock width={20} height={20} className="mt-0.5 text-olive" />
                <div>
                  <p className="text-[12px] uppercase tracking-[0.15em] text-soft">Business hours</p>
                  <ul className="mt-2 space-y-1">
                    {contact.business_hours.map((h) => (
                      <li key={h.days} className="flex justify-between gap-8 text-[15px] font-light"><span>{h.days}</span><span className="text-soft">{h.hours}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="border border-linen bg-ivory/60 p-5">
              <div className="flex items-start gap-4">
                <IconMapPin width={20} height={20} className="mt-0.5 text-olive" />
                <div>
                  <p className="text-[12px] uppercase tracking-[0.15em] text-soft">Find us</p>
                  <p className="mt-1 text-[15px] font-light">{contact.address}</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden border border-linen">
              <iframe
                title={`Map showing ${contact.map_query}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(contact.map_query)}&output=embed`}
                className="h-72 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
