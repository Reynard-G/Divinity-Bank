import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

function getKey(): Uint8Array {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  return new TextEncoder().encode(secretKey);
}

export interface SessionPayload {
  id: string;
  uuid: string;
  username: string;
  role: string;
  exp: number;
}

export async function encrypt(payload: Omit<SessionPayload, "exp">) {
  const key = getKey();

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  const key = getKey();

  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });

    // Validate the payload has all required fields
    if (
      typeof payload.id === "string" &&
      typeof payload.uuid === "string" &&
      typeof payload.username === "string" &&
      typeof payload.role === "string" &&
      typeof payload.exp === "number"
    ) {
      return {
        id: payload.id,
        uuid: payload.uuid,
        username: payload.username,
        role: payload.role,
        exp: payload.exp,
      };
    }

    console.error("Invalid JWT payload structure:", payload);
    return null;
  } catch (error) {
    console.error("JWT decryption failed:", error);
    return null;
  }
}

export async function createSession(
  id: string,
  uuid: string,
  username: string,
  role: string
) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const session = await encrypt({
    id,
    uuid,
    username,
    role,
  });

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    expires: expiresAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) return null;

  return await decrypt(session);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function updateSession(session: SessionPayload) {
  if (!session) return;

  const refreshed = await encrypt({
    id: session.id,
    uuid: session.uuid,
    username: session.username,
    role: session.role,
  });

  const cookieStore = await cookies();
  cookieStore.set("session", refreshed, {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}
