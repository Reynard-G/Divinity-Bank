import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  Await,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { IconPlus, IconPlusMinus, IconSelector } from "@tabler/icons-react";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import MinecraftUsernameList from "~/components/MinecraftUsernameList";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Skeleton } from "~/components/ui/skeleton";
import { SpokeSpinner } from "~/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useMediaQuery } from "~/hooks/use-media-query";
import { type loader } from "~/routes/app.$server.transactions";
import { NonSensitiveUser } from "~/types/User";

export default function CreateTransactionsDialog() {
  const { allUsers } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigation = useNavigation();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isUsersPopoverOpen, setIsUsersPopoverOpen] = useState<boolean>(false);
  const [selectedTransferUser, setSelectedTransferUser] =
    useState<NonSensitiveUser | null>(null);
  const [selectedTab, setSelectedTab] = useState<
    "deposit" | "withdraw" | "transfer"
  >("deposit");
  const [fileError, setFileError] = useState("");

  const isSubmitting = navigation.state === "submitting";

  const validateFile = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        reject("File size should not exceed 5MB");
        return;
      }

      // Check image dimensions
      const img = new Image();
      img.onload = () => {
        if (img.width > 2048 || img.height > 2048) {
          reject("Image dimensions should not exceed 2048x2048 pixels");
        } else {
          resolve();
        }
      };
      img.onerror = () => reject("Invalid image file");
    });
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await validateFile(file);
        setFileError("");
      } catch (error) {
        setFileError(error as string);
      }
    }
  };

  const handleUserSelect = (user: NonSensitiveUser) => {
    // Toggle selected user
    setSelectedTransferUser(user.id === selectedTransferUser?.id ? null : user);
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
      <IconSelector size={20} opacity={50} className="ml-2 opacity-50" />
    </Button>
  );

  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      if (fetcher.data.success) {
        try {
          toast.success(fetcher.data.message || "Transaction successful");
          setIsDialogOpen(false);
        } catch (error) {
          console.error("Error submitting transaction:", error);
          toast.error("Error submitting transaction. Please try again.");
        }
      } else {
        toast.error(fetcher.data.message || "Error submitting transaction");
      }
    }
  }, [fetcher.data, fetcher.state]);

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
            <DialogTitle>Transaction</DialogTitle>
          </VisuallyHidden.Root>

          <div className="mx-auto mb-2 mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#323232]">
            <IconPlusMinus size={30} aria-hidden="true" />
          </div>

          <fetcher.Form
            method="post"
            action={`?/${selectedTab}`}
            encType="multipart/form-data"
          >
            <div className="mb-2 grid gap-2 px-12 text-center">
              <h1 className="mb-2 text-lg font-semibold">New Transaction</h1>

              <Tabs
                defaultValue="deposit"
                onValueChange={(value) =>
                  setSelectedTab(value as "deposit" | "withdraw" | "transfer")
                }
              >
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

                  <div className="mb-5 mt-3 grid gap-2">
                    <div className="relative grid grid-cols-1 gap-1">
                      <p className="text-left text-sm text-muted-foreground">
                        Amount
                      </p>
                      <Input
                        type="number"
                        name="amount"
                        placeholder="100"
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="relative grid grid-cols-1 gap-1">
                      <p className="text-left text-sm text-muted-foreground">
                        Proof of Deposit (PNG, JPEG, WEBP)
                      </p>
                      <Input
                        id="proof-of-deposit"
                        name="proofOfDeposit"
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        multiple={false}
                        placeholder="Upload proof of deposit"
                        required
                        onChange={handleFileChange}
                        className="w-full"
                      />
                      {fileError && (
                        <p className="mt-1 text-sm text-red-500">{fileError}</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="withdraw">
                  <div>
                    <p className="text-base leading-6 text-muted-foreground">
                      Withdraw money from your account by providing the
                      necessary details below. Please ensure that your{" "}
                      <strong>minecraft username</strong> is the same as this
                      account to avoid any issues.
                    </p>
                  </div>

                  <div className="mb-5 mt-3 grid gap-2">
                    <div className="relative grid grid-cols-1 gap-1">
                      <p className="text-left text-sm text-muted-foreground">
                        Amount
                      </p>
                      <Input
                        type="number"
                        name="amount"
                        placeholder="100"
                        required
                        className="w-full"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="transfer">
                  <div>
                    <p className="text-base leading-6 text-muted-foreground">
                      Transfer money to another account by providing the
                      necessary details below. Please ensure that{" "}
                      <strong className="underline">both</strong>&nbsp;
                      <strong>minecraft usernames</strong> are correct to avoid
                      any issues.
                    </p>
                  </div>

                  <div className="mb-5 mt-3 grid gap-2">
                    <div className="relative grid grid-cols-1 gap-1">
                      <p className="text-left text-sm text-muted-foreground">
                        Amount
                      </p>
                      <Input
                        type="number"
                        name="amount"
                        placeholder="100"
                        required
                        className="w-full"
                      />
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
                                    <MinecraftUsernameList
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
                                  <DrawerContent className="w-full max-w-[414px] p-0">
                                    <MinecraftUsernameList
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
                      <Input
                        type="hidden"
                        name="recipient"
                        value={selectedTransferUser?.id || ""}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="border-t border-[#313131]">
              <div className="flex justify-between gap-5 px-12 py-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  name="_action"
                  value={selectedTab}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <SpokeSpinner size="sm" className="mr-1" />}
                  Submit
                </Button>
              </div>
            </div>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
