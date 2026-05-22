"use client";

import { useParams } from "next/navigation";
import { BarChartCard } from "@/charts/dashboard-charts";
import { SalaryTable } from "@/components/salary-table";
import { ErrorState, LoadingState } from "@/components/state-block";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompany } from "@/hooks/use-salaries";
import { formatCurrency, titleCase } from "@/utils/format";

export default function CompanyPage() {
  const params = useParams<{ company: string }>();

  const company = decodeURIComponent(params.company);
  const { data, isLoading, error } = useCompany(company);
  const insights = data?.data;

  if (isLoading)
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <LoadingState />
      </main>
    );
  if (error)
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <ErrorState message={(error as Error).message} />
      </main>
    );
  if (!insights) return null;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">{titleCase(insights.company)}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric title="Median compensation" value={formatCurrency(insights.median_compensation)} />
        <Metric title="Mean compensation" value={formatCurrency(insights.mean_compensation)} />
        <Metric title="Top compensation" value={formatCurrency(insights.top_compensation)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChartCard
          title="Level Distribution"
          data={[...insights.level_distribution].sort((a, b) => {
            const aN = Number(String(a.name).replace(/[^0-9]/g, ""));
            const bN = Number(String(b.name).replace(/[^0-9]/g, ""));
            return aN - bN;
          })}
        />
      </div>



      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Comparable Salary Records</h2>
        <SalaryTable rows={insights.salary_records} />
      </section>
    </main>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-semibold">{value}</CardContent>
    </Card>
  );
}


