import * as z from "zod";

export const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  note: z.string().optional(),
  paymentType: z.string().optional(),
  status: z.string().optional(),
  operator: z.enum(["and", "or"]).optional(),
});

export const getTransactionsSchema = searchParamsSchema;

export type GetTransactionsSchema = z.infer<typeof getTransactionsSchema>;
