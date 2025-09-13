import type { Metadata } from "next";

import { db } from "@/lib/db";
import { servers } from "@/lib/db/schema";
import { getServerByShortName } from "@/lib/db/queries/server.queries";

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

  return serverShortNames.map((shortName) => ({
    server: shortName,
  }));
}

export default async function ServerLayout({
  children,
  params,
}: ServerLayoutProps) {
  const { server: serverSlug } = await params;
  const server = await getServerByShortName(serverSlug);

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
    title: `${server?.name || serverSlug} | Divinity Bank`,
    description: `Banking dashboard for ${server?.name || serverSlug}`,
  };
}
