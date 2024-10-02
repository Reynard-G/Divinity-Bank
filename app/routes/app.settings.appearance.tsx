import {
  ActionFunctionArgs,
  defer,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Await, useFetcher, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { namedAction } from "remix-utils/named-action";

import AppSettingsLayout from "~/components/Layout/AppSettingsLayout";
import SettingsSelect from "~/components/Select/SettingsSelect";
import { Button } from "~/components/ui/button";
import { SpokeSpinner } from "~/components/ui/spinner";
import { getAppearanceSettings } from "~/lib/get.queries.server";
import { updateAppearanceSettings } from "~/lib/post.queries.server";
import { authenticator } from "~/lib/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = (
    await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    })
  ).id;

  const appearanceSettings = getAppearanceSettings(userId);

  return defer(
    { appearanceSettings },
    {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=2592000", // 30 days
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
    async save_appearance_settings() {
      const font = formData.get("font")?.toString();

      try {
        await updateAppearanceSettings(userId, {
          font,
        });
      } catch (error) {
        console.error("Error saving appearance settings:", error);
        return json(
          {
            success: false,
            message:
              "Error saving appearance settings, please try again later.",
          },
          { status: 500 },
        );
      }

      return json({
        success: true,
        message: "Appearance settings saved successfully.",
      });
    },
  });
}

export default function AppearanceSettings() {
  const { appearanceSettings } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const isSubmitting = fetcher.state === "submitting";

  return (
    <AppSettingsLayout title="Appearance" desc="Customize the look of the app.">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <SpokeSpinner color="white" />
          </div>
        }
      >
        <Await
          resolve={appearanceSettings}
          errorElement={
            <div className="flex h-48 items-center justify-center">
              <p className="text-red-500">
                Error loading appearance settings, please try again later.
              </p>
            </div>
          }
        >
          {(appearanceSettings) => (
            <fetcher.Form
              method="post"
              action="?/save_appearance_settings"
              className="space-y-4"
            >
              <SettingsSelect
                name="font"
                label="Font"
                items={["Default", "System", "Atskinon Hyperlegible"]}
                defaultItem={appearanceSettings.font}
                placeholder="Select a font"
                description="Change the font of the dashboard."
                className="max-w-[240px]"
              />

              <Button
                type="submit"
                name="_action"
                value="save_appearance_settings"
                variant="default"
                className="!mt-8 w-1/2"
                disabled={isSubmitting}
              >
                {isSubmitting && <SpokeSpinner size="sm" className="mr-1" />}
                Save Changes
              </Button>
            </fetcher.Form>
          )}
        </Await>
      </Suspense>
    </AppSettingsLayout>
  );
}
