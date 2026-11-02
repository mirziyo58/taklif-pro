import { describe, expect, it } from "vitest";
import { builtInEvents } from "@/lib/events";
import { inviteVariants } from "@/lib/invite-presets";

describe("builder text variants", () => {
  it("gives every field ready-made options for each event type", () => {
    for (const ev of builtInEvents) {
      const v = inviteVariants(ev);
      expect(v.groom.length, ev.slug).toBeGreaterThan(1);
      expect(v.guests.length, ev.slug).toBeGreaterThan(1);
      expect(v.venueName.length, ev.slug).toBeGreaterThan(1);
      expect(v.address.length, ev.slug).toBeGreaterThan(1);
      expect(v.dressCode.length, ev.slug).toBeGreaterThan(1);
      expect(v.notes.length, ev.slug).toBeGreaterThan(1);
      expect(v.message.length, ev.slug).toBeGreaterThan(1);
    }
  });

  it("keeps the event's own message among the options and never repeats it", () => {
    for (const ev of builtInEvents) {
      const v = inviteVariants(ev);
      expect(v.message).toContain(ev.defaultMessage);
      expect(new Set(v.message).size).toBe(v.message.length);
    }
  });

  it("asks for two names only for wedding-type events", () => {
    expect(inviteVariants(builtInEvents.find((e) => e.slug === "nikoh")!).bride.length).toBeGreaterThan(1);
    expect(inviteVariants(builtInEvents.find((e) => e.slug === "sunnat")!).bride).toEqual([]);
  });

  it("never suggests a guest name that would double the cover greeting", () => {
    for (const ev of builtInEvents) {
      for (const g of inviteVariants(ev).guests) {
        expect(g.startsWith("Hurmatli"), g).toBe(false);
      }
    }
  });
});
