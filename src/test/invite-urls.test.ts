import { describe, expect, it } from "vitest";
import { inviteUrls } from "@/lib/invite-urls";

describe("short invitation URLs", () => {
  it("uses the published site instead of the long editor preview address", () => {
    const links = inviteUrls("https://id-preview--c8bd1f90-313d-41e1-b814-509fc3a31d24.lovable.app", "9kgw5b", "abcdefgh23");
    expect(links.guest).toBe("https://zarhal-studio.lovable.app/t/9kgw5b");
    expect(links.owner).toBe("https://zarhal-studio.lovable.app/javoblar/abcdefgh23");
  });
  it("keeps a deployed site's own origin and only the short invitation id", () => {
    expect(inviteUrls("https://zarhal-studio.lovable.app", "9kgw5b", "abcdefgh23").guest)
      .toBe("https://zarhal-studio.lovable.app/t/9kgw5b");
    expect(inviteUrls("https://example.vercel.app", "9kgw5b", "abcdefgh23").guest)
      .toBe("https://example.vercel.app/t/9kgw5b");
  });
  it("keeps local checks on the local app", () => {
    expect(inviteUrls("http://localhost:8080", "9kgw5b", "abcdefgh23").guest)
      .toBe("http://localhost:8080/t/9kgw5b");
  });
});