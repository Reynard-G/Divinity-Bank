import {
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  not,
  notLike,
  type Column,
  type ColumnBaseConfig,
  type ColumnDataType,
} from "drizzle-orm";

const DataTableConfig = {
  comparisonOperators: [
    { label: "Contains", value: "ilike" as const },
    { label: "Does not contain", value: "notIlike" as const },
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "notEq" as const },
    { label: "Starts with", value: "startsWith" as const },
    { label: "Ends with", value: "endsWith" as const },
    { label: "Is empty", value: "isNull" as const },
    { label: "Is not empty", value: "isNotNull" as const },
  ],
  selectableOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "notEq" as const },
    { label: "Is empty", value: "isNull" as const },
    { label: "Is not empty", value: "isNotNull" as const },
  ],
  logicalOperators: [
    {
      label: "And",
      value: "and" as const,
      description: "All conditions must be met",
    },
    {
      label: "Or",
      value: "or" as const,
      description: "At least one condition must be met",
    },
  ],
};

export function filterColumn({
  column,
  value,
  isSelectable,
}: {
  column: Column<ColumnBaseConfig<ColumnDataType, string>, object, object>;
  value: string;
  isSelectable?: boolean;
}) {
  const [filterValue, filterOperator] = (value?.split("~").filter(Boolean) ??
    []) as [
    string,
    (
      | (typeof DataTableConfig)["comparisonOperators"][number]["value"]
      | undefined
    ),
  ];

  if (!filterValue) return;

  if (isSelectable) {
    switch (filterOperator) {
      case "eq":
        return inArray(column, filterValue?.split(".").filter(Boolean) ?? []);
      case "notEq":
        return not(
          inArray(column, filterValue?.split(".").filter(Boolean) ?? []),
        );
      case "isNull":
        return isNull(column);
      case "isNotNull":
        return isNotNull(column);
      default:
        return inArray(column, filterValue?.split(".") ?? []);
    }
  }

  switch (filterOperator) {
    case "ilike":
      return ilike(column, `%${filterValue}%`);
    case "notIlike":
      return notLike(column, `%${filterValue}%`);
    case "startsWith":
      return ilike(column, `${filterValue}%`);
    case "endsWith":
      return ilike(column, `%${filterValue}`);
    case "eq":
      return eq(column, filterValue);
    case "notEq":
      return not(eq(column, filterValue));
    case "isNull":
      return isNull(column);
    case "isNotNull":
      return isNotNull(column);
    default:
      return ilike(column, `%${filterValue}%`);
  }
}
