import { LoaderFunctionArgs } from "@remix-run/node";
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
import {
  getBalance,
  getServers,
  getTransactionSummary,
} from "~/lib/queries.server";
import { authenticator } from "~/lib/services/auth.server";
import { type Server as SelectedServer } from "~/types/Server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = (
    await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    })
  ).id;

  const servers = getServers();

  const userData = servers.then((serverList) =>
    Promise.all(
      serverList.map(async (server) => {
        const [balance, transactionSummary] = await Promise.all([
          getBalance(userId, server.shortName),
          getTransactionSummary(userId, server.shortName),
        ]);
        return {
          shortName: server.shortName,
          balance,
          transactionsCount: transactionSummary.transactionsCount,
          latestTransactionDate: transactionSummary.latestTransactionDate,
        };
      }),
    ),
  );

  return defer(
    { servers, userData },
    {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=60",
      },
    },
  );
}

export default function Servers() {
  const { servers, userData } = useLoaderData<typeof loader>();
  const { setSelectedServer } = useOutletContext<SelectedServer>();
  const location = useLocation();

  return (
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
        {(resolvedServers: Server[]) => (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {resolvedServers.map((server) => (
              // Render base server card while waiting for user data
              <Suspense
                key={server.id}
                fallback={
                  <ServerSelectionCard
                    selectedServer={location.pathname
                      .split("/")
                      .includes(server.shortName)}
                    serverName={server.name}
                    serverShortName={server.shortName}
                    serverBannerImage={server.bannerLink}
                    serverBalance={undefined}
                    transactionsAmount={undefined}
                    lastTransactionDate={undefined}
                    onClick={() => setSelectedServer(server)}
                  />
                }
              >
                <Await resolve={userData}>
                  {(resolvedUserData) => {
                    const serverUserData = resolvedUserData.find(
                      (data) => data.shortName === server.shortName,
                    );
                    return (
                      <ServerSelectionCard
                        selectedServer={location.pathname
                          .split("/")
                          .includes(server.shortName)}
                        serverName={server.name}
                        serverShortName={server.shortName}
                        serverBannerImage={server.bannerLink}
                        serverBalance={serverUserData?.balance}
                        transactionsAmount={serverUserData?.transactionsCount}
                        lastTransactionDate={
                          serverUserData?.latestTransactionDate
                            ? new Date(serverUserData.latestTransactionDate)
                            : undefined
                        }
                        onClick={() => setSelectedServer(server)}
                      />
                    );
                  }}
                </Await>
              </Suspense>
            ))}
          </div>
        )}
      </Await>
    </Suspense>
  );
}
