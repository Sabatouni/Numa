import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../lib/types";
import { money, orderStatusLabel } from "../lib/format";
import { buildOrderMessage, waLink } from "../lib/whatsapp";
import { generateOrderNumber, generateTrackingToken } from "../lib/order";
import { isValidEmail, isValidName, isValidPhone } from "../lib/validation";
import { supabase } from "../lib/supabase";
import { useStore } from "../context/StoreContext";
import { Modal } from "./ui";
import { IconCheck, IconMinus, IconPlus, IconWhatsApp } from "./Icons";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://numa.family";
const CUSTOMER_PREFILL_KEY = "numa-last-customer";

interface CustomerDetails {
  name: string;
  whatsapp: string;
  mobile: string;
  email: string;
}

const emptyCustomer: CustomerDetails = { name: "", whatsapp: "", mobile: "", email: "" };

function loadPrefill(): CustomerDetails {
  try {
    const raw = localStorage.getItem(CUSTOMER_PREFILL_KEY);
    if (!raw) return emptyCustomer;
    const parsed = JSON.parse(raw) as Partial<CustomerDetails>;
    return {
      name: parsed.name ?? "",
      whatsapp: parsed.whatsapp ?? "",
      mobile: parsed.mobile ?? "",
      email: parsed.email ?? "",
    };
  } catch {
    return emptyCustomer;
  }
}

/** Saves only the four identity fields, under a NUMA-specific key, purely
 *  as a same-browser convenience prefill for a repeat single-item order --
 *  never the order itself, never a tracking token, nothing else. */
function savePrefill(c: CustomerDetails) {
  try {
    localStorage.setItem(CUSTOMER_PREFILL_KEY, JSON.stringify(c));
  } catch {
    /* localStorage unavailable (private mode, quota) -- not essential, ignore */
  }
}

type Step = "details" | "submitting" | "confirmed" | "error";

interface Result {
  orderNumber: string;
  trackingToken: string;
  waBlocked: boolean;
  waUrl: string;
}

export default function OrderPanel({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { site, contact } = useStore();
  const variants = product.numa_product_variants;
  const colors = useMemo(() => [...new Map(variants.map((v) => [v.color, v])).values()], [variants]);
  const [color, setColor] = useState(colors[0]?.color ?? "");
  const sizes = useMemo(() => variants.filter((v) => v.color === color), [variants, color]);
  const [sizeId, setSizeId] = useState<string>("");
  const selected = sizes.find((v) => v.id === sizeId) ?? sizes.find((v) => v.stock > 0) ?? sizes[0];
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const inStock = (selected?.stock ?? 0) > 0;

  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<Step>("details");
  const [customer, setCustomer] = useState<CustomerDetails>(emptyCustomer);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submittingRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  function selectColor(c: string) {
    setColor(c);
    setSizeId("");
    setQty(1);
  }

  function openDetails() {
    setCustomer(loadPrefill());
    setFieldErrors({});
    setErrorMessage(null);
    setResult(null);
    setStep("details");
    setModalOpen(true);
  }

  function closeModal() {
    // Closing after a confirmed/failed attempt starts the panel fresh for a
    // possible next order; closing mid-form just dismisses it.
    setModalOpen(false);
    if (step === "confirmed") {
      setQty(1);
      setNote("");
    }
  }

  function validate(c: CustomerDetails): Partial<Record<keyof CustomerDetails, string>> {
    const errors: Partial<Record<keyof CustomerDetails, string>> = {};
    if (!isValidName(c.name)) errors.name = "Enter your full name.";
    if (!isValidPhone(c.whatsapp)) errors.whatsapp = "Enter a valid WhatsApp number.";
    if (!isValidPhone(c.mobile)) errors.mobile = "Enter a valid mobile number.";
    if (!isValidEmail(c.email)) errors.email = "Enter a valid email address.";
    return errors;
  }

  async function performInsert(payload: {
    order_number: string;
    tracking_token: string;
    whatsapp_message: string;
    customer: CustomerDetails;
  }) {
    return supabase.from("numa_orders").insert({
      product_id: product.id,
      product_name: product.name,
      size: selected?.size ?? null,
      color: selected?.color ?? null,
      quantity: qty,
      price: product.price * qty,
      customer_note: note.trim() || null,
      customer_name: payload.customer.name.trim(),
      customer_whatsapp: payload.customer.whatsapp.trim(),
      customer_mobile: payload.customer.mobile.trim(),
      customer_email: payload.customer.email.trim(),
      order_number: payload.order_number,
      tracking_token: payload.tracking_token,
      whatsapp_message: payload.whatsapp_message,
      status: "new",
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    // Guards a second Enter/click fired before React re-renders the
    // disabled button -- must run before anything else, synchronously.
    if (submittingRef.current) return;

    const errors = validate(customer);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    submittingRef.current = true;
    setFieldErrors({});

    // Everything from here to window.open() is synchronous -- no await,
    // no network call -- so it stays inside the same user gesture iOS
    // Safari requires for window.open() to be allowed.
    const orderNumber = generateOrderNumber();
    const trackingToken = generateTrackingToken();
    const trackingUrl = `${SITE_URL}/track/${trackingToken}`;
    const message = buildOrderMessage({
      productName: product.name,
      size: selected?.size,
      color: selected?.color,
      quantity: qty,
      unitPriceLabel: money(product.price, site.currency_symbol),
      totalPriceLabel: money(product.price * qty, site.currency_symbol),
      orderNumber,
      customerName: customer.name.trim(),
      customerWhatsapp: customer.whatsapp.trim(),
      customerMobile: customer.mobile.trim(),
      customerEmail: customer.email.trim(),
      trackingUrl,
      note: note.trim() || undefined,
    });
    const waUrl = waLink(contact.whatsapp, message);
    const waWindow = window.open(waUrl, "_blank", "noopener,noreferrer");

    setStep("submitting");

    void performInsert({ order_number: orderNumber, tracking_token: trackingToken, whatsapp_message: message, customer }).then(({ error }) => {
      submittingRef.current = false;
      if (!mountedRef.current) return;
      const outcome: Result = { orderNumber, trackingToken, waBlocked: !waWindow, waUrl };
      if (error) {
        setResult(outcome);
        setErrorMessage(error.message);
        setStep("error");
        return;
      }
      savePrefill(customer);
      setResult(outcome);
      setStep("confirmed");
    });
  }

  function retry() {
    if (!result || submittingRef.current) return;
    submittingRef.current = true;
    setStep("submitting");
    const message = buildOrderMessage({
      productName: product.name,
      size: selected?.size,
      color: selected?.color,
      quantity: qty,
      unitPriceLabel: money(product.price, site.currency_symbol),
      totalPriceLabel: money(product.price * qty, site.currency_symbol),
      orderNumber: result.orderNumber,
      customerName: customer.name.trim(),
      customerWhatsapp: customer.whatsapp.trim(),
      customerMobile: customer.mobile.trim(),
      customerEmail: customer.email.trim(),
      trackingUrl: `${SITE_URL}/track/${result.trackingToken}`,
      note: note.trim() || undefined,
    });
    void performInsert({ order_number: result.orderNumber, tracking_token: result.trackingToken, whatsapp_message: message, customer }).then(({ error }) => {
      submittingRef.current = false;
      if (!mountedRef.current) return;
      if (error) {
        setErrorMessage(error.message);
        setStep("error");
        return;
      }
      savePrefill(customer);
      setStep("confirmed");
    });
  }

  return (
    <div>
      {colors.length > 0 && (
        <fieldset className="mb-6">
          <legend className="label">Color — {color}</legend>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((v) => (
              <button
                key={v.color}
                type="button"
                onClick={() => selectColor(v.color)}
                aria-label={`Color ${v.color}`}
                aria-pressed={v.color === color}
                className={`h-9 w-9 rounded-full border-2 transition-all duration-300 ${v.color === color ? "border-olive scale-110" : "border-pebble hover:border-taupe"}`}
                style={{ backgroundColor: v.color_hex }}
              />
            ))}
          </div>
        </fieldset>
      )}

      {sizes.length > 0 && (
        <fieldset className="mb-6">
          <legend className="label">Size</legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={v.stock === 0}
                onClick={() => setSizeId(v.id)}
                aria-pressed={selected?.id === v.id}
                className={`border px-4 py-2.5 text-[13px] tracking-wide transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through ${selected?.id === v.id ? "border-olive bg-olive text-cream" : "border-pebble text-ink hover:border-olive"}`}
              >
                {v.size}
              </button>
            ))}
          </div>
          <p className="mt-2.5 text-[13px] font-light text-soft" aria-live="polite">
            {inStock ? (selected && selected.stock <= 3 ? `Only ${selected.stock} left in stock` : "In stock — ready to ship") : "Currently sold out in this option"}
          </p>
        </fieldset>
      )}

      <div className="mb-6 flex items-center gap-6">
        <div>
          <span className="label" id={`qty-label-${product.id}`}>Quantity</span>
          <div className="flex items-center border border-pebble" role="group" aria-labelledby={`qty-label-${product.id}`}>
            <button type="button" className="px-3.5 py-2.5 text-soft transition-colors hover:text-ink" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}><IconMinus width={15} height={15} /></button>
            <span className="w-8 text-center text-[15px]" aria-live="polite">{qty}</span>
            <button type="button" className="px-3.5 py-2.5 text-soft transition-colors hover:text-ink" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(selected?.stock || 10, q + 1))}><IconPlus width={15} height={15} /></button>
          </div>
        </div>
        <div>
          <span className="label">Total</span>
          <p className="font-serif text-2xl leading-[2.65rem]">{money(product.price * qty, site.currency_symbol)}</p>
        </div>
      </div>

      {!compact && (
        <div className="mb-6">
          <label htmlFor={`note-${product.id}`} className="label">Notes for us (optional)</label>
          <textarea
            id={`note-${product.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Gift wrapping, delivery preferences, questions…"
            className="input resize-none"
          />
        </div>
      )}

      <button type="button" onClick={openDetails} disabled={!inStock} className="btn-primary w-full py-4">
        <IconWhatsApp width={18} height={18} /> Order on WhatsApp
      </button>
      <p className="mt-3 text-center text-[13px] font-light text-soft">
        Opens WhatsApp with your order details ready to send. We confirm delivery & payment in the chat.
      </p>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        label={step === "confirmed" ? "Order received" : "Your details"}
        stack={compact}
      >
        <div className="p-7 sm:p-9">
          {(step === "details" || step === "submitting") && (
            <OrderDetailsForm
              product={product}
              selected={selected}
              qty={qty}
              site={site}
              customer={customer}
              setCustomer={setCustomer}
              fieldErrors={fieldErrors}
              submitting={step === "submitting"}
              onSubmit={submit}
            />
          )}
          {step === "confirmed" && result && (
            <OrderConfirmed
              customerName={customer.name.trim()}
              orderNumber={result.orderNumber}
              trackingToken={result.trackingToken}
              waBlocked={result.waBlocked}
              waUrl={result.waUrl}
              onContinue={closeModal}
            />
          )}
          {step === "error" && result && (
            <OrderFailed
              orderNumber={result.orderNumber}
              waBlocked={result.waBlocked}
              waUrl={result.waUrl}
              message={errorMessage}
              onRetry={retry}
              onClose={closeModal}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}

interface DetailsFormProps {
  product: Product;
  selected: Product["numa_product_variants"][number] | undefined;
  qty: number;
  site: { currency_symbol: string };
  customer: CustomerDetails;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerDetails>>;
  fieldErrors: Partial<Record<keyof CustomerDetails, string>>;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

function OrderDetailsForm({ product, selected, qty, site, customer, setCustomer, fieldErrors, submitting, onSubmit }: DetailsFormProps) {
  function field(key: keyof CustomerDetails, value: string) {
    setCustomer((c) => ({ ...c, [key]: value }));
  }

  return (
    <form onSubmit={onSubmit} aria-label="Order details" noValidate>
      <p className="eyebrow mb-2">Almost there</p>
      <h2 className="font-serif text-2xl leading-tight sm:text-3xl">Your details</h2>
      <div className="mt-4 border-y border-linen py-3 text-[14px] font-light text-soft">
        {product.name}
        {[selected?.size, selected?.color].filter(Boolean).length > 0 && (
          <> — {[selected?.size, selected?.color].filter(Boolean).join(" · ")}</>
        )}
        {" · "}Qty {qty} · <span className="text-ink">{money(product.price * qty, site.currency_symbol)}</span>
      </div>

      <div className="mt-6 space-y-4">
        <FormField id="cust-name" label="Full name" error={fieldErrors.name}>
          <input
            id="cust-name"
            required
            autoComplete="name"
            value={customer.name}
            onChange={(e) => field("name", e.target.value)}
            className="input"
            disabled={submitting}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="cust-whatsapp" label="WhatsApp number" hint="e.g. 255712345678" error={fieldErrors.whatsapp}>
            <input
              id="cust-whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={customer.whatsapp}
              onChange={(e) => field("whatsapp", e.target.value)}
              className="input"
              disabled={submitting}
            />
          </FormField>
          <FormField id="cust-mobile" label="Mobile number" hint="If different from WhatsApp" error={fieldErrors.mobile}>
            <input
              id="cust-mobile"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={customer.mobile}
              onChange={(e) => field("mobile", e.target.value)}
              className="input"
              disabled={submitting}
            />
          </FormField>
        </div>
        <FormField id="cust-email" label="Email" error={fieldErrors.email}>
          <input
            id="cust-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={customer.email}
            onChange={(e) => field("email", e.target.value)}
            className="input"
            disabled={submitting}
          />
        </FormField>
      </div>

      <button type="submit" disabled={submitting} className="btn-primary mt-7 w-full py-4">
        {submitting ? "Preparing your order…" : <><IconWhatsApp width={18} height={18} /> Continue to WhatsApp</>}
      </button>
      <p className="mt-3 text-center text-[12px] font-light text-soft">
        Your WhatsApp opens straight away; we save your order at the same time.
      </p>
    </form>
  );
}

function FormField({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      <div aria-live="polite">
        {error ? (
          <p role="alert" className="mt-1.5 text-[12px] text-claydeep">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-[12px] font-light text-soft">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

function OrderConfirmed({ customerName, orderNumber, trackingToken, waBlocked, waUrl, onContinue }: {
  customerName: string;
  orderNumber: string;
  trackingToken: string;
  waBlocked: boolean;
  waUrl: string;
  onContinue: () => void;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-sage/30 text-olive">
        <IconCheck width={22} height={22} />
      </div>
      <p className="eyebrow mb-2">Order received</p>
      <h2 className="font-serif text-2xl leading-tight sm:text-3xl">Thank you{customerName ? `, ${customerName}` : ""}.</h2>
      <p className="mt-4 text-[13px] uppercase tracking-[0.16em] text-soft">Order</p>
      <p className="font-serif text-xl">{orderNumber}</p>
      <p className="mt-3 text-[13px] uppercase tracking-[0.16em] text-soft">Status</p>
      <p className="font-serif text-xl">{orderStatusLabel("new")}</p>
      <p className="mx-auto mt-5 max-w-sm text-[14px] font-light leading-relaxed text-ink/85">
        We've received your order request. We'll contact you on WhatsApp after reviewing it.
      </p>

      {waBlocked && (
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-outline mt-6 w-full justify-center">
          <IconWhatsApp width={16} height={16} /> Open WhatsApp to send your order
        </a>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link to={`/track/${trackingToken}`} onClick={onContinue} className="btn-outline justify-center">Track Order</Link>
        <button type="button" onClick={onContinue} className="btn-primary justify-center">Continue Shopping</button>
      </div>
    </div>
  );
}

function OrderFailed({ orderNumber, waBlocked, waUrl, message, onRetry, onClose }: {
  orderNumber: string;
  waBlocked: boolean;
  waUrl: string;
  message: string | null;
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <div className="text-center">
      <p className="eyebrow mb-2 text-claydeep">We hit a snag</p>
      <h2 className="font-serif text-2xl leading-tight sm:text-3xl">Your order wasn't saved</h2>
      <p className="mx-auto mt-4 max-w-sm text-[14px] font-light leading-relaxed text-ink/85">
        Your WhatsApp message is ready{waBlocked ? "" : " and should have opened in a new tab"} — please send it so
        we can help you directly. We'll keep trying to save it here too.
      </p>
      <p className="mt-4 text-[12px] uppercase tracking-[0.16em] text-soft">Reference (not yet saved)</p>
      <p className="font-serif text-lg">{orderNumber}</p>
      {message && <p role="alert" className="mt-3 text-[12px] text-claydeep">{message}</p>}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-outline justify-center">
          <IconWhatsApp width={16} height={16} /> Open WhatsApp
        </a>
        <button type="button" onClick={onRetry} className="btn-primary justify-center">Retry saving</button>
      </div>
      <button type="button" onClick={onClose} className="btn-ghost mt-4">Close</button>
    </div>
  );
}
