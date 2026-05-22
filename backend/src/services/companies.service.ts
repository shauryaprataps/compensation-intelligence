import { prisma } from "../config/prisma.js";

export async function listCompanies() {
  // Return ALL distinct companies available in the DB.
  // No confidence filtering, no limits, no trending/top ordering.
  // We aggregate only to provide median/avg-compatible display fields.
  const grouped = await prisma.salary.groupBy({
    by: ["company"],
    _count: {
      company: true
    },
    _avg: {
      total_compensation: true
    }
  });

  // Note: _avg.total_compensation is Decimal | null depending on Prisma.
  // We keep payload minimal for the frontend (median can be computed per company later if needed).
  return grouped
    .map((g: { company: string; _count: { company: number }; _avg: { total_compensation: any } }) => ({
      company: g.company,
      record_count: g._count.company,
      average_compensation:
        g._avg.total_compensation?.toNumber?.() ?? g._avg.total_compensation ?? 0
    }))
    .sort((a: { company: string }, b: { company: string }) => a.company.localeCompare(b.company));
}

