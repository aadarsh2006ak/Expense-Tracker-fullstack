# 💰 FinFlow • Full Stack MERN Expense & Wealth Tracker

<p align="center">
  <img src="https://img.shields.io/badge/Stack-MERN-6366f1?style=for-the-badge&logo=mongodb&logoColor=white" alt="MERN Stack" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Vite-Tailwind_CSS-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

A production-grade **MERN (MongoDB, Express, React, Node.js)** Expense & Wealth Tracker web application featuring real-time analytics, category envelope budgets, CSV & PDF statement importing, one-click PDF & CSV report exports, multi-currency converter, and a modern glassmorphic dashboard.

---

## 📁 Repository Structure

```
Expense -Tracker/
├── backend/                  # Node.js + Express + MongoDB REST API
│   ├── config/
│   │   └── db.js             # Mongoose connection & health status helper
│   ├── controllers/
│   │   └── expenseController.js # CRUD, Analytics, CSV export, batch import
│   ├── models/
│   │   ├── Expense.js        # Mongoose Transaction schema
│   │   └── Budget.js         # Mongoose Category Budget schema
│   ├── routes/
│   │   └── expenseRoutes.js  # RESTful API route definitions
│   ├── .env.example          # Environment template
│   ├── package.json          # Express dependencies
│   └── server.js             # Server entry point
│
└── frontend/                 # React 19 + Vite + Tailwind CSS + Lucide Icons
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── AnalyticsView.jsx     # Category Donut & Monthly Trends charts
    │   │   ├── BudgetOverview.jsx    # Monthly envelope budgets & warnings
    │   │   ├── CategoryIcon.jsx      # Dynamic Lucide category icon resolver
    │   │   ├── ImportModal.jsx       # CSV & PDF drag-and-drop import with preview
    │   │   ├── Navbar.jsx            # Header, currency selector, export/import buttons
    │   │   ├── StatsCards.jsx        # Balance, Income, Expense, Savings Rate
    │   │   ├── Toast.jsx             # Notification toasts
    │   │   ├── TransactionList.jsx   # Search, filters, sort, actions, modals
    │   │   └── TransactionModal.jsx  # Add/Edit record modal with validation
    │   ├── services/
    │   │   └── api.js                # REST client for backend endpoints
    │   ├── utils/
    │   │   ├── constants.js          # Categories, currencies, formatters
    │   │   ├── fileParser.js         # Smart CSV & PDF text parser
    │   │   └── pdfExport.js          # jsPDF & autoTable statement generator
    │   ├── App.jsx                   # Main orchestrator & tabs
    │   ├── index.css                 # Glassmorphic styling & design tokens
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or newer)
- MongoDB instance (local or MongoDB Atlas)

### 1. Configure and Run Backend

```bash
cd backend
npm install
npm run dev
```
* Backend starts at `http://localhost:5000`
* Health check: `http://localhost:5000/api/health`

### 2. Run Frontend Web Application

```bash
cd frontend
npm install
npm run dev
```
* Open `http://localhost:5174` in your browser.

---

## ✨ Features

- **MERN Stack REST API**: Express.js with MongoDB (Mongoose) models with indexed querying on dates, types, and categories.
- **Import Statements (CSV & PDF)**:
  - Drag-and-drop CSV or PDF bank statement files.
  - Automatic column recognition, date/amount extraction, and smart category classification.
  - Interactive preview grid allowing row editing/deletions before batch saving to MongoDB.
- **Export Reports (PDF & CSV)**:
  - **Export to PDF**: Generates executive financial statements with KPI summaries, category breakdown tables, and transaction ledgers downloaded directly to your Downloads folder.
  - **Export to CSV**: Instant spreadsheet-ready `.csv` file download.
- **Dynamic Analytics & Visualizations**:
  - Interactive SVG Donut chart for category expense distribution with hover details.
  - Monthly cash flow bar chart (Income vs Expense comparison).
  - Payment method volumes breakdown (UPI, Card, Cash, Bank Transfer).
- **Comprehensive Transaction Management**:
  - Real-time search across titles and notes.
  - Multi-criteria filtering by Type (All / Income / Expense), Category, and Sorting (Newest, Oldest, Amount).
  - Add & Edit transaction modals with form validation and celebratory confetti.
  - Permanent delete modal with confirmation.
- **Budget Envelopes**: Set category monthly caps with automatic amber (80%) and red (100%) overspend alerts.
- **Multi-Currency Converter**: Support for `₹ INR`, `$ USD`, `€ EUR`, `£ GBP`, `CA$`, `AU$`, `¥ JPY`.

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server and MongoDB connection status |
| `GET` | `/api/expenses` | List transactions (supports `category`, `type`, `search`, `sortBy`, `sortOrder`) |
| `GET` | `/api/expenses/stats` | Aggregated metrics (Balance, Income, Expense, Savings %, Category & Monthly breakdown) |
| `POST` | `/api/expenses` | Create a new transaction |
| `POST` | `/api/expenses/batch` | Bulk insert transactions from CSV/PDF parser |
| `GET` | `/api/expenses/:id` | Get single transaction by ID |
| `PUT` | `/api/expenses/:id` | Update transaction by ID |
| `DELETE` | `/api/expenses/:id` | Delete transaction by ID |
| `GET` | `/api/expenses/export` | Download transactions as CSV stream |

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
