import React from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "../utils/constants";

export default function StatsCards({ stats, currency }) {
  const {
    totalBalance = 0,
    totalIncome = 0,
    totalExpense = 0,
    savingsRate = 0,
    totalTransactions = 0,
  } = stats || {};

  const isPositiveBalance = totalBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {/* 1. Total Net Balance Card */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-5 group">
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Net Balance
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2">
          <div
            className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isPositiveBalance ? "text-slate-100" : "text-rose-400"
            }`}
          >
            {formatCurrency(totalBalance, currency)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-md ${
                isPositiveBalance
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {isPositiveBalance ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {totalIncome > 0 ? `${((totalBalance / totalIncome) * 100).toFixed(0)}% preserved` : "0%"}
            </span>
            <span className="text-xs text-slate-400">{totalTransactions} total entries</span>
          </div>
        </div>
      </div>

      {/* 2. Total Income Card */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-5 group">
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Income
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-400">
            {formatCurrency(totalIncome, currency)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <span>Credits & Revenues</span>
          </div>
        </div>
      </div>

      {/* 3. Total Expenses Card */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-5 group">
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Expenses
          </span>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-rose-400">
            {formatCurrency(totalExpense, currency)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-400" />
            <span>Debits & Outflows</span>
          </div>
        </div>
      </div>

      {/* 4. Savings Rate Card */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-5 group">
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Savings Rate
          </span>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-purple-300">
              {Math.max(0, savingsRate)}%
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {savingsRate >= 30 ? "🔥 Excellent" : savingsRate > 10 ? "👍 Healthy" : "⚠️ Needs Care"}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-2 mt-3 overflow-hidden border border-slate-700/50">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
