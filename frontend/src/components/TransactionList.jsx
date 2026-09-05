import React, { useState } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  RotateCw,
  Inbox,
  AlertOctagon,
} from "lucide-react";
import { CATEGORIES, formatCurrency } from "../utils/constants";
import CategoryIcon from "./CategoryIcon";

export default function TransactionList({
  expenses = [],
  loading = false,
  currency = "INR",
  filterCategory,
  setFilterCategory,
  filterType,
  setFilterType,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  onEdit,
  onDelete,
  onRefresh,
  onOpenAddModal,
}) {
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteId);
      setDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-5 animate-fade-in">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions by title or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 text-slate-100 text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Type Filter Pills */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            {[
              { id: "All", label: "All" },
              { id: "expense", label: "Expenses" },
              { id: "income", label: "Income" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterType === t.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs font-medium px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs font-medium px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors"
            title="Refresh list"
          >
            <RotateCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Transaction List Body */}
      {loading && expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <RotateCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
          <p className="text-sm font-medium">Fetching transactions...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-4">
            <Inbox className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-200">No Transactions Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">
            {searchTerm || filterCategory !== "All" || filterType !== "All"
              ? "No records matched your search filters. Try adjusting or clearing filters."
              : "Your ledger is empty. Start by recording your first income or expense."}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/30"
            >
              + Add Transaction
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {expenses.map((expense) => {
            const isIncome = expense.type === "income";

            return (
              <div
                key={expense._id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700 transition-all gap-3"
              >
                {/* Left: Icon, Title, Category, Payment Method, Date */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <CategoryIcon categoryName={expense.category} size={20} />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100 truncate">{expense.title}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {expense.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDate(expense.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-slate-500" />
                        {expense.paymentMethod || "UPI"}
                      </span>
                      {expense.notes && (
                        <span className="truncate max-w-xs text-slate-500 hidden md:inline">
                          • {expense.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                  <div className="text-left sm:text-right">
                    <div
                      className={`text-sm sm:text-base font-black ${
                        isIncome ? "text-emerald-400" : "text-slate-100"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(expense.amount, currency)}
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {expense.type}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(expense)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-700 transition-colors"
                      title="Edit transaction"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(expense._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-sm w-full bg-slate-900 border border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Delete Transaction?</h3>
            <p className="text-xs text-slate-400 mt-1.5 mb-6">
              This action cannot be undone. It will remove this record permanently from MongoDB.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
