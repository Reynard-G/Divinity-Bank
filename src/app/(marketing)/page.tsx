import { BrandLockup } from "@/components/home/BrandLockup";
import { VoiceCyclingHero } from "@/components/home/VoiceCyclingHero";
import StarsideSigil from "@/components/starside/StarsideSigil";

/** Holds near-opaque higher than the design's original stops, which were
 *  tuned around a much smaller emblem. At the current EMBLEM_SIZE the
 *  emblem still sits behind the kicker on short laptop viewports, where
 *  the original gradient left it reading at ~0.58 brightness under the
 *  page's dimmest text; this keeps it near 0.22. The trailing .5 stop
 *  keeps the falloff gradual so the sigil dims out rather than ending on
 *  a visible edge. */
const BOTTOM_VIGNETTE =
  "linear-gradient(to top, #191919 8%, rgba(25,25,25,.92) 54%, rgba(25,25,25,.5) 78%, rgba(25,25,25,0) 100%)";
const TOP_VIGNETTE =
  "linear-gradient(to bottom, rgba(25,25,25,.85) 0%, rgba(25,25,25,0) 100%)";

export default function HomePage() {
  return (
    <main className="fixed inset-0 grid place-items-center overflow-hidden bg-background">
      <StarsideSigil emblemSrc="/logo.png" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%]"
        style={{ background: BOTTOM_VIGNETTE }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[24%]"
        style={{ background: TOP_VIGNETTE }}
      />

      {/* Centering lives on these wrappers so the entrance animations inside
          can own transform without fighting translateX(-50%). */}
      <div className="absolute left-1/2 top-[7.5%] -translate-x-1/2 text-center">
        <BrandLockup />
      </div>

      <div className="absolute bottom-[12%] left-1/2 w-[min(90vw,680px)] -translate-x-1/2">
        <VoiceCyclingHero />
      </div>
    </main>
  );
}
