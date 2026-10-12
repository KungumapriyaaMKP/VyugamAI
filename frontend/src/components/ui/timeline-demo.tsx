"use client";

import Timeline from "@/components/ui/timeline";

const settings = {
  textColor: "var(--color-foreground, #0f172a)",
  mutedTextColor: "var(--color-muted-foreground, #64748b)",
  activeColor: "#7e22ce",
  backgroundColor: "var(--color-background, #ffffff)",
  duration: 1.4,
};

export default function TimelineDemo(props: Partial<typeof settings>) {
  const s = { ...settings, ...props };
  return (
    <main className="bg-background text-foreground">
      {/* Lead-in so the pinned timeline has somewhere to scroll in from. */}
      <section className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Hackathon Progression Roadmap
        </p>
        <h1 className="max-w-[18ch] text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Project Timeline — 2026–2027
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Keep scrolling — the section pins, the track slides sideways, and each
          milestone draws its stem and reveals its copy as it reaches centre.
        </p>
        <span className="mt-2 animate-bounce text-muted-foreground">&darr;</span>
      </section>

      {/* Usage with custom copy and 2026-2027 stage breakdown */}
      <Timeline
        title="Project Timeline"
        periodLabel="2026 — 2027"
        backgroundColor={s.backgroundColor}
        textColor={s.textColor}
        mutedTextColor={s.mutedTextColor}
        activeColor={s.activeColor}
        imageUrl="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"
        imageAlt="Vyugam AI Hackathon Arena"
        duration={s.duration}
      />

      <section className="flex h-screen items-center justify-center px-6 text-center text-sm text-muted-foreground">
        From Squad Assembly to the 24-Hour Arena Grand Finale Gauntlet.
      </section>
    </main>
  );
}

