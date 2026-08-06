import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { Logo } from "../components/Logo";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
      <Seo title="Page not found | Numa Baby Essentials" description="This page seems to have wandered off for a nap." />
      <Logo className="mb-8 h-6 w-auto text-ink/70" />
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Gone for a little nap.</h1>
      <p className="mt-4 max-w-md font-light text-soft">The page you're looking for has wandered off — much like a toddler at bedtime. Let's take you somewhere cosy instead.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link to="/" className="btn-primary">Back home</Link>
        <Link to="/shop" className="btn-outline">Browse the shop</Link>
      </div>
    </div>
  );
}
