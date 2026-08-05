import { useEffect, useRef } from "react";

const buttons: { cmd: string; label: string; arg?: string; title: string }[] = [
  { cmd: "bold", label: "B", title: "Bold" },
  { cmd: "italic", label: "I", title: "Italic" },
  { cmd: "formatBlock", arg: "h2", label: "H2", title: "Heading" },
  { cmd: "formatBlock", arg: "p", label: "¶", title: "Paragraph" },
  { cmd: "insertUnorderedList", label: "• List", title: "Bullet list" },
];

export default function RichText({ value, onChange, label }: { value: string; onChange: (html: string) => void; label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value;
  }, [value]);

  function exec(cmd: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function addLink() {
    const url = window.prompt("Link URL (https://…)");
    if (url) exec("createLink", url);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1 border border-b-0 border-pebble bg-ivory p-2" role="toolbar" aria-label={`Formatting for ${label}`}>
        {buttons.map((b) => (
          <button key={b.title} type="button" title={b.title} aria-label={b.title} onMouseDown={(e) => e.preventDefault()} onClick={() => exec(b.cmd, b.arg)} className="min-w-9 border border-transparent px-2.5 py-1.5 text-[13px] transition-colors hover:border-pebble hover:bg-white">
            {b.label}
          </button>
        ))}
        <button type="button" title="Add link" aria-label="Add link" onMouseDown={(e) => e.preventDefault()} onClick={addLink} className="min-w-9 border border-transparent px-2.5 py-1.5 text-[13px] transition-colors hover:border-pebble hover:bg-white">Link</button>
      </div>
      <div
        ref={ref}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        onInput={() => { if (ref.current) onChange(ref.current.innerHTML); }}
        className="prose-numa min-h-[260px] border border-pebble bg-white/80 p-4 focus:border-olive focus:outline-none [&_a]:text-olive [&_a]:underline [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
      />
    </div>
  );
}
