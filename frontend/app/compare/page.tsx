"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { SalaryTable } from "@/components/salary-table";
import { ErrorState, LoadingState, EmptyState } from "@/components/state-block";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useComparison, useSalaries } from "@/hooks/use-salaries";

import { ComparisonCharts } from "@/components/ComparisonCharts";
import { ComparisonTable } from "@/components/ComparisonTable";
import { DecisionSnapshot } from "@/components/DecisionSnapshot";
import { Initials } from "@/app/compare/ComparisonInitials";

type SelectedRecord = {
  id: string;
  company: string;
  role: string;
  level_standardized: string;
  location: string;
  experience_years: number;
  base_salary: number;
  bonus: number;
  stock: number;
  total_compensation: number;
  confidence_score: number;
};

function levelToNum(level: string) {
  const n = Number(level.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function ComparePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    company: "",
    role: "",
    level: "",
    location: "",
    experience: ""
  });

  const params = useMemo(() => {
    const next = new URLSearchParams({ page: "1", pageSize: "50", sort: "total_compensation" });

    if (filters.company) next.set("company", filters.company);
    if (filters.role) next.set("role", filters.role);
    if (filters.location) next.set("location", filters.location);
    if (filters.level) next.set("level", filters.level);
    if (filters.experience) next.set("experience", filters.experience);

    return next;
  }, [filters]);

  const salaries = useSalaries(params);
  const comparison = useComparison(selected[0], selected[1]);

  function toggle(id: string) {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return current.length >= 2 ? [current[1], id] : [...current, id];
    });
  }

  const data = comparison.data?.data;

  const recordA = data?.record_a as SelectedRecord | undefined;
  const recordB = data?.record_b as SelectedRecord | undefined;

  const totalDifference = data?.difference.total ?? 0;
  const percentageDifference = data?.difference.percentage ?? 0;

  const levelDifference = recordB && recordA ? levelToNum(recordB.level_standardized) - levelToNum(recordA.level_standardized) : 0;

  const totalWinner: "A" | "B" = recordA && recordB ? (recordA.total_compensation >= recordB.total_compensation ? "A" : "B") : "A";
  const levelWinner: "A" | "B" = recordA && recordB ? (levelDifference >= 0 ? "B" : "A") : "A";
  const moreStockWinner: "A" | "B" = recordA && recordB ? (recordA.stock >= recordB.stock ? "A" : "B") : "A";
  const percentageWinner: "A" | "B" = totalWinner;

  const recommendation = (() => {
    if (!recordA || !recordB || !data) return "";

    const winner = totalWinner === "A" ? recordA : recordB;
    const loser = totalWinner === "A" ? recordB : recordA;

    const winnerLevelDiff = levelDifference === 0 ? "" : `Higher level (${levelDifference > 0 ? `+${levelDifference}` : levelDifference})`;

    const deltaAbs = Math.abs(data.difference.total);
    const sign = data.difference.total >= 0 ? "+" : "-";

    return `${winner.company} ${winner.level_standardized} pays ${sign}${deltaAbs >= 0 ? "" : ""}${data.difference.total >= 0 ? "more" : "less"} on total comp. ${winnerLevelDiff ? `Better level: ${winnerLevelDiff}.` : ""}`.trim();
  })();

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Compare Salary</h1>
        <p className="mt-2 text-muted-foreground">Select exactly two salary records to generate a Levels.fyi-style comparison.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Input placeholder="Company" value={filters.company} onChange={(e) => setFilters((p) => ({ ...p, company: e.target.value }))} />
          <Input placeholder="Role" value={filters.role} onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value }))} />
          <Input placeholder="Location" value={filters.location} onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))} />
          <Input placeholder="Level, e.g. L4" value={filters.level} onChange={(e) => setFilters((p) => ({ ...p, level: e.target.value }))} />
          <Input placeholder="Experience (min years)" value={filters.experience} onChange={(e) => setFilters((p) => ({ ...p, experience: e.target.value }))} />
        </CardContent>
      </Card>

      {salaries.isLoading ? (
        <LoadingState />
      ) : salaries.error ? (
        <ErrorState message={(salaries.error as Error).message} />
      ) : (
        <SalaryTable rows={salaries.data?.data ?? []} selectable selectedIds={selected} onToggle={toggle} />
      )}

      {selected.length !== 2 ? (
        <EmptyState message="Select exactly two salary records to generate a comparison" />
      ) : comparison.isLoading ? (
        <LoadingState label="Building comparison" />
      ) : comparison.error ? (
        <ErrorState message={(comparison.error as Error).message} />
      ) : data && recordA && recordB ? (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <StickyOfferCard
              side="Left"
              company={recordA.company}
              role={recordA.role}
              level={recordA.level_standardized}
              location={recordA.location}
              winner={totalWinner === "A"}
            />
            <StickyOfferCard
              side="Right"
              company={recordB.company}
              role={recordB.role}
              level={recordB.level_standardized}
              location={recordB.location}
              winner={totalWinner === "B"}
            />
          </div>

          <DecisionSnapshot
            recordACompany={recordA.company}
            recordBCompany={recordB.company}
            recordA={{ total_compensation: recordA.total_compensation, level_standardized: recordA.level_standardized }}
            recordB={{ total_compensation: recordB.total_compensation, level_standardized: recordB.level_standardized }}
            differenceTotal={totalDifference}
            percentageDifference={percentageDifference}
            levelDifference={levelDifference}
            recommendation={recommendation}
            winner={totalWinner}
          />

          <ComparisonCharts
            recordACompany={recordA.company}
            recordBCompany={recordB.company}
            recordA={recordA}
            recordB={recordB}
            percentageDifference={percentageDifference}
          />

          <ComparisonTable
            recordACompany={recordA.company}
            recordBCompany={recordB.company}
            recordA={recordA}
            recordB={recordB}
            levelDifference={levelDifference}
            companyDifference={data.company_comparison}
            percentageDifference={percentageDifference}
            levelWinner={levelWinner}
            totalWinner={totalWinner}
            moreStockWinner={moreStockWinner}
            percentageWinner={percentageWinner}
          />
        </div>
      ) : null}
    </main>
  );
}

function StickyOfferCard({
  side,
  company,
  role,
  level,
  location,
  winner
}: {
  side: string;
  company: string;
  role: string;
  level: string;
  location: string;
  winner: boolean;
}) {
  return (
    <Card className="sticky top-4 overflow-hidden border-border/70">
      <div className={`px-5 py-4 ${winner ? "bg-purple-600/10" : "bg-muted/20"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Initials name={company} />
            <div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold">{company}</div>
                {winner ? (
                  <span className="rounded-md bg-purple-600 px-2 py-0.5 text-xs font-semibold text-white">✓ BEST</span>
                ) : null}
              </div>
              <div className="text-sm text-muted-foreground">{role}</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">{side}</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-background/60 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Level</div>
            <div className="mt-1 text-base font-semibold">{level}</div>
          </div>
          <div className="rounded-lg border bg-background/60 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Location</div>
            <div className="mt-1 text-base font-semibold">{location}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

