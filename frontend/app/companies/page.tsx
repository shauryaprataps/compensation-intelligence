"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { formatCurrency, titleCase } from "@/utils/format";
import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "@/services/api";

import { ErrorState, LoadingState, EmptyState } from "@/components/state-block";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CompaniesPage() {
  const [query, setQuery] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
    staleTime: 60_000
  });

  const companies = data?.data ?? [];


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => c.company.toLowerCase().includes(q));
  }, [companies, query]);


  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <LoadingState />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <ErrorState message={(error as Error).message} />
      </main>
    );
  }

  if (!companies.length) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <EmptyState message="No company data available." />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Companies</h1>
        <p className="mt-2 text-muted-foreground">Browse companies available in the dataset.</p>
      </div>

      <Card>
        <CardContent className="grid gap-3 pt-5 md:grid-cols-[1fr_auto] md:items-center">
          <Input placeholder="Search company" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button variant="outline" disabled>
            <Search className="h-4 w-4" />
            Search
          </Button>
        </CardContent>
      </Card>

      <section>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(filtered.length ? filtered : companies).map((company) => (
            <Card key={company.company} className="transition-colors hover:bg-muted/40">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3 text-base">
                  <Link href={`/company/${company.company}`} className="hover:underline">
                    {titleCase(company.company)}
                  </Link>
                  <span className="text-sm text-muted-foreground">{company.record_count} records</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">Average compensation</div>
                <div className="text-2xl font-semibold">{formatCurrency(company.average_compensation)}</div>



              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

