"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * NOTE:
 * - The app uses dynamic routing for company details at /company/[company].
 * - This page is a safe fallback entry point only.
 * - It intentionally does NOT add a new product category or list all companies.
 */
export default function CompanyFallbackPage() {
  const router = useRouter();

  return (
    <main className="mx-auto max-w-7xl space-y-4 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Company</h1>
        <p className="mt-2 text-muted-foreground">
          Select a company from the salary table to view its compensation insights.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/salaries">Go to Salary Table</Link>
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>
    </main>
  );
}

