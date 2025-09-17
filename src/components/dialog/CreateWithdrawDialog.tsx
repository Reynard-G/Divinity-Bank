"use client";

import { useActionState, useState, useCallback } from "react";
import { IconMinus } from "@tabler/icons-react";
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
import { SpokeSpinner } from "@/components/ui/spinner";
import { withdrawAction } from "@/lib/db/actions/transaction.actions";

interface CreateWithdrawDialogProps {
  children?: React.ReactNode;
  serverId: number;
}

export function CreateWithdrawDialog({
  children,
  serverId,
}: CreateWithdrawDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [formState, formAction, pending] = useActionState(
    async (_state: null, formData: FormData) => {
      await handleFormAction(formData);
      return null;
    },
    null
  );

  const handleFormAction = useCallback(async (formData: FormData) => {
    try {
      const result = await withdrawAction(null, formData);

      if (result.success) {
        toast.success("Success!", {
          description: result.message,
        });

        setIsDialogOpen(false);
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

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <IconMinus size={16} className="mr-2" aria-hidden="true" />
            Withdraw Funds
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="p-0" aria-describedby={undefined}>
        <div className="mx-auto mb-2 mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#323232]">
          <IconMinus size={30} aria-hidden="true" />
        </div>

        <form action={formAction}>
          <div className="mb-2 grid gap-2 px-12 text-center">
            <DialogTitle className="mb-2 text-lg font-semibold">
              Withdraw Funds
            </DialogTitle>

            <p className="text-base leading-6 text-muted-foreground">
              Withdraw money from your account by providing the necessary
              details below. Please ensure that your{" "}
              <strong>minecraft username</strong> is the same as this account to
              avoid any issues.
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
                onClick={() => setIsDialogOpen(false)}
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
      </DialogContent>
    </Dialog>
  );
}
