import { cache } from "react";

import { getSession } from "@/lib/auth/jwt";
import type { SessionPayload } from "@/lib/auth/jwt";

export type JWTUser = Pick<SessionPayload, "uuid" | "username" | "role"> & { id: number };

/**
 * Fetches the current authenticated user from the JWT session.
 * 
 * @return A promise that resolves to an AuthUser object if the user is authenticated,
 *         or null if no user session exists.
 */

export const getCurrentUser = cache(async (): Promise<JWTUser | null> => {
  const session = await getSession();
  
  if (!session) {
    return null;
  }

  return {
    id: parseInt(session.id),
    uuid: session.uuid,
    username: session.username,
    role: session.role,
  };
});