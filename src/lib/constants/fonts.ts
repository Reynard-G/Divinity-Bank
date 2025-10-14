export const FONTS = Object.freeze({
  DEFAULT: "Default",
  SYSTEM: "System",
  ATKINSON_HYPERLEGIBLE: "Atkinson Hyperlegible",
} as const);

export type Font = (typeof FONTS)[keyof typeof FONTS];

export const FONT_CLASSNAMES: Record<Font, string> = {
  [FONTS.DEFAULT]: "font-neue_haas_grotesk",
  [FONTS.SYSTEM]: "font-sans",
  [FONTS.ATKINSON_HYPERLEGIBLE]: "font-atkinson_hyperlegible",
};
