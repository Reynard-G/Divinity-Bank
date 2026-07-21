"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { NEUTRAL_VOICES } from "@/lib/constants/voices";

const CYCLE_MS = 6000;
const FADE_OUT_MS = 540;
const HERO_IN_DELAY_MS = 60;
const LETTERS_IN_DELAY_MS = 520;
const PER_LETTER_MS = 26;
const FIRST_HERO_MS = 520;
const FIRST_LETTERS_MS = 560;

const RAIL_WIDTH = 360;
const RAIL_TEXT_GAP = 28;
const RAIL_LINE_MIN = 16;
const RAIL_LINE_MAX = 150;

const EASE = "cubic-bezier(.25,.1,.25,1)";

type Phase = {
  heroOpacity: number;
  heroOffset: number;
  letterOpacity: number;
  letterOffset: number;
  /** Off while letters exit so they leave together, on so they arrive one by one. */
  stagger: boolean;
};

const HIDDEN: Phase = {
  heroOpacity: 0,
  heroOffset: 10,
  letterOpacity: 0,
  letterOffset: 10,
  stagger: true,
};

const SHOWN: Phase = {
  heroOpacity: 1,
  heroOffset: 0,
  letterOpacity: 1,
  letterOffset: 0,
  stagger: false,
};

export function VoiceCyclingHero() {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(HIDDEN);
  const [labelWidth, setLabelWidth] = useState<number | null>(null);
  const [lineWidth, setLineWidth] = useState(RAIL_LINE_MIN);

  const labelMirror = useRef<HTMLSpanElement>(null);
  const kickerMirror = useRef<HTMLSpanElement>(null);
  const paused = useRef(false);

  const voice = NEUTRAL_VOICES[index] ?? NEUTRAL_VOICES[0]!;

  const measure = useCallback(() => {
    if (labelMirror.current) {
      // Letter-spacing leaves a trailing gap the mirror includes; the pad
      // keeps the last glyph off the clipping edge.
      setLabelWidth(Math.ceil(labelMirror.current.offsetWidth) + 2);
    }
    if (kickerMirror.current) {
      const textWidth = kickerMirror.current.offsetWidth;
      if (textWidth) {
        // The rail is a constant RAIL_WIDTH with a fixed gap either side of
        // the text, so the hairlines take whatever the label does not. They
        // are pinned to the outer edges, so those ends never move.
        const available = (RAIL_WIDTH - textWidth - RAIL_TEXT_GAP) / 2;
        setLineWidth(
          Math.max(
            RAIL_LINE_MIN,
            Math.min(RAIL_LINE_MAX, Math.round(available))
          )
        );
      }
    }
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [index, measure]);

  // Neue Haas and Anta load async, so the first measure runs against fallback
  // metrics and lands short. Re-measure once the real faces are in.
  useEffect(() => {
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
    };
  }, [measure]);

  useEffect(() => {
    if (prefersReducedMotion === null) return;

    if (prefersReducedMotion) {
      setPhase(SHOWN);
      return;
    }

    // Reset per cycle rather than appending for the life of the component,
    // so a page left open overnight does not accumulate spent timeout ids.
    let timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    later(
      () => setPhase((p) => ({ ...p, heroOpacity: 1, heroOffset: 0 })),
      FIRST_HERO_MS
    );
    later(
      () => setPhase((p) => ({ ...p, letterOpacity: 1, letterOffset: 0 })),
      FIRST_LETTERS_MS
    );

    const interval = setInterval(() => {
      if (paused.current) return;

      timers.forEach(clearTimeout);
      timers = [];

      setPhase({
        heroOpacity: 0,
        heroOffset: -10,
        letterOpacity: 0,
        letterOffset: -8,
        stagger: false,
      });

      later(() => {
        // Swapping while everything is invisible lets the measured rail and
        // button widths animate to their new values without visible clipping.
        setIndex((i) => (i + 1) % NEUTRAL_VOICES.length);
        setPhase((p) => ({ ...p, letterOffset: 8, stagger: true }));
        later(
          () => setPhase((p) => ({ ...p, heroOpacity: 1, heroOffset: 0 })),
          HERO_IN_DELAY_MS
        );
        later(
          () => setPhase((p) => ({ ...p, letterOpacity: 1, letterOffset: 0 })),
          LETTERS_IN_DELAY_MS
        );
      }, FADE_OUT_MS);
    }, CYCLE_MS);

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [prefersReducedMotion]);

  const kicker = `${voice.name} speaks`;
  const characters = Array.from(voice.callToAction);

  return (
    <motion.div
      className="flex flex-col items-center gap-[26px] text-center"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
      onFocus={() => {
        paused.current = true;
      }}
      onBlur={() => {
        paused.current = false;
      }}
    >
      <div className="relative h-3" style={{ width: RAIL_WIDTH }}>
        <span
          className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-white/[.22]"
          style={{ width: lineWidth, transition: `width .5s ${EASE}` }}
        />
        <span
          className="absolute right-0 top-1/2 h-px -translate-y-1/2 bg-white/[.22]"
          style={{ width: lineWidth, transition: `width .5s ${EASE}` }}
        />
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[.22em] text-white/[.42]"
          style={{
            opacity: phase.heroOpacity,
            transition: `opacity .5s ${EASE}`,
          }}
        >
          {kicker}
        </span>
        <span
          ref={kickerMirror}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[.22em] opacity-0"
        >
          {kicker}
        </span>
      </div>

      <h1
        className="flex min-h-[2.56em] w-[min(90vw,620px)] items-center justify-center text-balance font-neue_haas_grotesk text-[clamp(26px,3.4vw,40px)] font-normal leading-[1.28] tracking-[-.015em] text-white/[.92]"
        style={{
          opacity: phase.heroOpacity,
          transform: `translateY(${phase.heroOffset}px)`,
          transition: `opacity .55s ${EASE} .08s, transform .55s ${EASE} .08s`,
        }}
      >
        {voice.headline}
      </h1>

      <Button
        asChild
        variant="outline"
        className="relative h-auto gap-[10px] rounded-lg border-white/[.22] bg-white/[.05] px-[30px] py-[14px] font-neue_haas_grotesk text-[14px] font-semibold tracking-[.02em] text-white/[.92] shadow-none transition-[background-color,border-color] duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white/[.92] dark:border-white/[.22] dark:bg-white/[.05] dark:hover:bg-white/10"
        style={{ transitionTimingFunction: "cubic-bezier(.25,.1,.25,1)" }}
      >
        <Link href="/login" aria-label="Sign in to Divinity Bank">
          {/* The label is split per character for the reveal, which screen
              readers would announce letter by letter, so the accessible name
              comes from aria-label on the link instead. */}
          <span
            aria-hidden
            className="inline-block overflow-hidden whitespace-nowrap"
            style={{
              width: labelWidth ?? undefined,
              transition: `width .5s ${EASE}`,
            }}
          >
            <span className="inline-flex whitespace-nowrap">
              {characters.map((character, position) => (
                <span
                  key={`${index}-${position}`}
                  className="inline-block whitespace-pre"
                  style={{
                    opacity: phase.letterOpacity,
                    transform: `translateY(${phase.letterOffset}px)`,
                    transition:
                      `opacity .42s ${EASE} ${phase.stagger ? position * PER_LETTER_MS : 0}ms,` +
                      `transform .42s ${EASE} ${phase.stagger ? position * PER_LETTER_MS : 0}ms`,
                  }}
                >
                  {character}
                </span>
              ))}
            </span>
          </span>
          <span
            ref={labelMirror}
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 whitespace-nowrap text-[14px] font-semibold tracking-[.02em] opacity-0"
          >
            {voice.callToAction}
          </span>
          <ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />
        </Link>
      </Button>
    </motion.div>
  );
}
