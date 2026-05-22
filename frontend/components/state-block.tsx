import { AlertCircle, Loader2, SearchX } from "lucide-react";

export function LoadingState({ label = "Loading compensation data" }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-2 rounded-lg border bg-card text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-card text-sm text-destructive">
      <AlertCircle className="h-4 w-4" />
      {message}
    </div>
  );
}

export function EmptyState({ message = "No comparable records found" }: { message?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-2 rounded-lg border bg-card text-sm text-muted-foreground">
      <SearchX className="h-4 w-4" />
      {message}
    </div>
  );
}
