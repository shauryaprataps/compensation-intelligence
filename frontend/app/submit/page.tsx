"use client";

import { useEffect, useMemo, useState } from "react";


import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Plus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

import { getAllLocations, submitSalary } from "@/services/api";
import type { SubmitSalaryInput } from "@/types/salary";

import { normalizeLocation } from "@/utils/normalizeLocation";


const COMPANY_PRESETS = ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Nvidia", "OpenAI"];
const ROLE_PRESETS = ["Software Engineer", "Data Scientist", "Product Manager", "Engineering Manager", "Design"];
const LEVEL_PRESETS = ["L3", "L4", "L5", "L6", "L7", "L8"];


const CURRENCY_PRESETS = [
  { label: "INR (₹)", value: "INR" },
  { label: "USD ($)", value: "USD" }
];

function clampNonNegativeInt(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.trunc(n));
}

export default function SubmitSalaryPage() {
  const router = useRouter();

  const [currency, setCurrency] = useState<"INR" | "USD">("INR");

  const [companyPreset, setCompanyPreset] = useState<string>(COMPANY_PRESETS[0]);
  const [companyMode, setCompanyMode] = useState<"preset" | "custom">("preset");
  const [companyCustom, setCompanyCustom] = useState<string>("");

  const [role, setRole] = useState<string>(ROLE_PRESETS[0]);
  const [level, setLevel] = useState<string>(LEVEL_PRESETS[2]);

  const [locationInput, setLocationInput] = useState<string>("");
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [knownLocations, setKnownLocations] = useState<string[]>([]);


  const [experienceYears, setExperienceYears] = useState<number>(3);

  const [baseSalary, setBaseSalary] = useState<number | "">("");
  const [bonus, setBonus] = useState<number | "">(0);
  const [stock, setStock] = useState<number | "">(0);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const normalized = useMemo(() => {
    const base = baseSalary === "" ? 0 : baseSalary;
    const b = bonus === "" ? 0 : bonus;
    const s = stock === "" ? 0 : stock;

    return {
      company: companyMode === "preset" ? companyPreset : companyCustom.trim(),
      role,
      level_standardized: level,
      location: normalizeLocation(locationInput),
      experience_years: clampNonNegativeInt(experienceYears),
      base_salary: clampNonNegativeInt(base),
      bonus: clampNonNegativeInt(b),
      stock: clampNonNegativeInt(s),
      confidence_score: 80
    };
  }, [bonus, baseSalary, companyCustom, companyMode, companyPreset, experienceYears, level, locationInput, role, stock]);


  const estimatedTotalTc = useMemo(() => {
    const total = normalized.base_salary + normalized.bonus + normalized.stock;
    return total;
  }, [normalized.base_salary, normalized.bonus, normalized.stock]);

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};

    if (!normalized.company) next.company = "Company is required";
    if (!normalized.role) next.role = "Role is required";
    if (!normalized.level_standardized) next.level = "Level is required";
    if (!normalized.location) next.location = "Location is required";


    if (!Number.isFinite(experienceYears) || Number.isNaN(experienceYears)) {
      next.experience_years = "Years of experience is required";
    } else if (experienceYears < 0) {
      next.experience_years = "Experience years cannot be negative";
    }


    if (baseSalary === "") next.base_salary = "Base salary is required";
    else if (Number(baseSalary) < 0) next.base_salary = "Base salary cannot be negative";

    if (bonus !== "" && Number(bonus) < 0) next.bonus = "Bonus cannot be negative";
    if (stock !== "" && Number(stock) < 0) next.stock = "Stock/RSU cannot be negative";

    return next;
  }

  useEffect(() => {
    let mounted = true;
    setLocationLoading(true);
    setLocationError(null);

    getAllLocations()
      .then((locs) => {
        if (!mounted) return;
        setKnownLocations(locs);
        setLocationSuggestions([]);
      })
      .catch((err) => {
        if (!mounted) return;
        setLocationError((err as Error).message);
      })
      .finally(() => {
        if (!mounted) return;
        setLocationLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  function updateLocationSuggestions(nextValue: string) {
    const q = nextValue.trim().toLowerCase();
    if (!q) {
      setLocationSuggestions([]);
      return;
    }

    const aliasNormalized = normalizeLocation(nextValue);

    const matches = knownLocations
      .filter((loc) => {
        const normalizedLoc = normalizeLocation(loc).toLowerCase();
        return normalizedLoc.includes(q) || normalizedLoc.includes(aliasNormalized.toLowerCase());
      })
      .map((loc) => normalizeLocation(loc));

    // De-dupe while preserving order
    const uniq = Array.from(new Set(matches));
    setLocationSuggestions(uniq.slice(0, 8));
  }

  async function onSubmit(e: React.FormEvent) {

    e.preventDefault();
    if (submitting) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const payload: SubmitSalaryInput = {
        ...normalized,
        confidence_score: 80
      } as any;

      // Currency is not part of backend schema; it is only for user display/clarity.
      void currency;

      await submitSalary(payload);

      // Lightweight “toast” fallback (no toast lib in repo). Use alert for success/error.
      alert("Salary submitted successfully");
      router.push("/salaries");
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  const moneyPrefix = currency === "INR" ? "₹" : "$";

  function FieldError({ name }: { name: string }) {
    if (!errors[name]) return null;
    return (
      <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
        <AlertTriangle className="h-3.5 w-3.5" />
        {errors[name]}
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Submit Salary</h1>
          <p className="mt-2 text-sm text-muted-foreground">Share your comp details to help others benchmark.</p>
        </div>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Estimated Total TC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
              <div className="text-4xl font-bold tracking-tight">
                {moneyPrefix}
                {estimatedTotalTc.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Base {moneyPrefix}
                {(normalized.base_salary ?? 0).toLocaleString()} + Bonus {moneyPrefix}
                {(normalized.bonus ?? 0).toLocaleString()} + Stock {moneyPrefix}
                {(normalized.stock ?? 0).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Your Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <label className="text-sm font-medium">Company</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {COMPANY_PRESETS.map((c) => (
                      <Button
                        key={c}
                        type="button"
                        variant={companyMode === "preset" && companyPreset === c ? "default" : "outline"}
                        className="h-9"
                        onClick={() => {
                          setCompanyMode("preset");
                          setCompanyPreset(c);
                        }}
                      >
                        {c}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant={companyMode === "custom" ? "default" : "outline"}
                      className="h-9"
                      onClick={() => setCompanyMode("custom")}
                    >
                      <Plus className="h-4 w-4" />
                      Custom
                    </Button>
                  </div>

                  {companyMode === "custom" && (
                    <div className="mt-3">
                      <Input
                        placeholder="Enter company name"
                        value={companyCustom}
                        onChange={(e) => setCompanyCustom(e.target.value)}
                      />
                      <FieldError name="company" />
                    </div>
                  )}

                  {companyMode === "preset" && <FieldError name="company" />}
                </div>

                <div>
                  <label className="text-sm font-medium">Role</label>
                  <div className="mt-2">
                    <Select value={role} onChange={(e) => setRole(e.target.value)} options={ROLE_PRESETS.map((r) => ({ label: r, value: r }))} />
                  </div>
                  <FieldError name="role" />
                </div>

                <div>
                  <label className="text-sm font-medium">Level</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {LEVEL_PRESETS.map((l) => (
                      <Button
                        key={l}
                        type="button"
                        variant={level === l ? "default" : "outline"}
                        className="h-9"
                        onClick={() => setLevel(l)}
                      >
                        {l}
                      </Button>
                    ))}
                  </div>
                  <FieldError name="level" />
                </div>

                <div>
                  <label className="text-sm font-medium">Location</label>
                  <div className="mt-2">
                    <Input
                      placeholder="Enter city (e.g. Bengaluru)"
                      value={locationInput}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLocationInput(v);
                        updateLocationSuggestions(v);
                      }}
                    />

                    {locationLoading && (
                      <div className="mt-1 text-xs text-muted-foreground">Loading locations…</div>
                    )}
                    {locationError && (
                      <div className="mt-1 text-xs text-destructive">{locationError}</div>
                    )}

                    {locationSuggestions.length > 0 && (
                      <div className="mt-2 rounded-md border bg-background shadow-sm">
                        {locationSuggestions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
                            onClick={() => {
                              setLocationInput(s);
                              setLocationSuggestions([]);
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <FieldError name="location" />
                </div>


                <div>
                  <label className="text-sm font-medium">Years of experience</label>
                  <div className="mt-2">
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                    />
                  </div>
                  <FieldError name="experience_years" />
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Compensation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <div className="mt-2">
                    <Select value={currency} onChange={(e) => setCurrency(e.target.value as any)} options={CURRENCY_PRESETS.map((c) => ({ label: c.label, value: c.value }))} />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Base salary</label>
                  <div className="mt-2">
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      required
                      value={baseSalary}
                      onChange={(e) => {
                        const v = e.target.value;
                        setBaseSalary(v === "" ? "" : Number(v));
                      }}
                      placeholder="e.g. 1800000"
                    />
                  </div>
                  <FieldError name="base_salary" />
                </div>

                <div>
                  <label className="text-sm font-medium">Annual bonus</label>
                  <div className="mt-2">
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      value={bonus}
                      onChange={(e) => {
                        const v = e.target.value;
                        setBonus(v === "" ? "" : Number(v));
                      }}
                      placeholder="Optional"
                    />
                  </div>
                  <FieldError name="bonus" />
                </div>

                <div>
                  <label className="text-sm font-medium">Stock / RSU</label>
                  <div className="mt-2">
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      value={stock}
                      onChange={(e) => {
                        const v = e.target.value;
                        setStock(v === "" ? "" : Number(v));
                      }}
                      placeholder="Optional"
                    />
                  </div>
                  <FieldError name="stock" />
                </div>

                <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background">
                    <Plus className="h-3.5 w-3.5 opacity-70" />
                  </div>
                  <div>
                    Total TC is automatically calculated as Base + Bonus + Stock and submitted to the backend.
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-xs text-muted-foreground">
        Submitted salaries appear immediately in the listings, company analytics, and compare pages.
      </p>
    </main>
  );
}

