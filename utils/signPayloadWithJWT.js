import { SignJWT } from 'jose';

export default async function signPayloadWithJWT(payload, expires) {
  const jwtSecret = process.env.JWT_SECRET;
  const encodedJwtSecret = new TextEncoder().encode(jwtSecret);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS512' })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(encodedJwtSecret);
}