import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { SpokeSpinner } from "~/components/ui/spinner";
import { authenticator } from "~/lib/services/auth.server";
import { rateLimiter } from "~/lib/services/ratelimit.server";

type LoginFetcherResponse = {
  error?: string;
};

export const meta: MetaFunction = () => {
  return [
    { title: "Login • Divinity" },
    { name: "description", content: "Login to Divinity" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/app",
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const ip = getClientIPAddress(request) ?? "127.0.0.1";
  const identifier = `login:${ip}`;

  try {
    const { success } = await rateLimiter.limit(identifier);

    if (!success) {
      return json<LoginFetcherResponse>(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 },
      );
    }

    return await authenticator.authenticate("user-pass", request, {
      successRedirect: "/app",
      throwOnError: true,
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    return json<LoginFetcherResponse>(
      { error: "Invalid username or password" },
      { status: 401 },
    );
  }
}

export default function Login() {
  const fetcher = useFetcher<LoginFetcherResponse>();

  const isSubmitting = fetcher.state === "submitting";

  return (
    <main className="relative h-dvh">
      <div className="flex h-full items-center justify-center">
        <div className="flex w-full max-w-sm flex-col gap-4">
          {/* Top Branding */}
          <div className="flex flex-col items-center pb-6 duration-500 animate-in fade-in slide-in-from-top-5 fill-mode-both">
            <img src="/logo.svg" alt="Logo" className="m-4 w-12" />
            <p className="text-xl font-semibold">Welcome Back</p>
            <p className="text-base text-muted-foreground">
              Log in to your account to continue
            </p>
          </div>

          <fetcher.Form method="post" className="flex flex-col gap-2">
            <Input
              placeholder="Username"
              type="text"
              name="username"
              required
              className="delay-100 duration-700 animate-in fade-in slide-in-from-left-4 fill-mode-both"
            />
            <Input
              placeholder="Password"
              type="password"
              name="password"
              required
              className="delay-200 duration-700 animate-in fade-in slide-in-from-right-4 fill-mode-both"
            />

            {fetcher.data?.error && (
              <p className="text-sm text-red-500">{fetcher.data.error}</p>
            )}

            <Button
              type="submit"
              className="mt-4 w-full delay-300 duration-500 animate-in fade-in slide-in-from-bottom-5 fill-mode-both"
              disabled={isSubmitting}
            >
              {isSubmitting && <SpokeSpinner size="sm" className="mr-1" />}
              Log in
            </Button>
          </fetcher.Form>

          <p className="text-center text-sm text-muted-foreground delay-500 duration-500 animate-in fade-in slide-in-from-bottom-3 fill-mode-both">
            Need to create an account?&nbsp;
            <Link
              to="/register"
              className="text-primary transition-opacity duration-200 hover:opacity-80"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
