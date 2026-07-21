import { unauthorized } from "next/navigation";

import { AppearanceSettingsForm } from "@/components/settings/appearance-settings-form";
import { Separator } from "@/components/ui/separator";
import { getAppearanceSettings } from "@/lib/db/queries/settings.queries";
import { getCurrentUser } from "@/lib/db/queries/user.queries";

export default async function AppearanceSettingsPage() {
  const user = await getCurrentUser();

  if (!user) unauthorized();

  const appearanceSettings = await getAppearanceSettings(user.id);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-none">
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize the look and feel of the app.
        </p>
      </div>

      <Separator className="my-4 mt-2 flex-none" />

      <div className="faded-bottom -mx-4 flex-1 overflow-y-auto px-4">
        <div className="lg:max-w-xl">
          <AppearanceSettingsForm initialData={appearanceSettings} />
        </div>
      </div>
    </div>
  );
}
