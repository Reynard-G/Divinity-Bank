/**
 * The five neutral voice archetypes.
 *
 * Marketing and working surfaces use only these. The negative faces
 * (Lurker, Swarm, Verdict) are deliberately absent from this module
 * rather than filtered at the call site, so they cannot reach a public
 * surface by accident. Never mix archetypes within a single face's
 * kicker, headline, and call to action.
 */

export type Voice = {
  /** Rendered as "<name> speaks" in the homepage kicker. */
  name: string;
  headline: string;
  /** One to three words, in the voice of the face. */
  callToAction: string;
};

export const NEUTRAL_VOICES: readonly Voice[] = Object.freeze([
  {
    name: "The Synthetic",
    headline: "The ledger is open. Access is available.",
    callToAction: "Authenticate",
  },
  {
    name: "The Scholar",
    headline:
      "Every account here is remembered, and kept, as it has always been kept.",
    callToAction: "Enter the Ledger",
  },
  {
    name: "The Martial",
    headline:
      "The vault stands ready. The holder need only present themselves.",
    callToAction: "Present Yourself",
  },
  {
    name: "The Merchant",
    headline:
      "Come in, friend. Your coin is safe with me, and it stays between us.",
    callToAction: "Come In",
  },
  {
    name: "The Mystic",
    headline: "What is held, is held. Enter, and it keeps.",
    callToAction: "Show Yourself",
  },
]);
