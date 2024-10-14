import { compare } from "@node-rs/bcrypt";
import {
  type ActionFunctionArgs,
  defer,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Await, useFetcher, useLoaderData } from "@remix-run/react";
import { IconInfoCircle } from "@tabler/icons-react";
import { Suspense, useEffect } from "react";
import { namedAction } from "remix-utils/named-action";
import { toast } from "sonner";

import ChangePasswordButton from "~/components/ChangePasswordButton";
import SettingsInput from "~/components/Input/SettingsInput";
import AppSettingsLayout from "~/components/Layout/AppSettingsLayout";
import { Button } from "~/components/ui/button";
import { SpokeSpinner } from "~/components/ui/spinner";
import { getAccountSettings, getUserById } from "~/lib/get.queries.server";
import {
  changePassword,
  updateAccountSettings,
} from "~/lib/post.queries.server";
import { authenticator } from "~/lib/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = (
    await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    })
  ).id;

  const accountSettings = getAccountSettings(userId);

  return defer(
    { accountSettings },
    {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=30", // 30 seconds
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
    async save_account_settings() {
      const minecraftUsername = formData.get("minecraftUsername")?.toString();
      const discordUsername = formData.get("discordUsername")?.toString();

      try {
        if (!minecraftUsername || !discordUsername) {
          return json(
            { success: false, message: "All fields are required." },
            { status: 400 },
          );
        }

        const minecraftUsernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
        if (!minecraftUsernameRegex.test(minecraftUsername)) {
          return json(
            { success: false, message: "Invalid minecraft username." },
            { status: 400 },
          );
        }

        const discordUsernameRegexLegacy = /^.{2,32}#[0-9]{4}$/;
        const discordUsernameRegexNew =
          /^[a-z0-9](?:(?!\.\.)[a-z0-9_.]){0,30}[a-z0-9]$/;
        if (
          !discordUsernameRegexLegacy.test(discordUsername) &&
          !discordUsernameRegexNew.test(discordUsername)
        ) {
          return json(
            { success: false, message: "Invalid discord username." },
            { status: 400 },
          );
        }

        await updateAccountSettings(userId, {
          minecraftUsername,
          discordUsername,
        });
      } catch (error) {
        console.error("Error saving account settings:", error);
        return json(
          {
            success: false,
            message: "An unexpected error occurred. Please try again.",
          },
          { status: 500 },
        );
      }

      return json({
        success: true,
        message: "Account settings saved successfully.",
      });
    },
    async change_password() {
      const oldPassword = formData.get("old_password")?.toString();
      const newPassword = formData.get("new_password")?.toString();
      const confirmPassword = formData.get("confirm_new_password")?.toString();

      try {
        if (!oldPassword || !newPassword || !confirmPassword) {
          return json(
            { success: false, message: "All fields are required." },
            { status: 400 },
          );
        }

        if (newPassword !== confirmPassword) {
          return json(
            { success: false, message: "Passwords do not match." },
            { status: 400 },
          );
        }

        const user = await getUserById(userId);

        if (!user) {
          return json(
            { success: false, message: "User not found." },
            { status: 404 },
          );
        }

        const isPasswordValid = await compare(oldPassword, user.hashedPassword);

        if (!isPasswordValid) {
          return json(
            { success: false, message: "Invalid password." },
            { status: 400 },
          );
        }

        if (oldPassword === newPassword) {
          return json(
            {
              success: false,
              message: "New password must be different from old password.",
            },
            { status: 400 },
          );
        }

        await changePassword(userId, newPassword);
      } catch (error) {
        console.error("Error changing password:", error);
        return json(
          {
            success: false,
            message: "An unexpected error occurred. Please try again.",
          },
          { status: 500 },
        );
      }

      return json({ success: true, message: "Password changed successfully." });
    },
  });
}

export default function AccountSettings() {
  const { accountSettings } = useLoaderData<typeof loader>();
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
    <AppSettingsLayout title="Account" desc="This is how others will see you.">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <SpokeSpinner color="white" />
          </div>
        }
      >
        <Await
          resolve={accountSettings}
          errorElement={
            <div className="flex h-48 items-center justify-center">
              <p className="text-red-500">
                Error loading account settings, please try again later.
              </p>
            </div>
          }
        >
          {(accountSettings) => (
            <fetcher.Form
              method="post"
              action="?/save_account_settings"
              className="space-y-4"
            >
              <SettingsInput
                name="minecraftUsername"
                label="Username"
                defaultValue={accountSettings.minecraftUsername}
                placeholder="Username"
                description="This is your minecraft username. It will be used to verify and identify you in transactions."
              />

              <SettingsInput
                name="minecraftUuid"
                label="Minecraft UUID"
                defaultValue={accountSettings.minecraftUuid}
                placeholder="Minecraft UUID"
                description="Your minecraft UUID is primarily used to fetch your skin for other people to quickly identify you. Contact support if you wish to change this."
                disabled={true}
              />

              <SettingsInput
                name="discordUsername"
                label="Discord Username"
                defaultValue={accountSettings.discordUsername}
                placeholder="Discord Username"
                description="This is your discord username. It will be used to verify and identify you in discord."
              />

              <ChangePasswordButton label="Password" variant="outline">
                Change Password
              </ChangePasswordButton>

              <Button
                type="submit"
                name="_action"
                value="save_account_settings"
                variant="default"
                className="!mt-8 w-1/2"
                disabled={isSubmitting}
              >
                {isSubmitting && <SpokeSpinner size="sm" className="mr-1" />}
                Save Changes
              </Button>

              <div className="flex items-center space-x-2">
                <IconInfoCircle size={36} stroke={1.5} />
                <p className="text-sm text-muted-foreground">
                  You can request to deactivate your account by contacting
                  discord support. This will not delete your account but will
                  make it inaccessible.
                </p>
              </div>
            </fetcher.Form>
          )}
        </Await>
      </Suspense>
    </AppSettingsLayout>
  );
}
