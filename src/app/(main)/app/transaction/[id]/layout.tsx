import type { Metadata } from "next";

interface TransactionLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function TransactionLayout({
  children,
}: TransactionLayoutProps) {
  return <>{children}</>;
}

export type TransactionDirectoryParams = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: TransactionDirectoryParams): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Transaction #${id} | Divinity Bank`,
    description: `Details for transaction #${id} in Divinity Bank`,
  };
}
