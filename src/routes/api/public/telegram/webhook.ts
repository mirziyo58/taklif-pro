import { createFileRoute } from "@tanstack/react-router";
import { createHash, timingSafeEqual } from "node:crypto";

function deriveTelegramWebhookSecret(telegramApiKey: string): string {
  return createHash("sha256").update(`telegram-webhook:${telegramApiKey}`).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const TELEGRAM_API_KEY = process.env["TELEGRAM_API_KEY"];
        if (!TELEGRAM_API_KEY) {
          // Bot not connected yet — acknowledge without processing.
          return Response.json({ ok: true, ignored: true });
        }

        const expectedSecret = deriveTelegramWebhookSecret(TELEGRAM_API_KEY);
        const actualSecret = request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
        if (!safeEqual(actualSecret, expectedSecret)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const update = await request.json();
        const message = update.message ?? update.edited_message;
        const chat = message?.chat;
        if (!chat?.id) {
          return Response.json({ ok: true, ignored: true });
        }

        // Remember every chat that writes to the bot — orders are delivered there.
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("telegram_chats").upsert(
          {
            chat_id: chat.id,
            title: chat.title ?? [chat.first_name, chat.last_name].filter(Boolean).join(" ") ?? null,
          },
          { onConflict: "chat_id" },
        );
        if (error) {
          return Response.json({ error: error.message }, { status: 500 });
        }

        // Greet the sender so they know the bot is connected.
        if (typeof message.text === "string" && message.text.startsWith("/start")) {
          const lovableKey = process.env["LOVABLE_API_KEY"];
          if (lovableKey) {
            await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${lovableKey}`,
                "X-Connection-Api-Key": TELEGRAM_API_KEY,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                chat_id: chat.id,
                text: "✅ Bot ulandi! Endi saytdagi yangi buyurtmalar shu yerga kelib tushadi.",
              }),
            }).catch(() => {});
          }
        }

        return Response.json({ ok: true });
      },
    },
  },
});
