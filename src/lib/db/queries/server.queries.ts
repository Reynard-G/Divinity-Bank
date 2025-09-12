import { cache } from 'react';
import { asc, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import type { Server } from '@/lib/db/schema';
import { servers } from '@/lib/db/schema';

/**
 * Fetches all servers from the database.
 * 
 * @returns An array of server objects, ordered by their ID.
 */
export const getServers = cache(async (): Promise<Server[]> => {
  return db
    .select()
    .from(servers)
    .orderBy(asc(servers.id));
});

/**
 * Fetches a server by its short name.
 *
 * @param serverShortName - The short name of the server to fetch.
 * @returns The server object if found, or null if not found.
 */
export const getServerByShortName = cache(async (serverShortName: string): Promise<Server | null> => {
  const server = await db
    .select()
    .from(servers)
    .where(
      eq(servers.shortName, serverShortName)
    )
    .then(res => res[0] || null);

  return server;
});