# Compensation Intelligence System

A production-oriented compensation intelligence platform inspired by Levels.fyi, AmbitionBox, Glassdoor, and 6figr, but focused on structured compensation comparison by standardized level such as `L3`, `L4`, and `L5`.

This is not a salary listing website. The product principle is:

```text
Structured -> Queryable -> Comparable -> Decision-ready
```

## Architecture

The app is a TypeScript monorepo with a Next.js frontend and an Express API backend.

```text
compensation-intelligence/
  frontend/
    app/
    components/
    charts/
    hooks/
    services/
    types/
    utils/
  backend/
    src/
      controllers/
      routes/
      middleware/
      services/
      utils/
      validation/
      config/
    prisma/
    tests/
```

Business logic lives in backend services, not routes. Request validation is handled with Zod before data reaches the service layer. Prisma handles structured PostgreSQL access and indexed filtering.

## Tech Stack

- Frontend: Next.js 15 App Router, TypeScript, TailwindCSS, TanStack Query, shadcn-style UI primitives, Recharts
- Backend: Node.js, Express, TypeScript, Prisma ORM, Zod
- Database: PostgreSQL, designed for Neon
- Deployment: Vercel frontend, Render backend, Neon PostgreSQL
- Testing: Vitest, Supertest

## Core Data Model

`Salary` records store normalized and comparable compensation:

- `company`, `role`, `level_standardized`, `location`
- `experience_years`
- `base_salary`, `bonus`, `stock`
- `total_compensation`
- `confidence_score`
- duplicate signature
- timestamps

Indexes exist for `company`, `role`, `level_standardized`, `location`, `total_compensation`, and `company + level_standardized`.

`total_compensation = base_salary + bonus + stock`

`bonus` and `stock` default to `0`.

## Backend API

Base URL locally:

```text
http://localhost:4000/api
```

### POST `/api/ingest-salary`

Creates one normalized salary record.

```json
{
  "company": "Google",
  "role": "Software Engineer",
  "level_standardized": "L4",
  "location": "Bengaluru, India",
  "experience_years": 4,
  "base_salary": 5800000,
  "bonus": 900000,
  "stock": 2100000,
  "confidence_score": 91
}
```

Behavior:

- trims and lowercases company, role, and location
- uppercases standardized level
- defaults missing `bonus` and `stock` to `0`
- rejects missing company, role, level, invalid confidence, invalid experience, and negative salary values
- rejects duplicates with HTTP `409`

### GET `/api/salaries`

Server-side filtering, sorting, and pagination.

Example:

```text
/api/salaries?company=google&level=L4&sort=total_compensation&page=1
```

Supported filters:

- `company`
- `role`
- `location`
- `level`
- `experience`

Supported sorting:

- `total_compensation`
- `experience`
- `confidence`

Pagination:

- `page`
- `pageSize`

### GET `/api/company/:company`

Returns salary records plus:

- median compensation
- mean compensation
- level distribution
- top compensation
- location distribution
- role breakdown
- compensation trends

### GET `/api/compare?id1=&id2=`

Returns side-by-side comparison data:

- base, bonus, stock, and total difference
- percentage difference
- level comparison
- company comparison
- experience comparison

### GET `/api/stats`

Returns:

- top paying companies
- average and median compensation
- level distributions
- role distributions
- location distributions
- compensation distribution
- percentile estimator data

## Frontend Pages

- `/`: home, search, quick filters, trending companies, top paying companies
- `/salaries`: API-driven salary table with filters, sorting, pagination, loading/error/empty states
- `/company/[company]`: company metrics, distributions, role breakdown, salary table, trends
- `/compare`: select two salary records and compare components visually
- `/analytics`: dashboard for distributions, rankings, location insights, and percentiles

## Setup

Install dependencies:

```bash
npm install
```

Create backend environment:

```bash
cp backend/.env.example backend/.env
```

Set `DATABASE_URL` to your Neon PostgreSQL connection string.

Create frontend environment:

```bash
cp frontend/.env.example frontend/.env.local
```

Run Prisma:

```bash
npm run prisma:generate -w backend
npm run prisma:migrate -w backend
npm run seed -w backend
```

Run development servers:

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`.
Backend runs on `http://localhost:4000`.

## Verification

```bash
npm run test -w backend
npm run build -w backend
npm run build -w frontend
```

Verified locally:

- Backend tests: 12 passing
- Backend TypeScript build: passing
- Frontend Next.js production build: passing

## Deployment

### Neon PostgreSQL

1. Create a Neon project.
2. Copy the pooled PostgreSQL connection string.
3. Use it as `DATABASE_URL` in Render.
4. Run migrations from Render deploy command or manually:

```bash
npm run prisma:deploy -w backend
```

### Render Backend

Create a Web Service pointing to this repository.

Root directory:

```text
backend
```

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm run start
```

Environment variables:

- `DATABASE_URL`
- `PORT`
- `CORS_ORIGIN`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`

Set `CORS_ORIGIN` to the deployed Vercel frontend URL.

### Vercel Frontend

Root directory:

```text
frontend
```

Build command:

```bash
npm run build
```

Environment variables:

- `NEXT_PUBLIC_API_BASE_URL=https://your-render-service.onrender.com/api`

## Edge Cases Handled

- missing bonus and stock default to `0`
- null, malformed, or unexpected input rejected by strict Zod schemas
- negative salary values rejected
- invalid confidence and experience rejected
- company name inconsistencies normalized with trim and lowercase
- level inconsistencies normalized to uppercase
- duplicate salary records rejected through deterministic signatures and database uniqueness
- empty datasets and no results handled in UI
- API failures surfaced in UI error states
- slow requests show loading states
- invalid filters rejected server-side
- SQL injection attempts mitigated through Prisma parameterized queries and schema validation
- malformed JSON returns a structured `400`
- unexpected backend errors return structured API responses

## Security

- Helmet headers
- CORS allowlist through environment variable
- rate limiting
- strict input validation
- Prisma parameterized database access
- no business logic trusted from the client

## Tradeoffs

- Duplicate detection uses a deterministic signature over normalized identifying and compensation fields. This is reliable for exact duplicates, but near-duplicate detection could later include fuzzy matching or reviewer workflows.
- Compensation is stored as integer minor-free currency units for simplicity. Multi-currency support would require currency codes and exchange-rate normalization.
- Trends currently use created timestamps because historical offer dates are not in the required schema. A production data pipeline should add source and effective-date metadata.
- The frontend uses shadcn-compatible local primitives instead of invoking the shadcn CLI, keeping the repo self-contained and deployable.

## Future Improvements

- saved comparisons with authenticated users
- company aliases and acquisition-aware normalization
- compensation heatmaps by location and level
- confidence model based on sample size, source quality, and recency
- percentile estimator by company, level, role, and location segment
- background ingestion pipeline with moderation
- audit logs for salary record changes
