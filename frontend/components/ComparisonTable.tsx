"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";

export type ComparisonTableRow = {
  key:
    | "base"
    | "bonus"
    | "stock"
    | "total"
    | "level_diff"
    | "company_diff"
    | "percentage_diff";
  label: string;
  left: string;
  right: string;
  leftValue: number;
  rightValue: number;
  leftBetter: boolean;
  winnerBadge?: string;
  annotation?: string;
};

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-emerald-600/15 px-2 py-0.5 text-xs font-semibold text-emerald-700">
      {text}
    </span>
  );
}

type Props = {
  recordACompany: string;
  recordBCompany: string;
  recordA: {
    base_salary: number;
    bonus: number;
    stock: number;
    total_compensation: number;
    level_standardized: string;
    company: string;
    location: string;
  };
  recordB: {
    base_salary: number;
    bonus: number;
    stock: number;
    total_compensation: number;
    level_standardized: string;
    company: string;
    location: string;
  };
  levelDifference: number;
  companyDifference: string;
  percentageDifference: number;
  levelWinner: "A" | "B";
  totalWinner: "A" | "B";
  moreStockWinner: "A" | "B";
  percentageWinner: "A" | "B";
};

export function ComparisonTable({
  recordA,
  recordB,
  recordACompany,
  recordBCompany,
  levelDifference,
  companyDifference,
  percentageDifference,
  levelWinner,
  totalWinner,
  moreStockWinner,
  percentageWinner
}: Props) {
  const rows: ComparisonTableRow[] = [
    {
      key: "base",
      label: "Base salary",
      left: `${recordACompany}: ${formatCurrency(recordA.base_salary)}`,
      right: `${recordBCompany}: ${formatCurrency(recordB.base_salary)}`,
      leftValue: recordA.base_salary,
      rightValue: recordB.base_salary,
      leftBetter: recordA.base_salary > recordB.base_salary
    },
    {
      key: "bonus",
      label: "Bonus",
      left: `${recordACompany}: ${formatCurrency(recordA.bonus)}`,
      right: `${recordBCompany}: ${formatCurrency(recordB.bonus)}`,
      leftValue: recordA.bonus,
      rightValue: recordB.bonus,
      leftBetter: recordA.bonus > recordB.bonus
    },
    {
      key: "stock",
      label: "Stock / RSU",
      left: `${recordACompany}: ${formatCurrency(recordA.stock)}`,
      right: `${recordBCompany}: ${formatCurrency(recordB.stock)}`,
      leftValue: recordA.stock,
      rightValue: recordB.stock,
      leftBetter: recordA.stock > recordB.stock,
      winnerBadge: "MORE STOCK"
    },
    {
      key: "total",
      label: "Total compensation",
      left: `${recordACompany}: ${formatCurrency(recordA.total_compensation)}`,
      right: `${recordBCompany}: ${formatCurrency(recordB.total_compensation)}`,
      leftValue: recordA.total_compensation,
      rightValue: recordB.total_compensation,
      leftBetter: recordA.total_compensation > recordB.total_compensation
    },
    {
      key: "level_diff",
      label: "Level difference",
      left: `${recordA.level_standardized}`,
      right: `${recordB.level_standardized}`,
      leftValue: Number(recordA.level_standardized.replace(/[^0-9.-]/g, "")) || 0,
      rightValue: Number(recordB.level_standardized.replace(/[^0-9.-]/g, "")) || 0,
      leftBetter: levelDifference < 0,
      winnerBadge: levelWinner === "A" ? "HIGHER LEVEL" : levelWinner === "B" ? "HIGHER LEVEL" : undefined,
      annotation: levelDifference === 0 ? "Same level" : levelDifference > 0 ? `+${levelDifference} (B higher)` : `${levelDifference} (A higher)`
    },
    {
      key: "company_diff",
      label: "Company difference",
      left: recordA.company,
      right: recordB.company,
      leftValue: 0,
      rightValue: 0,
      leftBetter: false,
      annotation: companyDifference
    },
    {
      key: "percentage_diff",
      label: "Percentage difference",
      left: `${formatCurrency(recordA.total_compensation)} (${recordACompany})`,
      right: `${formatCurrency(recordB.total_compensation)} (${recordBCompany})`,
      leftValue: recordA.total_compensation,
      rightValue: recordB.total_compensation,
      leftBetter: percentageWinner === "A",
      annotation: `${percentageDifference}% (${percentageWinner === "A" ? `${recordACompany} higher` : `${recordBCompany} higher`})`
    }
  ];

  function highlight(which: "A" | "B", value: number, other: number) {
    if (which === "A") {
      return value >= other;
    }
    return other >= value;
  }

  return (
    <Card className="border-border/70">
      <CardContent className="p-0">
        <div className="grid gap-0 sm:grid-cols-2">
          <div className="bg-muted/30 px-5 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:rounded-tl-lg">
            {recordACompany}
          </div>
          <div className="bg-muted/30 px-5 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:rounded-tr-lg">
            {recordBCompany}
          </div>
        </div>

        <div className="divide-y">
          {rows.map((row) => {
            const winner = row.key === "stock" ? moreStockWinner : row.key === "total" ? totalWinner : row.key === "level_diff" ? levelWinner : row.key === "percentage_diff" ? percentageWinner : row.leftBetter ? "A" : "B";

            const showLeftBest = winner === "A";
            const showRightBest = winner === "B";

            const leftTint = showLeftBest ? "bg-emerald-600/10 text-emerald-700" : "text-muted-foreground";
            const rightTint = showRightBest ? "bg-emerald-600/10 text-emerald-700" : "text-muted-foreground";

            return (
              <div key={row.key} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr]">
                <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{row.label}</span>
                  </div>
                  <div className={`rounded-md px-3 py-2 text-right text-sm ${leftTint}`}>
                    {row.left}
                    {row.winnerBadge && row.key === "stock" && showLeftBest ? <Badge text="MORE STOCK" /> : null}
                    {row.key === "total" && showLeftBest ? <Badge text="✓ BEST" /> : null}
                    {row.key === "level_diff" && showLeftBest ? <Badge text="HIGHER LEVEL" /> : null}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:border-l">
                  <div className={`rounded-md px-3 py-2 text-left text-sm ${rightTint} w-full`}>
                    {row.right}
                    {row.winnerBadge && row.key === "stock" && showRightBest ? <Badge text="MORE STOCK" /> : null}
                    {row.key === "total" && showRightBest ? <Badge text="✓ BEST" /> : null}
                    {row.key === "level_diff" && showRightBest ? <Badge text="HIGHER LEVEL" /> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

