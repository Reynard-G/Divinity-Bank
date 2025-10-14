"use client";

import { useActionState, useCallback } from "react";

import { toast } from "sonner";

import { SettingsSwitch } from "@/components/settings/settings-switch";
import { Button } from "@/components/ui/button";
import { SpokeSpinner } from "@/components/ui/spinner";
import { updateNotificationSettings } from "@/lib/db/actions/settings.actions";

interface NotificationSettingsFormProps {
  initialData: {
    discordCommunication: boolean;
    discordTransactions: boolean;
    discordSecurity: boolean;
  };
}

export function NotificationSettingsForm({
  initialData,
}: NotificationSettingsFormProps) {
  const [, formAction, pending] = useActionState(
    async (_state: null, formData: FormData) => {
      await handleFormAction(formData);
      return null;
    },
    null
  );

  const handleFormAction = useCallback(async (formData: FormData) => {
    try {
      const result = await updateNotificationSettings(formData);

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
      console.error("Notification settings form submission error:", error);

      toast.error("Error", {
        description: "An unexpected error has occurred.",
      });
    }
  }, []);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <h3 className="mb-2 text-lg font-semibold">Discord Notifications</h3>
        <div className="space-y-4">
          <SettingsSwitch
            name="communication"
            label="Communication"
            defaultChecked={initialData.discordCommunication}
            description="Receive discord notifications for announcements, new features, etc."
          />

          <SettingsSwitch
            name="transactions"
            label="Transactions"
            defaultChecked={initialData.discordTransactions}
            description="Receive discord notifications for transactions."
          />

          <SettingsSwitch
            name="security"
            label="Security"
            defaultChecked={initialData.discordSecurity}
            description="Receive discord notifications for suspicious login attempts, etc."
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
        </div>
      </div>
    </form>
  );
}
