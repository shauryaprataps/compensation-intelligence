"use client";

export function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/g).filter(Boolean);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-sm font-bold text-foreground">
      {initials || "?"}
    </div>
  );
}

