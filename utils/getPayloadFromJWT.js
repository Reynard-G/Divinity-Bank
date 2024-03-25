import { cookies } from 'next/headers';

import { jwtVerify } from 'jose';

export default async function getPayloadFromJWT(jwt) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    const encodedJwtSecret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(jwt, encodedJwtSecret);

    if (!payload) cookies().delete('authorization');

    return payload;
  } catch (error) {
    return null;
  }
}
