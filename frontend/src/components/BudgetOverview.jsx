import React, { useState } from "react";
import { Target, AlertTriangle, CheckCircle, ShieldAlert, Plus, Edit2, Save, X } from "lucide-react";
import { formatCurrency, CATEGORIES } from "../utils/constants";
import CategoryIcon from "./CategoryIcon";

const INITIAL_BUDGETS = {
  Housing: 25000,
  Groceries: 8000,
  "Dining Out": 5000,
  Transportation: 4000,
  Utilities: 5000,
  Entertainment: 3000,
  Shopping: 10000,
  Healthcare: 5000,
};

export default function BudgetOverview({ stats, currency, onBudgetAlert }) {
  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem("finflow_budgets");
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [editingCategory, setEditingCategory] = useState(null);
  const [editLimit, setEditLimit] = useState("");

  const { categoryBreakdown = [] } = stats || {};

  // Calculate total budget vs total spent
  const totalBudget = Object.values(budgets).reduce((a, b) => a + Number(b), 0);
  const totalBudgetSpent = categoryBreakdown.reduce((sum, item) => {
    return budgets[item.category] ? sum + item.amount : sum;
  }, 0);

  const overallBudgetPercentage = totalBudget > 0 ? (totalBudgetSpent / totalBudget) * 100 : 0;

  const handleStartEdit = (category, currentLimit) => {
    setEditingCategory(category);
    setEditLimit(currentLimit.toString());
  };

  const handleSaveBudget = (category) => {
    const num = Number(editLimit);
    if (!isNaN(num) && num >= 0) {
      const updated = { ...budgets, [category]: num };
      setBudgets(updated);
      localStorage.setItem("finflow_budgets", JSON.stringify(updated));
    }
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overall Budget Status Banner */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Monthly Budget Envelope</h3>
              <p className="text-xs text-slate-400">Track and cap spending across your expense categories</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-slate-400">Overall Budget Utilized</div>
            <div className="text-lg font-black text-slate-100">
              {formatCurrency(totalBudgetSpent, currency)} / {formatCurrency(totalBudget, currency)}
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-800/90 rounded-full h-3 overflow-hidden border border-slate-700/60 mt-2">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              overallBudgetPercentage > 100
                ? "bg-rose-500"
                : overallBudgetPercentage > 80
                ? "bg-amber-500"
                : "bg-indigo-500"
            }`}
            style={{ width: `${Math.min(100, Math.max(0, overallBudgetPercentage))}%` }}
          />
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(budgets).map(([category, limit]) => {
          const expenseItem = categoryBreakdown.find((c) => c.category === category);
          const spent = expenseItem ? expenseItem.amount : 0;
          const percentage = limit > 0 ? (spent / limit) * 100 : 0;
          const isOverspent = spent > limit;
          const isWarning = percentage >= 80 && !isOverspent;

          return (
            <div
              key={category}
              className={`glass-card rounded-2xl p-5 relative border transition-all ${
                isOverspent
                  ? "border-rose-500/40 bg-rose-950/10"
                  : isWarning
                  ? "border-amber-500/40 bg-amber-950/10"
                  : "border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <CategoryIcon categoryName={category} size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{category}</h4>
                    <span className="text-[11px] text-slate-400">
                      {spent > 0 ? `${formatCurrency(spent, currency)} spent` : "No expenses yet"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {editingCategory === category ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={editLimit}
                        onChange={(e) => setEditLimit(e.target.value)}
                        className="w-24 bg-slate-900 text-xs px-2 py-1 rounded-lg border border-indigo-500 text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveBudget(category)}
                        className="p-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-500"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="p-1 rounded-md bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-300">
                        Cap: {formatCurrency(limit, currency)}
                      </span>
                      <button
                        onClick={() => handleStartEdit(category, limit)}
                        className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="Edit limit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 mt-3">
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverspent ? "bg-rose-500" : isWarning ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span
                    className={
                      isOverspent
                        ? "text-rose-400 font-bold"
                        : isWarning
                        ? "text-amber-400 font-semibold"
                        : "text-slate-400"
                    }
                  >
                    {isOverspent
                      ? `⚠️ Over budget by ${formatCurrency(spent - limit, currency)}`
                      : isWarning
                      ? `⚡ ${percentage.toFixed(0)}% utilized (Near limit)`
                      : `${(100 - percentage).toFixed(0)}% remaining`}
                  </span>
                  <span className="text-slate-500">{percentage.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
