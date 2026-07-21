/**
 * sigilGen v7 — adds steps()-quantized tick animation (tickMode/tickGrid)
 * on top of v6's split-buffer, overlay-comet architecture. This is the
 * ONLY functional change from v6 (session 5). Everything else — comet
 * math, wear model, PRNG stream invariants — is unchanged; see the
 * session-5 compact for full history/rationale.
 *
 * tickMode "steps" quantizes every tick's animation-duration AND
 * animation-delay onto a shared grid (tickGrid seconds) and switches
 * the timing-function from ease-in-out to steps(n, jump-none), so that
 * value changes across all 216 ticks land on the same absolute-time
 * grid points instead of continuously. UNVERIFIED beyond desktop
 * measurement in the review harness — the mechanism assumes the browser
 * skips rasterizing frames where computed style didn't change, which is
 * a reasonable but not universally guaranteed Blink/WebKit behavior.
 * Measured on reference desktop: baseline (ease) 50fps/41 1%-low vs
 * steps@0.25s 144fps/55 1%-low. NOT yet verified on mobile — that's the
 * open question this version exists to let you answer.
 */

export type SigilLayers = {
  stringStatic: string;
  stringAnim: string;
  frameStatic: string;
  frameAnim: string;
  tickRing: string;
};

export type SigilOptions = {
  chordPulse?: "overlay" | "segments" | "off";
  cometLen?: number;
  chordPulseFraction?: number;
  spokePulse?: boolean;
  collarComets?: boolean;
  cometStepDeg?: 1 | 2 | 3;
  /** Graduation Ring animations on/off. Default true. */
  tickAnim?: boolean;
  /** Tick timing function. "ease" = original continuous interpolation.
   *  "steps" = quantized to tickGrid, see file header. Default "steps"
   *  — this is now the recommended default, not "ease". */
  tickMode?: "ease" | "steps";
  /** Quantization grid in seconds, only used when tickMode is "steps".
   *  Default 0.25 — the value validated in the review harness. */
  tickGrid?: number;
  speckle?: boolean;
  widthMod?: boolean;
};

const INK = "#ffffff";
export const VIEW = 1200;
const C = VIEW / 2;

export function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rad = (d: number) => (d * Math.PI) / 180;
const pol = (r: number, deg: number): [number, number] => [
  C + r * Math.cos(rad(deg)),
  C + r * Math.sin(rad(deg)),
];

const f = (n: number) => {
  const s = n.toFixed(1);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
};
const fv = (n: number) => {
  let s = n.toFixed(2);
  if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s.startsWith("0.") ? s.slice(1) : s;
};
const fd = (n: number) => {
  let s = n.toFixed(3);
  s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s.replace(/^(-?)0\./, "$1.");
};

const LAYER_CSS =
  `<style>` +
  `@keyframes sg-pulse{0%,100%{stroke-opacity:var(--b);}0.6%{stroke-opacity:1;}9%{stroke-opacity:var(--b);}}` +
  `.sg-p{animation:sg-pulse var(--p) linear var(--d) infinite}` +
  `@media (prefers-reduced-motion:reduce){.sg *{animation:none!important}}` +
  `</style>`;

function opacityProfile(
  r: () => number,
  o: {
    points?: number;
    base?: number;
    amp?: number;
    floor?: number;
    wrap?: boolean;
  } = {}
): (t: number) => number {
  const { points = 6, base = 0.55, amp = 0.5, floor = 0.06, wrap = false } = o;
  const vals: number[] = [];
  for (let i = 0; i <= points; i++) vals.push(base + (r() - 0.5) * 2 * amp);
  let inc = true,
    dec = true;
  for (let i = 1; i <= points; i++) {
    if (vals[i] < vals[i - 1]) inc = false;
    if (vals[i] > vals[i - 1]) dec = false;
  }
  if (inc || dec) {
    const mid = Math.max(1, Math.floor(points / 2));
    vals[mid] = base + (inc ? -1 : 1) * (0.3 + r() * 0.7) * amp;
  }
  if (wrap) vals[points] = vals[0];
  return (t: number) => {
    const x = Math.min(0.9999, Math.max(0, t)) * points;
    const i = Math.floor(x);
    const s = (1 - Math.cos((x - i) * Math.PI)) / 2;
    const v = vals[i] * (1 - s) + vals[i + 1] * s;
    return v < floor ? 0 : Math.min(1, v);
  };
}

type PulseOpts = { period: number; travel: number; phase: number };

type StrokeOpts = {
  seg?: number;
  jitter?: number;
  w?: number;
  base?: number;
  amp?: number;
  und?: number;
  pulse?: PulseOpts | null;
  widthMod?: boolean;
  speckle?: boolean;
};

function wear(
  m: number,
  hf: ((t: number) => number) | null,
  t: number,
  w: number,
  widthMod: boolean
): [number, number] {
  let op: number, sw: number;
  if (widthMod) {
    sw = w * (0.3 + 0.7 * m);
    op = m === 0 ? 0 : 0.5 + 0.5 * m;
  } else {
    sw = w;
    op = m;
  }
  if (op > 0 && hf) {
    const g = hf(t);
    if (g === 0) op = 0;
    else {
      op *= 0.45 + 0.55 * Math.min(1, g);
      if (widthMod) sw *= 0.75 + 0.25 * Math.min(1, g);
    }
  }
  return [op, sw];
}

const pulseAttr = (pulse: PulseOpts, frac: number, op: number) =>
  ` class="sg-p" style="--b:${fv(op)};--d:${fd(-pulse.phase + frac * pulse.travel)}s"`;

function etchedLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r: () => number,
  o: StrokeOpts = {}
): string {
  const {
    jitter = 0.7,
    w = 1,
    base = 0.55,
    amp = 0.5,
    und = 55,
    pulse = null,
    widthMod = true,
    speckle = true,
  } = o;
  const seg = o.seg ?? (speckle ? 5 : 8);
  const dx = x2 - x1,
    dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 2) return "";
  const strokeAmp = amp * (0.3 + r() * 0.9);
  const strokeBase = base + (r() - 0.5) * 0.14;
  const pts = Math.max(4, Math.round(len / und));
  const prof = opacityProfile(r, {
    base: strokeBase,
    amp: strokeAmp,
    points: pts,
  });
  const hf = speckle
    ? opacityProfile(r, {
        base: 0.72,
        amp: 0.55,
        points: Math.max(6, Math.round(len / 6)),
        floor: 0.1,
      })
    : null;
  const n = Math.max(3, Math.round(len / seg));
  const nx = -dy / len,
    ny = dx / len;
  const offs: number[] = [];
  for (let i = 0; i <= n; i++) offs.push((r() - 0.5) * jitter);
  let out = "";
  for (let i = 0; i < n; i++) {
    const tm = (i + 0.5) / n;
    const [op, sw] = wear(prof(tm), hf, tm, w, widthMod);
    if (op === 0 && !pulse) continue;
    const t0 = i / n,
      t1 = (i + 1) / n;
    const j0 = offs[i],
      j1 = offs[i + 1];
    const extra = pulse ? pulseAttr(pulse, i / n, op) : "";
    out += `<line x1="${f(x1 + dx * t0 + nx * j0)}" y1="${f(y1 + dy * t0 + ny * j0)}" x2="${f(x1 + dx * t1 + nx * j1)}" y2="${f(y1 + dy * t1 + ny * j1)}" stroke-width="${fv(sw)}" stroke-opacity="${fv(op)}"${extra}/>`;
  }
  return pulse ? `<g style="--p:${pulse.period}s">${out}</g>` : out;
}

function etchedCircleAt(
  cx: number,
  cy: number,
  R: number,
  r: () => number,
  o: StrokeOpts & { stepDeg?: number; pulseDir?: 1 | -1 } = {}
): string {
  const {
    w = 1,
    base = 0.55,
    amp = 0.5,
    und = 70,
    jitter = 0,
    pulse = null,
    pulseDir = 1,
    widthMod = true,
    speckle = true,
  } = o;
  const stepDeg = o.stepDeg ?? (speckle ? 2 : 3);
  const circ = 2 * Math.PI * R;
  const pts = Math.max(6, Math.round(circ / und));
  const prof = opacityProfile(r, { base, amp, points: pts, wrap: true });
  const hf = speckle
    ? opacityProfile(r, {
        base: 0.72,
        amp: 0.55,
        points: Math.max(12, Math.round(circ / 6)),
        floor: 0.1,
        wrap: true,
      })
    : null;
  const steps = Math.ceil(360 / stepDeg);
  const offs: number[] = [];
  for (let i = 0; i <= steps; i++) offs.push((r() - 0.5) * jitter);
  offs[steps] = offs[0];
  let out = "";
  for (let k = 0; k < steps; k++) {
    const a = k * stepDeg;
    const [op, sw] = wear(prof(a / 360), hf, a / 360, w, widthMod);
    if (op === 0 && !pulse) continue;
    const r0 = R + offs[k],
      r1 = R + offs[k + 1],
      ra = (r0 + r1) / 2;
    const x0 = cx + r0 * Math.cos(rad(a)),
      y0 = cy + r0 * Math.sin(rad(a));
    const x1 = cx + r1 * Math.cos(rad(a + stepDeg)),
      y1 = cy + r1 * Math.sin(rad(a + stepDeg));
    const extra = pulse
      ? pulseAttr(pulse, (pulseDir === 1 ? a : 360 - a) / 360, op)
      : "";
    out += `<path d="M${f(x0)} ${f(y0)} A${f(ra)} ${f(ra)} 0 0 1 ${f(x1)} ${f(y1)}" stroke-width="${fv(sw)}" stroke-opacity="${fv(op)}"${extra}/>`;
  }
  return pulse ? `<g style="--p:${pulse.period}s">${out}</g>` : out;
}

const etchedCircle = (
  R: number,
  r: () => number,
  o: StrokeOpts & { stepDeg?: number; pulseDir?: 1 | -1 } = {}
) => etchedCircleAt(C, C, R, r, o);

function chordOverlay(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  p: PulseOpts,
  w: number,
  ovKf: Set<string>,
  len: number,
  gradId: string
): string {
  let pct = Math.round((p.travel / p.period) * 100);
  pct = Math.max(3, Math.min(30, Math.round(pct / 3) * 3));
  const chordLen = Math.hypot(x2 - x1, y2 - y1);
  const r = Math.max(
    1,
    Math.min(pct, Math.round(pct * Math.min(1, len / chordLen)))
  );
  ovKf.add(pct + "|" + r);
  const delay = fd(-p.phase);
  return `<line x1="${-len}" y1="0" x2="0" y2="0" pathLength="1" stroke-dasharray="1 1.04" stroke-dashoffset="-1.02" stroke="url(#${gradId})" stroke-width="${fv(w * 0.55)}" opacity="0" style="offset-path:path('M${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)}');offset-rotate:auto;animation:sg-cm${pct}-${r} ${p.period}s linear ${delay}s infinite"/>`;
}

function cometKf(p: number, r: number): string {
  const keys = new Map<number, Record<string, string>>();
  const add = (k: number, props: Record<string, string>) =>
    keys.set(k, Object.assign(keys.get(k) || {}, props));
  add(0, {
    "offset-distance": "0%",
    "stroke-dashoffset": "-1.02",
    opacity: "0",
  });
  add(1, { opacity: "1" });
  add(r, { "stroke-dashoffset": "0" });
  add(p, { "offset-distance": "100%", opacity: "1" });
  add(p + 3, { opacity: "0" });
  add(100, {
    "offset-distance": "100%",
    "stroke-dashoffset": "0",
    opacity: "0",
  });
  return (
    `@keyframes sg-cm${p}-${r}{` +
    [...keys.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(
        ([k, v]) =>
          `${k}%{${Object.entries(v)
            .map(([a, b]) => a + ":" + b)
            .join(";")}}`
      )
      .join("") +
    `}`
  );
}

const ovKeyframes = (ovKf: Set<string>) =>
  [...ovKf]
    .map((key) => {
      const [p, r] = key.split("|").map(Number);
      return cometKf(p, r);
    })
    .join("");

const cometDefs = (len: number, gradId: string) =>
  `<defs><linearGradient id="${gradId}" gradientUnits="userSpaceOnUse" x1="${-len}" y1="0" x2="0" y2="0">` +
  `<stop offset="0" stop-color="${INK}" stop-opacity="0"/>` +
  `<stop offset=".55" stop-color="${INK}" stop-opacity=".3"/>` +
  `<stop offset=".85" stop-color="${INK}" stop-opacity=".7"/>` +
  `<stop offset="1" stop-color="${INK}" stop-opacity=".95"/>` +
  `</linearGradient></defs>`;

function quant(v: number, grid: number) {
  return Math.max(grid, Math.round(v / grid) * grid);
}
function stepsOf(dur: number, grid: number) {
  return Math.max(1, Math.round(dur / grid));
}

const COLLAR_OUT = 290;
const COLLAR_IN = 276;
const SPOKE_START_R = 478;
const SPOKE_R = COLLAR_OUT;
const SPOKE_BASE = 0.66;
const SPOKE_AMP = 0.34;
const SPOKE_W = 0.9;

export function generateSigil(
  seed = 7,
  uniformStrokeW: number | null = 2.5,
  opts: SigilOptions = {}
): SigilLayers {
  const {
    chordPulse = "overlay",
    cometLen = 90,
    chordPulseFraction = 1,
    spokePulse = false,
    collarComets = false,
    cometStepDeg = 1,
    tickAnim = true,
    tickMode = "steps",
    tickGrid = 0.25,
    speckle = true,
    widthMod = true,
  } = opts;
  const gradId = `sgc${seed}`;

  const UW = (v: number) => uniformStrokeW ?? v;
  const rTick = mulberry32(seed * 101 + 1);
  const rString = mulberry32(seed * 101 + 2);
  const rFrame = mulberry32(seed * 101 + 3);
  const rPulse = mulberry32(seed * 101 + 5);

  const N = 14;
  const R1 = 452,
    R2 = 312;
  const ovKf = new Set<string>();
  let sS = "",
    sA = "";
  const verts: [number, number][] = [];
  for (let i = 0; i < N; i++) verts.push(pol(R1, (i * 360) / N - 90));
  for (let i = 0; i < N; i++) {
    const [x1, y1] = verts[i],
      [x2, y2] = verts[(i + 1) % N];
    sS += etchedLine(x1, y1, x2, y2, rString, {
      w: UW(1.3),
      base: 0.62,
      amp: 0.42,
      speckle,
      widthMod,
    });
  }
  const inner: [number, number][] = [];
  for (let i = 0; i < N; i++) inner.push(pol(R2, ((i + 0.5) * 360) / N - 90));
  for (let i = 0; i < N; i++) {
    const [x1, y1] = inner[i],
      [x2, y2] = inner[(i + 1) % N];
    sS += etchedLine(x1, y1, x2, y2, rString, {
      w: UW(1.1),
      base: 0.58,
      amp: 0.4,
      speckle,
      widthMod,
    });
    sS += `<circle cx="${f(x1)}" cy="${f(y1)}" r="1.8" fill="${INK}" fill-opacity=".6" stroke="none"/>`;
  }
  const lerp = (
    p: [number, number],
    q: [number, number],
    t: number
  ): [number, number] => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const at = (j: number) => inner[((j % N) + N) % N];
  for (let i = 0; i < N; i++) {
    const [vx, vy] = verts[i];
    {
      const ang = (i * 360) / N - 90;
      const [sx, sy] = pol(SPOKE_START_R, ang);
      const [tx, ty] = pol(SPOKE_R, ang);
      const p: PulseOpts = {
        period: +(5 + rPulse() * 6).toFixed(2),
        travel: +(0.65 + rPulse() * 0.7).toFixed(2),
        phase: +(rPulse() * 11).toFixed(2),
      };
      const spoke = etchedLine(sx, sy, tx, ty, rString, {
        w: UW(SPOKE_W),
        base: SPOKE_BASE,
        amp: SPOKE_AMP,
        jitter: 0.4,
        speckle,
        widthMod,
        pulse: spokePulse ? p : null,
      });
      if (spokePulse) sA += spoke;
      else sS += spoke;
    }
    const targets: [number, number][] = [];
    for (const t of [0.06, 0.2, 0.35, 0.65, 0.8, 0.94])
      targets.push(lerp(at(i - 1), at(i), t));
    for (const t of [0.6, 0.82]) targets.push(lerp(at(i - 2), at(i - 1), t));
    for (const t of [0.18, 0.4]) targets.push(lerp(at(i), at(i + 1), t));
    for (const [tx, ty] of targets) {
      const p: PulseOpts = {
        period: +(5 + rPulse() * 6).toFixed(2),
        travel: +(0.55 + rPulse() * 0.6).toFixed(2),
        phase: +(rPulse() * 11).toFixed(2),
      };
      const gate =
        chordPulseFraction >= 1 ? true : rPulse() < chordPulseFraction;
      const pulsed = gate && chordPulse !== "off";
      const perSeg = pulsed && chordPulse === "segments";
      const wearMk = etchedLine(vx, vy, tx, ty, rString, {
        w: UW(0.7),
        base: 0.38,
        amp: 0.4,
        jitter: 0.5,
        speckle,
        widthMod,
        pulse: perSeg ? p : null,
      });
      if (perSeg) sA += wearMk;
      else sS += wearMk;
      if (pulsed && chordPulse === "overlay")
        sA += chordOverlay(vx, vy, tx, ty, p, UW(0.7), ovKf, cometLen, gradId);
    }
    sS += etchedCircleAt(vx, vy, 5.5, rString, {
      stepDeg: 30,
      w: UW(1.1),
      base: 0.75,
      amp: 0.28,
      speckle,
      widthMod,
    });
    sS += `<circle cx="${f(vx)}" cy="${f(vy)}" r="2.2" fill="${INK}" fill-opacity=".7" stroke="none"/>`;
  }

  let fS = "",
    fA = "";
  fS += etchedCircle(478, rFrame, {
    w: UW(1.4),
    base: 0.58,
    amp: 0.45,
    jitter: 0.4,
    speckle,
    widthMod,
  });
  const ringPulse = (): PulseOpts => {
    const p = +(12 + rPulse() * 6).toFixed(2);
    return { period: p, travel: p, phase: +(rPulse() * p).toFixed(2) };
  };
  const outerPulse = ringPulse();
  const innerPulse = ringPulse();
  if (collarComets) {
    fA += etchedCircle(COLLAR_OUT, rFrame, {
      w: UW(1.6),
      base: 0.66,
      amp: 0.4,
      stepDeg: cometStepDeg,
      speckle,
      widthMod,
      pulse: outerPulse,
      pulseDir: -1,
    });
    fA += etchedCircle(COLLAR_IN, rFrame, {
      w: UW(0.8),
      base: 0.4,
      amp: 0.45,
      und: 50,
      stepDeg: cometStepDeg,
      speckle,
      widthMod,
      pulse: innerPulse,
      pulseDir: 1,
    });
  } else {
    fS += etchedCircle(COLLAR_OUT, rFrame, {
      w: UW(1.6),
      base: 0.66,
      amp: 0.4,
      speckle,
      widthMod,
    });
    fS += etchedCircle(COLLAR_IN, rFrame, {
      w: UW(0.8),
      base: 0.4,
      amp: 0.45,
      und: 50,
      speckle,
      widthMod,
    });
  }

  const wrapS = (m: string) =>
    m ? `<g class="sg" fill="none" stroke-linecap="round">${m}</g>` : "";
  const wrapA = (m: string) =>
    m
      ? `<g class="sg" fill="none" stroke-linecap="round">${LAYER_CSS}` +
        `${ovKf.size ? cometDefs(cometLen, gradId) : ""}${m}` +
        `${ovKf.size ? `<style>${ovKeyframes(ovKf)}</style>` : ""}</g>`
      : "";

  // ---- tick ring ----
  let tickRing = `<g class="sg">`;
  const RT = 500;
  const LEN_VARIANTS = 6,
    OP_VARIANTS = 4;
  let kf = "<style>";
  for (let v = 0; v < LEN_VARIANTS; v++) {
    const stopVals = [0.32 + rTick() * 0.1];
    for (let s = 0; s < 4; s++) stopVals.push(0.34 + rTick() * 0.66);
    kf += `@keyframes sg-len${v}{`;
    stopVals.forEach((val, idx) => {
      const pct = Math.round((idx / stopVals.length) * 100);
      kf += `${pct}%{stroke-dasharray:${val.toFixed(2)} 2;}`;
    });
    kf += `100%{stroke-dasharray:${stopVals[0].toFixed(2)} 2;}}`;
  }
  for (let v = 0; v < OP_VARIANTS; v++) {
    const lo = 0.25 + rTick() * 0.25,
      mid = 0.55 + rTick() * 0.3;
    kf += `@keyframes sg-op${v}{0%{opacity:1;}35%{opacity:${lo.toFixed(2)};}70%{opacity:${mid.toFixed(2)};}100%{opacity:1;}}`;
  }
  kf += `@media (prefers-reduced-motion:reduce){.sg *{animation:none!important}}`;
  kf += "</style>";
  tickRing += kf;

  const tickProf = opacityProfile(rTick, {
    base: 0.58,
    amp: 0.42,
    floor: 0.05,
    points: 12,
    wrap: true,
  });
  for (let i = 0; i < 216; i++) {
    const a = (i * 360) / 216;
    const major = i % 9 === 0;
    const wave = tickProf(a / 360);
    if (wave === 0) continue;
    const op = Math.min(1, wave * (major ? 1.3 : 0.85) + (rTick() - 0.5) * 0.1);
    if (op <= 0.05) continue;
    const opVar = Math.floor(rTick() * OP_VARIANTS);
    let opDur = 3.5 + rTick() * 4;
    let opDelay = rTick() * 8;
    if (major) {
      const ln = 24 + rTick() * 6;
      const [x1, y1] = pol(RT, a),
        [x2, y2] = pol(RT + ln, a);
      let st = "";
      if (tickAnim && tickMode === "ease") {
        st = ` style="animation:sg-op${opVar} ${opDur.toFixed(2)}s ease-in-out -${opDelay.toFixed(2)}s infinite"`;
      } else if (tickAnim && tickMode === "steps") {
        opDur = quant(opDur, tickGrid);
        opDelay = quant(opDelay, tickGrid);
        st = ` style="animation:sg-op${opVar} ${opDur}s steps(${stepsOf(opDur, tickGrid)},jump-none) -${opDelay}s infinite"`;
      }
      tickRing += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke-width="${fv(UW(1.5))}" stroke-opacity="${fv(op)}"${st}/>`;
    } else {
      const maxLn = 24 + rTick() * 6;
      const lenVar = Math.floor(rTick() * LEN_VARIANTS);
      let lenDur = 2 + rTick() * 3;
      let lenDelay = rTick() * 6;
      const [x1, y1] = pol(RT, a),
        [x2, y2] = pol(RT + maxLn, a);
      let st = "";
      if (tickAnim && tickMode === "ease") {
        st = ` style="animation:sg-len${lenVar} ${lenDur.toFixed(2)}s ease-in-out -${lenDelay.toFixed(2)}s infinite,sg-op${opVar} ${opDur.toFixed(2)}s ease-in-out -${opDelay.toFixed(2)}s infinite"`;
      } else if (tickAnim && tickMode === "steps") {
        lenDur = quant(lenDur, tickGrid);
        lenDelay = quant(lenDelay, tickGrid);
        opDur = quant(opDur, tickGrid);
        opDelay = quant(opDelay, tickGrid);
        st = ` style="animation:sg-len${lenVar} ${lenDur}s steps(${stepsOf(lenDur, tickGrid)},jump-none) -${lenDelay}s infinite,sg-op${opVar} ${opDur}s steps(${stepsOf(opDur, tickGrid)},jump-none) -${opDelay}s infinite"`;
      }
      tickRing += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" pathLength="1" stroke-dasharray="0.45 2" stroke-width="${fv(UW(1))}" stroke-opacity="${fv(op)}"${st}/>`;
    }
  }
  tickRing += `</g>`;

  return {
    stringStatic: wrapS(sS),
    stringAnim: wrapA(sA),
    frameStatic: wrapS(fS),
    frameAnim: wrapA(fA),
    tickRing,
  };
}
