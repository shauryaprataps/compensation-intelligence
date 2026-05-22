import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import { median, mean } from "../src/utils/analytics.js";

const prisma = new PrismaClient();
faker.seed(20260522);

type Level = "L3" | "L4" | "L5" | "L6" | "L7" | "L8";
type Region = "India" | "US" | "UK" | "Singapore";
type Category = "top-tier" | "big-tech" | "finance" | "indian-tech";

type CompanyName = keyof typeof COMPANY_CONFIG;

type SeedSalary = {
  company: string;
  role: string;
  level_standardized: Level;
  location: string;
  experience_years: number;
  base_salary: number;
  bonus: number;
  stock: number;
  confidence_score: number;
  total_compensation: number;
  duplicate_signature: string;
};

const TARGET_RECORDS = 250;

const COMPANY_CONFIG = {
  Google: {
    locations: ["Bengaluru, India", "Hyderabad, India", "Seattle, US", "San Francisco, US", "London, UK", "Singapore"],
    multiplier: 1.2
  },
  Meta: {
    locations: ["Seattle, US", "San Francisco, US", "London, UK", "New York, US"],
    multiplier: 1.3
  },
  OpenAI: {
    locations: ["San Francisco, US", "New York, US", "London, UK"],
    multiplier: 1.5
  },
  Microsoft: {
    locations: ["Hyderabad, India", "Bengaluru, India", "Seattle, US"],
    multiplier: 1.1
  },
  Amazon: {
    locations: ["Bengaluru, India", "Hyderabad, India", "Seattle, US", "Austin, US"],
    multiplier: 1.0
  },
  Netflix: {
    locations: ["Los Angeles, US", "San Francisco, US"],
    multiplier: 1.4
  },
  Stripe: {
    locations: ["San Francisco, US", "New York, US", "London, UK"],
    multiplier: 1.3
  },
  Uber: {
    locations: ["Bengaluru, India", "San Francisco, US"],
    multiplier: 1.1
  },
  "Goldman Sachs": {
    locations: ["New York, US", "London, UK", "Bengaluru, India"],
    multiplier: 1.15
  },
  JPMorgan: {
    locations: ["New York, US", "London, UK", "Bengaluru, India"],
    multiplier: 1.1
  },
  Swiggy: {
    locations: ["Bengaluru, India", "Remote India"],
    multiplier: 0.75
  },
  Zomato: {
    locations: ["Gurugram, India", "Bengaluru, India"],
    multiplier: 0.7
  },
  PhonePe: {
    locations: ["Bengaluru, India"],
    multiplier: 0.85
  },
  Razorpay: {
    locations: ["Bengaluru, India"],
    multiplier: 0.8
  },
  Flipkart: {
    locations: ["Bengaluru, India"],
    multiplier: 0.85
  },
  "Tata Consultancy Services": {
    locations: ["Bengaluru, India", "Pune, India", "Chennai, India"],
    multiplier: 0.65
  },
  Infosys: {
    locations: ["Bengaluru, India", "Pune, India", "Chennai, India"],
    multiplier: 0.6
  },
  Wipro: {
    locations: ["Bengaluru, India", "Pune, India", "Chennai, India"],
    multiplier: 0.6
  },
  HCL: {
    locations: ["Bengaluru, India", "Pune, India", "Chennai, India"],
    multiplier: 0.6
  },
  Accenture: {
    locations: ["Bengaluru, India", "Pune, India", "Chennai, India"],
    multiplier: 0.7
  }
} as const;

const COMPANY_META: Record<CompanyName, { category: Category; weight: number }> = {
  Google: { category: "top-tier", weight: 16 },
  Meta: { category: "top-tier", weight: 10 },
  OpenAI: { category: "top-tier", weight: 6 },
  Microsoft: { category: "big-tech", weight: 16 },
  Amazon: { category: "big-tech", weight: 18 },
  Netflix: { category: "top-tier", weight: 5 },
  Stripe: { category: "top-tier", weight: 7 },
  Uber: { category: "big-tech", weight: 7 },
  "Goldman Sachs": { category: "finance", weight: 8 },
  JPMorgan: { category: "finance", weight: 8 },
  Swiggy: { category: "indian-tech", weight: 8 },
  Zomato: { category: "indian-tech", weight: 8 },
  PhonePe: { category: "indian-tech", weight: 7 },
  Razorpay: { category: "indian-tech", weight: 6 },
  Flipkart: { category: "indian-tech", weight: 8 },
  "Tata Consultancy Services" : { category: "indian-tech", weight: 6 },
  Infosys : { category: "indian-tech", weight: 6 },
  Wipro : { category: "indian-tech", weight: 6 },
  HCL : { category: "indian-tech", weight: 6 },
  Accenture : { category: "indian-tech", weight: 7 }
};

const engineeringRoles = [
  "Software Engineer",
  "Backend Engineer",
  "Frontend Engineer",
  "Full Stack Engineer",
  "ML Engineer",
  "Data Engineer",
  "Platform Engineer",
  "DevOps Engineer",
  "SRE"
];
const managementRoles = ["Engineering Manager", "Product Manager"];
const researchRoles = ["AI Researcher", "Applied Scientist", "Research Engineer"];

const levelWeights: Array<{ level: Level; weight: number }> = [
  { level: "L3", weight: 30 },
  { level: "L4", weight: 25 },
  { level: "L5", weight: 20 },
  { level: "L6", weight: 15 },
  { level: "L7", weight: 8 },
  { level: "L8", weight: 2 }
];

const experienceRanges: Record<Level, [number, number]> = {
  L3: [0, 2],
  L4: [2, 5],
  L5: [4, 8],
  L6: [7, 12],
  L7: [10, 15],
  L8: [13, 20]
};

const indiaBaseBands: Record<Level, [number, number]> = {
  L3: [1_500_000, 3_000_000],
  L4: [2_500_000, 5_000_000],
  L5: [4_500_000, 8_000_000],
  L6: [8_000_000, 15_000_000],
  L7: [10_000_000, 20_000_000],
  L8: [20_000_000, 40_000_000]
};

const usBaseBands: Record<Level, [number, number]> = {
  L3: [9_000_000, 15_000_000],
  L4: [15_000_000, 25_000_000],
  L5: [20_000_000, 40_000_000],
  L6: [30_000_000, 70_000_000],
  L7: [50_000_000, 100_000_000],
  L8: [80_000_000, 150_000_000]
};

const locationMultipliers: Record<Region, number> = {
  India: 1,
  US: 1.8,
  UK: 1.4,
  Singapore: 1.6
};

const regionTargets: Array<{ region: Region; count: number }> = [
  { region: "India", count: 150 },
  { region: "US", count: 75 },
  { region: "UK", count: 18 },
  { region: "Singapore", count: 7 }
];

function weightedPick<T extends { weight: number }>(items: T[]) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let point = faker.number.float({ min: 0, max: total, fractionDigits: 6 });

  for (const item of items) {
    point -= item.weight;
    if (point <= 0) return item;
  }

  return items[items.length - 1];
}

function randomFrom<T>(items: readonly T[]) {
  return items[faker.number.int({ min: 0, max: items.length - 1 })];
}

function roundToNearest(value: number, nearest: number) {
  return Math.max(nearest, Math.round(value / nearest) * nearest);
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function regionForLocation(location: string): Region {
  if (location.endsWith(", US")) return "US";
  if (location.endsWith(", UK")) return "UK";
  if (location === "Singapore") return "Singapore";
  return "India";
}

function baseBand(level: Level, region: Region): [number, number] {
  if (region === "US") return usBaseBands[level];
  if (region === "UK") return scaleBand(indiaBaseBands[level], 1.4);
  if (region === "Singapore") return scaleBand(indiaBaseBands[level], 1.6);
  return indiaBaseBands[level];
}

function scaleBand([min, max]: [number, number], multiplier: number): [number, number] {
  return [Math.round(min * multiplier), Math.round(max * multiplier)];
}

function companiesForRegion(region: Region) {
  return (Object.keys(COMPANY_CONFIG) as CompanyName[])
    .filter((company) => COMPANY_CONFIG[company].locations.some((location) => regionForLocation(location) === region))
    .map((company) => ({
      company,
      weight: COMPANY_META[company].weight
    }));
}

function pickCompanyForRegion(region: Region) {
  return weightedPick(companiesForRegion(region)).company;
}

function pickLocationForCompanyAndRegion(company: CompanyName, region: Region) {
  const validLocations = COMPANY_CONFIG[company].locations.filter((location) => regionForLocation(location) === region);
  if (!validLocations.length) {
    throw new Error(`No valid ${region} locations configured for ${company}`);
  }
  return randomFrom(validLocations);
}

function pickRole(company: CompanyName, level: Level) {
  const category = COMPANY_META[company].category;
  const groupRoll = faker.number.int({ min: 1, max: 100 });

  if (category === "finance" && groupRoll <= 35) return randomFrom(managementRoles);
  if (category === "top-tier" && ["OpenAI", "Google", "Meta"].includes(company) && groupRoll > 75) return randomFrom(researchRoles);
  if (Number(level.slice(1)) >= 6 && groupRoll <= 30) return randomFrom(managementRoles);
  if (groupRoll <= 60) return randomFrom(engineeringRoles);
  if (groupRoll <= 80) return randomFrom(managementRoles);
  return randomFrom(researchRoles);
}

function experienceFor(level: Level) {
  const [min, max] = experienceRanges[level];
  return faker.number.float({ min, max, fractionDigits: 1 });
}

function roleMultiplier(role: string) {
  if (role === "AI Researcher") return 1.25;
  if (role === "Applied Scientist" || role === "Research Engineer") return 1.16;
  if (role === "ML Engineer") return 1.1;
  if (role === "Engineering Manager") return 1.15;
  if (role === "Product Manager") return 1.08;
  if (role === "Frontend Engineer") return 0.95;
  if (role === "Data Engineer") return 0.94;
  return 1;
}

function buildCompensation(company: CompanyName, role: string, level: Level, region: Region, experience: number) {
  const [min, max] = baseBand(level, region);
  const [expMin, expMax] = experienceRanges[level];
  const experiencePosition = (experience - expMin) / Math.max(1, expMax - expMin);
  const bandPosition = faker.number.float({ min: 0.22, max: 0.84, fractionDigits: 3 });
  const companyMultiplier = COMPANY_CONFIG[company].multiplier;
  const baseRaw =
    (min + (max - min) * bandPosition) *
    companyMultiplier *
    locationMultipliers[region] *
    roleMultiplier(role) *
    (0.94 + experiencePosition * 0.12);
  const base_salary = roundToNearest(baseRaw, 50_000);
  const { bonusRate, stockRate } = componentRates(company, role);
  const bonus = roundToNearest(base_salary * bonusRate, 25_000);
  const stock = roundToNearest(base_salary * stockRate, 25_000);

  return {
    base_salary,
    bonus,
    stock,
    total_compensation: base_salary + bonus + stock
  };
}

function componentRates(company: CompanyName, role: string) {
  const category = COMPANY_META[company].category;
  const researchBoost = ["AI Researcher", "Applied Scientist", "Research Engineer", "ML Engineer"].includes(role) ? 1.12 : 1;

  if (category === "finance") {
    return {
      bonusRate: faker.number.float({ min: 0.24, max: 0.42, fractionDigits: 3 }),
      stockRate: faker.number.float({ min: 0, max: 0.06, fractionDigits: 3 })
    };
  }

  if (category === "indian-tech") {
    return {
      bonusRate: faker.number.float({ min: 0.04, max: 0.11, fractionDigits: 3 }),
      stockRate: faker.number.float({ min: 0.04, max: 0.16, fractionDigits: 3 }) * researchBoost
    };
  }

  if (category === "top-tier") {
    return {
      bonusRate: faker.number.float({ min: 0.1, max: 0.2, fractionDigits: 3 }),
      stockRate: faker.number.float({ min: 0.35, max: 0.7, fractionDigits: 3 }) * researchBoost
    };
  }

  return {
    bonusRate: faker.number.float({ min: 0.1, max: 0.2, fractionDigits: 3 }),
    stockRate: faker.number.float({ min: 0.16, max: 0.38, fractionDigits: 3 }) * researchBoost
  };
}

function confidenceFor(company: CompanyName) {
  const category = COMPANY_META[company].category;
  if (category === "indian-tech") return faker.number.int({ min: 70, max: 90 });
  if (category === "top-tier") return faker.number.int({ min: 78, max: 98 });
  return faker.number.int({ min: 74, max: 95 });
}

function duplicateSignature(row: Omit<SeedSalary, "duplicate_signature">) {
  const payload = [
    normalizeText(row.company),
    normalizeText(row.role),
    row.level_standardized,
    normalizeText(row.location),
    row.experience_years.toFixed(1),
    row.base_salary,
    row.bonus,
    row.stock
  ].join("|");

  return createHash("sha256").update(payload).digest("hex");
}

function makeRecord(region: Region): SeedSalary {
  const company = pickCompanyForRegion(region);
  const location = pickLocationForCompanyAndRegion(company, region);
  const level = weightedPick(levelWeights).level;
  const role = pickRole(company, level);
  const experience = experienceFor(level);
  const compensation = buildCompensation(company, role, level, region, experience);
  const row = {
    company,
    role,
    level_standardized: level,
    location,
    experience_years: experience,
    confidence_score: confidenceFor(company),
    ...compensation
  };

  return {
    ...row,
    duplicate_signature: duplicateSignature(row)
  };
}

function outliers(): SeedSalary[] {
  const rows: Array<Omit<SeedSalary, "duplicate_signature">> = [
    {
      company: "OpenAI",
      role: "AI Researcher",
      level_standardized: "L8",
      location: "San Francisco, US",
      experience_years: 18,
      base_salary: 330_000_000,
      bonus: 66_000_000,
      stock: 285_000_000,
      confidence_score: 83,
      total_compensation: 681_000_000
    },
    {
      company: "Netflix",
      role: "Platform Engineer",
      level_standardized: "L7",
      location: "Los Angeles, US",
      experience_years: 14,
      base_salary: 200_000_000,
      bonus: 22_000_000,
      stock: 190_000_000,
      confidence_score: 79,
      total_compensation: 412_000_000
    },
    {
      company: "Google",
      role: "Engineering Manager",
      level_standardized: "L8",
      location: "San Francisco, US",
      experience_years: 19,
      base_salary: 250_000_000,
      bonus: 55_000_000,
      stock: 230_000_000,
      confidence_score: 90,
      total_compensation: 535_000_000
    }
  ];

  return rows.map((row) => ({ ...row, duplicate_signature: duplicateSignature(row) }));
}

function duplicateInputs(rows: SeedSalary[]) {
  const google = rows.find((row) => row.company === "Google");
  if (!google) return [];

  return ["GOOGLE", " google "].map((company) => {
    const row = { ...google, company };
    return { ...row, duplicate_signature: duplicateSignature(row) };
  });
}

function buildDataset() {
  const rows: SeedSalary[] = [];

  for (const target of regionTargets) {
    for (let index = 0; index < target.count; index += 1) {
      rows.push(makeRecord(target.region));
    }
  }

  const uniqueTargetRows = rows.slice(0, TARGET_RECORDS - outliers().length);
  const withOutliers = [...uniqueTargetRows, ...outliers()];
  return [...withOutliers, ...duplicateInputs(withOutliers)];
}

function assertHardConstraints(rows: SeedSalary[]) {
  for (const row of rows) {
    const config = COMPANY_CONFIG[row.company.trim() as CompanyName];
    if (!config?.locations.includes(row.location as never)) {
      throw new Error(`Invalid company-location combination: ${row.company} -> ${row.location}`);
    }

    const [minExp, maxExp] = experienceRanges[row.level_standardized];
    if (row.experience_years < minExp || row.experience_years > maxExp) {
      throw new Error(`Invalid experience for ${row.level_standardized}: ${row.experience_years}`);
    }

    if (row.total_compensation !== row.base_salary + row.bonus + row.stock) {
      throw new Error(`Invalid total compensation for ${row.company}`);
    }
  }
}

async function main() {
  const rows = buildDataset();
  assertHardConstraints(rows);

  let inserted = 0;
  let skippedDuplicates = 0;

  for (const row of rows) {
    const normalized = {
      company: normalizeText(row.company),
      role: normalizeText(row.role),
      level_standardized: row.level_standardized,
      location: normalizeText(row.location),
      experience_years: row.experience_years,
      base_salary: row.base_salary,
      bonus: row.bonus,
      stock: row.stock,
      confidence_score: row.confidence_score,
      total_compensation: row.total_compensation,
      duplicate_signature: row.duplicate_signature
    };
    const existing = await prisma.salary.findUnique({
      where: { duplicate_signature: normalized.duplicate_signature }
    });

    if (existing) {
      skippedDuplicates += 1;
      continue;
    }

    await prisma.salary.upsert({
      where: { duplicate_signature: normalized.duplicate_signature },
      update: {},
      create: normalized
    });
    inserted += 1;
  }

  const allRows = await prisma.salary.findMany();
  const totals = allRows.map((row) => row.total_compensation);
  const highest = allRows.reduce((best, row) => (row.total_compensation > best.total_compensation ? row : best), allRows[0]);

  console.log("Seed complete");
  console.log(`Records inserted: ${inserted}`);
  console.log(`Duplicate inputs skipped: ${skippedDuplicates}`);
  console.log(`Companies: ${new Set(allRows.map((row) => row.company)).size}`);
  console.log(`Locations: ${new Set(allRows.map((row) => row.location)).size}`);
  console.log(`Levels: ${[...new Set(allRows.map((row) => row.level_standardized))].sort().join(", ")}`);
  console.log(`Highest compensation: ${highest.company} ${highest.level_standardized} ${highest.role} ${highest.total_compensation}`);
  console.log(`Average compensation: ${Math.round(mean(totals))}`);
  console.log(`Median compensation: ${median(totals)}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
