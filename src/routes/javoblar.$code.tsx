import { createFileRoute, Link } from "@tanstack/react-router";
import { Ornament } from "@/components/site/Reveal";
import { getOwnerReplies } from "@/lib/invites.functions";

export const Route = createFileRoute("/javoblar/$code")({
  loader: ({ params }) => getOwnerReplies({ data: { code: params.code } }),
  head: () => ({
    meta: [
      { title: "Mehmonlar javoblari — to‘y egalari uchun" },
      { name: "description", content: "Taklifnomangizga kelgan mehmonlar javoblari." },
      { property: "og:title", content: "Mehmonlar javoblari" },
      { property: "og:description", content: "Taklifnomangizga kelgan javoblar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OwnerPage,
});

function OwnerPage() {
  const res = Route.useLoaderData();
  if (!res)
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <h1 className="section-title">Sahifa topilmadi</h1>
      </main>
    );
  const d = res.data as { groom?: string; bride?: string };
  const yes = res.replies.filter((r) => r.attending);
  const total = yes.reduce((s, r) => s + r.guests, 0);
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="eyebrow text-center">To‘y egalari uchun</p>
      <h1 className="section-title mt-4 text-center">{d.groom}{d.bride ? ` & ${d.bride}` : ""}</h1>
      <Ornament className="my-8" />
      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat n={res.replies.length} l="Javoblar" />
        <Stat n={total} l="Keladi (kishi)" />
        <Stat n={res.replies.length - yes.length} l="Kela olmaydi" />
      </div>
      <Link to="/t/$id" params={{ id: res.id }} className="mt-6 block text-center eyebrow underline underline-offset-4">Taklifnomani ochish</Link>
      <h2 className="mt-12 font-serif text-2xl">Mehmonlar</h2>
      {res.replies.length === 0 && <p className="mt-4 text-muted-foreground">Hozircha javob yo‘q.</p>}
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {res.replies.map((r, i) => (
          <li key={i} className="py-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-serif text-lg">{r.name}</span>
              <span className="text-sm text-muted-foreground">{r.attending ? `✅ ${r.guests} kishi` : "❌ Kela olmaydi"}</span>
            </div>
            {r.message && <p className="mt-1 text-sm text-muted-foreground">{r.message}</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div className="border border-gold/50 py-4">
      <div className="font-serif text-3xl">{n}</div>
      <div className="mt-1 text-[0.6rem] uppercase tracking-widest text-muted-foreground">{l}</div>
    </div>
  );
}
