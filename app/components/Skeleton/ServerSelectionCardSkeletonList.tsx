import ServerSelectionCardSkeleton from "~/components/Skeleton/ServerSelectionCardSkeleton";

export default function ServerSelectionCardSkeletonList() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <ServerSelectionCardSkeleton />
      <ServerSelectionCardSkeleton />
      <ServerSelectionCardSkeleton />
    </div>
  );
}
