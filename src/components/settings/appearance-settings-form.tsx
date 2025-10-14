"use client";

import { useActionState, useCallback } from "react";

import { toast } from "sonner";

import { SettingsSelect } from "@/components/settings/settings-select";
import { Button } from "@/components/ui/button";
import { SpokeSpinner } from "@/components/ui/spinner";
import { FONTS } from "@/lib/constants/fonts";
import { updateAppearanceSettings } from "@/lib/db/actions/settings.actions";

interface AppearanceSettingsFormProps {
  initialData: {
    font: string | null;
  };
}

export function AppearanceSettingsForm({
  initialData,
}: AppearanceSettingsFormProps) {
  const [, formAction, pending] = useActionState(
    async (_state: null, formData: FormData) => {
      await handleFormAction(formData);
      return null;
    },
    null
  );

  const handleFormAction = useCallback(async (formData: FormData) => {
    try {
      const result = await updateAppearanceSettings(formData);

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
      console.error("Appearance settings form submission error:", error);

      toast.error("Error", {
        description: "An unexpected error has occurred.",
      });
    }
  }, []);

  return (
    <form action={formAction} className="space-y-4">
      <SettingsSelect
        name="font"
        label="Font"
        items={Object.values(FONTS)}
        defaultItem={initialData.font || ""}
        placeholder="Select a font"
        description="Select the font you want to use in the dashboard."
        className="max-w-xs"
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
    </form>
  );
}
