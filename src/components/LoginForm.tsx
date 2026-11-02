import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fieldCls } from "@/components/wedding/Rsvp";

/** Username + password login. Usernames map to synthetic emails (username@app.local). */
export function LoginForm({ hint }: { hint?: string }) {
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: `${username.trim().toLowerCase()}@app.local`,
      password: pass,
    });
    setBusy(false);
    if (error) toast.error("Login yoki parol noto‘g‘ri");
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-6">
      {hint && <p className="text-center text-sm text-muted-foreground">{hint}</p>}
      <div>
        <label className="eyebrow" htmlFor="lg-user">Login</label>
        <input id="lg-user" required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className={fieldCls} />
      </div>
      <div>
        <label className="eyebrow" htmlFor="lg-pass">Parol</label>
        <input id="lg-pass" type="password" required autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} className={fieldCls} />
      </div>
      <button disabled={busy} className="flex w-full items-center justify-center gap-2 bg-primary py-4 eyebrow !text-primary-foreground hover:opacity-90 disabled:opacity-50">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Kirish
      </button>
    </form>
  );
}
