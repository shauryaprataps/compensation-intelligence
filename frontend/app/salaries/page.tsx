"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDownUp, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { SalaryTable } from "@/components/salary-table";
import { ErrorState, LoadingState } from "@/components/state-block";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useSalaries } from "@/hooks/use-salaries";

export default function SalariesPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-7xl px-4 py-8"><LoadingState /></main>}>
      <SalariesContent />
    </Suspense>
  );
}

function SalariesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState({
    company: searchParams.get("company") ?? "",
    role: searchParams.get("role") ?? "",
    location: searchParams.get("location") ?? "",
    level: searchParams.get("level") ?? ""
  });

  const params = useMemo(() => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(filters).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!next.get("page")) next.set("page", "1");
    if (!next.get("pageSize")) next.set("pageSize", "20");
    return next;
  }, [filters, searchParams]);

  const { data, isLoading, error } = useSalaries(params);

  function applyFilters() {
    params.set("page", "1");
    router.push(`/salaries?${params.toString()}`);
  }

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/salaries?${next.toString()}`);
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Salary Table</h1>
      </div>

      <Card>
        <CardContent className="grid gap-3 pt-5 md:grid-cols-5">
          <Input placeholder="Company" value={filters.company} onChange={(event) => setFilters((prev) => ({ ...prev, company: event.target.value }))} />
          <Input placeholder="Role" value={filters.role} onChange={(event) => setFilters((prev) => ({ ...prev, role: event.target.value }))} />
          <Input placeholder="Location" value={filters.location} onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))} />
          <Input placeholder="Level, e.g. L4" value={filters.level} onChange={(event) => setFilters((prev) => ({ ...prev, level: event.target.value }))} />
          <Button onClick={applyFilters}>
            <Search className="h-4 w-4" />
            Search
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          <Select
            value={searchParams.get("sort") ?? "total_compensation"}
            onChange={(event) => updateParam("sort", event.target.value)}
            options={[
              { label: "Total compensation", value: "total_compensation" },
              { label: "Experience", value: "experience" },
              { label: "Confidence", value: "confidence" }
            ]}
          />
          <Select
            value={searchParams.get("order") ?? "desc"}
            onChange={(event) => updateParam("order", event.target.value)}
            options={[
              { label: "Descending", value: "desc" },
              { label: "Ascending", value: "asc" }
            ]}
          />
        </div>
        <div className="text-sm text-muted-foreground">{data?.pagination.total ?? 0} records</div>
      </div>

      {isLoading ? <LoadingState /> : error ? <ErrorState message={(error as Error).message} /> : <SalaryTable rows={data?.data ?? []} />}

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          disabled={(data?.pagination.page ?? 1) <= 1}
          onClick={() => updateParam("page", String((data?.pagination.page ?? 1) - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={(data?.pagination.page ?? 1) >= (data?.pagination.totalPages ?? 1)}
          onClick={() => updateParam("page", String((data?.pagination.page ?? 1) + 1))}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </main>
  );
}
