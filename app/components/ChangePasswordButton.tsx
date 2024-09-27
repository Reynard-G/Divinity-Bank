import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useFetcher } from "@remix-run/react";
import { IconKey } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { AccountSettingsFetcherResponse } from "~/routes/app.settings.account";

import { SpokeSpinner } from "./ui/spinner";

interface ChangePasswordButtonProps {
  label: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  children?: React.ReactNode;
}

export default function ChangePasswordButton({
  label,
  variant = "default",
  children,
}: ChangePasswordButtonProps) {
  const fetcher = useFetcher<AccountSettingsFetcherResponse>();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");

  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data && !fetcher.data.success && fetcher.state === "idle") {
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setIsDialogOpen(false);
      toast.error(fetcher.data.message);
    } else if (
      fetcher.data &&
      fetcher.data.success &&
      fetcher.state === "idle"
    ) {
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setIsDialogOpen(false);
      toast.success(fetcher.data.message);
    }
  }, [fetcher.data, fetcher.state]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !isSubmitting &&
      newPassword === confirmNewPassword &&
      newPassword.length > 0 &&
      oldPassword !== newPassword
    ) {
      fetcher.submit(e.currentTarget, { method: "post" });
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium leading-none">{label}</label>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            aria-label={label}
            variant={variant}
            className="w-fit focus:ring-0"
          >
            {children}
          </Button>
        </DialogTrigger>

        <DialogContent className="p-0" aria-describedby={undefined}>
          <VisuallyHidden.Root>
            <DialogTitle>Change Password</DialogTitle>
          </VisuallyHidden.Root>

          <div className="mx-auto mb-2 mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#323232]">
            <IconKey size={30} aria-hidden="true" />
          </div>

          <fetcher.Form
            method="post"
            action="?/change_password"
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <h1 className="mb-2 text-center text-lg font-semibold">
              Change Password
            </h1>

            <div className="space-y-3 px-12">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="old_password"
                >
                  Old Password
                  <Input
                    required
                    type="password"
                    name="old_password"
                    value={oldPassword}
                    placeholder="Old Password"
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="new_password"
                >
                  New Password
                  <Input
                    required
                    type="password"
                    name="new_password"
                    value={newPassword}
                    placeholder="New Password"
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="confirm_new_password"
                >
                  Confirm New Password
                  <Input
                    required
                    type="password"
                    name="confirm_new_password"
                    value={confirmNewPassword}
                    placeholder="Confirm New Password"
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </label>
              </div>

              <div className="!mb-4 !mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  className="w-fit"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  name="_action"
                  value="change_password"
                  variant="outline"
                  disabled={
                    isSubmitting ||
                    newPassword !== confirmNewPassword ||
                    newPassword.length == 0 ||
                    oldPassword === newPassword
                  }
                  className="w-fit"
                >
                  {isSubmitting && <SpokeSpinner size="sm" className="mr-1" />}
                  Change Password
                </Button>
              </div>
            </div>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
