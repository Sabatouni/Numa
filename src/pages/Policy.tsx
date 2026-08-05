import { useStore } from "../context/StoreContext";
import Seo from "../components/Seo";
import { SectionHeading } from "../components/ui";

const meta = {
  privacy: { title: "Privacy Policy", eyebrow: "Your data, respected" },
  shipping: { title: "Shipping Policy", eyebrow: "From our hands to yours" },
  returns: { title: "Returns & Exchanges", eyebrow: "Loved, or returned" },
} as const;

export default function Policy({ kind }: { kind: keyof typeof meta }) {
  const { policies } = useStore();
  const text = policies[kind];
  const { title, eyebrow } = meta[kind];

  return (
    <div className="container-page pt-8 sm:pt-12">
      <Seo title={`${title} | Numa Baby Essentials`} description={`${title} for Numa Baby Essentials.`} />
      <SectionHeading eyebrow={eyebrow} title={title} />
      <div className="prose-numa mx-auto max-w-2xl">
        {text.split("\n\n").map((para, i) => (
          <p key={i} className="whitespace-pre-line">{para}</p>
        ))}
      </div>
    </div>
  );
}
