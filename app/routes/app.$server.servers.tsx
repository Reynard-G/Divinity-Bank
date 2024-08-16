import {
  Await,
  defer,
  useLoaderData,
  useLocation,
  useOutletContext,
} from "@remix-run/react";
import { Suspense } from "react";

import ServerSelectionCard from "~/components/ServerSelectionCard";
import ServerSelectionCardSkeletonList from "~/components/Skeleton/ServerSelectionCardSkeletonList";
import { type Server } from "~/lib/db/schema";
import { getServers } from "~/lib/queries.server";
import { type Server as SelectedServer } from "~/types/Server";

export async function loader() {
  const servers = getServers();
  return defer({ servers });
}

export default function Servers() {
  const { servers } = useLoaderData<typeof loader>();
  const { setSelectedServer } = useOutletContext<SelectedServer>();
  const location = useLocation();

  return (
    <>
      <Suspense fallback={<ServerSelectionCardSkeletonList />}>
        <Await
          resolve={servers}
          errorElement={
            <div className="flex h-32 items-center justify-center">
              <p className="text-red-500">
                Error loading servers, please try again later.
              </p>
            </div>
          }
        >
          {(servers: Server[]) => (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {servers.map((server) => (
                <ServerSelectionCard
                  key={server.id}
                  selectedServer={location.pathname
                    .split("/")
                    .includes(server.shortName)}
                  serverName={server.name}
                  serverShortName={server.shortName}
                  serverBannerImage={server.bannerLink}
                  serverBalance="1234.56"
                  transactionsAmount={12}
                  lastTransactionDate={
                    new Date(Date.now() - 2 * 60 * 60 * 1000 - 23 * 60 * 1000)
                  } // 2 hours and 23 minutes ago
                  onClick={() => setSelectedServer(server)}
                />
              ))}
            </div>
          )}
        </Await>
      </Suspense>
    </>
  );
}
