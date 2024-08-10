import { Suspense, useState } from "react";
import { IconPlus, IconPlusMinus, IconSelector } from "@tabler/icons-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import { NonSensitiveUser } from "~/types/User";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer";
import { Skeleton } from "../ui/skeleton";
import { Await, useLoaderData } from "@remix-run/react";
import { loader } from "~/routes/app.transactions";
import { useMediaQuery } from "~/hooks/use-media-query";
import UsersList from "../Command/MinecraftUsernameList";

export default function CreateTransactionsDialog() {
  const { allUsers } = useLoaderData<typeof loader>();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isUsersPopoverOpen, setIsUsersPopoverOpen] = useState<boolean>(false);
  const [selectedTransferUser, setSelectedTransferUser] =
    useState<NonSensitiveUser | null>(null);

  const handleUserSelect = (user: NonSensitiveUser) => {
    // If the user is already selected, deselect it
    setSelectedTransferUser(
      user.minecraft_username === selectedTransferUser?.minecraft_username
        ? null
        : user,
    );
    setIsUsersPopoverOpen(false);
  };

  const triggerButton = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={isUsersPopoverOpen}
      className="justify-between"
    >
      {selectedTransferUser?.minecraft_username ? (
        <span className="truncate">
          {selectedTransferUser.minecraft_username}
        </span>
      ) : (
        <span className="text-muted-foreground">Select a User...</span>
      )}
      <IconSelector size={20} opacity={50} className="ml-2" />
    </Button>
  );

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <IconPlus size={16} className="mr-2" aria-hidden="true" />
            New Transaction
          </Button>
        </DialogTrigger>

        <DialogContent className="p-0" aria-describedby={undefined}>
          <VisuallyHidden.Root>
            <DialogTitle>Export</DialogTitle>
          </VisuallyHidden.Root>

          <div className="mx-auto mb-2 mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#323232]">
            <IconPlusMinus size={30} aria-hidden="true" />
          </div>

          <div className="mb-2 grid gap-2 px-12 text-center">
            <h1 className="mb-2 text-lg font-semibold">New Transaction</h1>

            <Tabs defaultValue="deposit">
              <TabsList className="mb-4 grid w-full grid-cols-3">
                <TabsTrigger value="deposit">Deposit</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                <TabsTrigger value="transfer">Transfer</TabsTrigger>
              </TabsList>

              <TabsContent value="deposit">
                <div>
                  <p className="text-base leading-6 text-muted-foreground">
                    Deposit money into your account by providing the necessary
                    details below. Please ensure that your{" "}
                    <strong>minecraft username</strong> is the same as this
                    account to avoid any issues.
                  </p>
                </div>

                <div className="mt-3 grid gap-2">
                  <div className="relative grid grid-cols-1 gap-1">
                    <p className="text-left text-sm text-muted-foreground">
                      Amount
                    </p>
                    <Input type="number" placeholder="100" className="w-full" />
                  </div>

                  <div className="relative grid grid-cols-1 gap-1">
                    <p className="text-left text-sm text-muted-foreground">
                      Proof of Deposit
                    </p>
                    <Input
                      id="proof-of-deposit"
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      placeholder="Upload proof of deposit"
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="withdraw">
                <div>
                  <p className="text-base leading-6 text-muted-foreground">
                    Withdraw money from your account by providing the necessary
                    details below. Please ensure that your{" "}
                    <strong>minecraft username</strong> is the same as this
                    account to avoid any issues.
                  </p>
                </div>

                <div className="mt-3 grid gap-2">
                  <div className="relative grid grid-cols-1 gap-1">
                    <p className="text-left text-sm text-muted-foreground">
                      Amount
                    </p>
                    <Input type="number" placeholder="100" className="w-full" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="transfer">
                <div>
                  <p className="text-base leading-6 text-muted-foreground">
                    Transfer money to another account by providing the necessary
                    details below. Please ensure that{" "}
                    <strong className="underline">both</strong>&nbsp;
                    <strong>minecraft usernames</strong> are correct to avoid
                    any issues.
                  </p>
                </div>

                <div className="mt-3 grid gap-2">
                  <div className="relative grid grid-cols-1 gap-1">
                    <p className="text-left text-sm text-muted-foreground">
                      Amount
                    </p>
                    <Input type="number" placeholder="100" className="w-full" />
                  </div>

                  <div className="relative grid grid-cols-1 gap-1">
                    <p className="text-left text-sm text-muted-foreground">
                      Recipient
                    </p>
                    <Suspense
                      fallback={<Skeleton className="h-8 w-24 rounded-md" />}
                    >
                      <Await resolve={allUsers}>
                        {(allUsers) => (
                          <>
                            {isDesktop ? (
                              <Popover
                                open={isUsersPopoverOpen}
                                onOpenChange={setIsUsersPopoverOpen}
                              >
                                <PopoverTrigger asChild>
                                  {triggerButton}
                                </PopoverTrigger>

                                <PopoverContent className="w-[414px] p-0">
                                  <UsersList
                                    users={allUsers}
                                    selectedUser={selectedTransferUser}
                                    onUserSelect={handleUserSelect}
                                  />
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <Drawer
                                open={isUsersPopoverOpen}
                                onOpenChange={setIsUsersPopoverOpen}
                              >
                                <DrawerTrigger asChild>
                                  {triggerButton}
                                </DrawerTrigger>

                                <DrawerContent className="w-[414px] p-0">
                                  <UsersList
                                    users={allUsers}
                                    selectedUser={selectedTransferUser}
                                    onUserSelect={handleUserSelect}
                                  />
                                </DrawerContent>
                              </Drawer>
                            )}
                          </>
                        )}
                      </Await>
                    </Suspense>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-between gap-5 border-t border-[#313131] px-12 py-6">
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
            <Button className="w-full">Submit</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
