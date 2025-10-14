import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users, userSettings } from "@/lib/db/schema";

export async function getAccountSettings(userId: number) {
  try {
    const [user] = await db
      .select({
        minecraftUsername: users.minecraftUsername,
        minecraftUuid: users.minecraftUuid,
        discordUsername: users.discordUsername,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user;
  } catch (error) {
    console.error("Failed to fetch account settings:", error);
    throw new Error("Failed to retrieve account settings");
  }
}

export async function getAppearanceSettings(userId: number) {
  try {
    const [settings] = await db
      .select({
        font: userSettings.font,
      })
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    return settings;
  } catch (error) {
    console.error("Failed to fetch appearance settings:", error);
    throw new Error("Failed to retrieve appearance settings");
  }
}

export async function getNotificationSettings(userId: number) {
  try {
    const [settings] = await db
      .select({
        discordCommunication: userSettings.discordCommunication,
        discordTransactions: userSettings.discordTransactions,
        discordSecurity: userSettings.discordSecurity,
      })
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    return settings;
  } catch (error) {
    console.error("Failed to fetch notification settings:", error);
    throw new Error("Failed to retrieve notification settings");
  }
}
