import type { Metadata } from "next";

import { db } from "@/lib/db";
import { getServerByShortName } from "@/lib/db/queries/server.queries";
import { servers } from "@/lib/db/schema";

interface ServerLayoutProps {
  children: React.ReactNode;
  params: Promise<{ server: string }>;
}

export async function generateStaticParams() {
  const serverShortNames = await db
    .select()
    .from(servers)
    .orderBy(servers.id)
    .then((rows) => rows.map((row) => row.shortName));

  if (serverShortNames.length === 0) {
    throw new Error("No servers found - check database configuration");
  }

  return serverShortNames.map((shortName) => ({
    server: shortName,
  }));
}

export default async function ServerLayout({ children }: ServerLayoutProps) {
  return <>{children}</>;
}

export type ServerDirectoryParams = {
  params: Promise<{ server: string }>;
};

export async function generateMetadata({
  params,
}: ServerDirectoryParams): Promise<Metadata> {
  const { server: serverSlug } = await params;
  const server = await getServerByShortName(serverSlug);

  return {
    title: `${server?.name || serverSlug.toUpperCase()} | Divinity Bank`,
    description: `Banking dashboard for ${server?.name || serverSlug.toUpperCase()}`,
  };
}
