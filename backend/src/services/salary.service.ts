import type { Prisma, Salary } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/errors.js";
import { mean, median, percentile } from "../utils/analytics.js";
import { createDuplicateSignature, normalizeLevel, normalizeText } from "../utils/normalize.js";
import { getPagination, toPaginationMeta } from "../utils/pagination.js";
import type { SalaryInput, SalaryQuery } from "../validation/salary.validation.js";

const sortMap = {
  total_compensation: "total_compensation",
  experience: "experience_years",
  confidence: "confidence_score"
} as const;

function toDto(row: Salary) {
  return {
    ...row,
    experience_years: Number(row.experience_years)
  };
}

function buildWhere(query: SalaryQuery): Prisma.SalaryWhereInput {
  return {
    company: query.company ? { contains: normalizeText(query.company), mode: "insensitive" } : undefined,
    role: query.role ? { contains: normalizeText(query.role), mode: "insensitive" } : undefined,
    location: query.location ? { contains: normalizeText(query.location), mode: "insensitive" } : undefined,
    level_standardized: query.level ? normalizeLevel(query.level) : undefined,
    experience_years: query.experience === undefined ? undefined : { gte: query.experience }
  };
}

export async function ingestSalary(input: SalaryInput) {
  const normalized = {
    company: normalizeText(input.company),
    role: normalizeText(input.role),
    level_standardized: normalizeLevel(input.level_standardized),
    location: normalizeText(input.location),
    experience_years: input.experience_years,
    base_salary: input.base_salary,
    bonus: input.bonus ?? 0,
    stock: input.stock ?? 0,
    confidence_score: input.confidence_score
  };

  const total_compensation = normalized.base_salary + normalized.bonus + normalized.stock;
  const duplicate_signature = createDuplicateSignature(normalized);

  const existing = await prisma.salary.findUnique({ where: { duplicate_signature } });
  if (existing) {
    throw new AppError(409, "Duplicate salary record", { id: existing.id });
  }

  const salary = await prisma.salary.create({
    data: {
      ...normalized,
      total_compensation,
      duplicate_signature
    }
  });

  return toDto(salary);
}

export async function listSalaries(query: SalaryQuery) {
  const pagination = getPagination(query.page, query.pageSize);
  const where = buildWhere(query);
  const orderBy = {
    [sortMap[query.sort]]: query.order
  };

  const [total, rows] = await prisma.$transaction([
    prisma.salary.count({ where }),
    prisma.salary.findMany({
      where,
      orderBy,
      skip: pagination.skip,
      take: pagination.take
    })
  ]);

  return {
    data: rows.map(toDto),
    pagination: toPaginationMeta(total, pagination.page, pagination.pageSize)
  };
}

export async function getCompanyInsights(company: string) {
  const normalizedCompany = normalizeText(company);
  const rows = await prisma.salary.findMany({
    where: { company: normalizedCompany },
    orderBy: { total_compensation: "desc" }
  });

  if (!rows.length) {
    throw new AppError(404, "Company not found");
  }

  const totals = rows.map((row) => row.total_compensation);

  return {
    company: normalizedCompany,
    salary_records: rows.map(toDto),
    median_compensation: median(totals),
    mean_compensation: mean(totals),
    top_compensation: Math.max(...totals),
    level_distribution: groupCount(rows, "level_standardized"),
    location_distribution: groupCount(rows, "location"),
    role_breakdown: groupCount(rows, "role"),
    compensation_trends: rows
      .slice()
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
      .map((row) => ({
        created_at: row.created_at,
        total_compensation: row.total_compensation,
        level: row.level_standardized
      }))
  };
}

export async function compareSalaries(id1: string, id2: string) {
  const rows = await prisma.salary.findMany({
    where: { id: { in: [id1, id2] } }
  });

  if (rows.length !== 2) {
    throw new AppError(404, "One or both salary records were not found");
  }

  const first = rows.find((row) => row.id === id1);
  const second = rows.find((row) => row.id === id2);
  if (!first || !second) {
    throw new AppError(404, "One or both salary records were not found");
  }

  const totalDifference = second.total_compensation - first.total_compensation;
  const percentageDifference =
    first.total_compensation === 0 ? 0 : Math.round((totalDifference / first.total_compensation) * 10000) / 100;

  return {
    record_a: toDto(first),
    record_b: toDto(second),
    difference: {
      base: second.base_salary - first.base_salary,
      bonus: second.bonus - first.bonus,
      stock: second.stock - first.stock,
      total: totalDifference,
      percentage: percentageDifference
    },
    level_comparison: `${first.level_standardized} vs ${second.level_standardized}`,
    company_comparison: `${first.company} vs ${second.company}`,
    experience_comparison: Number(second.experience_years) - Number(first.experience_years)
  };
}

export async function getStats() {
  const rows = await prisma.salary.findMany();
  const totals = rows.map((row) => row.total_compensation);

  const companyGroups = groupAggregate(rows, "company");

  return {
    top_paying_companies: companyGroups
      .map((item) => ({
        company: item.key,
        average_compensation: mean(item.values),
        median_compensation: median(item.values),
        record_count: item.values.length
      }))
      .sort((a, b) => b.average_compensation - a.average_compensation)
      .slice(0, 10),
    average_compensation: mean(totals),
    median_compensation: median(totals),
    level_distributions: groupCount(rows, "level_standardized"),
    role_distributions: groupCount(rows, "role"),
    location_distributions: groupCount(rows, "location"),
    compensation_distribution: bucketCompensation(totals),
    percentile_estimator: rows.map((row) => ({
      id: row.id,
      company: row.company,
      level: row.level_standardized,
      total_compensation: row.total_compensation,
      percentile: percentile(totals, row.total_compensation)
    }))
  };
}

function groupCount(rows: Salary[], key: keyof Pick<Salary, "company" | "role" | "level_standardized" | "location">) {
  return Object.entries(
    rows.reduce<Record<string, number>>((acc, row) => {
      const value = String(row[key]);
      acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));
}

function groupAggregate(rows: Salary[], key: "company") {
  const grouped = rows.reduce<Record<string, number[]>>((acc, row) => {
    const value = row[key];
    acc[value] = acc[value] ?? [];
    acc[value].push(row.total_compensation);
    return acc;
  }, {});

  return Object.entries(grouped).map(([keyName, values]) => ({ key: keyName, values }));
}

function bucketCompensation(values: number[]) {
  const bucketSize = 1_000_000;
  const grouped = values.reduce<Record<string, number>>((acc, value) => {
    const floor = Math.floor(value / bucketSize) * bucketSize;
    const label = `${floor / 100000}L-${(floor + bucketSize) / 100000}L`;
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped).map(([range, count]) => ({ range, count }));
}
