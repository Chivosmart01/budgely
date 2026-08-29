# Budgely — Personal Budget & Daily Expense Management Platform

Budgely is a production-quality, full-stack personal finance web application built around the disciplined principle:

> **Income → Allocation → Daily Spending → Remaining Budget → Monthly Analysis**

The user first plans how their monthly salary should be partitioned across categories, and then logs itemized daily expenses against those budgets using interactive calendar heatmaps and real-time financial tracking.

---

## Key Features

1. **Monthly Salary Budgeting**:
   - Create monthly budgets with customizable income/salary amounts.
   - Dynamically allocate funds into custom categories.
   - Real-time allocated sum calculations and over-allocation warning protections.
   - **Template Duplication**: Instantly copy any previous month's category allocations without copying past expenses.

2. **Daily Expense Calendar Heatmaps**:
   - Visual monthly calendar for daily expense tracking.
   - Color-intensity heatmap indicators based on daily spend.
   - Click any date to view itemized expenses (e.g. *Aug 27: Food ₦2,500 + Transport ₦1,000 + Airtime ₦500 = ₦4,000*).
   - Fast inline expense addition, editing, and deletion.

3. **Smart Financial Calculations**:
   - High-precision monetary arithmetic (backend Decimal precision, no JavaScript floating-point errors).
   - Real-time remaining budget balances (`Budget - Expenses`).
   - Budget utilization percentages and automated warning thresholds (Healthy `< 70%`, Warning `70-89%`, Critical `90-99%`, Over Budget `≥ 100%`).
   - Dedicated Savings tracking and Savings Rate percentage of total monthly income.

4. **Fintech Analytics & Visualizations**:
   - Interactive Recharts expense bar chart filterable by timeframe (Today, This week, This month, Last month, 3 months, 6 months, This year) and view granularity (Daily, Weekly, Monthly).
   - Category spending Donut/Pie charts.
   - Budget vs Actual variance comparison charts.
   - Historical multi-month income vs spending trend area charts.

5. **Security & Authentication**:
   - JWT Access tokens (15m) + secure Refresh token rotation (7d) stored in DB.
   - Bcrypt password hashing.
   - User ownership verification on every database query.
   - Light & Dark mode with persistent user preference.

---

## Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI v5) with custom Fintech Dark & Light themes
- **State Management**: Zustand
- **Charts**: Recharts
- **Date Handling**: date-fns
- **HTTP Client**: Axios with automatic 401 token refresh interceptors

### Backend
- **Framework**: NestJS (Modular Monolith architecture)
- **ORM & Database**: Prisma ORM with PostgreSQL
- **Security**: Passport JWT, BcryptJS, Helmet, CORS, Class-Validator
- **API Documentation**: Swagger / OpenAPI at `/api/docs`

---

## Quickstart Guide

### Prerequisites
- **Node.js**: v18+ (Tested on v22)
- **PostgreSQL**: v14+ (Local instance or Docker)

### 1. Clone & Setup Database
Ensure PostgreSQL is running locally or via Docker.
Create the database:
```bash
createdb budgely_db
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
npm run start:dev
```
The NestJS backend will start on **http://localhost:4005/api/v1**.
Interactive Swagger documentation is available at **http://localhost:4005/api/docs**.

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The Next.js frontend will start on **http://localhost:3000**.

---

## Getting Started

1. Open **http://localhost:3000** in your browser.
2. Click **Create an Account** to register with your email and password.
3. Start by creating your first monthly budget and allocating your salary into custom categories.

---

## Docker Deployment

To spin up the complete stack (PostgreSQL + NestJS API + Next.js Web App) using Docker Compose:

```bash
docker compose up --build
```

---

## Testing

### Backend Unit Tests
```bash
cd backend
npm test
```

Runs comprehensive unit tests covering:
- Safe Decimal financial calculation arithmetic (`financial-calc.spec.ts`)
- Budget over-allocation rules and duplicate prevention (`budgets.service.spec.ts`)
- JWT authentication, password hashing, and token generation (`auth.service.spec.ts`)

---

## REST API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login and receive JWT access & refresh tokens |
| `POST` | `/api/v1/auth/refresh` | Silent access token refresh |
| `GET` | `/api/v1/dashboard/summary` | Monthly financial KPI summary & warnings |
| `GET` | `/api/v1/dashboard/spending-chart` | Filterable spending trend chart data |
| `GET` | `/api/v1/dashboard/category-breakdown` | Category distribution for donut charts |
| `GET` | `/api/v1/dashboard/budget-vs-actual` | Category budget vs actual spending variances |
| `GET` | `/api/v1/budgets` | List all monthly budgets |
| `POST` | `/api/v1/budgets` | Create a monthly salary budget with allocations |
| `POST` | `/api/v1/budgets/:id/copy` | Copy budget category template to new month |
| `GET` | `/api/v1/budget-categories/:id` | Category details with daily calendar heatmap |
| `GET` | `/api/v1/expenses` | Paginated and filtered expense list |
| `POST` | `/api/v1/expenses` | Record a new expense |
| `GET` | `/api/v1/reports/monthly` | In-depth monthly financial audit report |
| `GET` | `/api/v1/reports/historical` | Multi-month income vs spending trends |
