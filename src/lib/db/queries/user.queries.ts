"use server";

import { cache } from "react";
import { ilike } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/jwt";
import type { SessionPayload } from "@/lib/auth/jwt";

export type JWTUser = Pick<SessionPayload, "uuid" | "username" | "role"> & {
  id: number;
};

export interface MinecraftUser {
  id: number;
  minecraftUsername: string;
  minecraftUuid: string;
}

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

/**
 * Searches for Minecraft users by username.
 *
 * @param searchQuery - The search term to filter usernames by
 * @param limit - Maximum number of results to return (default: 10)
 * @returns A promise that resolves to an array of MinecraftUser objects
 */
export const getMinecraftUsers = cache(
  async (
    searchQuery?: string,
    limit: number = 10
  ): Promise<MinecraftUser[]> => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        return [];
      }

      const baseQuery = db
        .select({
          id: users.id,
          minecraftUsername: users.minecraftUsername,
          minecraftUuid: users.minecraftUuid,
        })
        .from(users);

      // Apply search filter if provided
      let result;
      if (searchQuery && searchQuery.trim()) {
        result = await baseQuery
          .where(ilike(users.minecraftUsername, `%${searchQuery.trim()}%`))
          .limit(limit);
      } else {
        result = await baseQuery.limit(limit);
      }

      // Exclude current user from results
      return result.filter((user) => user.id !== currentUser.id);
    } catch (error) {
      console.error("Failed to fetch minecraft users:", error);
      return [];
    }
  }
);

/**
 * Searches for Minecraft users by username with validation.
 * Requires a minimum of 3 characters for the search query.
 *
 * @param searchQuery - The search term to filter usernames by (minimum 3 characters)
 * @param limit - Maximum number of results to return (default: 10)
 * @returns A promise that resolves to an array of MinecraftUser objects
 */
export const searchMinecraftUsers = cache(
  async (searchQuery: string, limit: number = 10): Promise<MinecraftUser[]> => {
    // Validate minimum search length
    if (!searchQuery || searchQuery.trim().length < 3) {
      return [];
    }

    return getMinecraftUsers(searchQuery, limit);
  }
);
