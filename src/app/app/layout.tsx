import { unauthorized } from "next/navigation";

import NextTopLoader from "nextjs-toploader";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { getServers } from "@/lib/db/queries/server.queries";
import { getCurrentUser } from "@/lib/db/queries/user.queries";

export interface UserForComponents {
  id: number;
  name: string;
  uuid: string;
  role: string;
  image: string;
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const servers = await getServers();

  if (!user) {
    unauthorized();
  }

  const userDetails: UserForComponents = {
    id: user.id,
    name: user.username,
    uuid: user.uuid,
    role: user.role,
    image: `https://crafatar.com/avatars/${user.uuid}?size=36&overlay`,
  };

  return (
    <>
      <NextTopLoader
        color="#FAFAFA"
        shadow="0px 0px 10px rgba(0, 0, 0, 0.1)"
        showSpinner={false}
      />

      <div className="h-full overflow-hidden">
        <div className="h-full bg-background text-foreground">
          <div className="box-border h-screen w-full grow overflow-y-auto">
            <div className="grid auto-cols-auto md:pl-[248px]">
              <AppSidebar servers={servers} />

              <div className="box-border flex min-h-full flex-col">
                <AppHeader user={userDetails} />

                <main className="relative flex grow flex-col p-6">
                  {children}
                </main>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
