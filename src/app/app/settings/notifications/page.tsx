import { unauthorized } from "next/navigation";

import { NotificationSettingsForm } from "@/components/settings/notification-settings-form";
import { Separator } from "@/components/ui/separator";
import { getNotificationSettings } from "@/lib/db/queries/settings.queries";
import { getCurrentUser } from "@/lib/db/queries/user.queries";

export default async function NotificationSettingsPage() {
  const user = await getCurrentUser();

  if (!user) unauthorized();

  const notificationSettings = await getNotificationSettings(user.id);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-none">
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Manage your notifications settings.
        </p>
      </div>

      <Separator className="my-4 mt-2 flex-none" />

      <div className="faded-bottom -mx-4 flex-1 overflow-y-auto px-4">
        <div className="lg:max-w-xl">
          <NotificationSettingsForm initialData={notificationSettings} />
        </div>
      </div>
    </div>
  );
}
