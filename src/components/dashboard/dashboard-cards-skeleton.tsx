import { Skeleton } from "@/components/ui/skeleton";

export function DashboardCardsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="space-y-3 rounded-lg border p-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}
