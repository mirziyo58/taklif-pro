import { createServerFn } from "@tanstack/react-start";

type OrderInput = {
  service: string;
  name: string;
  contact: string;
  deadline?: string | undefined;
  brief: string;
};

export const submitOrder = createServerFn({ method: "POST" })
  .inputValidator((d: OrderInput) => {
    if (!d || typeof d.service !== "string" || !d.service.trim()) throw new Error("Xizmatni tanlang");
    if (typeof d.name !== "string" || d.name.trim().length < 2) throw new Error("Ismingizni kiriting");
    if (typeof d.contact !== "string" || d.contact.trim().length < 5) throw new Error("Telefon yoki Telegram kiriting");
    if (typeof d.brief !== "string" || d.brief.trim().length < 10) throw new Error("Loyiha haqida yozing");
    return d;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("orders").insert({
      service: data.service.trim(),
      name: data.name.trim(),
      contact: data.contact.trim(),
      deadline: data.deadline || null,
      brief: data.brief.trim(),
    });
    if (error) throw new Error(error.message);

    const { notifyTelegram } = await import("@/lib/telegram.server");
      const text = [
        "🎉 Yangi buyurtma!",
        "",
        `Xizmat: ${data.service}`,
        `Ism: ${data.name}`,
        `Aloqa: ${data.contact}`,
        data.deadline ? `Muddat: ${data.deadline}` : null,
        "",
        data.brief,
      ]
        .filter(Boolean)
        .join("\n");
    const delivered = await notifyTelegram(text);
    return { ok: true as const, delivered };
  });
