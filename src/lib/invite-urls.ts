/** Preview links are for editing; guests receive the published site's short link. */
export const publishedInviteOrigin = "https://zarhal-studio.lovable.app";

export function inviteUrls(origin: string, id: string, ownerCode: string) {
  const url = new URL(origin);
  const isEditorPreview = url.hostname.endsWith(".lovable.app") &&
    (url.hostname.startsWith("id-preview--") || url.hostname.startsWith("preview--"));
  const base = isEditorPreview ? publishedInviteOrigin : url.origin;
  return {
    guest: `${base}/t/${encodeURIComponent(id)}`,
    owner: `${base}/javoblar/${encodeURIComponent(ownerCode)}`,
  };
}