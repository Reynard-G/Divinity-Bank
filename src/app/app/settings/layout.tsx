import { SettingsNav } from "@/components/SettingsNav";
import { PageHeader } from "@/components/ui/page-header";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default async function SettingsLayout({
  children,
}: SettingsLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl grow flex-col">
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences."
      />

      <div className="flex flex-1 flex-col space-y-4 md:space-y-2 lg:flex-row lg:space-x-8 lg:space-y-0 lg:overflow-hidden">
        <aside className="top-0 lg:sticky lg:w-1/3">
          <SettingsNav />
        </aside>

        <div className="flex w-full p-1 pb-6 pr-4">{children}</div>
      </div>
    </div>
  );
}

export async function generateMetadata() {
  return {
    title: "Settings | Divinity Bank",
    description: "Manage your account settings and preferences.",
  };
}
