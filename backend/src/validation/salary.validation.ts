import { z } from "zod";

const money = z.coerce.number().int().min(0).max(100_000_000);

export const salaryInputSchema = z
  .object({
    company: z.string().trim().min(1, "Company is required").max(120),
    role: z.string().trim().min(1, "Role is required").max(120),
    level_standardized: z.string().trim().min(1, "Level is required").max(20),
    location: z.string().trim().min(1, "Location is required").max(120),
    experience_years: z.coerce.number().min(0).max(60),
    base_salary: money,
    bonus: money.optional().default(0),
    stock: money.optional().default(0),
    confidence_score: z.coerce.number().int().min(0).max(100)
  })
  .strict();

export const salaryQuerySchema = z
  .object({
    company: z.string().trim().min(1).optional(),
    role: z.string().trim().min(1).optional(),
    location: z.string().trim().min(1).optional(),
    level: z.string().trim().min(1).optional(),
    experience: z.coerce.number().min(0).max(60).optional(),
    sort: z.enum(["total_compensation", "experience", "confidence"]).optional().default("total_compensation"),
    order: z.enum(["asc", "desc"]).optional().default("desc"),
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().positive().max(100).optional().default(20)
  })
  .strict();

export const compareQuerySchema = z
  .object({
    id1: z.string().min(1),
    id2: z.string().min(1)
  })
  .strict()
  .refine((data) => data.id1 !== data.id2, {
    message: "Comparison requires two different salary records",
    path: ["id2"]
  });

export type SalaryInput = z.infer<typeof salaryInputSchema>;
export type SalaryQuery = z.infer<typeof salaryQuerySchema>;
