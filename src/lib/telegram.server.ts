/** Sends only to chats already registered by the verified bot webhook. */
export async function notifyTelegram(text: string): Promise<number> {
  const telegramKey = process.env["TELEGRAM_API_KEY"];
  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (!telegramKey || !lovableKey) {
    console.error("Telegram notification unavailable: missing configuration");
    return 0;
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: chats, error } = await supabaseAdmin.from("telegram_chats").select("chat_id");
  if (error) { console.error("Telegram chat lookup failed:", error.message); return 0; }
  if (!chats?.length) { console.error("Telegram notification unavailable: no registered chat"); return 0; }
  let delivered = 0;
  for (const chat of chats) {
    try {
      const response = await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
        method: "POST",
        headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": telegramKey, "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chat.chat_id, text }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) { console.error(`Telegram send failed [${response.status}]: ${await response.text()}`); continue; }
      const result = await response.json() as { ok?: boolean; description?: string };
      if (result.ok) delivered++;
      else console.error("Telegram send failed:", result.description);
    } catch (error) { console.error("Telegram send error:", error); }
  }
  return delivered;
}