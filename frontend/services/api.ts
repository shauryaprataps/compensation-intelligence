import type { CompanyInsights, CompareResponse, SalaryListResponse, Stats } from "@/types/salary";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

async function request<T>(path: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message ?? "API request failed");
  }

  return payload as T;
}

export function getSalaries(params: URLSearchParams) {
  return request<SalaryListResponse>(`/salaries?${params.toString()}`);
}

export function getStats() {
  return request<{ success: true; data: Stats }>("/stats");
}

export type CompaniesListResponse = {
  success: boolean;
  data: Array<{
    company: string;
    record_count: number;
    average_compensation: number;
  }>;
};

export function getCompanies() {
  return request<CompaniesListResponse>("/companies");
}


export function getCompany(company: string) {
  return request<{ success: true; data: CompanyInsights }>(`/company/${encodeURIComponent(company)}`);
}

export function getComparison(id1: string, id2: string) {
  return request<{ success: true; data: CompareResponse }>(`/compare?id1=${encodeURIComponent(id1)}&id2=${encodeURIComponent(id2)}`);
}
