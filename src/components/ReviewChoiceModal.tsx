import { useStore } from "../context/StoreContext";
import { buildReviewMessage, waLink } from "../lib/whatsapp";
import { IconInstagram, IconWhatsApp } from "./Icons";
import { Modal } from "./ui";

export default function ReviewChoiceModal() {
  const { reviewModalOpen, setReviewModalOpen, contact, socials, site } = useStore();
  const instagram = socials.find((s) => s.platform === "instagram");
  const igHandle = instagram ? instagram.url.replace(/\/$/, "").split("/").pop() : null;
  const igDm = igHandle ? `https://ig.me/m/${igHandle}` : (instagram?.url ?? "https://instagram.com");
  const wa = waLink(contact.whatsapp, buildReviewMessage(site.name));

  return (
    <Modal open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} label="Choose how to leave your review">
      <div className="p-8 sm:p-10 text-center">
        <p className="eyebrow mb-3">We'd love to hear from you</p>
        <h2 className="font-serif text-3xl leading-tight">How would you like to<br />leave your review?</h2>
        <p className="mt-4 text-[15px] font-light text-soft">Choose whichever feels easiest — we read every single one.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            href={igDm}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setReviewModalOpen(false)}
            className="group flex flex-col items-center gap-3 border border-pebble p-6 transition-all duration-300 hover:border-clay hover:bg-linen"
          >
            <IconInstagram width={28} height={28} className="text-claydeep" />
            <span className="text-[13px] uppercase tracking-[0.15em]">Instagram DM</span>
            <span className="text-[13px] font-light text-soft">Message us {igHandle ? `@${igHandle}` : "on Instagram"}</span>
          </a>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setReviewModalOpen(false)}
            className="group flex flex-col items-center gap-3 border border-pebble p-6 transition-all duration-300 hover:border-sage hover:bg-linen"
          >
            <IconWhatsApp width={28} height={28} className="text-[#5b7052]" />
            <span className="text-[13px] uppercase tracking-[0.15em]">WhatsApp</span>
            <span className="text-[13px] font-light text-soft">Chat with us directly</span>
          </a>
        </div>
      </div>
    </Modal>
  );
}
