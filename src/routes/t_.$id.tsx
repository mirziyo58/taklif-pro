import { createFileRoute, Link } from "@tanstack/react-router";
import { Invitation } from "@/components/wedding/Invitation";
import { toWeddingData } from "@/lib/invite-link";
import { getInvite } from "@/lib/invites.functions";
import { useEvents } from "@/lib/use-events";

export const Route = createFileRoute("/t_/$id")({
  loader: async ({ params }) => ({ input: (await getInvite({ data: { id: params.id } })) }),
  head: () => ({
    meta: [
      { title: "Sizga taklifnoma" },
      { name: "description", content: "Sizni bayramimizga taklif qilamiz — taklifnomani oching." },
      { property: "og:title", content: "Sizga taklifnoma" },
      { property: "og:description", content: "Sizni bayramimizga taklif qilamiz — taklifnomani oching." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShortInvite,
});

function ShortInvite() {
  const { input } = Route.useLoaderData();
  const { id } = Route.useParams();
  const { events } = useEvents();
  if (!input)
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="section-title">Taklifnoma topilmadi</h1>
        <p className="mt-4 text-muted-foreground">Havola noto‘g‘ri yoki o‘chirilgan.</p>
        <Link to="/yaratish" className="mt-8 bg-primary px-7 py-4 eyebrow !text-primary-foreground">Taklifnoma yaratish</Link>
      </main>
    );
  return <Invitation data={toWeddingData(input, events)} showCreate={false} theme={input.theme ?? ""} inviteId={id} />;
}
