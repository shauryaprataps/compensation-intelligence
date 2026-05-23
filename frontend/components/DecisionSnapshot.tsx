"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";

type Props = {
  recordACompany: string;
  recordBCompany: string;
  recordA: {
    total_compensation: number;
    level_standardized: string;
  };
  recordB: {
    total_compensation: number;
    level_standardized: string;
  };
  differenceTotal: number;
  percentageDifference: number;
  levelDifference: number;
  recommendation: string;
  winner: "A" | "B";
};

function levelToNum(level: string) {
  const n = Number(level.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function DecisionSnapshot({
  recordACompany,
  recordBCompany,
  differenceTotal,
  percentageDifference,
  levelDifference,
  recommendation,
  winner
}: Props) {
  const winnerText = winner === "A" ? recordACompany : recordBCompany;

  const diffLabel = differenceTotal >= 0 ? "+" : "-";
  const diffAbs = Math.abs(differenceTotal);

  const levelStr = levelDifference === 0 ? "Same level" : levelDifference > 0 ? `Higher level (+${levelDifference})` : `Higher level (${levelDifference})`;

  return (
    <Card className="border-border/70">
      <CardHeader className="space-y-1">
        <CardTitle>Decision Snapshot</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-muted/30 p-4">
            <div className="text-sm font-semibold text-muted-foreground">Higher total comp → winner</div>
            <div className="mt-2 text-2xl font-bold text-purple-600">{winnerText}</div>
          </div>

          <div className="rounded-lg bg-muted/30 p-4">
            <div className="text-sm font-semibold text-muted-foreground">Difference amount</div>
            <div className="mt-2 text-xl font-semibold">{diffLabel}{formatCurrency(diffAbs)}</div>
          </div>

          <div className="rounded-lg bg-muted/30 p-4">
            <div className="text-sm font-semibold text-muted-foreground">Percentage increase</div>
            <div className="mt-2 text-xl font-semibold">{percentageDifference.toFixed(0)}%</div>
          </div>

          <div className="rounded-lg bg-muted/30 p-4 md:col-span-2">
            <div className="text-sm font-semibold text-muted-foreground">Better level</div>
            <div className="mt-2 text-lg font-semibold">{levelStr}</div>
            <div className="mt-3 text-sm text-muted-foreground">Recommendation:</div>
            <div className="mt-1 text-base font-medium">“{recommendation}”</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

