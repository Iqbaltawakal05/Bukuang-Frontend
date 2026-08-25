# Bukuang — Personal Finance Management System (Frontend SPA)

[![React 18](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

Bukuang Frontend is a high-performance Single Page Application (SPA) built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**. It communicates directly with the **Bukuang Laravel REST API** (`http://127.0.0.1:8000/api/v1`) using Axios interceptors and Sanctum Bearer token management. Fully localized in Bahasa Indonesia and optimized for both desktop and mobile viewports.

---

## Features Implemented

1. **Authentication & Profile Hygiene (`/login`, `/register`, `/profile`)**
   - User Registration, Login, Logout, Profile update, and Password revision with form error validation.
   - Form accessibility & security hygiene with `autoComplete` attributes (`username`, `current-password`, `new-password`).

2. **Interactive Financial Dashboard (`/`)**
   - Real-time Summary Cards: Total Balance, Monthly Income, Monthly Expense, and Net Savings in IDR currency formatting.
   - 6-Month Income vs. Expense smooth area line chart using Chart.js.
   - Monthly Category Expense Distribution donut chart.
   - Budget Usage progress indicator widget with warning state thresholds (`SAFE`, `WARNING` >=80%, `EXCEEDED` >=100%).
   - Recent 5 transactions table.

3. **Category Management (`/categories`)**
   - Filter tabs: *Semua Kategori*, *Pemasukan*, *Pengeluaran*.
   - Clear distinction badges for 27 System Default categories (*Bawaan Sistem*) tailored for students/kost and Custom Categories.
   - Custom Category creation modal with HEX color and icon picker.

4. **Transaction Management (`/transactions`)**
   - Data table with search filter, date range picker, type filter, category filter, sorting, and pagination.
   - Type-filtered category dropdown in modal forms.
   - **Custom Confirmation Modal (`ConfirmModal.tsx`)**: Replaces native browser popups with a modern Deep Navy + Rose dialog for secure transaction deletions.

5. **Monthly Budget Allocation (`/budgets`)**
   - Month & Year navigation (`< Month/Year >`).
   - Category budget limit cards with spent amount, remaining saldo, percentage, and threshold warnings (`SAFE` <80%, `WARNING` 80-99%, `EXCEEDED` >=100%).
   - Modal forms for creating and updating budget allocations.

6. **Financial Goals & Savings Deposits (`/financial-goals`)**
   - Goal progress tracking cards displaying target amount, current collected amount, target date, and completion status (`active`, `completed`).
   - **Interactive Deposit Modal (`+ Setor Dana`)**: Accepts contributions, updates progress bars dynamically, and automatically creates an Expense Transaction (*Savings & Goal Deposit*) to reduce available Total Balance.

7. **Recurring Transactions & Custom Frequencies (`/recurring-transactions`)**
   - Automated recurring schedule list table with frequency badges (`daily`, `weekly`, `monthly`, `every_3_months`, `every_6_months`, `yearly`).
   - **Semesteran / 6 Bulan Sekali (Bayar UKT/Kuliah)** and **Triwulan (3 Bulan Sekali)** options for student recurring fees.
   - Schedule creation modal and active/inactive status toggle switch.

8. **Reports & Export Center (`/reports`)**
   - Period summary reports (`daily`, `weekly`, `monthly`, `yearly`, `custom` date range).
   - Category breakdown table with percentage distribution.
   - **Export Request Widget**: Select file format (PDF, CSV, XLSX), submit background queue export job, monitor status, and stream file download directly in browser.

9. **Full Mobile Responsiveness**
   - Slide-in mobile drawer sidebar triggered by a hamburger menu button (🍔) with backdrop blur overlay.
   - Stacked responsive grid layouts and horizontal scrollable data tables across 375px mobile screens to desktop displays.

---

## System Requirements & Prerequisites

- **Node.js**: `>= 18.0.0` (v22 recommended)
- **npm**: `>= 9.0.0`
- **Bukuang Backend Server**: Running at `http://127.0.0.1:8000`

---

## Installation & Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/Iqbaltawakal05/Bukuang-Frontend.git
   cd bukuang-frontend
   ```

2. **Install npm Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will run at `http://localhost:5173`.

4. **Build Production Bundle**
   ```bash
   npm run build
   ```

---

## License

This software is open-sourced software licensed under the [MIT License](LICENSE).
