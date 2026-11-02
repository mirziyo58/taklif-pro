import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Copy, ExternalLink, ImagePlus, Loader2, Music, RefreshCw, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { type InviteInput } from "@/lib/invite-link";
import { inviteUrls } from "@/lib/invite-urls";
import { findEvent } from "@/lib/events";
import { useEvents } from "@/lib/use-events";
import { fieldCls } from "@/components/wedding/Rsvp";
import { Ornament } from "@/components/site/Reveal";
import { createInvite } from "@/lib/invites.functions";
import { mediaUrl, uploadMedia } from "@/lib/upload";
import { inviteVariants } from "@/lib/invite-presets";
import { isValidInviteDate, nextTashkentWeekday, setInviteDatePart, tashkentDateISO } from "@/lib/invite-fields";

const THEMES = [
  { slug: "", name: "Klassik", colors: ["#3a1d2a", "#c9a45c", "#f6efe6"] },
  { slug: "emerald", name: "Zumrad", colors: ["#1f4a3a", "#d8b45e", "#f3f6ef"] },
  { slug: "navy", name: "Tungi ko‘k", colors: ["#1d2a4f", "#dcc07a", "#f2f4f8"] },
  { slug: "blush", name: "Pushti", colors: ["#9b3b4a", "#d1a670", "#f8ecec"] },
  { slug: "night", name: "Oltin tun", colors: ["#1e1a22", "#c9a45c", "#ece3d3"] },
];

/** Bosib maydonni to‘ldiradigan tayyor matn variantlari. */
function Chips({ values, current, onPick }: { values: string[]; current: string; onPick: (v: string) => void }) {
  if (!values.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {values.map((val) => {
        const on = current.trim() === val;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onPick(val)}
            aria-pressed={on}
            className={`max-w-full truncate rounded-full border px-3 py-1 text-xs transition ${on ? "border-gold bg-gold/15 text-foreground" : "border-border text-muted-foreground hover:border-gold hover:text-foreground"}`}
          >
            {val}
          </button>
        );
      })}
    </div>
  );
}

export const Route = createFileRoute("/yaratish")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Taklifnoma yaratish — to‘y va marosimlar uchun" },
      { name: "description", content: "Nikoh, sunnat, beshik to‘yi, tug‘ilgan kun va yubiley uchun raqamli taklifnoma yarating." },
      { property: "og:title", content: "O‘z to‘y taklifnomangizni yarating" },
      { property: "og:description", content: "Bir necha daqiqada nafis raqamli taklifnoma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Builder,
});

const empty: InviteInput = {
  type: "nikoh", photoUrl: "", groom: "", bride: "", date: "", venueName: "", address: "", dressCode: "", notes: "", message: "", photo: 0, photos: [], musicUrl: "",
};
const KEY = "invite-draft";

function Builder() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link to="/" className="eyebrow">← Namuna</Link>
      <h1 className="section-title mt-6 text-center">Taklifnoma yaratish</h1>
      <Ornament className="my-10" />
      <BuilderForm />
    </main>
  );
}

function BuilderForm() {
  const [f, setF] = useState<InviteInput>(empty);
  const [link, setLink] = useState("");
  const [ownerLink, setOwnerLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const replaceIdx = useRef<number | null>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const { events } = useEvents();
  const ev = findEvent(f.type, events);
  const variants = inviteVariants(ev);
  const dateShortcuts = [
    { label: "Ertaga", value: tashkentDateISO(1) },
    { label: "Keyingi shanba", value: nextTashkentWeekday(6) },
    { label: "Keyingi yakshanba", value: nextTashkentWeekday(0) },
  ];

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s) setF({ ...empty, ...JSON.parse(s) });
    } catch { /* ignore */ }
  }, []);

  const set = <K extends keyof InviteInput>(k: K, v: InviteInput[K]) => {
    const next = { ...f, [k]: v };
    setF(next);
    setLink(""); setOwnerLink("");
    localStorage.setItem(KEY, JSON.stringify(next));
  };
  const setAll = (next: InviteInput) => {
    setF(next);
    setLink(""); setOwnerLink("");
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  // Effective photo list: custom uploads if any, else the event's built-in set.
  const photos = (f.photos?.length ? f.photos : ev.photos.map((p) => p.src)).map(mediaUrl);

  const upload = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      return await uploadMedia(file);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Yuklab bo‘lmadi");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const addPhoto = async (file: File) => {
    const url = await upload(file);
    if (url) setAll({ ...f, photos: [...photos, url] });
  };
  const replacePhoto = async (file: File) => {
    const i = replaceIdx.current;
    if (i === null) return;
    const url = await upload(file);
    if (!url) return;
    const next = photos.map((p, j) => (j === i ? url : p));
    const out = { ...f, photos: next };
    if ((f.photoUrl || photos[0]) === photos[i]) out.photoUrl = url;
    setAll(out);
  };
  const removePhoto = (i: number) => {
    const next = photos.filter((_, j) => j !== i);
    const out = { ...f, photos: next };
    if ((f.photoUrl || photos[0]) === photos[i]) out.photoUrl = next[0] ?? "";
    setAll(out);
  };
  const addMusic = async (file: File) => {
    const url = await upload(file);
    if (url) set("musicUrl", url);
  };

  const create = async () => {
    if (f.groom.trim().length < 2 || (ev.couple && f.bride.trim().length < 2))
      return setError(ev.couple ? "Kuyov va kelin ismlarini kiriting" : `${ev.nameLabel}ni kiriting`);
    if (!isValidInviteDate(f.date)) return setError("Sana va vaqtni tanlang (00:00–23:59)");
    if (f.mapsUrl?.trim()) {
      try {
        const url = new URL(f.mapsUrl.trim());
        if (!["https:", "http:"].includes(url.protocol)) throw new Error();
      } catch { return setError("Xarita havolasini to‘liq kiriting (https://...)"); }
    }
    if (!f.venueName.trim()) return setError("Bayram joyi nomini kiriting");
    setError("");
    const out = { ...f, bride: ev.couple ? f.bride : "", photoUrl: f.photoUrl || photos[0] || "", photos };
    setSaving(true);
    try {
      const r = await createInvite({ data: { data: out } });
      const urls = inviteUrls(window.location.origin, r.id, r.ownerCode);
      setLink(urls.guest);
      setOwnerLink(urls.owner);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Saqlab bo‘lmadi");
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); toast.success("Havola nusxalandi"); }
    catch { toast.error("Nusxalab bo‘lmadi"); }
  };
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: ev.couple ? `${f.groom} & ${f.bride}` : f.groom, text: ev.heading, url: link }); } catch { /* cancelled */ }
    } else copy();
  };

  const input = (k: keyof InviteInput, label: string, props: Record<string, unknown> = {}, variants: string[] = []) => (
    <div>
      <label htmlFor={k} className="eyebrow">{label}</label>
      <input id={k} value={String(f[k] ?? "")} onChange={(e) => set(k, e.target.value as never)} className={fieldCls} {...props} />
      <Chips values={variants} current={String(f[k] ?? "")} onPick={(val) => set(k, val as never)} />
    </div>
  );

  return (
    <div className="space-y-7">
      <p className="text-center text-muted-foreground">
        Ma’lumotlarni kiriting — tayyor havolani mehmonlarga yuboring.
        <span className="mt-1 block text-xs">Har maydon ostida tayyor variantlar bor: bosing, keyin o‘zingiz tahrirlang.</span>
      </p>
      <fieldset>
        <legend className="eyebrow">Marosim turi *</legend>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {events.map((e) => {
            const on = ev.slug === e.slug;
            return (
              <button key={e.slug} type="button" aria-pressed={on}
                onClick={() => setAll({ ...f, type: e.slug, photo: 0, photoUrl: e.photos[0]?.src ?? "", photos: [] })}
                className={`group relative aspect-[4/5] overflow-hidden border-2 text-left transition ${on ? "border-gold" : "border-transparent opacity-80 hover:opacity-100"}`}>
                {e.photos[0] && <img src={e.photos[0].src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                <span className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-3 font-serif text-lg text-ivory">{e.name}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="grid gap-7 sm:grid-cols-2">
        {input("groom", `${ev.nameLabel} *`, { placeholder: ev.namePlaceholder }, variants.groom)}
        {ev.couple && input("bride", "Kelin ismi *", { placeholder: "Madina" }, variants.bride)}
      </div>
      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="event-date" className="eyebrow">Sana *</label>
          <input id="event-date" type="date" value={f.date.split("T")[0] ?? ""} onChange={(e) => set("date", setInviteDatePart(f.date, "date", e.target.value))} className={fieldCls} />
        </div>
        <fieldset>
          <legend className="eyebrow">Vaqt (24 soat) *</legend>
          <div className="flex items-center gap-3">
            <select aria-label="Soat" value={f.date.split("T")[1]?.split(":")[0] ?? ""} onChange={(e) => set("date", setInviteDatePart(f.date, "time", `${e.target.value}:${f.date.split("T")[1]?.split(":")[1] || "00"}`))} className={fieldCls}>
              <option value="" disabled>Soat</option>
              {Array.from({ length: 24 }, (_, n) => String(n).padStart(2, "0")).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span aria-hidden="true">:</span>
            <select aria-label="Daqiqa" value={f.date.split("T")[1]?.split(":")[1] ?? ""} onChange={(e) => set("date", setInviteDatePart(f.date, "time", `${f.date.split("T")[1]?.split(":")[0] || "00"}:${e.target.value}`))} className={fieldCls}>
              <option value="" disabled>Daqiqa</option>
              {Array.from({ length: 60 }, (_, n) => String(n).padStart(2, "0")).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </fieldset>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="eyebrow">Tez sana:</span>
        {dateShortcuts.map((d) => {
          const on = f.date.split("T")[0] === d.value;
          return (
            <button key={d.label} type="button" aria-pressed={on}
              onClick={() => set("date", setInviteDatePart(f.date || "T17:00", "date", d.value))}
              className={`rounded-full border px-3 py-1 text-xs transition ${on ? "border-gold bg-gold/15 text-foreground" : "border-border text-muted-foreground hover:border-gold hover:text-foreground"}`}>
              {d.label}
            </button>
          );
        })}
      </div>
      <div className="grid gap-7 sm:grid-cols-2">
        {input("venueName", "Bayram joyi *", { placeholder: "Navro‘z Saroyi" }, variants.venueName)}
        {input("address", "Manzil", { placeholder: "Ko‘cha, uy, shahar" }, variants.address)}
      </div>
      {input("guests", "Mehmonlar", { placeholder: "Kamolovlar oilasi" }, variants.guests)}
      {input("mapsUrl", "Xarita havolasi", { type: "url", placeholder: "https://maps.app.goo.gl/..." })}
      {input("dressCode", "Kiyinish uslubi", { placeholder: "Klassik kechki libos" }, variants.dressCode)}
      {input("notes", "Eslatma", { placeholder: "Kelishingizni oldindan tasdiqlang" }, variants.notes)}
      <div>
        <label htmlFor="message" className="eyebrow">Mehmonlarga xabar</label>
        <textarea id="message" rows={3} value={f.message} onChange={(e) => set("message", e.target.value)} className={fieldCls} placeholder={ev.defaultMessage} />
        <Chips values={variants.message} current={f.message} onPick={(val) => set("message", val)} />
      </div>

      <fieldset>
        <legend className="eyebrow">Dizayn</legend>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {THEMES.map((t) => {
            const on = (f.theme ?? "") === t.slug;
            return (
              <button key={t.slug || "classic"} type="button" aria-pressed={on} onClick={() => set("theme", t.slug)}
                className={`border-2 p-3 text-center transition ${on ? "border-gold" : "border-border hover:border-gold/60"}`}>
                <span className="flex h-10 overflow-hidden">
                  {t.colors.map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}
                </span>
                <span className="mt-2 block text-sm">{t.name}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow">Suratlar — bosing: asosiy qilish · almashtirish · o‘chirish</legend>
        <input
          ref={replaceInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void replacePhoto(file);
            e.target.value = "";
          }}
        />
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((src, i) => {
            const on = (f.photoUrl || photos[0]) === src;
            return (
              <div key={src + i} className={`group relative aspect-[3/4] overflow-hidden border-2 transition ${on ? "border-gold" : "border-transparent opacity-80 hover:opacity-100"}`}>
                <button type="button" onClick={() => setAll({ ...f, photo: i, photoUrl: src })} aria-pressed={on} aria-label={`Asosiy surat qilish: ${i + 1}`} className="block h-full w-full">
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
                {on && <span className="absolute left-1 top-1 bg-gold px-2 py-0.5 text-[0.55rem] uppercase tracking-widest text-burgundy">Asosiy</span>}
                <div className="absolute right-1 top-1 flex gap-1">
                  <button
                    type="button"
                    aria-label="Suratni almashtirish"
                    onClick={() => { replaceIdx.current = i; replaceInput.current?.click(); }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-charcoal/80 text-ivory hover:bg-gold hover:text-burgundy"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  {photos.length > 1 && (
                    <button
                      type="button"
                      aria-label="Suratni o‘chirish"
                      onClick={() => removePhoto(i)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-charcoal/80 text-ivory hover:bg-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <label className={`flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-border text-muted-foreground transition hover:border-gold hover:text-gold ${uploading ? "pointer-events-none opacity-50" : ""}`}>
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
            <span className="text-[0.6rem] uppercase tracking-widest">Qo‘shish</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void addPhoto(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Bu suratlar taklifnomaning galereyasida ham ko‘rinadi.</p>
      </fieldset>

      <fieldset>
        <legend className="eyebrow">Qo‘shiq</legend>
        {f.musicUrl ? (
          <div className="mt-3 flex items-center justify-between gap-3 border border-gold/50 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <Music className="h-5 w-5 shrink-0 text-gold" />
              <audio src={mediaUrl(f.musicUrl)} controls preload="metadata" className="h-9 w-full min-w-0 max-w-xs" />
            </div>
            <button type="button" onClick={() => set("musicUrl", "")} aria-label="Qo‘shiqni o‘chirish" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border hover:border-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className={`mt-3 flex cursor-pointer items-center justify-center gap-3 border-2 border-dashed border-border p-5 text-muted-foreground transition hover:border-gold hover:text-gold ${uploading ? "pointer-events-none opacity-50" : ""}`}>
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Music className="h-5 w-5" />}
            <span className="eyebrow">MP3 yuklash</span>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void addMusic(file);
                e.target.value = "";
              }}
            />
          </label>
        )}
        <p className="mt-2 text-xs text-muted-foreground">Qo‘shiq qo‘shilmasa, yumshoq fon ohangi ijro etiladi.</p>
      </fieldset>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button type="button" onClick={() => void create()} disabled={uploading || saving} className="w-full bg-primary py-4 eyebrow !text-primary-foreground hover:opacity-90 disabled:opacity-50">
        {saving ? "Saqlanmoqda..." : "Taklifnomani yaratish"}
      </button>

      {link && (
        <div role="status" className="border border-gold p-6 text-center animate-fade-up">
          <p className="font-serif text-2xl">Taklifnomangiz tayyor!</p>
          <p className="mt-3 break-all text-sm text-muted-foreground">{link}</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 border border-primary py-3 eyebrow !text-primary"><ExternalLink className="h-4 w-4" />Ochish</a>
            <button onClick={copy} className="flex items-center justify-center gap-2 border border-primary py-3 eyebrow !text-primary"><Copy className="h-4 w-4" />Nusxalash</button>
            <button onClick={share} className="flex items-center justify-center gap-2 bg-primary py-3 eyebrow !text-primary-foreground"><Share2 className="h-4 w-4" />Ulashish</button>
          </div>
          {ownerLink && (
            <div className="mt-6 border-t border-border pt-5">
              <p className="eyebrow">To‘y egalari uchun — mehmonlar javoblari</p>
              <p className="mt-2 break-all text-sm text-muted-foreground">{ownerLink}</p>
              <a href={ownerLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 border border-primary px-5 py-3 eyebrow !text-primary"><ExternalLink className="h-4 w-4" />Javoblarni ko‘rish</a>
              <p className="mt-2 text-xs text-muted-foreground">Bu havolani faqat to‘y egalariga bering — mehmonlarga yubormang.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
