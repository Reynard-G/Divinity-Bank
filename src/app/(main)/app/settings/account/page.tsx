import { unauthorized } from "next/navigation";

import { AccountSettingsForm } from "@/components/settings/account-settings-form";
import { Separator } from "@/components/ui/separator";
import { getAccountSettings } from "@/lib/db/queries/settings.queries";
import { getCurrentUser } from "@/lib/db/queries/user.queries";

export default async function AccountSettingsPage() {
  const user = await getCurrentUser();

  if (!user) unauthorized();

  const accountSettings = await getAccountSettings(user.id);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-none">
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you.
        </p>
      </div>

      <Separator className="my-4 mt-2 flex-none" />

      <div className="faded-bottom -mx-4 flex-1 overflow-y-auto px-4">
        <div className="lg:max-w-xl">
          <AccountSettingsForm initialData={accountSettings} />
        </div>
      </div>
    </div>
  );
}
