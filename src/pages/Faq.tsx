import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import type { Faq as FaqType } from "../lib/types";
import { useStore } from "../context/StoreContext";
import { waLink } from "../lib/whatsapp";
import Seo from "../components/Seo";
import { SectionHeading, Skeleton } from "../components/ui";
import { IconChevronDown } from "../components/Icons";

export default function Faq() {
  const { contact, site } = useStore();
  const [faqs, setFaqs] = useState<FaqType[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase.from("numa_faqs").select("*").eq("active", true).order("sort_order")
      .then(({ data }) => { setFaqs((data as FaqType[]) ?? []); setLoading(false); });
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="container-page pt-8 sm:pt-12">
      <Seo title="FAQ | Numa Baby Essentials" description="Ordering on WhatsApp, delivery times, sizing, returns and everything else you might wonder about Numa." jsonLd={faqs.length ? jsonLd : undefined} />
      <SectionHeading eyebrow="Good to know" title="Frequently asked questions" />
      <div className="mx-auto max-w-2xl divide-y divide-linen border-y border-linen">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="my-4 h-12" />)
          : faqs.map((f) => {
              const isOpen = open === f.id;
              return (
                <div key={f.id}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : f.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="font-serif text-[1.15rem] text-ink">{f.question}</span>
                    <IconChevronDown width={18} height={18} className={`shrink-0 text-soft transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.6, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 pr-8 text-[15px] font-light leading-relaxed text-soft">{f.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
      </div>
      <div className="mt-12 text-center">
        <p className="font-light text-soft">Still wondering about something?</p>
        <a href={waLink(contact.whatsapp, `Hello ${site.name}! I have a question.`)} target="_blank" rel="noopener noreferrer" className="btn-outline mt-4">Ask us on WhatsApp</a>
      </div>
    </div>
  );
}
