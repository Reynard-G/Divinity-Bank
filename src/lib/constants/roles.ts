export const ROLES = Object.freeze({
  ADMIN: "ADMIN",
  BANKER: "BANKER",
  CLIENT: "CLIENT",
} as const);

export type Role = (typeof ROLES)[keyof typeof ROLES];
