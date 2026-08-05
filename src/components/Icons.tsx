import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P): P => ({ width: 20, height: 20, fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24", "aria-hidden": true, ...p });

export const IconSearch = (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const IconHeart = (p: P) => (<svg {...base(p)}><path d="M12 20.5c-5.2-3.4-8.5-6.6-8.5-10A4.6 4.6 0 0 1 8.1 5.8c1.6 0 3.1.8 3.9 2.2.8-1.4 2.3-2.2 3.9-2.2a4.6 4.6 0 0 1 4.6 4.7c0 3.4-3.3 6.6-8.5 10Z" /></svg>);
export const IconMenu = (p: P) => (<svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
export const IconClose = (p: P) => (<svg {...base(p)}><path d="m6 6 12 12M18 6 6 18" /></svg>);
export const IconChevronDown = (p: P) => (<svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>);
export const IconChevronLeft = (p: P) => (<svg {...base(p)}><path d="m15 6-6 6 6 6" /></svg>);
export const IconChevronRight = (p: P) => (<svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>);
export const IconStar = (p: P) => (<svg {...base({ ...p, fill: p.fill ?? "currentColor", stroke: "none" })}><path d="m12 2.7 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.5l-5.8 3 1.1-6.4L2.6 9.5l6.5-.9L12 2.7Z" /></svg>);
export const IconPlus = (p: P) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const IconMinus = (p: P) => (<svg {...base(p)}><path d="M5 12h14" /></svg>);
export const IconTrash = (p: P) => (<svg {...base(p)}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>);
export const IconEdit = (p: P) => (<svg {...base(p)}><path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3ZM13.5 6.5l3 3" /></svg>);
export const IconCopy = (p: P) => (<svg {...base(p)}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a1 1 0 0 1 1-1h9" /></svg>);
export const IconUpload = (p: P) => (<svg {...base(p)}><path d="M12 16V4m0 0 -4 4m4-4 4 4M4 20h16" /></svg>);
export const IconImage = (p: P) => (<svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m5 18 5-5 3 3 3-2.5L21 17" /></svg>);
export const IconVideo = (p: P) => (<svg {...base(p)}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></svg>);
export const IconEye = (p: P) => (<svg {...base(p)}><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></svg>);
export const IconEyeOff = (p: P) => (<svg {...base(p)}><path d="M3 3l18 18M10.5 5.9A10 10 0 0 1 22 12a15.7 15.7 0 0 1-3.3 3.7M6.6 6.6A15 15 0 0 0 2 12s3.5 6.5 10 6.5a10 10 0 0 0 3.4-.6" /></svg>);
export const IconLogout = (p: P) => (<svg {...base(p)}><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 16l4-4-4-4M20 12H9" /></svg>);
export const IconExternal = (p: P) => (<svg {...base(p)}><path d="M14 4h6v6M20 4 11 13M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" /></svg>);
export const IconCheck = (p: P) => (<svg {...base(p)}><path d="m5 13 4 4L19 7" /></svg>);
export const IconMail = (p: P) => (<svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>);
export const IconPhone = (p: P) => (<svg {...base(p)}><path d="M6.5 3h3l1.5 4.5-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z" /></svg>);
export const IconMapPin = (p: P) => (<svg {...base(p)}><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>);
export const IconClock = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>);
export const IconShare = (p: P) => (<svg {...base(p)}><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" /></svg>);
export const IconGrid = (p: P) => (<svg {...base(p)}><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></svg>);
export const IconZoom = (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M8 11h6M11 8v6" /></svg>);

export const IconWhatsApp = (p: P) => (
  <svg {...base({ ...p, fill: "currentColor", stroke: "none" })}>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 1 1-4.2 15.3l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8Zm-3 4.1c-.2 0-.5.1-.7.4-.2.2-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.9 4.5 3.9 2.2.9 2.7.7 3.2.7.5 0 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.2-.2-.5-.3l-1.8-.9c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2-.1-.4 0-.5l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2c-.2-.5-.4-.4-.6-.4h-.5Z" />
  </svg>
);
export const IconInstagram = (p: P) => (<svg {...base(p)}><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" /></svg>);
export const IconFacebook = (p: P) => (<svg {...base(p)}><path d="M14.5 8.5H17V5h-2.5A3.5 3.5 0 0 0 11 8.5V11H8.5v3.5H11V21h3.5v-6.5H17L17.5 11h-3v-2a.5.5 0 0 1 .5-.5Z" /></svg>);
export const IconTikTok = (p: P) => (<svg {...base(p)}><path d="M15 4c.4 2.4 2 4 4.5 4.2V11c-1.7 0-3.2-.5-4.5-1.4v5.9A5.5 5.5 0 1 1 9.5 10v3a2.5 2.5 0 1 0 2.5 2.5V4H15Z" /></svg>);
export const IconPinterest = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M9.5 20.5 12 11m-1.8 2.7A3.4 3.4 0 1 1 15 9.5c0 2.5-1.5 4.5-3.4 4.5-.9 0-1.6-.5-1.4-1.3" /></svg>);
export const IconThreads = (p: P) => (<svg {...base(p)}><path d="M12 21c-4.6 0-7.5-3.2-7.5-9S7.4 3 12 3c3.9 0 6.6 2.2 7.3 5.7M12.2 13.4c1.9-.2 4.3.2 4.3 2.5 0 2.2-2 3.1-4 3.1-2.3 0-3.7-1.2-3.7-2.9 0-1.9 1.7-2.9 4.2-2.9 3 0 4.9 1.3 4.9 4" /></svg>);
export const IconYouTube = (p: P) => (<svg {...base(p)}><rect x="3" y="6" width="18" height="12" rx="3" /><path d="m10.5 9.5 4.5 2.5-4.5 2.5v-5Z" fill="currentColor" stroke="none" /></svg>);

export function SocialIcon({ platform, ...p }: P & { platform: string }) {
  switch (platform.toLowerCase()) {
    case "instagram": return <IconInstagram {...p} />;
    case "facebook": return <IconFacebook {...p} />;
    case "tiktok": return <IconTikTok {...p} />;
    case "pinterest": return <IconPinterest {...p} />;
    case "threads": return <IconThreads {...p} />;
    case "youtube": return <IconYouTube {...p} />;
    case "whatsapp": return <IconWhatsApp {...p} />;
    case "email": return <IconMail {...p} />;
    case "phone": return <IconPhone {...p} />;
    default: return <IconExternal {...p} />;
  }
}
