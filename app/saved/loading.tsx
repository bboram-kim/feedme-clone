import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6" aria-busy="true">
      <div className="flex w-full max-w-3xl flex-col gap-5">
        <Skeleton className="h-8 w-32" />
        {[0, 1, 2].map((i) => (
          <Card key={i} size="sm">
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
