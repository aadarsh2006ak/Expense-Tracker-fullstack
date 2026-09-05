import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import Navbar from "./components/Navbar";
import StatsCards from "./components/StatsCards";
import AnalyticsView from "./components/AnalyticsView";
import BudgetOverview from "./components/BudgetOverview";
import TransactionList from "./components/TransactionList";
import TransactionModal from "./components/TransactionModal";
import ImportModal from "./components/ImportModal";
import Toast from "./components/Toast";
import {
  fetchExpenses,
  fetchExpenseStats,
  createExpense,
  updateExpense,
  deleteExpense,
  bulkImportExpenses,
} from "./services/api";
import { exportExpensesToPDF } from "./utils/pdfExport";

export default function App() {
  // Application State
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    savingsRate: 0,
    totalTransactions: 0,
    categoryBreakdown: [],
    monthlyTrends: [],
    paymentMethodBreakdown: [],
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // User Preferences
  const [currency, setCurrency] = useState(() => localStorage.getItem("finflow_currency") || "INR");
  const [theme, setTheme] = useState(() => localStorage.getItem("finflow_theme") || "dark");

  // Filtering and Sorting
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  // Modals & Feedback
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [toast, setToast] = useState(null);

  // Toast Trigger
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem("finflow_currency", currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem("finflow_theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  // Load Expenses and Analytics
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [field, order] = sortBy.split("-");
      const [expensesData, statsData] = await Promise.all([
        fetchExpenses({
          category: filterCategory,
          type: filterType,
          search: searchTerm,
          sortBy: field,
          sortOrder: order,
        }),
        fetchExpenseStats(),
      ]);

      setExpenses(expensesData || []);
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error("Error loading MERN data:", err);
      showToast("Unable to reach backend API. Check if server is running.", "error");
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterType, searchTerm, sortBy, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create or Update Transaction
  const handleSaveTransaction = async (data, id) => {
    if (id) {
      await updateExpense(id, data);
      showToast("Transaction updated successfully!");
    } else {
      await createExpense(data);
      showToast(
        data.type === "income" ? "🎉 Income logged successfully!" : "Expense recorded successfully!"
      );
      // Small celebratory confetti for new transaction
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.85 },
          colors: data.type === "income" ? ["#10b981", "#34d399", "#6ee7b7"] : ["#6366f1", "#8b5cf6", "#a855f7"],
        });
      } catch (e) {
        // ignore if confetti fails
      }
    }
    loadData();
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id) => {
    await deleteExpense(id);
    showToast("Transaction removed from database.");
    loadData();
  };

  // Bulk Import Transactions (CSV or PDF statement)
  const handleBulkImport = async (importedItems) => {
    const res = await bulkImportExpenses(importedItems);
    showToast(`🎉 Successfully imported ${res.count || importedItems.length} transactions for analysis!`);
    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.7 },
        colors: ["#6366f1", "#10b981", "#3b82f6", "#f59e0b"],
      });
    } catch (e) {
      // ignore
    }
    loadData();
  };

  // Export PDF Statement Report
  const handleExportPDF = () => {
    try {
      exportExpensesToPDF({ expenses, stats, currency });
      showToast("📄 Financial Statement PDF downloaded to your Downloads folder!");
    } catch (err) {
      console.error(err);
      showToast("Failed to generate PDF export", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currency={currency}
        setCurrency={setCurrency}
        onOpenAddModal={() => {
          setEditingExpense(null);
          setIsModalOpen(true);
        }}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportPDF={handleExportPDF}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Top Financial Stats Hero (Visible across dashboard & analytics) */}
        <StatsCards stats={stats} currency={currency} />

        {/* Tab Views */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Analytics Preview Column */}
              <div className="lg:col-span-12">
                <AnalyticsView stats={stats} currency={currency} />
              </div>

              {/* Transactions List */}
              <div className="lg:col-span-12">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Recent Transactions</h3>
                    <p className="text-xs text-slate-400">Manage, import, and filter your latest income and expenses</p>
                  </div>
                </div>
                <TransactionList
                  expenses={expenses}
                  loading={loading}
                  currency={currency}
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  filterType={filterType}
                  setFilterType={setFilterType}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  onEdit={(item) => {
                    setEditingExpense(item);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDeleteTransaction}
                  onRefresh={loadData}
                  onOpenAddModal={() => {
                    setEditingExpense(null);
                    setIsModalOpen(true);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100">All Transactions</h3>
                <p className="text-xs text-slate-400">Search, filter, edit, and export complete transaction history</p>
              </div>
            </div>
            <TransactionList
              expenses={expenses}
              loading={loading}
              currency={currency}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              filterType={filterType}
              setFilterType={setFilterType}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onEdit={(item) => {
                setEditingExpense(item);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteTransaction}
              onRefresh={loadData}
              onOpenAddModal={() => {
                setEditingExpense(null);
                setIsModalOpen(true);
              }}
            />
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Financial Intelligence & Analytics</h3>
                <p className="text-xs text-slate-400">Deep dive into spending patterns and monthly trends</p>
              </div>
            </div>
            <AnalyticsView stats={stats} currency={currency} />
          </div>
        )}

        {activeTab === "budgets" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Budget Limits & Envelopes</h3>
                <p className="text-xs text-slate-400">Control category budgets and get real-time overspend alerts</p>
              </div>
            </div>
            <BudgetOverview stats={stats} currency={currency} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FinFlow • Expense & Wealth Intelligence</span>
          <span>MongoDB • Express • React • Node.js</span>
        </div>
      </footer>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleSaveTransaction}
        initialData={editingExpense}
        currency={currency}
      />

      {/* Import Modal (CSV / PDF) */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleBulkImport}
        currency={currency}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
