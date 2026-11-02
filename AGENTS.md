<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Event (marosim) types: built-in defaults and images live in src/lib/events.ts; admins override name/heading/message/extra images via the event_types table, merged by mergeEvents. Why: site works even if the database is empty.
- Admin role: first signed-up user is auto-assigned admin via a trigger on user_roles. Why: owner can claim /admin without manual setup.
- Invitation date and map field parsing lives in a shared client-safe helper so builder validation and shared links stay consistent.
- Invitation URL generation lives in a client-safe helper: editor preview origins use the published domain, while deployed and local origins stay same-origin so guest links are short and usable.
- Start invitation audio directly from the opening click through a control ref, not an effect, to preserve browser user-gesture playback permission.
- Share Telegram notification delivery in a server-only helper that checks both HTTP and provider success and logs failures without losing saved submissions.
- Vercel deployments use Nitro's Vercel preset and Build Output API, while Lovable retains its managed preset; static-only output cannot serve invitation creation, replies, or media endpoints.
