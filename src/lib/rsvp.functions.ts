import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  invite: z.string().max(200).optional(),
  inviteId: z.string().regex(/^[a-z0-9]{4,12}$/).optional(),
  name: z.string().trim().min(2).max(100),
  attending: z.enum(["yes", "no"]),
  guests: z.number().int().min(1).max(10),
  message: z.string().max(500).optional(),
});

export const submitRsvp = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("rsvps").insert({
      invite: data.invite ?? null,
      invite_id: data.inviteId ?? null,
      name: data.name,
      attending: data.attending === "yes",
      guests: data.guests,
      message: data.message || null,
    });
    if (error) throw new Error(error.message);

    const { notifyTelegram } = await import("@/lib/telegram.server");
      const text = [
        "💌 Yangi javob (taklifnoma)",
        data.invite ? `Taklifnoma: ${data.invite}` : null,
        `Ism: ${data.name}`,
        data.attending === "yes" ? `✅ Keladi · ${data.guests} kishi` : "❌ Kela olmaydi",
        data.message ? `\nTilak: ${data.message}` : null,
      ].filter(Boolean).join("\n");
    const delivered = await notifyTelegram(text);
    return { ok: true as const, delivered };
  });
