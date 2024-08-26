import { type LoaderFunctionArgs } from "@remix-run/node";

import AppSettingsLayout from "~/components/Layout/AppSettingsLayout";

export async function loader({ request }: LoaderFunctionArgs) {
  return null;
}

export default function AccountSettings() {
  return (
    <AppSettingsLayout
      title="Account"
      desc="Update your account & minecraft details."
    >
      <p>Account page</p>
    </AppSettingsLayout>
  );
}
