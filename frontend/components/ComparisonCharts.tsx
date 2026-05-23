"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
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
    level_standardized: string;
    experience_years: number;
    confidence_score: number;
  };
  recordB: {
    base_salary: number;
    bonus: number;
    stock: number;
    total_compensation: number;
    level_standardized: string;
    experience_years: number;
    confidence_score: number;
  };
  percentageDifference: number;
};

function levelToNum(level: string) {
  const n = Number(level.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function ComparisonCharts({ recordACompany, recordBCompany, recordA, recordB, percentageDifference }: Props) {
  const barData = useMemo(() => {
    return [
      { metric: "Base", A: recordA.base_salary, B: recordB.base_salary },
      { metric: "Bonus", A: recordA.bonus, B: recordB.bonus },
      { metric: "Stock", A: recordA.stock, B: recordB.stock },
      { metric: "Total", A: recordA.total_compensation, B: recordB.total_compensation }
    ];
  }, [recordA, recordB]);

  const radarData = useMemo(() => {
    const maxLevel = Math.max(levelToNum(recordA.level_standardized), levelToNum(recordB.level_standardized), 1);
    const maxExp = Math.max(recordA.experience_years, recordB.experience_years, 1);
    const maxConfidence = Math.max(recordA.confidence_score, recordB.confidence_score, 1);
    const maxTotal = Math.max(recordA.total_compensation, recordB.total_compensation, 1);

    // Scale to keep chart readable.
    const scale = (v: number, max: number) => (max <= 0 ? 0 : (v / max) * 100);

    return [
      {
        subject: recordACompany,
        total_comp: scale(recordA.total_compensation, maxTotal),
        level: scale(levelToNum(recordA.level_standardized), maxLevel),
        bonus: scale(recordA.bonus, Math.max(recordA.bonus, recordB.bonus, 1)),
        stock: scale(recordA.stock, Math.max(recordA.stock, recordB.stock, 1)),
        experience: scale(recordA.experience_years, maxExp),
        confidence: scale(recordA.confidence_score, maxConfidence)
      },
      {
        subject: recordBCompany,
        total_comp: scale(recordB.total_compensation, maxTotal),
        level: scale(levelToNum(recordB.level_standardized), maxLevel),
        bonus: scale(recordB.bonus, Math.max(recordA.bonus, recordB.bonus, 1)),
        stock: scale(recordB.stock, Math.max(recordA.stock, recordB.stock, 1)),
        experience: scale(recordB.experience_years, maxExp),
        confidence: scale(recordB.confidence_score, maxConfidence)
      }
    ];
  }, [recordA, recordB, recordACompany, recordBCompany]);

  const diffPct = useMemo(() => {
    const safe = (n: number) => (Number.isFinite(n) ? n : 0);

    const pct = (offer1: number, offer2: number) => {
      if (offer1 === 0) return 0;
      return ((offer2 - offer1) / offer1) * 100;
    };

    // We display offer2 relative to offer1 (B vs A) consistently.
    return [
      { metric: "Base %", pct: safe(pct(recordA.base_salary, recordB.base_salary)) },
      { metric: "Bonus %", pct: safe(pct(recordA.bonus, recordB.bonus)) },
      { metric: "Stock %", pct: safe(pct(recordA.stock, recordB.stock)) },
      { metric: "Total %", pct: safe(pct(recordA.total_compensation, recordB.total_compensation)) },
      { metric: "(B-A) Overall", pct: safe(percentageDifference) }
    ];
  }, [recordA, recordB, percentageDifference]);

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Radar (Total / Level / Bonus / Stock / Experience / Confidence)</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis domain={[0, 100]} tick={false} />
              <Radar name={recordACompany} dataKey="total_comp" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              <Radar name={recordBCompany} dataKey="total_comp" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-muted-foreground">Radar is normalized/scaled for readability.</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Difference Percentage Across Categories (B vs A)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={diffPct} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `${v.toFixed(0)}%`} />
              <YAxis type="category" dataKey="metric" width={140} />
              <Tooltip formatter={(value: any) => `${Number(value).toFixed(1)}%`} />
              <Bar dataKey="pct" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

