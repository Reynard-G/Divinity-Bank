"use client";

import { useActionState, useCallback } from "react";

import { InfoIcon } from "lucide-react";
import { toast } from "sonner";

import { SettingsInput } from "@/components/settings/settings-input";
import { Button } from "@/components/ui/button";
import { SpokeSpinner } from "@/components/ui/spinner";
import { updateAccountSettings } from "@/lib/db/actions/settings.actions";

interface AccountSettingsFormProps {
  initialData: {
    minecraftUsername: string | null;
    minecraftUuid: string | null;
    discordUsername: string | null;
  };
}

export function AccountSettingsForm({ initialData }: AccountSettingsFormProps) {
  const [, formAction, pending] = useActionState(
    async (_state: null, formData: FormData) => {
      await handleFormAction(formData);
      return null;
    },
    null
  );

  const handleFormAction = useCallback(async (formData: FormData) => {
    try {
      const result = await updateAccountSettings(formData);

      if (result.success) {
        toast.success("Success!", {
          description: result.message,
        });
      } else if (result.error) {
        toast.error("Error", {
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Account settings form submission error:", error);

      toast.error("Error", {
        description: "An unexpected error has occurred.",
      });
    }
  }, []);

  return (
    <form action={formAction} className="space-y-4">
      <SettingsInput
        name="minecraftUsername"
        label="Username"
        defaultValue={initialData.minecraftUsername || ""}
        placeholder="Username"
        description="This is your minecraft username. It will be used to verify and identify you in transactions."
      />

      <SettingsInput
        name="minecraftUuid"
        label="Minecraft UUID"
        defaultValue={initialData.minecraftUuid || ""}
        placeholder="Minecraft UUID"
        description="Your minecraft UUID is primarily used to fetch your skin for other people to quickly identify you. Contact support if you wish to change this."
        readOnly={true}
        className="opacity-50"
      />

      <SettingsInput
        name="discordUsername"
        label="Discord Username"
        defaultValue={initialData.discordUsername || ""}
        placeholder="Discord Username"
        description="This is your discord username. It will be used to verify and identify you in discord."
      />

      <Button
        type="submit"
        variant="default"
        className="!mt-8 w-1/2"
        disabled={pending}
      >
        {pending && <SpokeSpinner size="sm" className="mr-1" />}
        {pending ? "Saving..." : "Save Changes"}
      </Button>

      <div className="flex items-center space-x-2">
        <InfoIcon size={24} />
        <p className="text-sm text-muted-foreground">
          You can request to deactivate your account by contacting discord
          support. This will not delete your account but will make it
          inaccessible.
        </p>
      </div>
    </form>
  );
}
