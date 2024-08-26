import { type LoaderFunctionArgs } from "@remix-run/node";

import AppSettingsLayout from "~/components/Layout/AppSettingsLayout";

export async function loader({ request }: LoaderFunctionArgs) {
  return null;
}

export default function AppearanceSettings() {
  return (
    <AppSettingsLayout title="Appearance" desc="Customize the look of the app.">
      <p>Appearance page</p>
    </AppSettingsLayout>
  );
}
