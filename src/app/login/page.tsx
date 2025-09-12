"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpokeSpinner } from "@/components/ui/spinner";
import { login } from "@/lib/db/actions/auth.actions";

export default function LoginPage() {
  const [formState, formAction, pending] = useActionState(login, null);

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

          <form action={formAction} autoComplete="off" className="flex flex-col gap-2">
            <Input
              name="username"
              placeholder="Username"
              type="text"
              required
              className="delay-100 duration-700 animate-in fade-in slide-in-from-left-4 fill-mode-both"
            />
            <Input
              name="password"
              placeholder="Password"
              type="password"
              required
              className="delay-200 duration-700 animate-in fade-in slide-in-from-right-4 fill-mode-both"
            />

            {formState?.error && (
              <p className="text-sm text-red-500">{formState.error}</p>
            )}

            <Button
              type="submit"
              className="mt-4 w-full delay-300 duration-500 animate-in fade-in slide-in-from-bottom-5 fill-mode-both"
              disabled={pending}
            >
              {pending && <SpokeSpinner size="sm" className="mr-1" />}
              {pending ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground delay-500 duration-500 animate-in fade-in slide-in-from-bottom-3 fill-mode-both">
            Need to create an account?&nbsp;
            <Link
              href="/register"
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