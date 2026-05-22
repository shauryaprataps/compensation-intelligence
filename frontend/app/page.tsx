"use client";

import Link from "next/link";
import { Search, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingState, ErrorState, EmptyState } from "@/components/state-block";
import { useStats } from "@/hooks/use-salaries";
import { formatCurrency, titleCase } from "@/utils/format";

export default function HomePage() {
  const [company, setCompany] = useState("");
  const { data, isLoading, error } = useStats();
  const stats = data?.data;

  const searchHref = useMemo(() => `/salaries?company=${encodeURIComponent(company)}`, [company]);

  return (
    <main>
      <section className="border-b bg-secondary/50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <div className="inline-flex rounded-md bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
              Structured → Queryable → Comparable → Decision-ready
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
                Compensation intelligence by level, not noisy job titles.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Normalize salary records, compare L3/L4/L5 bands, and make compensation decisions with confidence-weighted data.
              </p>
            </div>
            <div className="flex max-w-2xl flex-col gap-3 sm:flex-row">
              <Input placeholder="Search company, e.g. google" value={company} onChange={(event) => setCompany(event.target.value)} />
              <Button asChild>
                <Link href={searchHref}>
                  <Search className="h-4 w-4" />
                  Search
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {["google", "microsoft", "amazon"].map((item) => (
                <Button key={item} asChild variant="outline" size="sm">
                  <Link href={`/salaries?company=${item}`}>{titleCase(item)}</Link>
                </Button>
              ))}
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Decision Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Metric label="Average compensation" value={stats ? formatCurrency(stats.average_compensation) : "Awaiting data"} />
              <Metric label="Median compensation" value={stats ? formatCurrency(stats.median_compensation) : "Awaiting data"} />
              <Metric label="Level bands tracked" value={String(stats?.level_distributions.length ?? 0)} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Paying Companies</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <LoadingState /> : error ? <ErrorState message={(error as Error).message} /> : !stats?.top_paying_companies.length ? <EmptyState /> : (
              <div className="space-y-3">
                {stats.top_paying_companies.slice(0, 5).map((company) => (
                  <Link key={company.company} href={`/company/${company.company}`} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50">
                    <span className="font-medium">{titleCase(company.company)}</span>
                    <span className="text-sm text-muted-foreground">{formatCurrency(company.average_compensation)}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Trending Companies</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {(stats?.top_paying_companies ?? []).slice(0, 4).map((company) => (
              <Link key={company.company} href={`/company/${company.company}`} className="rounded-md border p-4 hover:bg-muted/50">
                <TrendingUp className="mb-3 h-4 w-4 text-primary" />
                <div className="font-semibold">{titleCase(company.company)}</div>
                <div className="text-sm text-muted-foreground">{company.record_count} comparable records</div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
