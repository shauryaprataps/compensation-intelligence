"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompany, getComparison, getSalaries, getStats } from "@/services/api";

export function useSalaries(params: URLSearchParams) {
  return useQuery({
    queryKey: ["salaries", params.toString()],
    queryFn: () => getSalaries(params),
    staleTime: 30_000
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
    staleTime: 60_000
  });
}

export function useCompany(company: string) {
  return useQuery({
    queryKey: ["company", company],
    queryFn: () => getCompany(company),
    staleTime: 60_000
  });
}

export function useComparison(id1?: string, id2?: string) {
  return useQuery({
    queryKey: ["compare", id1, id2],
    queryFn: () => getComparison(id1!, id2!),
    enabled: Boolean(id1 && id2 && id1 !== id2)
  });
}
