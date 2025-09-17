"use client";

import { useActionState, useState, Suspense, useCallback } from "react";
import { IconArrowRight, IconSelector } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { SpokeSpinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { transferAction } from "@/lib/db/actions/transaction.actions";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MinecraftUsernameList } from "@/components/MinecraftUsernameList";
import type { MinecraftUser } from "@/lib/db/queries/user.queries";

interface CreateTransferDialogProps {
  children?: React.ReactNode;
  serverId: number;
}

export function CreateTransferDialog({
  children,
  serverId,
}: CreateTransferDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isUsersPopoverOpen, setIsUsersPopoverOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<MinecraftUser | null>(null);
  const [formState, formAction, pending] = useActionState(
    async (_state: null, formData: FormData) => {
      await handleFormAction(formData);
      return null;
    },
    null
  );

  // Custom form action that includes user handling
  const handleFormAction = useCallback(async (formData: FormData) => {
    try {
      const result = await transferAction(null, formData);

      if (result.success) {
        toast.success("Success!", {
          description: result.message,
        });

        setIsDialogOpen(false);
        setSelectedUser(null);
      } else if (result.error) {
        toast.error("Error", {
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);

      toast.error("Error", {
        description: "An unexpected error has occurred.",
      });
    }
  }, []);

  const handleUserSelect = (user: MinecraftUser) => {
    setSelectedUser(user);
    setIsUsersPopoverOpen(false);
  };

  const triggerButton = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={isUsersPopoverOpen}
      className="w-full justify-between"
    >
      <div className="flex items-center">
        {selectedUser?.minecraftUsername ? (
          <>
            <Avatar className="mr-2 h-6 w-6 rounded-sm">
              <AvatarImage
                src={`https://crafatar.com/avatars/${selectedUser.minecraftUuid}?size=24&overlay`}
                alt={selectedUser.minecraftUsername}
              />
            </Avatar>
            <span className="truncate">{selectedUser.minecraftUsername}</span>
          </>
        ) : (
          <span className="text-muted-foreground">Select a User...</span>
        )}
      </div>
      <IconSelector size={20} opacity={50} className="ml-2 opacity-50" />
    </Button>
  );

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setSelectedUser(null);
        }
      }}
    >
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <IconArrowRight size={16} className="mr-2" aria-hidden="true" />
            Transfer Money
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="p-0" aria-describedby={undefined}>
        <div className="mx-auto mb-2 mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#323232]">
          <IconArrowRight size={30} aria-hidden="true" />
        </div>

        <form action={formAction}>
          <div className="mb-2 grid gap-2 px-12 text-center">
            <DialogTitle className="mb-2 text-lg font-semibold">
              Transfer Money
            </DialogTitle>

            <p className="text-base leading-6 text-muted-foreground">
              Transfer money to another account by providing the necessary
              details below. Please ensure that{" "}
              <strong className="underline">both</strong>&nbsp;
              <strong>minecraft usernames</strong> are correct to avoid any
              issues.
            </p>

            <input type="hidden" name="serverId" value={serverId} />

            <input
              type="hidden"
              name="recipientId"
              value={selectedUser?.id.toString() || ""}
            />
            <input
              type="hidden"
              name="recipientUsername"
              value={selectedUser?.minecraftUsername || ""}
            />

            <div className="mb-5 mt-3 grid gap-2">
              <div className="space-y-1">
                <Label
                  htmlFor="amount"
                  className="text-left text-sm text-muted-foreground"
                >
                  Amount
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="100.00"
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-left text-sm text-muted-foreground">
                  Recipient
                </Label>
                <Suspense
                  fallback={<Skeleton className="h-8 w-24 rounded-md" />}
                >
                  {isDesktop ? (
                    <Popover
                      open={isUsersPopoverOpen}
                      onOpenChange={setIsUsersPopoverOpen}
                    >
                      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>

                      <PopoverContent className="w-[414px] p-0">
                        <MinecraftUsernameList
                          selectedUser={selectedUser}
                          onUserSelect={handleUserSelect}
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Drawer
                      open={isUsersPopoverOpen}
                      onOpenChange={setIsUsersPopoverOpen}
                    >
                      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
                      <DrawerContent className="w-full max-w-[414px] p-0">
                        <MinecraftUsernameList
                          selectedUser={selectedUser}
                          onUserSelect={handleUserSelect}
                        />
                      </DrawerContent>
                    </Drawer>
                  )}
                </Suspense>
              </div>
            </div>
          </div>

          <div className="border-t border-border">
            <div className="flex justify-between gap-5 px-12 py-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="w-full"
                disabled={pending || !selectedUser}
              >
                {pending && <SpokeSpinner size="sm" className="mr-1" />}
                Submit
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
