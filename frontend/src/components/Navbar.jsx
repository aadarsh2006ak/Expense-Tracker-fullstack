import React, { useState } from "react";
import {
  WalletCards,
  Plus,
  Download,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react";
import { CURRENCIES, formatCurrency } from "../utils/constants";
import { getExportCsvUrl } from "../services/api";

export default function Navbar({
  currency,
  setCurrency,
  onOpenAddModal,
  onOpenImportModal,
  onExportPDF,
  activeTab,
  setActiveTab,
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <WalletCards className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  FinFlow
                </span>
                <p className="text-[11px] text-slate-400 hidden sm:block">Smart Expense & Wealth Tracker</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              {[
                { id: "dashboard", label: "Dashboard" },
                { id: "transactions", label: "Transactions" },
                { id: "analytics", label: "Analytics" },
                { id: "budgets", label: "Budgets" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: Actions, Currency, Import/Export, Add Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-slate-900 text-slate-200 text-xs font-medium px-2.5 py-2 rounded-xl border border-slate-700/80 hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>

            {/* Import CSV / PDF Statement Button */}
            <button
              onClick={onOpenImportModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all hover:scale-105 active:scale-95"
              title="Import CSV or PDF statement to analyze expenses"
            >
              <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
              <span>Import Statement</span>
            </button>

            {/* Export Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu((prev) => !prev)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all"
                title="Export options"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showExportMenu && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 animate-fade-in"
                  onMouseLeave={() => setShowExportMenu(false)}
                >
                  {/* Export PDF */}
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      onExportPDF();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <div className="font-semibold">Export to PDF</div>
                      <div className="text-[10px] text-slate-400">Statement & Analytics</div>
                    </div>
                  </button>

                  {/* Export CSV */}
                  <a
                    href={getExportCsvUrl()}
                    download
                    onClick={() => setShowExportMenu(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors text-left"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold">Export to CSV</div>
                      <div className="text-[10px] text-slate-400">Excel / Spreadsheet</div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* Primary Add Transaction Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 border border-indigo-400/30 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Add Record</span>
              <span className="xs:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/60">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "transactions", label: "Transactions" },
            { id: "analytics", label: "Analytics" },
            { id: "budgets", label: "Budgets" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600/20 text-indigo-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
