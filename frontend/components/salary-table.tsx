"use client";

import Link from "next/link";
import type { SalaryRecord } from "@/types/salary";
import { formatCurrency, titleCase } from "@/utils/format";
import { EmptyState } from "@/components/state-block";

type Props = {
  rows: SalaryRecord[];
  selectable?: boolean;
  selectedIds?: string[];
  onToggle?: (id: string) => void;
};

export function SalaryTable({ rows, selectable = false, selectedIds = [], onToggle }: Props) {
  if (!rows.length) return <EmptyState />;

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            {selectable ? <th className="px-4 py-3">Pick</th> : null}
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Level</th>
            <th className="px-4 py-3">Experience</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Base</th>
            <th className="px-4 py-3">Bonus</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Total Compensation</th>
            <th className="px-4 py-3">Confidence</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-muted/40">
              {selectable ? (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => onToggle?.(row.id)}
                    aria-label={`Select ${row.company} ${row.level_standardized}`}
                  />
                </td>
              ) : null}
              <td className="px-4 py-3 font-medium">
                <Link className="text-primary hover:underline" href={`/company/${row.company}`}>
                  {titleCase(row.company)}
                </Link>
              </td>
              <td className="px-4 py-3">{titleCase(row.role)}</td>
              <td className="px-4 py-3">{row.level_standardized}</td>
              <td className="px-4 py-3">{row.experience_years} yrs</td>
              <td className="px-4 py-3">{titleCase(row.location)}</td>
              <td className="px-4 py-3">{formatCurrency(row.base_salary)}</td>
              <td className="px-4 py-3">{formatCurrency(row.bonus)}</td>
              <td className="px-4 py-3">{formatCurrency(row.stock)}</td>
              <td className="px-4 py-3 font-semibold">{formatCurrency(row.total_compensation)}</td>
              <td className="px-4 py-3">
                <span className="inline-flex rounded-md bg-secondary px-2 py-1 text-xs">{row.confidence_score}%</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
