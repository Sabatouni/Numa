import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { waLink } from "../lib/whatsapp";
import { IconMail, IconMapPin, IconPhone, IconWhatsApp, SocialIcon } from "./Icons";
import NewsletterForm from "./NewsletterForm";

const shopLinks = [
  { to: "/shop", label: "Shop All" },
  { to: "/new-arrivals", label: "New Arrivals" },
  { to: "/categories", label: "Categories" },
  { to: "/collections", label: "Collections" },
  { to: "/gallery", label: "Gallery" },
];
const aboutLinks = [
  { to: "/about", label: "Our Story" },
  { to: "/journal", label: "Journal" },
  { to: "/reviews", label: "Reviews" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
];
const policyLinks = [
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/shipping-policy", label: "Shipping Policy" },
  { to: "/returns", label: "Returns & Exchanges" },
];

export default function Footer() {
  const { site, contact, socials } = useStore();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-linen bg-ivory">
      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="font-serif text-2xl tracking-[0.3em]">{site.name.toUpperCase()}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.4em] text-soft">{site.tagline}</p>
            <p className="mt-5 max-w-xs text-[15px] font-light leading-relaxed text-soft">{site.description}</p>
            <ul className="mt-6 flex flex-wrap items-center gap-2" aria-label="Social media">
              {socials.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label ?? s.platform} className="flex h-10 w-10 items-center justify-center rounded-full border border-pebble text-soft transition-all duration-300 hover:border-olive hover:text-olive">
                    <SocialIcon platform={s.platform} width={17} height={17} />
                  </a>
                </li>
              ))}
              <li>
                <a href={waLink(contact.whatsapp)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-10 w-10 items-center justify-center rounded-full border border-pebble text-soft transition-all duration-300 hover:border-olive hover:text-olive">
                  <IconWhatsApp width={17} height={17} />
                </a>
              </li>
            </ul>
          </div>

          <nav className="lg:col-span-2" aria-label="Shop links">
            <h3 className="eyebrow mb-5 font-sans font-normal">Shop</h3>
            <ul className="space-y-3">
              {shopLinks.map((l) => (
                <li key={l.to}><Link to={l.to} className="text-[15px] font-light text-ink/75 transition-colors hover:text-ink">{l.label}</Link></li>
              ))}
            </ul>
          </nav>

          <nav className="lg:col-span-2" aria-label="About links">
            <h3 className="eyebrow mb-5 font-sans font-normal">Numa</h3>
            <ul className="space-y-3">
              {aboutLinks.map((l) => (
                <li key={l.to}><Link to={l.to} className="text-[15px] font-light text-ink/75 transition-colors hover:text-ink">{l.label}</Link></li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-4">
            <h3 className="eyebrow mb-5 font-sans font-normal">Stay close</h3>
            <p className="mb-4 text-[15px] font-light text-soft">Little arrivals, gentle offers, and stories from the island. No noise.</p>
            <NewsletterForm />
            <ul className="mt-6 space-y-2.5 text-[14px] font-light text-soft">
              <li>
                <a className="inline-flex items-center gap-2.5 transition-colors hover:text-ink" href={`tel:${contact.phone.replace(/\s/g, "")}`}><IconPhone width={15} height={15} /> {contact.phone}</a>
              </li>
              <li>
                <a className="inline-flex items-center gap-2.5 transition-colors hover:text-ink" href={`mailto:${contact.email}`}><IconMail width={15} height={15} /> {contact.email}</a>
              </li>
              <li>
                <a className="inline-flex items-start gap-2.5 transition-colors hover:text-ink" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`} target="_blank" rel="noopener noreferrer">
                  <IconMapPin width={15} height={15} className="mt-0.5 shrink-0" /> {contact.address}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-pebble/50 pt-8 sm:flex-row">
          <p className="text-[13px] font-light text-soft">© {year} {site.name} {site.tagline}. All rights reserved.</p>
          <nav aria-label="Policies">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {policyLinks.map((l) => (
                <li key={l.to}><Link to={l.to} className="text-[13px] font-light text-soft transition-colors hover:text-ink">{l.label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
