import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
} from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import {
  IconNotification,
  IconPalette,
  IconTool,
  IconUser,
} from "@tabler/icons-react";

import SettingsSidebarNav from "~/components/Select/SettingsSidebarNav";
import { Separator } from "~/components/ui/separator";

const sidebarNavItems = [
  // Change Password
  {
    title: "Profile",
    icon: <IconUser size={18} />,
    href: "/app/settings/profile",
  },
  // Minecraft details
  {
    title: "Account",
    icon: <IconTool size={18} />,
    href: "/app/settings/account",
  },
  // Maybe font & themes?
  {
    title: "Appearance",
    icon: <IconPalette size={18} />,
    href: "/app/settings/appearance",
  },
  // Discord notifications is the future?
  {
    title: "Notifications",
    icon: <IconNotification size={18} />,
    href: "/app/settings/notifications",
  },
];

export const meta: MetaFunction = () => {
  return [
    { title: "Settings • Divinity" },
    { name: "description", content: "User settings for Divinity" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.pathname === "/app/settings") {
    return redirect(`/app/settings/profile`);
  }

  return null;
}

export default function Settings() {
  return (
    <div className="mx-auto flex w-full max-w-7xl grow flex-col max-h-[calc(100vh-7rem)]">
      <div className="top-0 z-0">
        <div title="Transactions" className="space-y-0.5">
          <h1 className="flex-auto text-2xl font-semibold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and set minecraft details.
          </p>
        </div>
      </div>

      <Separator className="mb-4 mt-2 lg:mb-6 lg:mt-4" />

      <div className="flex flex-1 flex-col space-y-4 md:space-y-2 lg:overflow-hidden lg:flex-row lg:space-x-8 lg:space-y-0">
        <aside className="top-0 lg:sticky lg:w-1/3">
          <SettingsSidebarNav items={sidebarNavItems} />
        </aside>

        <div className="flex w-full p-1 pr-4 pb-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
