import React, { useState } from "react";
import { PieChart, BarChart3, CreditCard, Layers, TrendingUp, Info } from "lucide-react";
import { formatCurrency, CATEGORIES } from "../utils/constants";
import CategoryIcon from "./CategoryIcon";

export default function AnalyticsView({ stats, currency }) {
  const { categoryBreakdown = [], monthlyTrends = [], paymentMethodBreakdown = [], totalExpense = 0, totalIncome = 0 } = stats || {};

  const [hoveredCategory, setHoveredCategory] = useState(null);

  // SVG Donut calculation
  const radius = 80;
  const strokeWidth = 26;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  let cumulativePercent = 0;

  const colorPalette = [
    "#6366f1", // Indigo
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#8b5cf6", // Purple
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#14b8a6", // Teal
    "#a855f7", // Fuchsia
  ];

  // Maximum monthly amount for scaling bars
  const maxMonthlyVal = Math.max(
    ...monthlyTrends.map((m) => Math.max(m.income, m.expense)),
    1000
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Analytics Grid: Category Donut + Monthly Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Expense Breakdown (Donut Chart) */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-6 relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Category Breakdown</h3>
                <p className="text-xs text-slate-400">Expense distribution by category</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {categoryBreakdown.length} Categories
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <Layers className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm font-medium">No expense records found yet</p>
              <p className="text-xs text-slate-500 mt-1">Add transactions to generate interactive charts</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* SVG Donut Chart */}
              <div className="relative w-52 h-52 shrink-0 flex items-center justify-center">
                <svg width="200" height="200" className="transform -rotate-90">
                  {/* Background Track */}
                  <circle
                    stroke="rgba(255, 255, 255, 0.05)"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={normalizedRadius}
                    cx="100"
                    cy="100"
                  />

                  {/* Category Slices */}
                  {categoryBreakdown.map((item, idx) => {
                    const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
                    const rotation = (cumulativePercent / 100) * 360;
                    cumulativePercent += item.percentage;
                    const sliceColor = colorPalette[idx % colorPalette.length];
                    const isHovered = hoveredCategory === item.category;

                    return (
                      <circle
                        key={item.category}
                        stroke={sliceColor}
                        fill="transparent"
                        strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                        strokeDasharray={`${circumference} ${circumference}`}
                        style={{
                          strokeDashoffset,
                          transformOrigin: "50% 50%",
                          transform: `rotate(${rotation}deg)`,
                          transition: "all 0.3s ease",
                        }}
                        r={normalizedRadius}
                        cx="100"
                        cy="100"
                        onMouseEnter={() => setHoveredCategory(item.category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        className="cursor-pointer hover:opacity-90"
                      />
                    );
                  })}
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                  <span className="text-[11px] font-medium text-slate-400">Total Spent</span>
                  <span className="text-base font-extrabold text-slate-100 mt-0.5">
                    {formatCurrency(totalExpense, currency)}
                  </span>
                  {hoveredCategory && (
                    <span className="text-[10px] text-indigo-400 font-bold truncate max-w-[120px]">
                      {hoveredCategory}
                    </span>
                  )}
                </div>
              </div>

              {/* Legend List */}
              <div className="w-full space-y-2 max-h-56 overflow-y-auto pr-1">
                {categoryBreakdown.map((cat, idx) => {
                  const catColor = colorPalette[idx % colorPalette.length];
                  const isHovered = hoveredCategory === cat.category;

                  return (
                    <div
                      key={cat.category}
                      onMouseEnter={() => setHoveredCategory(cat.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                        isHovered ? "bg-slate-800/80 ring-1 ring-indigo-500/40" : "hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: catColor }}
                        />
                        <span className="text-xs font-semibold text-slate-200">{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-300">
                          {formatCurrency(cat.amount, currency)}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 w-10 text-right">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Monthly Cashflow Bar Chart (Income vs Expense) */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Monthly Cash Flow</h3>
                <p className="text-xs text-slate-400">Income vs Expense trends</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
                <span className="text-slate-300">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-400" />
                <span className="text-slate-300">Expense</span>
              </div>
            </div>
          </div>

          {monthlyTrends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <BarChart3 className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm font-medium">No trend data available yet</p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="h-56 flex items-end justify-between gap-3 sm:gap-6 px-2 border-b border-slate-800 pb-3">
                {monthlyTrends.map((trend) => {
                  const incomeHeight = Math.max(8, (trend.income / maxMonthlyVal) * 100);
                  const expenseHeight = Math.max(8, (trend.expense / maxMonthlyVal) * 100);

                  return (
                    <div key={trend.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2 h-44">
                        {/* Income Bar */}
                        <div
                          className="w-full max-w-[22px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-500 group-hover:brightness-125 relative"
                          style={{ height: `${incomeHeight}%` }}
                          title={`Income: ${formatCurrency(trend.income, currency)}`}
                        />

                        {/* Expense Bar */}
                        <div
                          className="w-full max-w-[22px] bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md transition-all duration-500 group-hover:brightness-125 relative"
                          style={{ height: `${expenseHeight}%` }}
                          title={`Expense: ${formatCurrency(trend.expense, currency)}`}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-200">
                        {trend.month.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Net Cashflow Summary footer */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-2 pt-1">
                <span>Net Cashflow: <strong className="text-slate-200">{formatCurrency(totalIncome - totalExpense, currency)}</strong></span>
                <span>Active Period: <strong className="text-slate-200">{monthlyTrends.length} Months</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Method Distribution Card */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Payment Modes</h3>
            <p className="text-xs text-slate-400">Transaction volumes by payment channel</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {paymentMethodBreakdown.map((pm) => (
            <div key={pm.method} className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{pm.method}</span>
              <p className="text-lg font-bold text-slate-100 mt-1">{formatCurrency(pm.total, currency)}</p>
            </div>
          ))}
          {paymentMethodBreakdown.length === 0 && (
            <p className="text-xs text-slate-500 col-span-4">No payment method data recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
