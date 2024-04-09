import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  // Convert Decimal types to String
  return new PrismaClient().$extends({
    result: {
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
