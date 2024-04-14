import { cookies } from 'next/headers';

import prisma from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

export const runtime = 'edge';

export async function GET() {
  const cookie = cookies().get('authorization')?.value;

  try {
    const id = (await getPayloadFromJWT(cookie))?.id;

    const transactions =
      (await prisma.transactions.findMany({
        where: {
          user_id: id,
        },
        include: {
          user_user: {
            select: {
              minecraft_username: true,
              minecraft_uuid: true,
            },
          },
          created_by_user: {
            select: {
              minecraft_username: true,
              minecraft_uuid: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      })) ?? [];

    // Convert UTC Datetime to Unix Timestamp
    const formattedTransactions = transactions.map((transaction) => {
      const { user_user, created_by_user, ...rest } = transaction;
      return {
        ...rest,
        minecraft_username: user_user?.minecraft_username,
        minecraft_uuid: user_user?.minecraft_uuid,
        created_minecraft_username: created_by_user?.minecraft_username,
        created_minecraft_uuid: created_by_user?.minecraft_uuid,
        created_at: Math.floor(
          new Date(transaction.created_at).getTime() / 1000,
        ),
        updated_at: Math.floor(
          new Date(transaction.updated_at).getTime() / 1000,
        ),
      };
    });

    return new Response(JSON.stringify(formattedTransactions), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Unauthorized', { status: 401 });
  }
}
