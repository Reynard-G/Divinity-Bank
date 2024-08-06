import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { compare /*, hash*/ } from "@node-rs/bcrypt";
import { sessionStorage } from "~/lib/services/session.server";
import { db } from "~/lib/db/db.server";
import { users } from "~/lib/db/schema";
import { eq } from "drizzle-orm";

export type AuthUser = {
  id: number;
  username: string;
};

export const authenticator = new Authenticator<AuthUser>(sessionStorage, {
  throwOnError: true,
});

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const username = form.get("username") as string;
    const password = form.get("password") as string;

    const user = (
      await db.select().from(users).where(eq(users.minecraftUsername, username))
    )?.[0];

    if (!user) {
      throw new AuthorizationError("Invalid username or password");
    }

    const isValidPassword = await compare(password, user.hashedPassword);

    if (!isValidPassword) {
      throw new AuthorizationError("Invalid username or password");
    }

    return {
      id: user.id,
      uuid: user.minecraftUuid,
      username: user.minecraftUsername,
      role: user.role,
    };
  }),
  "user-pass",
);

/*export async function createUser(
  username: string,
  password: string,
): Promise<AuthUser> {
  const hashedPassword = await hash(password, 12);

  const [newUser] = await db.insert(users).values({
    minecraftUsername: username,
    password: hashedPassword,
  });

  return newUser;
}*/
