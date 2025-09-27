import { sql } from "drizzle-orm";

import { TRANSACTION_STATUSES } from "@/lib/constants/transaction-statuses";
import { TRANSACTION_TYPES } from "@/lib/constants/transaction-types";

/**
 * Raw SQL query to calculate user balance for a specific server
 * This query is used in both queries and actions to ensure consistency
 */
export const getBalanceQuery = (userId: number, serverId: number) => sql`
  SELECT 
    COALESCE(
      SUM(CASE 
        WHEN transaction_type = ${TRANSACTION_TYPES.CREDIT} 
          AND status = ${TRANSACTION_STATUSES.SUCCESS} 
        THEN amount::numeric 
        ELSE 0 
      END), 0
    ) - 
    COALESCE(
      SUM(CASE 
        WHEN transaction_type = ${TRANSACTION_TYPES.DEBIT} 
          AND status IN (${TRANSACTION_STATUSES.PENDING}, ${TRANSACTION_STATUSES.SUCCESS})
        THEN amount::numeric 
        ELSE 0 
      END), 0
    ) as current_balance
  FROM "Transactions" 
  WHERE user_id = ${userId} 
    AND server_id = ${serverId}
`;
