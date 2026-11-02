import { createFileRoute } from "@tanstack/react-router";

const MAX = 25 * 1024 * 1024;

// Lets anyone building an invitation upload a photo or song without signing in.
export const Route = createFileRoute("/api/public/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const type = request.headers.get("content-type") || "";
        if (!/^(image|audio)\//.test(type)) return new Response("Faqat rasm yoki qo‘shiq", { status: 400 });
        const body = await request.arrayBuffer();
        if (!body.byteLength || body.byteLength > MAX) return new Response("Fayl juda katta (25MB gacha)", { status: 413 });
        const ext = (new URL(request.url).searchParams.get("ext") || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.storage.from("invite-media").upload(path, body, { contentType: type, cacheControl: "31536000" });
        if (error) return new Response(error.message, { status: 500 });
        return Response.json({ path });
      },
    },
  },
});
