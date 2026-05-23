export type SalaryRecord = {
  id: string;
  company: string;
  role: string;
  level_standardized: string;
  location: string;
  experience_years: number;
  base_salary: number;
  bonus: number;
  stock: number;
  total_compensation: number;
  confidence_score: number;
  created_at: string;
  updated_at: string;
};

export type SalaryListResponse = {
  success: boolean;
  data: SalaryRecord[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

export type CompanyInsights = {
  company: string;
  salary_records: SalaryRecord[];
  median_compensation: number;
  mean_compensation: number;
  top_compensation: number;
  level_distribution: Array<{ name: string; count: number }>;
  location_distribution: Array<{ name: string; count: number }>;
  role_breakdown: Array<{ name: string; count: number }>;
  compensation_trends: Array<{ created_at: string; total_compensation: number; level: string }>;
};

export type Stats = {
  top_paying_companies: Array<{
    company: string;
    average_compensation: number;
    median_compensation: number;
    record_count: number;
  }>;
  average_compensation: number;
  median_compensation: number;
  level_distributions: Array<{ name: string; count: number }>;
  role_distributions: Array<{ name: string; count: number }>;
  location_distributions: Array<{ name: string; count: number }>;
  compensation_distribution: Array<{ range: string; count: number }>;
  percentile_estimator: Array<{
    id: string;
    company: string;
    level: string;
    total_compensation: number;
    percentile: number;
  }>;
};

export type CompareResponse = {
  record_a: SalaryRecord;
  record_b: SalaryRecord;
  difference: {
    base: number;
    bonus: number;
    stock: number;
    total: number;
    percentage: number;
  };
  level_comparison: string;
  company_comparison: string;
  experience_comparison: number;
};

export type SubmitSalaryInput = {
  company: string;
  role: string;
  level_standardized: string;
  location: string;
  experience_years: number;
  base_salary: number;
  bonus?: number;
  stock?: number;
  total_compensation: number;
  confidence_score: number;
};

