import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { InviteInput } from "@/lib/invite-link";

const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
function code(n: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

/** Saves an invitation and returns a short id for guests and a private code for the owners. */
export const createInvite = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ data: z.record(z.unknown()) }).parse(d))
  .handler(async ({ data }) => {
    const json = JSON.stringify(data.data);
    if (json.length > 20000) throw new Error("Ma’lumot juda katta");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (let i = 0; i < 5; i++) {
      const id = code(6);
      const ownerCode = code(10);
      const { error } = await supabaseAdmin.from("invites").insert({ id, owner_code: ownerCode, data: data.data as never });
      if (!error) return { id, ownerCode };
      if (!error.message.includes("duplicate")) throw new Error(error.message);
    }
    throw new Error("Qaytadan urinib ko‘ring");
  });

export const getInvite = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.string().regex(/^[a-z0-9]{4,12}$/) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("invites").select("data").eq("id", data.id).maybeSingle();
    return (row?.data ?? null) as InviteInput | null;
  });

/** Owners' private page: their invitation and every guest reply to it. */
export const getOwnerReplies = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ code: z.string().regex(/^[a-z0-9]{6,20}$/) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inv } = await supabaseAdmin.from("invites").select("id, data").eq("owner_code", data.code).maybeSingle();
    if (!inv) return null;
    const { data: rows } = await supabaseAdmin
      .from("rsvps").select("name, attending, guests, message, created_at")
      .eq("invite_id", inv.id).order("created_at", { ascending: false });
    return { id: inv.id, data: inv.data as unknown as InviteInput, replies: rows ?? [] };
  });
