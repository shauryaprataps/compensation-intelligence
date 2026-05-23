import type { CompanyInsights, CompareResponse, SalaryListResponse, Stats } from "@/types/salary";

const API_BASE_URL=
  process.env.NEXT_PUBLIC_API_URL ||
  "https://compensation-intelligence-backend.onrender.com";

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
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
  return request<{ success: true; data: CompanyInsights }>(
    `/company/${encodeURIComponent(company)}`
  );
}

export function getComparison(id1: string, id2: string) {
  return request<{ success: true; data: CompareResponse }>(
    `/compare?id1=${encodeURIComponent(id1)}&id2=${encodeURIComponent(id2)}`
  );
}

export type SubmitSalaryApiResponse = {
  success: boolean;
  data: any;
};

export async function submitSalary(payload: any): Promise<SubmitSalaryApiResponse> {
  return request<SubmitSalaryApiResponse>("/ingest-salary", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getAllLocations(): Promise<string[]> {
  // Fetch enough rows to get distinct locations.
  // Backend paging is supported; we request a larger page size to reduce calls.
  const params = new URLSearchParams({ page: "1", pageSize: "200", sort: "total_compensation", order: "desc" });
  const res = await getSalaries(params);
  const locations = (res.data ?? []).map((r: any) => r.location).filter(Boolean);
  return Array.from(new Set(locations));
}


