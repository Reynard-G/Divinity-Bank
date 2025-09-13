import {
  and,
  or,
  eq,
  ne,
  gt,
  lt,
  gte,
  lte,
  isNull,
  isNotNull,
  ilike,
  notIlike,
  inArray,
  notInArray,
  type SQL,
  type Column,
} from "drizzle-orm";
import { transactions } from "@/lib/db/schema";
import type { ExtendedColumnFilter, JoinOperator } from "@/types/data-table";
import type { TransactionWithDetails } from "@/lib/db/queries/transaction.queries";

export function buildWhereClause(
  filters: ExtendedColumnFilter<TransactionWithDetails>[],
  joinOperator: JoinOperator,
  userId?: number,
  serverId?: number
): SQL | undefined {
  const conditions: (SQL | undefined)[] = [];

  // Add user and server filters if provided
  if (userId) {
    conditions.push(eq(transactions.userId, userId));
  }
  if (serverId) {
    conditions.push(eq(transactions.serverId, serverId));
  }

  // Build filter conditions
  for (const filter of filters) {
    let condition: SQL | undefined;

    switch (filter.id as string) {
      case "createdByUser":
        condition = buildTextCondition(transactions.createdByUserId, filter);
        break;
      case "amount":
        condition = buildNumericCondition(transactions.amount, filter);
        break;
      case "fee":
        condition = buildNumericCondition(transactions.fee, filter);
        break;
      case "transactionType":
        condition = buildTextCondition(transactions.transactionType, filter);
        break;
      case "paymentType":
        condition = buildTextCondition(transactions.paymentType, filter);
        break;
      case "status":
        condition = buildTextCondition(transactions.status, filter);
        break;
      case "note":
        condition = buildTextCondition(transactions.note, filter);
        break;
      case "createdAt":
        condition = buildDateCondition(transactions.createdAt, filter);
        break;
    }

    if (condition) {
      conditions.push(condition);
    }
  }

  const validConditions = conditions.filter(Boolean) as SQL[];
  if (validConditions.length === 0) return undefined;

  return joinOperator === "and"
    ? and(...validConditions)
    : or(...validConditions);
}

export function buildTextCondition(
  column: Column,
  filter: ExtendedColumnFilter<TransactionWithDetails>
): SQL | undefined {
  switch (filter.operator) {
    case "iLike":
      return typeof filter.value === "string"
        ? ilike(column, `%${filter.value}%`)
        : undefined;
    case "notILike":
      return typeof filter.value === "string"
        ? notIlike(column, `%${filter.value}%`)
        : undefined;
    case "eq":
      return eq(column, filter.value);
    case "ne":
      return ne(column, filter.value);
    case "inArray":
      return Array.isArray(filter.value)
        ? inArray(column, filter.value)
        : undefined;
    case "notInArray":
      return Array.isArray(filter.value)
        ? notInArray(column, filter.value)
        : undefined;
    case "isEmpty":
      return isNull(column);
    case "isNotEmpty":
      return isNotNull(column);
    default:
      return undefined;
  }
}

export function buildNumericCondition(
  column: Column,
  filter: ExtendedColumnFilter<TransactionWithDetails>
): SQL | undefined {
  switch (filter.operator) {
    case "eq":
      return eq(column, filter.value);
    case "ne":
      return ne(column, filter.value);
    case "lt":
      return lt(column, filter.value);
    case "lte":
      return lte(column, filter.value);
    case "gt":
      return gt(column, filter.value);
    case "gte":
      return gte(column, filter.value);
    case "isBetween":
      if (Array.isArray(filter.value) && filter.value.length === 2) {
        const firstValue =
          filter.value[0] != null && filter.value[0] !== ""
            ? Number(filter.value[0])
            : null;
        const secondValue =
          filter.value[1] != null && filter.value[1] !== ""
            ? Number(filter.value[1])
            : null;

        if (firstValue === null && secondValue === null) {
          return undefined;
        }

        const conditions = [
          firstValue !== null ? gte(column, firstValue) : undefined,
          secondValue !== null ? lte(column, secondValue) : undefined,
        ].filter(Boolean) as SQL[];

        return and(...conditions);
      }
      return undefined;
    case "isEmpty":
      return isNull(column);
    case "isNotEmpty":
      return isNotNull(column);
    default:
      return undefined;
  }
}

export function buildDateCondition(
  column: Column,
  filter: ExtendedColumnFilter<TransactionWithDetails>
): SQL | undefined {
  switch (filter.operator) {
    case "eq":
      if (typeof filter.value === "string") {
        const date = new Date(Number(filter.value));
        const startOfDay = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        const endOfDay = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          23,
          59,
          59,
          999
        );
        return and(
          gte(column, startOfDay.toISOString()),
          lte(column, endOfDay.toISOString())
        );
      }
      return undefined;
    case "ne":
      if (typeof filter.value === "string") {
        const date = new Date(Number(filter.value));
        const startOfDay = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        const endOfDay = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          23,
          59,
          59,
          999
        );
        return or(
          lt(column, startOfDay.toISOString()),
          gt(column, endOfDay.toISOString())
        );
      }
      return undefined;
    case "lt":
      return typeof filter.value === "string"
        ? lt(column, new Date(Number(filter.value)).toISOString())
        : undefined;
    case "lte":
      return typeof filter.value === "string"
        ? lte(column, new Date(Number(filter.value)).toISOString())
        : undefined;
    case "gt":
      return typeof filter.value === "string"
        ? gt(column, new Date(Number(filter.value)).toISOString())
        : undefined;
    case "gte":
      return typeof filter.value === "string"
        ? gte(column, new Date(Number(filter.value)).toISOString())
        : undefined;
    case "isBetween":
      if (Array.isArray(filter.value) && filter.value.length === 2) {
        const startDate =
          filter.value[0] != null && filter.value[0] !== ""
            ? new Date(Number(filter.value[0])).toISOString()
            : null;
        const endDate =
          filter.value[1] != null && filter.value[1] !== ""
            ? new Date(Number(filter.value[1])).toISOString()
            : null;

        if (!startDate && !endDate) {
          return undefined;
        }

        const conditions = [
          startDate ? gte(column, startDate) : undefined,
          endDate ? lte(column, endDate) : undefined,
        ].filter(Boolean) as SQL[];

        return and(...conditions);
      }
      return undefined;
    case "isEmpty":
      return isNull(column);
    case "isNotEmpty":
      return isNotNull(column);
    default:
      return undefined;
  }
}
