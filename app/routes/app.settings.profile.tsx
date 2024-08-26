import { type LoaderFunctionArgs } from "@remix-run/node";

import AppSettingsLayout from "~/components/Layout/AppSettingsLayout";

export async function loader({ request }: LoaderFunctionArgs) {
  return null;
}

export default function ProfileSettings() {
  return (
    <AppSettingsLayout title="Profile" desc="This is how others will see you.">
      <p>Profile page</p>
    </AppSettingsLayout>
  );
}
