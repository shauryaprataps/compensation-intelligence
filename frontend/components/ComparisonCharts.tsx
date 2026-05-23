"use client";

import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";

type Props = {
  recordACompany: string;
  recordBCompany: string;
  recordA: {
    base_salary: number;
    bonus: number;
    stock: number;
    total_compensation: number;
  };
  recordB: {
    base_salary: number;
    bonus: number;
    stock: number;
    total_compensation: number;
  };
};

export function ComparisonCharts({ recordACompany, recordBCompany, recordA, recordB }: Props) {
  const barData = useMemo(() => {
    return [
      { metric: "Base", A: recordA.base_salary, B: recordB.base_salary },
      { metric: "Bonus", A: recordA.bonus, B: recordB.bonus },
      { metric: "Stock", A: recordA.stock, B: recordB.stock },
      { metric: "Total", A: recordA.total_compensation, B: recordB.total_compensation }
    ];
  }, [recordA, recordB]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grouped Comparison (Base / Bonus / Stock / Total)</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="metric" />
            <YAxis tickFormatter={(v) => formatCurrency(v)} />
            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
            <Bar dataKey="A" name={recordACompany} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="B" name={recordBCompany} fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}


