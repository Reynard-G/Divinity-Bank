import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const prismaClientSingleton = () => {
  return new PrismaClient().$extends(withAccelerate(), {
    result: {
      // Convert Decimal types to String
      transactions: {
        amount: {
          needs: { amount: true },
          compute: (transaction) => transaction.amount.toString(),
        },
        fee: {
          needs: { fee: true },
          compute: (transaction) => transaction.fee.toString(),
        },
      },
    },
  });
};

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
