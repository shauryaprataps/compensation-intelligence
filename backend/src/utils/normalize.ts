import crypto from "node:crypto";

export type SignatureInput = {
  company: string;
  role: string;
  level_standardized: string;
  location: string;
  experience_years: number;
  base_salary: number;
  bonus: number;
  stock: number;
};

export function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizeLevel(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function createDuplicateSignature(input: SignatureInput) {
  const payload = [
    normalizeText(input.company),
    normalizeText(input.role),
    normalizeLevel(input.level_standardized),
    normalizeText(input.location),
    Number(input.experience_years).toFixed(1),
    input.base_salary,
    input.bonus,
    input.stock
  ].join("|");

  return crypto.createHash("sha256").update(payload).digest("hex");
}
