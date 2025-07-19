import { Card } from "@/components/ui/card";

export function CultureCardSkeleton() {
  return (
    <Card className="p-6 space-y-4">
      <div className="mx-auto w-20 h-20 bg-muted rounded-full animate-pulse-soft"></div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse-soft"></div>
        <div className="h-3 bg-muted rounded w-3/4 mx-auto animate-pulse-soft"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-1/2 mx-auto animate-pulse-soft"></div>
        <div className="h-6 bg-muted rounded w-2/3 mx-auto animate-pulse-soft"></div>
      </div>
    </Card>
  );
}

export function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <CultureCardSkeleton key={i} />
      ))}
    </>
  );
}