import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getServers } from "@/lib/db/queries/server.queries";
import { createServerRoutes } from "@/lib/utils/server-routes";

async function getTargetServerForRedirect(): Promise<string | null> {
  const servers = await getServers();
  if (servers.length === 0) return null;

  const cookieStore = await cookies();
  const lastVisitedServer = cookieStore.get("lastVisitedServer")?.value;
  if (lastVisitedServer) {
    const matchedServer = servers.find(server => server.shortName === lastVisitedServer);
    if (matchedServer) return matchedServer.shortName;
  }

  return servers[0].shortName;
}

export default async function AppPage() {
  const targetServerShortName = await getTargetServerForRedirect();
  if (!targetServerShortName) {
    notFound();
  }

  redirect(createServerRoutes.dashboard(targetServerShortName));
}
