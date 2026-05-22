import { describe, expect, it } from "vitest";
import { createDuplicateSignature, normalizeLevel, normalizeText } from "../src/utils/normalize.js";

describe("normalization utilities", () => {
  it("normalizes company name inconsistencies", () => {
    expect(normalizeText(" Google ")).toBe("google");
    expect(normalizeText("GOOGLE")).toBe("google");
    expect(normalizeText("gooGLe")).toBe("google");
  });

  it("normalizes levels to comparable values", () => {
    expect(normalizeLevel(" l4 ")).toBe("L4");
  });

  it("creates stable duplicate signatures for normalized equivalents", () => {
    const first = createDuplicateSignature({
      company: "Google",
      role: "Software Engineer",
      level_standardized: "l4",
      location: "Bengaluru",
      experience_years: 4,
      base_salary: 5000000,
      bonus: 0,
      stock: 1000000
    });

    const second = createDuplicateSignature({
      company: " google ",
      role: "software engineer",
      level_standardized: "L4",
      location: "bengaluru",
      experience_years: 4,
      base_salary: 5000000,
      bonus: 0,
      stock: 1000000
    });

    expect(first).toBe(second);
  });
});
