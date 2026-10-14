// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import {
  type CSSProperties,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* Inline stand-in for @gsap/react's useGSAP. Mirrors its default
   `revertOnUpdate: false`: one gsap.context lives for the component's
   lifetime, the callback is re-added when dependencies change, and the
   context is reverted only on unmount. A callback may return its own
   cleanup, which runs before the next re-add and on unmount. */
function useGSAP(
  callback: () => void | (() => void),
  options?: {
    dependencies?: unknown[];
    scope?: { current: Element | null } | Element | null;
  }
) {
  const deps = options?.dependencies ?? [];
  const scope = options?.scope;
  const ctxRef = useRef<gsap.Context | null>(null);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useLayoutEffect(() => {
    const el =
      scope && typeof scope === "object" && "current" in scope
        ? scope.current
        : (scope as Element | null);
    ctxRef.current = gsap.context(() => {}, el ?? undefined);
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = undefined;
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!ctxRef.current) return;
    cleanupRef.current?.();
    const ret = ctxRef.current.add(callback);
    cleanupRef.current = typeof ret === "function" ? ret : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export type JourneyItem = {
  id: string;
  stage: string;
  timeframe: string;
  title: string;
  content: string;
};

export type TimelineProps = {
  title?: string;
  periodLabel?: string;
  textColor?: string;
  mutedTextColor?: string;
  activeColor?: string;
  backgroundColor?: string;
  imageUrl?: string;
  imageAlt?: string;
  duration?: number;
  scrollDuration?: number;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQueryList.addEventListener("change", callback);

  return () => mediaQueryList.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;

  return window.matchMedia?.(REDUCED_MOTION_QUERY)?.matches ?? false;
}

function getServerReducedMotionSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );
}

// 5 Sequential Hackathon Stages from the User's Image
export const allJourneyItems: JourneyItem[] = [
  {
    id: "stage-01",
    stage: "Stage 01",
    timeframe: "November – December 2026",
    title: "Team Formation",
    content: "Assemble teams of 4 students, verify collegiate domains, and finalize official team profiles.",
  },
  {
    id: "stage-02",
    stage: "Stage 02",
    timeframe: "December 2026",
    title: "Problem Statement Selection",
    content: "Review 50+ curated problem statements across AI, FinTech, CyberSecurity, and Clean Energy.",
  },
  {
    id: "stage-03",
    stage: "Stage 03",
    timeframe: "December 2026 – January 2027",
    title: "Idea & Architecture Blueprint",
    content: "Prepare technical architecture decks, system block diagrams, and submit foundational proposals.",
  },
  {
    id: "stage-04",
    stage: "Stage 04",
    timeframe: "January – February 2027",
    title: "Prototype & Code Walkthrough",
    content: "Engineer full working prototypes, commit code to GitHub, and deliver video walkthrough demos.",
  },
  {
    id: "stage-05",
    stage: "Stage 05",
    timeframe: "February – March 2027",
    title: "24-Hour Grand Finale Hackathon",
    content: "Continuous 24-hour physical hackathon live on campus at Sri Eshwar College with expert jury awards.",
  },
];

export default function Timeline({
  title = "Project Timeline",
  periodLabel = "2026 — 2027",
  textColor = "var(--color-foreground, #000000)",
  mutedTextColor = "var(--color-muted-foreground, #475569)",
  activeColor = "#7e22ce",
  backgroundColor = "var(--color-background, #ffffff)",
  imageUrl = "/images/vyugam_timeline_official.jpeg",
  imageAlt = "Vyugam AI Hackathon Timeline",
}: TimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wholeSliderRef = useRef<HTMLDivElement>(null);
  const trackLineRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const sectionStyle: CSSProperties = {
    color: textColor,
    backgroundColor,
  };
  const activeStyle: CSSProperties = {
    backgroundColor: activeColor,
  };
  const mutedTextStyle: CSSProperties = {
    color: mutedTextColor,
  };

  useGSAP(() => {
    const section = sectionRef.current;
    const slider = wholeSliderRef.current;
    if (!section || !slider) return;

    const items = allJourneyItems;

    if (reducedMotion) {
      gsap.set(slider, { clearProps: "transform" });
      gsap.set(".journey-line", { width: "100%" });
      items.forEach((item) => {
        gsap.set(`.jl-${item.id}`, { scaleY: 1 });
        gsap.set(`.jd-${item.id}`, { scale: 1 });
        gsap.set(`.card-${item.id}`, { opacity: 1, y: 0 });
      });
      return;
    }

    // Initialize animation values
    items.forEach((item, index) => {
      const isTop = index % 2 === 0;
      gsap.set(`.jl-${item.id}`, {
        scaleY: 0,
        transformOrigin: isTop ? "bottom bottom" : "top top",
      });
      gsap.set(`.jd-${item.id}`, { scale: 0 });
      gsap.set(`.card-${item.id}`, {
        opacity: 0,
        y: isTop ? -18 : 18,
      });
    });
    gsap.set(".journey-line", { width: "0%" });

    // Mathematical horizontal distance required to bring the final card into full view
    const getMaxScroll = () => {
      if (!slider) return 0;
      // Scroll until slider end is comfortably visible with right-side margin
      const totalWidth = slider.scrollWidth;
      const viewWidth = window.innerWidth;
      return Math.max(0, totalWidth - viewWidth + 60);
    };

    // Single unified Master Timeline tied to the sticky section scroll
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
      defaults: {
        ease: "none",
      },
    });

    // 1. Smooth horizontal track sliding across normalized duration [0, 1]
    masterTl.to(
      slider,
      {
        x: () => -getMaxScroll(),
        ease: "none",
        duration: 1,
      },
      0
    );

    // 2. Active line progress across normalized duration [0, 1]
    masterTl.to(
      ".journey-line",
      {
        width: "100%",
        ease: "none",
        duration: 1,
      },
      0
    );

    // 3. Staggered reveal for each milestone along the track
    const stepDuration = 0.12;
    const intervals = [0.06, 0.25, 0.44, 0.63, 0.82];

    items.forEach((item, index) => {
      const startT = intervals[index] ?? (0.06 + index * 0.19);

      // Stem extension
      masterTl.to(
        `.jl-${item.id}`,
        {
          scaleY: 1,
          duration: stepDuration * 0.45,
          ease: "power1.out",
        },
        startT
      );

      // Node dot pop
      masterTl.to(
        `.jd-${item.id}`,
        {
          scale: 1,
          duration: stepDuration * 0.4,
          ease: "back.out(2)",
        },
        startT + stepDuration * 0.15
      );

      // Card content fade and slide into position
      masterTl.to(
        `.card-${item.id}`,
        {
          opacity: 1,
          y: 0,
          duration: stepDuration * 0.65,
          ease: "power2.out",
        },
        startT + stepDuration * 0.25
      );
    });

    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, { dependencies: [reducedMotion], scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="h-[240vh] max-[600px]:h-[280vh] w-full relative"
      style={sectionStyle}
    >
      {/* Sticky Full-Viewport Stage: pins smoothly while user scrolls down the section */}
      <div className="h-screen w-full sticky top-0 overflow-hidden flex items-center">
        {/* Horizontal Moving Canvas Container */}
        <div
          ref={wholeSliderRef}
          className="flex h-[76vh] items-center gap-8 md:gap-12 px-6 md:px-14 relative w-max"
        >
          {/* Leading Media & Overview Card */}
          <div className="h-[66vh] w-[28vw] min-w-[300px] max-w-[400px] flex flex-col justify-between p-6 bg-slate-50 border border-slate-200 shadow-sm shrink-0 relative z-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-[#2e1065] text-xs font-mono font-bold tracking-widest uppercase">
                {periodLabel}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900 leading-none">
                {title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Official 5-stage progression timeline for VyugamAI hackathon participants.
              </p>
            </div>

            <div className="h-[46%] w-full overflow-hidden border border-slate-200 shadow-inner">
              <img
                src={imageUrl}
                alt={imageAlt}
                draggable={false}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Milestones Track: contains the center timeline line and the 5 milestones */}
          <div className="relative flex items-center gap-8 md:gap-12 h-full">
            {/* Continuous Center Track Line (Dot sits exactly on this line) */}
            <div
              ref={trackLineRef}
              className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[3px] bg-slate-200 pointer-events-none z-0"
            >
              <div
                className="h-full rounded-full journey-line"
                style={activeStyle}
              />
            </div>

            {/* 5 Distinct Alternating Milestone Columns */}
            {allJourneyItems.map((item, index) => {
              const isTop = index % 2 === 0;

              return (
                <div
                  key={item.id}
                  className="relative h-[66vh] w-[25vw] min-w-[310px] max-w-[370px] shrink-0 z-10"
                >
                  {isTop ? (
                    /* ================= TOP MILESTONE ================= */
                    <>
                      {/* Top Card: parked strictly above (50% - 36px) - ZERO text overlap */}
                      <div
                        className={`card-${item.id} absolute left-0 right-0 bottom-[calc(50%+36px)] flex flex-col justify-end space-y-2`}
                      >
                        <div className="inline-flex items-center gap-1.5 w-fit px-2.5 py-0.5 rounded-none bg-purple-100 text-[#2e1065] text-[11px] font-mono font-bold tracking-wider uppercase">
                          {item.stage} • {item.timeframe}
                        </div>
                        <h4 className="text-base sm:text-lg md:text-xl font-black leading-tight text-slate-900 tracking-tight">
                          {item.title}
                        </h4>
                        <p
                          className="text-xs sm:text-sm leading-relaxed text-slate-600 line-clamp-3 font-medium"
                          style={mutedTextStyle}
                        >
                          {item.content}
                        </p>
                      </div>

                      {/* Vertical Stem: goes from dot (50%) UP to card bottom (50% - 36px) */}
                      <div
                        className={`absolute left-8 bottom-1/2 w-[2px] h-9 -translate-x-1/2 origin-bottom rounded-full pointer-events-none z-10 jl-${item.id}`}
                        style={activeStyle}
                      />

                      {/* Node Dot: positioned DEAD-CENTER on the horizontal timeline line */}
                      <div
                        className={`absolute left-8 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full pointer-events-none z-20 shadow-md border-2 border-white jd-${item.id}`}
                        style={activeStyle}
                      />
                    </>
                  ) : (
                    /* ================= BOTTOM MILESTONE ================= */
                    <>
                      {/* Node Dot: positioned DEAD-CENTER on the horizontal timeline line */}
                      <div
                        className={`absolute left-8 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full pointer-events-none z-20 shadow-md border-2 border-white jd-${item.id}`}
                        style={activeStyle}
                      />

                      {/* Vertical Stem: goes from dot (50%) DOWN to card top (50% + 36px) */}
                      <div
                        className={`absolute left-8 top-1/2 w-[2px] h-9 -translate-x-1/2 origin-top rounded-full pointer-events-none z-10 jl-${item.id}`}
                        style={activeStyle}
                      />

                      {/* Bottom Card: parked strictly below (50% + 36px) - ZERO text overlap */}
                      <div
                        className={`card-${item.id} absolute left-0 right-0 top-[calc(50%+36px)] flex flex-col justify-start space-y-2`}
                      >
                        <div className="inline-flex items-center gap-1.5 w-fit px-2.5 py-0.5 rounded-none bg-purple-100 text-[#2e1065] text-[11px] font-mono font-bold tracking-wider uppercase">
                          {item.stage} • {item.timeframe}
                        </div>
                        <h4 className="text-base sm:text-lg md:text-xl font-black leading-tight text-slate-900 tracking-tight">
                          {item.title}
                        </h4>
                        <p
                          className="text-xs sm:text-sm leading-relaxed text-slate-600 line-clamp-3 font-medium"
                          style={mutedTextStyle}
                        >
                          {item.content}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Comfortable Right End Buffer so Final Boss is fully inside the screen */}
          <div className="w-[14vw] min-w-[120px] shrink-0 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
