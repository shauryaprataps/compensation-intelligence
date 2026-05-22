import { describe, expect, it } from "vitest";
import { compareQuerySchema, salaryInputSchema, salaryQuerySchema } from "../src/validation/salary.validation.js";

describe("salary validation", () => {
  it("defaults missing bonus and stock to zero", () => {
    const result = salaryInputSchema.parse({
      company: " Google ",
      role: "Software Engineer",
      level_standardized: "L4",
      location: "Bengaluru",
      experience_years: 4,
      base_salary: 5000000,
      confidence_score: 90
    });

    expect(result.bonus).toBe(0);
    expect(result.stock).toBe(0);
  });

  it("rejects missing required fields", () => {
    expect(() =>
      salaryInputSchema.parse({
        role: "Software Engineer",
        level_standardized: "L4",
        location: "Bengaluru",
        experience_years: 4,
        base_salary: 5000000,
        confidence_score: 90
      })
    ).toThrow();
  });

  it("rejects negative salary values", () => {
    expect(() =>
      salaryInputSchema.parse({
        company: "Google",
        role: "Software Engineer",
        level_standardized: "L4",
        location: "Bengaluru",
        experience_years: 4,
        base_salary: -1,
        confidence_score: 90
      })
    ).toThrow();
  });

  it("rejects invalid confidence and experience", () => {
    expect(() =>
      salaryInputSchema.parse({
        company: "Google",
        role: "Software Engineer",
        level_standardized: "L4",
        location: "Bengaluru",
        experience_years: 99,
        base_salary: 5000000,
        confidence_score: 101
      })
    ).toThrow();
  });

  it("accepts supported filtering and sorting inputs", () => {
    const result = salaryQuerySchema.parse({
      company: "google",
      level: "L4",
      sort: "total_compensation",
      page: "1"
    });

    expect(result.company).toBe("google");
    expect(result.sort).toBe("total_compensation");
    expect(result.page).toBe(1);
  });

  it("requires two different ids for comparison", () => {
    expect(() => compareQuerySchema.parse({ id1: "same", id2: "same" })).toThrow();
  });
});
