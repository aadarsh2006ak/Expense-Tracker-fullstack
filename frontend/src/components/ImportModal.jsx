import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Download,
  RotateCw,
} from "lucide-react";
import { parseCSVFile, parsePDFFile } from "../utils/fileParser";
import { formatCurrency, CATEGORIES } from "../utils/constants";
import CategoryIcon from "./CategoryIcon";

export default function ImportModal({ isOpen, onClose, onImportSuccess, currency = "INR" }) {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setError("");
    setParsing(true);

    try {
      let data = [];
      const extension = selected.name.split(".").pop().toLowerCase();

      if (extension === "csv" || extension === "txt") {
        data = await parseCSVFile(selected);
      } else if (extension === "pdf") {
        data = await parsePDFFile(selected);
      } else {
        throw new Error("Unsupported format. Please upload a .CSV or .PDF statement.");
      }

      setParsedRows(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to parse file. Please verify format.");
      setParsedRows([]);
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const fakeEvent = { target: { files: [droppedFile] } };
      handleFileChange(fakeEvent);
    }
  };

  const handleRemoveRow = (idx) => {
    setParsedRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateRow = (idx, field, value) => {
    setParsedRows((prev) =>
      prev.map((row, i) => {
        if (i === idx) {
          return {
            ...row,
            [field]: field === "amount" ? Math.abs(parseFloat(value)) || 0 : value,
          };
        }
        return row;
      })
    );
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setImporting(true);
    setError("");
    try {
      await onImportSuccess(parsedRows);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to import rows into database.");
    } finally {
      setImporting(false);
    }
  };

  const downloadSampleCSV = () => {
    const sample = `Date,Title,Amount,Type,Category,Payment Method,Notes\r\n2026-09-01,Monthly Salary,75000,income,Salary,Bank Transfer,Direct deposit salary\r\n2026-09-02,Apartment Rent,22000,expense,Housing,Bank Transfer,Monthly rent\r\n2026-09-03,Supermarket Grocery,4500,expense,Groceries,UPI,Weekly food supplies\r\n2026-09-04,Starbucks Coffee,450,expense,Dining Out,Card,Team coffee\r\n2026-09-05,Electricity Bill,2800,expense,Utilities,UPI,State electricity board`;

    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "finflow_sample_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl glass-card rounded-3xl p-6 sm:p-8 bg-slate-900 border border-slate-700/80 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Import Statements & Transactions</h2>
              <p className="text-xs text-slate-400">Import CSV or PDF bank statements to analyze expenses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-950/60 rounded-2xl p-6 text-center cursor-pointer transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.pdf,.txt"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                {file ? file.name : "Click or drag & drop statement to upload"}
              </p>
              <p className="text-xs text-slate-500 mt-1">Supports CSV and PDF bank statement files</p>

              <div className="flex items-center gap-3 mt-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> .CSV format
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-rose-400" /> .PDF statements
                </span>
              </div>
            </div>
          </div>

          {/* Sample template link */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Need a formatted template?</span>
            <button
              type="button"
              onClick={downloadSampleCSV}
              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Sample CSV</span>
            </button>
          </div>

          {/* Error display */}
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Loading parsing */}
          {parsing && (
            <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-xs font-semibold">
              <RotateCw className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Parsing and extracting transactions from {file?.name}...</span>
            </div>
          )}

          {/* Extracted Preview Data Grid */}
          {!parsing && parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Extracted Transactions Preview ({parsedRows.length} items)
                </span>
                <span className="text-[11px] text-slate-400">Review or adjust rows before importing</span>
              </div>

              <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Title</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Amount</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {parsedRows.map((row, idx) => (
                      <tr key={row.id || idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-2 whitespace-nowrap text-slate-400">{row.date}</td>
                        <td className="p-2 font-medium text-slate-100 max-w-[160px] truncate">
                          {row.title}
                        </td>
                        <td className="p-2">
                          <select
                            value={row.category}
                            onChange={(e) => handleUpdateRow(idx, "category", e.target.value)}
                            className="bg-slate-950 text-xs px-2 py-1 rounded border border-slate-800 text-slate-200"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              row.type === "income"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            {row.type}
                          </span>
                        </td>
                        <td className="p-2 font-bold text-slate-100">
                          {formatCurrency(row.amount, currency)}
                        </td>
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedRows.length === 0 || importing || parsing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {importing ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Importing & Analyzing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Import & Analyze {parsedRows.length > 0 ? `(${parsedRows.length} Records)` : ""}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
