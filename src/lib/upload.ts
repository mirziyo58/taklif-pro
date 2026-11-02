/** Rewrites old direct storage links to the app's media route (bucket is private). */
export function mediaUrl(url: string): string {
  const m = url.match(/\/storage\/v1\/object\/public\/invite-media\/(.+)$/);
  return m ? `/api/public/media/${m[1]}` : url;
}

/** Upload a file through the app and return a URL guests can open. No sign-in needed. */
export async function uploadMedia(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const res = await fetch(`/api/public/upload?ext=${ext}`, {
    method: "POST",
    headers: { "content-type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) throw new Error((await res.text()) || "Yuklab bo‘lmadi");
  const { path } = (await res.json()) as { path: string };
  return `${window.location.origin}/api/public/media/${path}`;
}
