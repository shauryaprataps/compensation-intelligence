"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SalaryTable } from "@/components/salary-table";
import { ErrorState, LoadingState, EmptyState } from "@/components/state-block";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useComparison, useSalaries } from "@/hooks/use-salaries";
import { formatCurrency } from "@/utils/format";

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
      // Enforce selecting exactly two records (A + B).
      return current.length >= 2 ? [current[1], id] : [...current, id];
    });
  }


  const chartData = comparison.data?.data
    ? [
        {
          component: "Base",
          A: comparison.data.data.record_a.base_salary,
          B: comparison.data.data.record_b.base_salary
        },
        {
          component: "Bonus",
          A: comparison.data.data.record_a.bonus,
          B: comparison.data.data.record_b.bonus
        },
        {
          component: "Stock",
          A: comparison.data.data.record_a.stock,
          B: comparison.data.data.record_b.stock
        },
        {
          component: "Total",
          A: comparison.data.data.record_a.total_compensation,
          B: comparison.data.data.record_b.total_compensation
        }
      ]
    : [];

  const recordACompany = comparison.data?.data?.record_a.company;
  const recordBCompany = comparison.data?.data?.record_b.company;


  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Compare Salary Records</h1>
        <p className="mt-2 text-muted-foreground">Filter salary records, then select exactly two to compare components and compensation deltas.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Company" value={filters.company} onChange={(e) => setFilters((p) => ({ ...p, company: e.target.value }))} />
          <Input placeholder="Role" value={filters.role} onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value }))} />
          <Input placeholder="Location" value={filters.location} onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))} />
          <Input placeholder="Level, e.g. L4" value={filters.level} onChange={(e) => setFilters((p) => ({ ...p, level: e.target.value }))} />
          <Input placeholder="Experience (min years)" value={filters.experience} onChange={(e) => setFilters((p) => ({ ...p, experience: e.target.value }))} />

        </CardContent>
      </Card>

      {salaries.isLoading ? <LoadingState /> : salaries.error ? <ErrorState message={(salaries.error as Error).message} /> : (
        <SalaryTable rows={salaries.data?.data ?? []} selectable selectedIds={selected} onToggle={toggle} />
      )}


      {selected.length !== 2 ? <EmptyState message="Select exactly two salary records to generate a comparison" /> : comparison.isLoading ? <LoadingState label="Building comparison" /> : comparison.error ? <ErrorState message={(comparison.error as Error).message} /> : comparison.data?.data ? (

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Structured Comparison</CardTitle>

            </CardHeader>
            <CardContent className="space-y-3">
              <Diff label="Base" value={comparison.data.data.difference.base} />
              <Diff label="Bonus" value={comparison.data.data.difference.bonus} />
              <Diff label="Stock" value={comparison.data.data.difference.stock} />
              <Diff label="Total compensation" value={comparison.data.data.difference.total} />

              <div className="rounded-md border p-3 text-sm">Level difference: {comparison.data.data.level_comparison}</div>
              <div className="rounded-md border p-3 text-sm">Company difference: {comparison.data.data.company_comparison}</div>

              <div className="rounded-md border p-3 text-sm">Percentage difference: <strong>{comparison.data.data.difference.percentage}%</strong></div>

            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Component Comparison</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="component" />
                  <YAxis />
                  <Tooltip />
                  <Bar

                    dataKey="A"
                    name={recordACompany}
                    fill="#0f8f84"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="B"
                    name={recordBCompany}
                    fill="#f08a24"
                    radius={[4, 4, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  );
}

function Diff({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3 text-sm">
      <span>{label}</span>
      <span className={value >= 0 ? "font-semibold text-primary" : "font-semibold text-destructive"}>{formatCurrency(value)}</span>
    </div>
  );
}
