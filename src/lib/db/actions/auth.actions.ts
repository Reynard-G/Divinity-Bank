"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";

import { createSession, deleteSession } from "@/lib/auth/jwt";
import { rateLimiter } from "@/lib/auth/ratelimit";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getClientIPAddress } from "@/lib/utils/get-client-ip-address";
import { validateLoginData } from "@/lib/validations/auth.validations";

type LoginFormState = {
  success: boolean;
  error?: string;
  retryAfter?: number;
};

/**
 * Login server action
 * Validates user credentials and creates a session
 */
export async function login(
  _state: LoginFormState | null,
  formData: FormData
): Promise<LoginFormState> {
  try {
    const ip = getClientIPAddress(await headers());
    const ipIdentifier = `login:${ip}`;
    const validation = validateLoginData(formData);

    if (!validation.success || !validation.data) {
      return {
        success: false,
        error: "Invalid form data",
      };
    }
    const { username, password } = validation.data;

    const { success } = await rateLimiter.limit(ipIdentifier);
    if (!success) {
      return {
        success: false,
        error: "Too many login attempts. Please try again later.",
      };
    }

    const user = await db
      .select({
        id: users.id,
        minecraftUuid: users.minecraftUuid,
        minecraftUsername: users.minecraftUsername,
        hashedPassword: users.hashedPassword,
        role: users.role,
      })
      .from(users)
      .where(eq(users.minecraftUsername, username))
      .then((res) => res[0]);
    if (!user) {
      return {
        success: false,
        error: "Invalid username or password",
      };
    }

    const isPasswordValid = await compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      return {
        success: false,
        error: "Invalid username or password",
      };
    }

    await createSession(
      user.id.toString(),
      user.minecraftUuid,
      user.minecraftUsername,
      user.role
    );

    redirect("/app");
  } catch (error) {
    // Throw redirect error if it is a redirect error
    // This is necessary to ensure that the redirect works correctly in try/catch blocks
    if (isRedirectError(error)) {
      throw error;
    }

    console.error(
      "Login Server Action Error:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      error: "An unexpected error occurred during login.",
    };
  }
}

/**
 * Logout server action
 * Deletes the current session and redirects to the login page
 *
 * @returns {Promise<never>} Never resolves, always redirects
 */
export async function logout(): Promise<never> {
  await deleteSession();
  redirect("/login");
}
