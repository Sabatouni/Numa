import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import Seo from "../components/Seo";
import LazyImage from "../components/LazyImage";
import { FadeIn, SectionHeading } from "../components/ui";

export default function About() {
  const { about, site } = useStore();
  return (
    <div className="container-page pt-8 sm:pt-12">
      <Seo title="Our Story | Numa Baby Essentials" description="Numa began in Stone Town, Zanzibar with a simple belief: the softest years deserve the softest things." />
      <SectionHeading eyebrow="Our story" title="Made for little moments that last forever." />
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <FadeIn>
          <LazyImage
            src="https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1200&auto=format&fit=crop"
            alt="A baby in soft ivory cotton"
            aspect="aspect-[4/5]"
            className="rounded-tr-[6rem]"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="prose-numa">
            {about.story.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {about.values.map((v) => (
              <div key={v.title} className="border-l-2 border-sand pl-4">
                <h3 className="text-[12px] font-sans font-normal uppercase tracking-[0.18em]">{v.title}</h3>
                <p className="mt-1.5 text-[14px] font-light text-soft">{v.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link to="/shop" className="btn-primary">Shop {site.name}</Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
