# 💳 Resolver — Payment Reconciliation System

An internal fintech product operations tool designed to automate batch payment reconciliation, identify financial discrepancies between bank statements and internal ledgers, provide an audit trail for Ops Teams, and expose an interactive SQL engine visibility layer.

![Tech Stack](https://img.shields.io/badge/Stack-Next.js%2016%20%7C%20PostgreSQL%20%7C%20TypeScript%20%7C%20TailwindCSS-blue)
![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-green)
![Design](https://img.shields.io/badge/UI-Enterprise%20Minimal%20Dark-darkgray)

---

## 🌟 Key Features

1. **Automated Batch Reconciliation**
   - Upload bank statement CSVs and internal system ledger CSVs.
   - Executes single-query **`FULL OUTER JOIN`** SQL logic in PostgreSQL to classify records into:
     - ✅ **Matched**: Amounts and transaction dates match.
     - ⚠️ **Mismatched**: Discrepancy in payment amount or date.
     - ❌ **Missing in Bank**: Present in internal ledger but unreflected by bank.
     - ❌ **Missing in Internal**: Settled by bank but unrecorded internally.

2. **SQL Engine & Transparency Layer**
   - **Query Peek Panel**: View exact raw SQL queries, execution time (ms), and parameters used on every page.
   - **Interactive SQL Workbench**: Execute custom `SELECT` queries against live PostgreSQL tables with safety filters.

3. **Operations & Audit Trail**
   - **Discrepancy Resolution**: Add resolution notes and log reviewer identity for mismatches.
   - **CSV Export**: Export reconciliation run results as `.csv` files for offline auditing.
   - **Run Management**: View historical runs with computed **Match Rates %** and delete test runs.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions, API Routes)
- **Database**: PostgreSQL (Neon Serverless)
- **Database Client**: `node-postgres` (`pg`) using raw SQL queries to showcase explicit database skills
- **CSV Engine**: PapaParse
- **Styling**: Enterprise minimal dark theme built with Vanilla CSS & TailwindCSS v4

---

## 📁 Database Schema

```sql
reconciliation_runs (id, run_date, bank_filename, internal_filename, total_bank_records, total_internal_records, matched_count, mismatched_count, missing_in_bank_count, missing_in_internal_count, status)

bank_transactions (id, run_id, transaction_id, amount, currency, transaction_date, description, status)

internal_transactions (id, run_id, transaction_id, amount, currency, transaction_date, description, status)

reconciliation_results (id, run_id, transaction_id, match_status, bank_amount, internal_amount, amount_diff, bank_date, internal_date, notes, resolved, resolved_at, resolved_by)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- PostgreSQL database (e.g. Neon PostgreSQL)

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgres://user:password@ep-host.region.aws.neon.tech/neondb?sslmode=require"
```

### 3. Run Database Migrations
Initialize database tables and indexes:
```bash
npx tsx lib/migrate.ts
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Sample test CSVs are available in `sample-data/bank_sample.csv` and `sample-data/internal_sample.csv`.
