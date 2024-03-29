import { cookies } from 'next/headers';

import prisma from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

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
          Users_Transactions_user_idToUsers: {
            select: {
              minecraft_username: true,
            },
          },
        },
      })) ?? [];

    // Convert UTC Datetime to Unix Timestamp
    const formattedTransactions = transactions.map((transaction) => {
      const { Users_Transactions_user_idToUsers, ...rest } = transaction;
      return {
        ...rest,
        minecraft_username:
          Users_Transactions_user_idToUsers.minecraft_username,
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
