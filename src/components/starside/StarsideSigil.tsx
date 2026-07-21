"use client";

/**
 * StarsideSigil — FINAL, locked configuration. One component, one config.
 * There is no prop for toggling chord comets, tick mode, architecture, or
 * any of the other axes that existed during development — those were
 * tuning knobs for the review harness, not production surface. If a
 * future change needs one of them exposed again, add the prop
 * deliberately; don't restore the old options object wholesale.
 *
 * The one variation between device classes is art direction, not a
 * performance gate: below the desktop breakpoint the background is
 * deliberately calmer, so the tick shimmer is off and the comet field is
 * thinned. This replaced an earlier hardwareConcurrency/pointer
 * heuristic, which measured CPU parallelism when the workload is
 * raster-bound and so misjudged capable 4-core desktops. Do not read the
 * small-screen config as a performance guarantee; nothing here measures
 * the device.
 *
 * Props: seed (cosmetic variation only, same composition rules — see
 * "should the seed be randomized" discussion, default stays fixed) and
 * emblemSrc (required, the centerpiece PNG).
 */

import { useEffect, useMemo } from "react";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { generateSigil, VIEW } from "@/lib/sigilGen";

type LayerKey =
  | "emblem"
  | "stringStatic"
  | "stringAnim"
  | "frameStatic"
  | "frameAnim"
  | "tickRing";
/** `ink` is the layer's composited opacity, standing in for the design's
 *  per-stroke rgba alpha. It has to live on the layer group rather than as
 *  a `stroke-opacity` on the <svg>, because sigilGen emits its own
 *  stroke-opacity per element, which would override an inherited value
 *  instead of multiplying with it. */
type LayerSpec = {
  key: LayerKey;
  spin: [number, 1 | -1] | null;
  depth: number;
  order: number;
  ink: number;
};

const SPIN_TICK: [number, 1 | -1] = [66, -1];
const LAYER_SPECS: LayerSpec[] = [
  { key: "tickRing", spin: SPIN_TICK, depth: 1, order: 0, ink: 0.5 },
  { key: "frameStatic", spin: null, depth: 0.75, order: 1, ink: 0.58 },
  { key: "frameAnim", spin: null, depth: 0.75, order: 1, ink: 0.58 },
  { key: "stringStatic", spin: null, depth: 0.55, order: 2, ink: 0.72 },
  { key: "stringAnim", spin: null, depth: 0.55, order: 2, ink: 0.72 },
  { key: "emblem", spin: null, depth: 0.3, order: 3, ink: 0.94 },
];

const INK = "#ffffff";
const BACKDROP = "#191919";
const ENTRANCE_DURATION = 0.6;
const ENTRANCE_STAGGER = 0.08;
const ENTRANCE_EASE = [0.25, 0.1, 0.25, 1] as const;
const PARALLAX_RANGE = 16;
const EMBLEM_SIZE = 540;
const EMBLEM_POS = (VIEW - EMBLEM_SIZE) / 2;
const SIZE = "min(92vmin, 880px)";
const TICK_GRID = 0.25;
/** Matches the isDesktop breakpoint used by the dialog components. */
const DESKTOP_QUERY = "(min-width: 768px)";
/** Comet load below the desktop breakpoint. Safe to vary per device:
 *  chordPulseFraction only shifts the rPulse stream, which feeds animation
 *  timing, never geometry (geometry draws from rTick/rString/rFrame), so
 *  the static composition is identical on both paths. */
const CALM_CHORD_FRACTION = 0.45;

export default function StarsideSigil({
  seed = 7,
  emblemSrc,
}: {
  seed?: number;
  emblemSrc: string;
}) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  const layers = useMemo(
    () =>
      generateSigil(seed, 2.5, {
        chordPulse: "overlay",
        cometLen: 90,
        chordPulseFraction: isDesktop ? 1 : CALM_CHORD_FRACTION,
        spokePulse: false,
        collarComets: false,
        tickAnim: isDesktop,
        tickMode: "steps",
        tickGrid: TICK_GRID,
        speckle: true,
        widthMod: true,
      }),
    [seed, isDesktop]
  );

  const prefersReducedMotion = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, prefersReducedMotion]);

  const emblemMarkup = `<image href="${emblemSrc}" x="${EMBLEM_POS}" y="${EMBLEM_POS}" width="${EMBLEM_SIZE}" height="${EMBLEM_SIZE}"/>`;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
        background: BACKDROP,
        zIndex: -1,
      }}
    >
      <style>{`
        @keyframes ss-spinrev { to { transform: rotate(-360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .ss-layer { animation: none !important; }
        }
      `}</style>
      <div style={{ position: "relative", width: SIZE, aspectRatio: "1" }}>
        {LAYER_SPECS.map((spec) => {
          const markup =
            spec.key === "emblem" ? emblemMarkup : layers[spec.key];
          if (!markup) return null;
          return (
            <SigilLayer
              key={spec.key}
              spec={spec}
              markup={markup}
              spin={prefersReducedMotion ? null : spec.spin}
              sx={sx}
              sy={sy}
              reduced={!!prefersReducedMotion}
            />
          );
        })}
      </div>
    </div>
  );
}

function SigilLayer({
  spec,
  markup,
  spin,
  sx,
  sy,
  reduced,
}: {
  spec: LayerSpec;
  markup: string;
  spin: [number, 1 | -1] | null;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  reduced: boolean;
}) {
  const x = useTransform(sx, (v) => v * PARALLAX_RANGE * spec.depth);
  const y = useTransform(sy, (v) => v * PARALLAX_RANGE * spec.depth);

  return (
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        x: reduced ? 0 : x,
        y: reduced ? 0 : y,
      }}
      initial={reduced ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: spec.ink, scale: 1 }}
      transition={{
        duration: ENTRANCE_DURATION,
        delay: spec.order * ENTRANCE_STAGGER,
        ease: ENTRANCE_EASE,
      }}
    >
      <svg
        className="ss-layer"
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          stroke: INK,
          fill: "none",
          animation: spin
            ? `ss-spinrev ${spin[0]}s linear infinite`
            : undefined,
        }}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </motion.div>
  );
}
