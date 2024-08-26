import { type LoaderFunctionArgs } from "@remix-run/node";

import AppSettingsLayout from "~/components/Layout/AppSettingsLayout";

export async function loader({ request }: LoaderFunctionArgs) {
  return null;
}

export default function NotificationSettings() {
  return (
    <AppSettingsLayout
      title="Notifications"
      desc="Customize the look of the app."
    >
      <p>Notifications page</p>
    </AppSettingsLayout>
  );
}
