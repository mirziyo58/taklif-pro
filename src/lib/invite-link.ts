import { wedding } from "@/config/site";
import type { WeddingData } from "@/components/wedding/Invitation";
import { mediaUrl } from "@/lib/upload";
import { findEvent, type EventDef } from "@/lib/events";
import { inviteMapsUrl } from "@/lib/invite-fields";

/** Data a visitor enters in the builder. Stored in the link itself (no server). */
export type InviteInput = {
  /** event type slug, e.g. "nikoh", "sunnat". Missing = nikoh (old links). */
  type?: string;
  groom: string;
  bride: string;
  date: string; // "YYYY-MM-DDTHH:mm" Tashkent time
  venueName: string;
  address: string;
  mapsUrl?: string;
  dressCode: string;
  notes: string;
  message: string;
  photo: number;
  /** chosen photo URL (set by builder); falls back to photo index */
  photoUrl?: string;
  /** custom photo URLs (uploaded by the creator); replaces the event's default set */
  photos?: string[];
  /** uploaded music URL; empty = soft ambient fallback */
  musicUrl?: string;
  /** design theme slug; empty = classic */
  theme?: string;
  /** guest name shown on the cover, e.g. "Kamolovlar oilasi" */
  guests?: string;
};

export const photoChoices = wedding.gallery;

const months = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

export function encodeInvite(i: InviteInput): string {
  const bytes = new TextEncoder().encode(JSON.stringify(i));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeInvite(s: string): InviteInput | null {
  try {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const o = JSON.parse(new TextDecoder().decode(bytes));
    if (!o || typeof o.groom !== "string" || typeof o.bride !== "string") return null;
    return o as InviteInput;
  } catch {
    return null;
  }
}

export function toWeddingData(i: InviteInput, events?: EventDef[]): WeddingData {
  const ev = findEvent(i.type ?? "nikoh", events);
  const [d = "", t = ""] = i.date.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const dateLabel = y && m && day ? `${day} ${months[m - 1]} ${y}` : "Sana belgilanmagan";
  const custom = (i.photos ?? []).filter(Boolean).map(mediaUrl);
  const base = ev.photos.length ? ev.photos : photoChoices;
  const photos = custom.length ? custom.map((src) => ({ src, alt: ev.name })) : base;
  const hero = (i.photoUrl && mediaUrl(i.photoUrl)) || photos[i.photo]?.src || photos[0]?.src || wedding.heroImage;
  const isWedding = ev.slug === "nikoh";
  return {
    ...wedding,
    heading: ev.heading,
    eyebrow: ev.eyebrow,
    groom: i.groom || (ev.couple ? "Kuyov" : "Bayram egasi"),
    bride: ev.couple ? i.bride || "Kelin" : "",
    date: i.date ? `${i.date}:00+05:00` : "",
    dateLabel,
    timeLabel: t || "—",
    venue: {
      ...wedding.venue,
      name: i.venueName || "Bayram joyi",
      address: i.address,
      mapsUrl: inviteMapsUrl(i.mapsUrl, i.address || i.venueName),
    },
    dressCode: i.dressCode || (isWedding ? wedding.dressCode : "Bayramona libos"),
    notes: i.notes || (isWedding ? wedding.notes : "Kelishingizni oldindan tasdiqlang."),
    message: i.message || ev.defaultMessage,
    heroImage: hero,
    portrait: photos[1]?.src ?? hero,
    schedule: ev.schedule,
    gallery: custom.length || !isWedding ? photos.map((p) => ({ ...p, w: 832, h: 1216 })) : wedding.gallery,
    musicSrc: (i.musicUrl && mediaUrl(i.musicUrl)) || wedding.musicSrc,
    guests: i.guests?.trim() || "",
  };
}
