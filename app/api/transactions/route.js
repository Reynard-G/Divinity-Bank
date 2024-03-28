import { cookies } from 'next/headers';

import prisma from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

export async function GET() {
  const cookie = cookies().get('authorization')?.value;

  try {
    const id = (await getPayloadFromJWT(cookie))?.id;

    const transactions =
      (await prisma.transactions.findFirst({
        where: { id },
      })) ?? [];

    return new Response(JSON.stringify(transactions), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Unauthorized', { status: 401 });
  }
}
