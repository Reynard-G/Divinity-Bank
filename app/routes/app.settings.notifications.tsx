import {
  type ActionFunctionArgs,
  defer,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Await, useFetcher, useLoaderData } from "@remix-run/react";
import { Suspense, useEffect } from "react";
import { namedAction } from "remix-utils/named-action";
import { toast } from "sonner";

import AppSettingsLayout from "~/components/Layout/AppSettingsLayout";
import SettingsSwitch from "~/components/Switch/SettingsSwitch";
import { Button } from "~/components/ui/button";
import { SpokeSpinner } from "~/components/ui/spinner";
import { getNotificationSettings } from "~/lib/get.queries.server";
import { updateNotificationSettings } from "~/lib/post.queries.server";
import { authenticator } from "~/lib/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = (
    await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    })
  ).id;

  const notificationSettings = getNotificationSettings(userId);

  return defer(
    { notificationSettings },
    {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=86400", // 1 day
      },
    },
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const userId = (
    await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    })
  ).id;

  return namedAction(request, {
    async save_notification_settings() {
      const communication = formData.get("communication") === "on";
      const transactions = formData.get("transactions") === "on";
      const security = formData.get("security") === "on";

      try {
        await updateNotificationSettings(userId, {
          discordCommunication: communication,
          discordTransactions: transactions,
          discordSecurity: security,
        });
      } catch (error) {
        console.error("Error saving notification settings:", error);
        return json(
          {
            success: false,
            message: "Error saving notification settings.",
          },
          {
            status: 500,
          },
        );
      }

      return json({
        success: true,
        message: "Notification settings saved successfully.",
      });
    },
  });
}

export default function NotificationSettings() {
  const { notificationSettings } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data && !fetcher.data.success && fetcher.state === "idle") {
      toast.error(fetcher.data.message);
    } else if (
      fetcher.data &&
      fetcher.data.success &&
      fetcher.state === "idle"
    ) {
      toast.success(fetcher.data.message);
    }
  }, [fetcher.data, fetcher.state]);

  return (
    <AppSettingsLayout
      title="Notifications"
      desc="Manage your notifications settings"
    >
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <SpokeSpinner color="white" />
          </div>
        }
      >
        <Await
          resolve={notificationSettings}
          errorElement={
            <div className="flex h-48 items-center justify-center">
              <p className="text-red-500">
                Error loading appearance settings, please try again later.
              </p>
            </div>
          }
        >
          {(notificationSettings) => (
            <fetcher.Form
              method="post"
              action="?/save_notification_settings"
              className="space-y-4"
            >
              <div>
                <h3 className="mb-2 text-lg font-semibold">
                  Discord Notifications
                </h3>
                <div className="space-y-4">
                  <SettingsSwitch
                    name="communication"
                    label="Communication"
                    defaultChecked={notificationSettings.discordCommunication}
                    description="Receive discord notifications for announcements, new features, etc."
                  />

                  <SettingsSwitch
                    name="transactions"
                    label="Transactions"
                    defaultChecked={notificationSettings.discordTransactions}
                    description="Receive discord notifications for transactions."
                  />

                  <SettingsSwitch
                    name="security"
                    label="Security"
                    defaultChecked={notificationSettings.discordSecurity}
                    description="Receive discord notifications for suspicious login attempts, etc."
                  />

                  <Button
                    type="submit"
                    name="_action"
                    value="save_notification_settings"
                    variant="default"
                    className="!mt-8 w-1/2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <SpokeSpinner size="sm" className="mr-1" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>
            </fetcher.Form>
          )}
        </Await>
      </Suspense>
    </AppSettingsLayout>
  );
}
