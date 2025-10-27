"use server";

import { cache } from "react";

import { ilike } from "drizzle-orm";

import { getSession } from "@/lib/auth/jwt";
import type { SessionPayload } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export type JWTUser = Pick<
  SessionPayload,
  "uuid" | "username" | "role" | "font"
> & {
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
    font: session.font,
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

      // Build query dynamically
      let query = db
        .select({
          id: users.id,
          minecraftUsername: users.minecraftUsername,
          minecraftUuid: users.minecraftUuid,
        })
        .from(users)
        .$dynamic();

      // Apply search filter if provided
      if (searchQuery && searchQuery.trim()) {
        query = query.where(
          ilike(users.minecraftUsername, `%${searchQuery.trim()}%`)
        );
      }

      // Apply limit and execute query
      const result = await query.limit(limit);

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
