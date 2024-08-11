import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { compare /*, hash*/ } from "@node-rs/bcrypt";
import { sessionStorage } from "~/lib/services/session.server";
import { db } from "~/lib/db/db.server";
import { users } from "~/lib/db/schema";
import { eq } from "drizzle-orm";

export type AuthUser = {
  id: number;
  uuid: string;
  username: string;
  role: string;
};

export const authenticator = new Authenticator<AuthUser>(sessionStorage, {
  throwOnError: true,
});

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const username = form.get("username") as string;
    const password = form.get("password") as string;

    const user = (
      await db
        .select({
          id: users.id,
          minecraft_uuid: users.minecraftUuid,
          minecraft_username: users.minecraftUsername,
          hashed_password: users.hashedPassword,
          role: users.role,
        })
        .from(users)
        .where(eq(users.minecraftUsername, username))
    )?.[0];

    if (!user) {
      throw new AuthorizationError("Invalid username or password");
    }

    const isValidPassword = await compare(password, user.hashed_password);

    if (!isValidPassword) {
      throw new AuthorizationError("Invalid username or password");
    }

    return {
      id: user.id,
      uuid: user.minecraft_uuid,
      username: user.minecraft_username,
      role: user.role,
    } satisfies AuthUser;
  }),
  "user-pass",
);
