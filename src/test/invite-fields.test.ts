import { describe, expect, it } from "vitest";
import { isValidInviteDate, nextTashkentWeekday, setInviteDatePart, inviteMapsUrl, tashkentDateISO } from "@/lib/invite-fields";

describe("invitation fields", () => {
  it("accepts 24-hour times from midnight to 23:59 without AM/PM", () => {
    expect(isValidInviteDate("2027-05-20T00:00")).toBe(true);
    expect(isValidInviteDate("2027-05-20T23:59")).toBe(true);
    expect(isValidInviteDate("2027-05-20T24:00")).toBe(false);
    expect(isValidInviteDate("2027-05-20T06:00 PM")).toBe(false);
    expect(setInviteDatePart("2027-05-20T18:30", "time", "23:59")).toBe("2027-05-20T23:59");
  });
  it("opens the independently supplied map link rather than searching the address", () => {
    expect(inviteMapsUrl("https://maps.app.goo.gl/example", "Toshkent")).toBe("https://maps.app.goo.gl/example");
    expect(inviteMapsUrl("javascript:alert(1)", "Toshkent")).toBe("https://www.google.com/maps/search/?api=1&query=Toshkent");
  });
  it("offers quick dates that are always in the future", () => {
    const tomorrow = tashkentDateISO(1);
    expect(tomorrow).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(tomorrow > tashkentDateISO(0)).toBe(true);
    const saturday = nextTashkentWeekday(6);
    expect(saturday > tashkentDateISO(0)).toBe(true);
    expect(new Date(`${saturday}T00:00:00Z`).getUTCDay()).toBe(6);
    expect(nextTashkentWeekday(0) > tashkentDateISO(0)).toBe(true);
  });
});