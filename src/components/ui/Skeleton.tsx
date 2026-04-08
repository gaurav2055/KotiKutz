type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
  );
}
