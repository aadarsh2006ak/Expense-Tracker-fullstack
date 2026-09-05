import React, { useState, useEffect } from "react";
import {
  X,
  PlusCircle,
  Edit3,
  Calendar,
  CreditCard,
  FileText,
  Tag,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { CATEGORIES, PAYMENT_METHODS, CURRENCIES } from "../utils/constants";
import CategoryIcon from "./CategoryIcon";

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  currency = "INR",
}) {
  const isEditing = Boolean(initialData && initialData._id);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "Groceries",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "UPI",
    notes: "",
    tags: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        amount: initialData.amount !== undefined ? initialData.amount.toString() : "",
        type: initialData.type || "expense",
        category: initialData.category || "General",
        date: initialData.date ? new Date(initialData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        paymentMethod: initialData.paymentMethod || "UPI",
        notes: initialData.notes || "",
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(", ") : "",
      });
    } else {
      setFormData({
        title: "",
        amount: "",
        type: "expense",
        category: "Groceries",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "UPI",
        notes: "",
        tags: "",
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const currentCurrencySymbol = (CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0]).symbol;

  const availableCategories = CATEGORIES.filter(
    (c) => c.type === "both" || c.type === formData.type
  );

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = "Please enter a transaction title";
    }
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      errs.amount = "Please enter a valid amount greater than 0";
    }
    if (!formData.category) {
      errs.category = "Please select a category";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };
      await onSubmit(payload, initialData?._id);
      onClose();
    } catch (err) {
      setErrors({ form: err.message || "Failed to save transaction" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 bg-slate-900 border border-slate-700/80 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                formData.type === "income"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}
            >
              {isEditing ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {isEditing ? "Edit Transaction" : "Record New Transaction"}
              </h2>
              <p className="text-xs text-slate-400">Add to your MERN financial tracker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {errors.form && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
              {errors.form}
            </div>
          )}

          {/* Type Toggle: Expense vs Income */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Transaction Type</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    type: "expense",
                    category: "Groceries",
                  }));
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  formData.type === "expense"
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Expense Outflow</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    type: "income",
                    category: "Salary",
                  }));
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  formData.type === "income"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Income Inflow</span>
              </button>
            </div>
          </div>

          {/* Amount & Title Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Amount ({currentCurrencySymbol}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-indigo-400">
                  {currentCurrencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={`w-full bg-slate-950 text-slate-100 text-sm font-bold pl-8 pr-3.5 py-2.5 rounded-xl border ${
                    errors.amount ? "border-rose-500" : "border-slate-800"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                />
              </div>
              {errors.amount && <p className="text-[11px] text-rose-400 mt-1">{errors.amount}</p>}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Title / Description *</label>
              <input
                type="text"
                placeholder="e.g. Weekly Grocery Run"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full bg-slate-950 text-slate-100 text-sm px-3.5 py-2.5 rounded-xl border ${
                  errors.title ? "border-rose-500" : "border-slate-800"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
              />
              {errors.title && <p className="text-[11px] text-rose-400 mt-1">{errors.title}</p>}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category *</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
              {availableCategories.map((cat) => {
                const isSelected = formData.category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.name })}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-indigo-600/30 border border-indigo-500 text-indigo-200"
                        : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-transparent"
                    }`}
                  >
                    <CategoryIcon categoryName={cat.name} size={14} className="p-1" />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full bg-slate-950 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notes (Optional)</label>
            <textarea
              rows="2"
              placeholder="Additional details, invoice number, etc."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 text-slate-100 text-xs px-3.5 py-2 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
