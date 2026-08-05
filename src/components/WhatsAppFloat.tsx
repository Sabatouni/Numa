import { motion } from "framer-motion";
import { useStore } from "../context/StoreContext";
import { waLink } from "../lib/whatsapp";
import { IconWhatsApp } from "./Icons";

export default function WhatsAppFloat() {
  const { contact, site } = useStore();
  const href = waLink(contact.whatsapp, `Hello ${site.name}! I have a question.`);
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.4, ease: [0.25, 0.6, 0.3, 1] }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-[#5b7052] text-cream shadow-lg shadow-ink/20 sm:bottom-7 sm:right-7"
    >
      <IconWhatsApp width={26} height={26} />
    </motion.a>
  );
}
