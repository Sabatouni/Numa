import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("busy");
    const { error } = await supabase.from("numa_newsletter_subscribers").insert({ email: email.trim().toLowerCase() });
    if (error && !error.message.includes("duplicate")) setState("error");
    else { setState("done"); setEmail(""); }
  }

  return (
    <form onSubmit={subscribe} className="flex max-w-sm" aria-label="Newsletter signup">
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="input rounded-none border-r-0"
        disabled={state === "busy" || state === "done"}
      />
      <button type="submit" className="btn-primary shrink-0" disabled={state === "busy" || state === "done"}>
        {state === "done" ? "Joined ✓" : state === "busy" ? "…" : "Join"}
      </button>
      {state === "error" && <p role="alert" className="sr-only">Subscription failed, please try again.</p>}
    </form>
  );
}
