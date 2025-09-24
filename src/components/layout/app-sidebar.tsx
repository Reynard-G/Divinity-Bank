"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import {
  IconHome,
  IconServer,
  IconTransfer,
  IconSettings,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from "@/components/ui/command";
import { cn } from "@/lib/utils/cn";
import type { Server } from "@/lib/db/schema";
import {
  createServerRoutes,
  createServerRoute,
  SERVER_ROUTES,
} from "@/lib/utils/server-routes";

interface SidebarItemProps {
  label: string;
  path: string;
  icon: React.ReactNode;
}

function SidebarItem({ label, path, icon }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === path || pathname.startsWith(path + "/");

  return (
    <Link
      href={path}
      className={cn(
        "flex h-8 items-center rounded-md p-2 text-sm font-medium leading-5 text-[#a0a0a0] no-underline transition-colors duration-100",
        isActive
          ? "pointer-events-none cursor-default bg-[#3b3b3b] text-foreground"
          : "transition-colors duration-200 hover:bg-[#3b3b3b] hover:text-[#b0b0b0]"
      )}
    >
      <div className="flex grow items-center gap-2">
        <div className="relative text-foreground">{icon}</div>
        <span className="grow">{label}</span>
      </div>
    </Link>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      {/* the section header */}
      <div className="flex flex-col gap-3">
        {title && (
          <div className="whitespace-nowrap text-[10px] font-semibold uppercase leading-[12px] tracking-widest text-[#b0b0b0]">
            {title}
          </div>
        )}
        <div className="flex flex-col gap-1">{children}</div>
      </div>
    </>
  );
}

export function AppSidebar({ servers }: { servers: Server[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [isServerPopoverOpen, setIsServerPopoverOpen] = useState(false);

  // Extract current server from pathname
  useEffect(() => {
    if (pathname.startsWith("/app/") && servers.length > 0) {
      const page = pathname.match(/^\/app\/server\/([^\/]+)\/?/); // Match /app/server/:server or /app/server/:server/
      const serverFromPath = page ? page[1] : null;

      const matchedServer = servers.find(
        (server) => server.shortName === serverFromPath
      );
      if (matchedServer) {
        setSelectedServer(matchedServer);
      } else {
        setSelectedServer(servers[0]);
      }
    }
  }, [pathname, servers]);

  // Get navigation items based on current server
  const getNavigationItems = (serverShortName: string | null) => {
    const baseServer = serverShortName || servers[0]?.shortName || "default";

    return [
      {
        section: "Account",
        items: [
          {
            label: "Dashboard",
            path: createServerRoutes.dashboard(baseServer),
            icon: <IconHome size={16} aria-hidden="true" />,
          },
          {
            label: "Servers",
            path: createServerRoutes.servers(baseServer),
            icon: <IconServer size={16} aria-hidden="true" />,
          },
        ],
      },
      {
        section: "Services",
        items: [
          {
            label: "Transactions",
            path: createServerRoutes.transactions(baseServer),
            icon: <IconTransfer size={16} aria-hidden="true" />,
          },
        ],
      },
    ];
  };

  const bottomNavigation = {
    section: "User",
    items: [
      {
        label: "Settings",
        path: "/app/settings",
        icon: <IconSettings size={16} aria-hidden="true" />,
      },
    ],
  };

  const navigationItems = getNavigationItems(selectedServer?.shortName || null);

  return (
    <div className="fixed bottom-0 left-0 top-0 z-0 box-border hidden w-[248px] flex-col border-r border-solid border-r-[#3b3b3b] bg-sidebar md:flex">
      {/* Sidebar Brand */}
      <div className="flex min-h-16 flex-col items-center">
        <Link
          className="flex h-full cursor-pointer flex-row items-center justify-center gap-2 bg-none p-0"
          href="/"
        >
          <Image
            unoptimized
            src="/logo.svg"
            alt="Logo"
            width={48}
            height={48}
          />
          <h1 className="text-center font-anta text-xl font-bold tracking-wider text-foreground">
            Divinity
          </h1>
        </Link>
      </div>

      {/* Server Selector */}
      {pathname.startsWith("/app/server/") && (
        <div className="relative px-5 pt-3">
          <Popover
            open={isServerPopoverOpen}
            onOpenChange={setIsServerPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-label="Server selector"
                aria-expanded={isServerPopoverOpen}
                className="w-full justify-between !bg-background"
              >
                <div className="flex items-center gap-2">
                  <IconServer size={20} aria-hidden="true" />
                  {selectedServer?.name || "Select server"}
                </div>

                {isServerPopoverOpen ? (
                  <IconChevronUp size={16} aria-hidden="true" />
                ) : (
                  <IconChevronDown size={16} aria-hidden="true" />
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="mx-3 w-[221px] p-0">
              <Command>
                <CommandInput placeholder="Search servers..." />
                <CommandList>
                  <CommandEmpty>No servers found.</CommandEmpty>
                  <CommandGroup>
                    {servers.map((server) => (
                      <CommandItem
                        key={server.id}
                        onSelect={() => {
                          setSelectedServer(server);
                          setIsServerPopoverOpen(false);
                          // Navigate to the same page type on the new server
                          const page = pathname.match(
                            /^\/app\/server\/[^\/]+\/([^\/]+)/
                          ); // Match /app/server/:server/:page
                          const currentPageType = page
                            ? page[1]
                            : SERVER_ROUTES.DASHBOARD;

                          router.push(
                            createServerRoute(server.shortName, currentPageType)
                          );
                        }}
                      >
                        <IconCheck
                          size={16}
                          className={cn(
                            "mr-2 h-4 w-4",
                            server.id === selectedServer?.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                          aria-hidden="true"
                        />
                        {server.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Navigation */}
      <div className="flex h-full flex-col justify-between overflow-y-auto px-5 py-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-transparent">
        <div className="flex flex-col gap-6">
          {navigationItems.map((section) => (
            <SidebarSection key={section.section} title={section.section}>
              {section.items.map((item) => (
                <SidebarItem
                  key={item.label}
                  label={item.label}
                  path={item.path}
                  icon={item.icon}
                />
              ))}
            </SidebarSection>
          ))}
        </div>

        <div>
          <SidebarSection>
            {bottomNavigation.items.map((item) => (
              <SidebarItem
                key={item.label}
                label={item.label}
                path={item.path}
                icon={item.icon}
              />
            ))}
          </SidebarSection>
        </div>
      </div>
    </div>
  );
}
