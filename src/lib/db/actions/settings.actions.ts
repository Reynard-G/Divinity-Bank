"use server";

import { revalidatePath } from "next/cache";

import { eq } from "drizzle-orm";

import { getSession, updateSession } from "@/lib/auth/jwt";
import { FONTS } from "@/lib/constants/fonts";
import { db } from "@/lib/db";
import {
  type InsertUser,
  type InsertUserSetting,
  users,
  userSettings,
} from "@/lib/db/schema";

type UpdateSettingsState = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function updateAccountSettings(
  formData: FormData
): Promise<UpdateSettingsState> {
  const session = await getSession();

  if (!session) {
    return {
      success: false,
      error: "You must be logged in to update account settings",
    };
  }

  const minecraftUsername = formData.get("minecraftUsername")?.toString();
  const minecraftUuid = formData.get("minecraftUuid")?.toString();
  const discordUsername = formData.get("discordUsername")?.toString();

  if (!minecraftUsername || !minecraftUuid || !discordUsername) {
    return { success: false, error: "All fields are required" };
  }

  try {
    // Only update fields that have changed to avoid unnecessary database writes
    await db.transaction(async (tx) => {
      const user = await tx
        .select()
        .from(users)
        .where(eq(users.id, parseInt(session.id)))
        .limit(1)
        .then((res) => res[0]);

      if (!user) {
        throw new Error("User not found");
      }

      // Build updates object with only changed fields
      const updates: Partial<InsertUser> = {};

      if (user.minecraftUsername !== minecraftUsername) {
        updates.minecraftUsername = minecraftUsername;
      }
      if (user.minecraftUuid !== minecraftUuid) {
        updates.minecraftUuid = minecraftUuid;
      }
      if (user.discordUsername !== discordUsername) {
        updates.discordUsername = discordUsername;
      }

      // Only perform update if there are changes
      if (Object.keys(updates).length > 0) {
        await tx
          .update(users)
          .set(updates)
          .where(eq(users.id, parseInt(session.id)));
      }
    });

    await updateSession({
      ...session,
      username: minecraftUsername,
      uuid: minecraftUuid,
    });

    // Revalidate the entire app layout to update header/sidebar with new username/avatar
    revalidatePath("/app", "layout");
    // Also revalidate the settings page to show updated values
    revalidatePath("/app/settings/account");

    return { success: true, message: "Account settings updated successfully" };
  } catch (error) {
    console.error("Error updating account settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

export async function updateAppearanceSettings(
  formData: FormData
): Promise<UpdateSettingsState> {
  const session = await getSession();

  if (!session) {
    return {
      success: false,
      error: "You must be logged in to update appearance settings",
    };
  }

  const font = formData.get("font")?.toString();

  if (!font) {
    return { success: false, error: "Font field is required" };
  }

  if (
    !Object.values(FONTS).includes(font as (typeof FONTS)[keyof typeof FONTS])
  ) {
    return { success: false, error: "Invalid font selected" };
  }

  try {
    await db
      .update(userSettings)
      .set({ font })
      .where(eq(userSettings.userId, parseInt(session.id)));

    await updateSession({
      ...session,
      font,
    });

    // Revalidate the entire app layout to apply new font
    revalidatePath("/app", "layout");
    // Also revalidate the settings page to show updated values
    revalidatePath("/app/settings/appearance");

    return {
      success: true,
      message: "Appearance settings updated successfully",
    };
  } catch (error) {
    console.error("Error updating appearance settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

export async function updateNotificationSettings(
  formData: FormData
): Promise<UpdateSettingsState> {
  const session = await getSession();

  if (!session) {
    return {
      success: false,
      error: "You must be logged in to update notification settings",
    };
  }

  const discordCommunication = formData.get("communication") === "on";
  const discordTransactions = formData.get("transactions") === "on";
  const discordSecurity = formData.get("security") === "on";

  // Only update fields that have changed to avoid unnecessary database writes
  try {
    await db.transaction(async (tx) => {
      const settings = await tx
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, parseInt(session.id)))
        .limit(1)
        .then((res) => res[0]);

      if (!settings) {
        throw new Error("User settings not found");
      }

      const updates: Partial<InsertUserSetting> = {};

      if (settings.discordCommunication !== discordCommunication) {
        updates.discordCommunication = discordCommunication;
      }
      if (settings.discordTransactions !== discordTransactions) {
        updates.discordTransactions = discordTransactions;
      }
      if (settings.discordSecurity !== discordSecurity) {
        updates.discordSecurity = discordSecurity;
      }

      // Only perform update if there are changes
      if (Object.keys(updates).length > 0) {
        await tx
          .update(userSettings)
          .set(updates)
          .where(eq(userSettings.userId, parseInt(session.id)));
      }
    });

    revalidatePath("/app/settings/notifications");

    return {
      success: true,
      message: "Notification settings updated successfully",
    };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}
