-- CreateTable
CREATE TABLE "salaries" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "level_standardized" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "experience_years" DECIMAL(4,1) NOT NULL,
    "base_salary" INTEGER NOT NULL,
    "bonus" INTEGER NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "total_compensation" INTEGER NOT NULL,
    "confidence_score" INTEGER NOT NULL,
    "duplicate_signature" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "salaries_duplicate_signature_key" ON "salaries"("duplicate_signature");

-- CreateIndex
CREATE INDEX "salaries_company_idx" ON "salaries"("company");

-- CreateIndex
CREATE INDEX "salaries_role_idx" ON "salaries"("role");

-- CreateIndex
CREATE INDEX "salaries_level_standardized_idx" ON "salaries"("level_standardized");

-- CreateIndex
CREATE INDEX "salaries_location_idx" ON "salaries"("location");

-- CreateIndex
CREATE INDEX "salaries_total_compensation_idx" ON "salaries"("total_compensation");

-- CreateIndex
CREATE INDEX "salaries_company_level_standardized_idx" ON "salaries"("company", "level_standardized");
