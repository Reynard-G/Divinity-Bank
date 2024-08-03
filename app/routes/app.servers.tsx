import { Suspense } from "react";
import { type LoaderFunction } from "@remix-run/node";
import { Await, defer, useLoaderData } from "@remix-run/react";

import ServerSelectionCard from "~/components/ServerSelectionCard";
import { getServers } from "~/lib/queries.server";
import { type Server } from "~/lib/db/schema";
import ServerSelectionCardSkeletonList from "~/components/Skeleton/ServerSelectionCardSkeletonList";

export const loader: LoaderFunction = async () => {
  const servers = getServers();
  return defer({ servers });
};

export default function Servers() {
  const { servers } = useLoaderData<typeof loader>();

  return (
    <>
      <Suspense fallback={<ServerSelectionCardSkeletonList />}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Await resolve={servers}>
            {(servers: Server[]) =>
              servers.map((server) => (
                <ServerSelectionCard
                  key={server.id}
                  serverName={server.name}
                  serverBannerImage={server.bannerLink}
                  serverBalance="1234.56"
                  transactionsAmount={12}
                  lastTransactionDate={
                    new Date(Date.now() - 2 * 60 * 60 * 1000 - 23 * 60 * 1000)
                  } // 2 hours and 23 minutes ago
                />
              ))
            }
          </Await>
        </div>
      </Suspense>
    </>
  );
}
