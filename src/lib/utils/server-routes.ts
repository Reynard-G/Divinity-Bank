/**
 * Generates server-specific route URLs
 * @param serverShortName - The short name of the server
 * @param route - The specific route within the server (e.g., 'dashboard', 'transactions')
 * @returns The complete URL path
 */
export function createServerRoute(
  serverShortName: string,
  route: string
): string {
  return `/app/server/${serverShortName}/${route}`;
}

/**
 * Predefined server routes for consistency
 */
export const SERVER_ROUTES = {
  DASHBOARD: "dashboard",
  TRANSACTIONS: "transactions",
  SERVERS: "servers",
} as const;

/**
 * Convenience functions for common server routes
 */
export const createServerRoutes = {
  dashboard: (serverShortName: string) =>
    createServerRoute(serverShortName, SERVER_ROUTES.DASHBOARD),
  transactions: (serverShortName: string) =>
    createServerRoute(serverShortName, SERVER_ROUTES.TRANSACTIONS),
  servers: (serverShortName: string) =>
    createServerRoute(serverShortName, SERVER_ROUTES.SERVERS),
} as const;
