import { type LoaderFunction } from "@remix-run/node";
import {
  Await,
  defer,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { Suspense } from "react";

import ServerSelectionCard from "~/components/ServerSelectionCard";
import ServerSelectionCardSkeletonList from "~/components/Skeleton/ServerSelectionCardSkeletonList";
import { type Server } from "~/lib/db/schema";
import { getServers } from "~/lib/queries.server";
import { type Server as SelectedServer } from "~/types/Server";

export const loader: LoaderFunction = async () => {
  const servers = getServers();
  return defer({ servers });
};

export default function Servers() {
  const { servers } = useLoaderData<typeof loader>();
  const { selectedServer, setSelectedServer } =
    useOutletContext<SelectedServer>();

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
                  selectedServer={selectedServer?.id === server.id}
                  serverName={server.name}
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
