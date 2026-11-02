import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Pause, Play, Share2 } from "lucide-react";
import { wedding } from "@/config/site";
import { shareLink } from "@/lib/share";
import { Button } from "@/components/ui/button";
import { mediaUrl } from "@/lib/upload";

export type MusicHandle = { play: () => Promise<void> };

/** Floating music + share control. Never autoplays before a user gesture. */
export const MusicControl = forwardRef<MusicHandle, { src?: string; title?: string }>(function MusicControl({ src, title }, ref) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);

  const startSynth = async () => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);
      // Soft ambient chord (Fmaj9) with slow tremolo
      [174.6, 220, 261.6, 329.6, 392].forEach((f, i) => {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = 0.05;
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.08 + i * 0.03;
        const lg = ctx.createGain();
        lg.gain.value = 0.03;
        lfo.connect(lg).connect(g.gain);
        o.connect(g).connect(gain);
        o.start();
        lfo.start();
      });
      ctxRef.current = { ctx, gain };
    }
    const { ctx, gain } = ctxRef.current;
    await ctx.resume();
    gain.gain.setTargetAtTime(0.6, ctx.currentTime, 1.2);
  };
  const stopSynth = () => {
    const c = ctxRef.current;
    if (c) c.gain.gain.setTargetAtTime(0, c.ctx.currentTime, 0.4);
  };

  const musicSrc = mediaUrl(src ?? wedding.musicSrc ?? "");

  const play = async () => {
    try {
      if (musicSrc) {
        if (!audioRef.current) {
          audioRef.current = new Audio(musicSrc);
          audioRef.current.loop = true;
        }
        await audioRef.current.play();
      } else {
        await startSynth();
      }
      setPlaying(true);
      setError(false);
    } catch {
      setError(true);
      setPlaying(false);
    }
  };
  const pause = () => {
    audioRef.current?.pause();
    stopSynth();
    setPlaying(false);
  };

  useImperativeHandle(ref, () => ({ play }));

  useEffect(() => {
    setPlaying(false);
    setError(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    stopSynth();
  }, [musicSrc]);

  useEffect(() => () => {
    audioRef.current?.pause();
    void ctxRef.current?.ctx.close();
  }, []);

  return (
    <div className="fixed right-4 z-40 flex flex-col gap-2 safe-bottom">
      <Button
        size="icon"
        type="button"
        onClick={() => shareLink(title ?? `${wedding.groom} & ${wedding.bride}`, "To‘y taklifnomasi")}
        aria-label="Taklifnomani ulashish"
        title="Taklifnomani ulashish"
        className="h-12 w-12 rounded-full border border-primary-foreground/30 bg-primary text-primary-foreground shadow-soft"
      >
        <Share2 className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        type="button"
        onClick={playing ? pause : play}
        aria-pressed={playing}
        aria-label={playing ? "Musiqani to‘xtatish" : "Musiqani yoqish"}
        title={error ? "Musiqani yoqib bo‘lmadi — qayta bosing" : playing ? "Musiqani to‘xtatish" : "Musiqani yoqish"}
        className="relative h-12 w-12 rounded-full border border-primary-foreground/30 bg-primary text-primary-foreground shadow-soft"
      >
        {playing ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 translate-x-px" />
        )}
        {error && <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive" />}
      </Button>
      {error && <p role="alert" className="max-w-40 bg-background p-2 text-xs text-foreground">Qo‘shiq ochilmadi. Qayta bosing.</p>}
    </div>
  );
});
