import { AvatarImage } from "@radix-ui/react-avatar";
import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import {
  Link,
  NavLink,
  Outlet,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconHome,
  IconMenu,
  IconServer,
  IconTransfer,
} from "@tabler/icons-react";
import { useState } from "react";

import SidebarItem from "~/components/Sidebar/SidebarItem";
import SidebarSection from "~/components/Sidebar/SidebarSection";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "~/components/ui/sheet";
import { type Server } from "~/lib/db/schema";
import { getServers } from "~/lib/queries.server";
import { authenticator } from "~/lib/services/auth.server";
import { cn } from "~/lib/utils/cn";
import { type Server as SelectedServer } from "~/types/Server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const url = new URL(request.url);
  if (url.pathname === "/app") {
    return redirect("/app/dashboard");
  }

  const servers = await getServers();

  return { user, servers };
};

export default function App() {
  const { user, servers } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [selectedServer, setSelectedServer] = useState<Server>(servers[0]);
  const [isServerPopoverOpen, setIsServerPopoverOpen] = useState(false);

  const NavigationItems = [
    {
      section: "Main",
      items: [
        {
          label: "Home",
          path: `/app/${selectedServer.shortName}/dashboard`,
          icon: <IconHome size={24} aria-hidden="true" />,
        },
        {
          label: "Servers",
          path: `/app/${selectedServer.shortName}/servers`,
          icon: <IconServer size={24} aria-hidden="true" />,
        },
      ],
    },
    {
      section: "Actions",
      items: [
        {
          label: "Transactions",
          path: `/app/${selectedServer.shortName}/transactions`,
          icon: <IconTransfer size={24} aria-hidden="true" />,
        },
      ],
    },
  ];

  return (
    <>
      <div className="h-full overflow-hidden">
        <div className="h-full bg-[#161616] text-[#ededed]">
          <div className="box-border h-screen w-full flex-grow overflow-y-scroll">
            <div className="grid auto-cols-auto md:pl-[248px]">
              {/* Sidebar */}
              <div className="fixed bottom-0 left-0 top-0 z-0 box-border hidden w-[248px] flex-col border-r border-solid border-r-[#343434] bg-[#1c1c1c] md:flex">
                {/* Sidebar Brand */}
                <div>
                  <Link
                    className="mx-4 mb-1 mt-6 flex cursor-pointer flex-row gap-4 bg-none p-0"
                    to="/app/dashboard"
                  >
                    <img src="/logo.svg" alt="Logo" className="w-12" />
                    <h1 className="text-center font-anta text-xl font-bold tracking-wider text-[#ededed]">
                      Divinity
                    </h1>
                  </Link>
                </div>

                <div className="relative px-3 pt-3">
                  <Popover
                    open={isServerPopoverOpen}
                    onOpenChange={setIsServerPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isServerPopoverOpen}
                        className="w-full justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <IconServer size={20} aria-hidden="true" />

                          {selectedServer.name}
                        </div>

                        {isServerPopoverOpen ? (
                          <IconChevronDown size={16} aria-hidden="true" />
                        ) : (
                          <IconChevronUp size={16} aria-hidden="true" />
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
                                  navigate(`/app/${server.shortName}/servers`);
                                }}
                              >
                                <IconCheck
                                  size={16}
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    server.id === selectedServer.id
                                      ? "opacity-100"
                                      : "opacity-0",
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

                {/* Sidebar Navigation */}
                <div className="flex flex-col overflow-y-scroll py-3 pl-3 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-transparent">
                  {NavigationItems.map((section) => (
                    <SidebarSection key={section.section}>
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
              </div>

              {/* Main Content */}
              <div className="box-border flex min-h-full flex-col">
                {/* Top Navigation */}
                <nav className="sticky top-0 z-10 flex items-center border-b border-b-[#343434] bg-[#1c1c1c] px-4 py-2 pl-5">
                  <div className="hidden flex-auto items-center justify-end gap-4 md:flex">
                    <Button variant="outline" asChild>
                      <a
                        href="https://discord.com"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 127.14 96.36"
                          width="20"
                        >
                          <path
                            fill="#fff"
                            d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"
                          />
                        </svg>
                        Discord
                      </a>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Avatar className="rounded shadow-[0px_0px_0px_1px_#161616] transition-shadow duration-200 hover:shadow-[0px_0px_0px_3px_#383838]">
                          <AvatarImage
                            src={`https://crafatar.com/avatars/${user.uuid}?size=32&overlay`}
                          />
                          <AvatarFallback>N/A</AvatarFallback>
                        </Avatar>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => navigate("/app/settings")}
                        >
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/logout")}>
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                      >
                        <IconMenu size={20} aria-hidden="true" />
                        <span className="sr-only">Toggle navigation menu</span>
                      </Button>
                    </SheetTrigger>

                    <SheetContent side="left">
                      <nav className="grid gap-6 text-lg font-medium">
                        <Link
                          to="/app/dashboard"
                          className="flex items-center gap-2 text-lg font-semibold"
                        >
                          <img
                            src="/logo.svg"
                            alt="Divinity Bank"
                            className="w-12"
                          />
                          <h1 className="text-center font-anta text-xl font-bold tracking-wider text-[#ededed]">
                            Divinity
                          </h1>
                          <span className="sr-only">Divinity Bank</span>
                        </Link>

                        {NavigationItems.map((section) =>
                          section.items.map((item) => (
                            <SheetClose key={item.label} asChild>
                              <NavLink key={item.label} to={item.path}>
                                {/* Move `className` logic to <span> due to `asChild` treating `className` as a literal string */}
                                {({ isActive }) => (
                                  <span
                                    className={cn(
                                      "font-semibold transition-colors duration-200 hover:text-foreground",
                                      !isActive &&
                                        "font-medium text-muted-foreground",
                                    )}
                                  >
                                    {item.label}
                                  </span>
                                )}
                              </NavLink>
                            </SheetClose>
                          )),
                        )}
                      </nav>
                    </SheetContent>
                  </Sheet>
                </nav>

                <main className="relative flex grow flex-col p-6">
                  <Outlet
                    context={
                      {
                        selectedServer,
                        setSelectedServer,
                      } satisfies SelectedServer
                    }
                  />
                </main>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
