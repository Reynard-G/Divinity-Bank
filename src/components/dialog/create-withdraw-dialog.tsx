"use client";

import { useActionState, useState, useCallback } from "react";

import { MinusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpokeSpinner } from "@/components/ui/spinner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { withdraw } from "@/lib/db/actions/transaction.actions";
import { cn } from "@/lib/utils/cn";

interface CreateWithdrawDialogProps {
  children?: React.ReactNode;
  serverId: number;
}

export function CreateWithdrawDialog({
  children,
  serverId,
}: CreateWithdrawDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [, formAction, pending] = useActionState(
    async (_state: null, formData: FormData) => {
      await handleFormAction(formData);
      return null;
    },
    null
  );

  const handleFormAction = useCallback(async (formData: FormData) => {
    try {
      const result = await withdraw(formData);

      if (result.success) {
        toast.success("Success!", {
          description: result.message,
        });

        setIsOpen(false);
      } else if (result.error) {
        toast.error("Error", {
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Withdrawal form submission error:", error);

      toast.error("Error", {
        description: "An unexpected error has occurred.",
      });
    }
  }, []);

  const withdrawForm = (
    <form action={formAction}>
      <div
        className={cn("mb-2 grid gap-2 px-12 text-center", isDesktop && "pt-6")}
      >
        <div className="mx-auto mb-2 mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#323232] md:mt-0">
          <MinusIcon size={30} aria-hidden="true" />
        </div>

        {isDesktop ? (
          <DialogTitle className="mb-2 text-lg font-semibold">
            Withdraw Funds
          </DialogTitle>
        ) : (
          <DrawerTitle className="mb-2 text-lg font-semibold">
            Withdraw Funds
          </DrawerTitle>
        )}

        <p className="text-base leading-6 text-muted-foreground">
          Please ensure that your <strong>minecraft username</strong> is the
          same as this account to avoid any issues.
        </p>

        <input type="hidden" name="serverId" value={serverId} />

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
        </div>
      </div>

      <div className="border-t border-border">
        <div className="flex justify-between gap-5 px-12 py-6">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={pending} className="w-full">
            {pending && <SpokeSpinner size="sm" className="mr-1" />}
            Submit
          </Button>
        </div>
      </div>
    </form>
  );

  const trigger = children ?? (
    <Button variant="outline" size="sm">
      <MinusIcon size={16} className="mr-2" aria-hidden="true" />
      Withdraw Funds
    </Button>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="p-0" aria-describedby={undefined}>
          {withdrawForm}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="p-0">{withdrawForm}</DrawerContent>
    </Drawer>
  );
}
