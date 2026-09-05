import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "./constants";

/**
 * Generate and download a complete Financial & Expense PDF Report
 * Directly downloads to the user's Downloads folder
 */
export function exportExpensesToPDF({ expenses = [], stats = {}, currency = "INR" }) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 80, "F");

  // App Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("FinFlow", 40, 42);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Financial Statement & Expense Analysis Report", 40, 58);

  // Date and Currency on top right
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${today}`, pageWidth - 40, 38, { align: "right" });
  doc.text(`Currency: ${currency}`, pageWidth - 40, 52, { align: "right" });

  // 2. Executive Summary Box
  const totalIncome = stats.totalIncome || 0;
  const totalExpense = stats.totalExpense || 0;
  const totalBalance = stats.totalBalance || totalIncome - totalExpense;
  const savingsRate = stats.savingsRate || (totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0);

  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(40, 100, pageWidth - 80, 70, 6, 6, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(40, 100, pageWidth - 80, 70, 6, 6, "S");

  // Summary Metrics columns
  const colWidth = (pageWidth - 80) / 4;

  const metrics = [
    { label: "Total Balance", value: formatCurrency(totalBalance, currency), color: totalBalance >= 0 ? [16, 185, 129] : [244, 63, 94] },
    { label: "Total Income", value: formatCurrency(totalIncome, currency), color: [16, 185, 129] },
    { label: "Total Expenses", value: formatCurrency(totalExpense, currency), color: [244, 63, 94] },
    { label: "Savings Rate", value: `${Math.max(0, savingsRate).toFixed(1)}%`, color: [99, 102, 241] },
  ];

  metrics.forEach((m, idx) => {
    const xPos = 40 + idx * colWidth + 15;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(m.label.toUpperCase(), xPos, 122);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.value, xPos, 144);
  });

  let currentY = 190;

  // 3. Category Breakdown Table (if expenses exist)
  if (stats.categoryBreakdown && stats.categoryBreakdown.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Expense Distribution by Category", 40, currentY);

    const categoryRows = stats.categoryBreakdown.map((item) => [
      item.category,
      formatCurrency(item.amount, currency),
      `${item.percentage}%`,
    ]);

    autoTable(doc, {
      startY: currentY + 10,
      head: [["Category", "Amount Spent", "% of Total Outflow"]],
      body: categoryRows,
      theme: "striped",
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontSize: 9,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 5,
      },
      margin: { left: 40, right: 40 },
    });

    currentY = doc.lastAutoTable.finalY + 25;
  }

  // 4. Transaction Ledger Table
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`Transaction Ledger (${expenses.length} Records)`, 40, currentY);

  const tableRows = expenses.map((e) => {
    const dateFormatted = new Date(e.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const formattedAmt = `${e.type === "income" ? "+" : "-"}${formatCurrency(e.amount, currency)}`;

    return [
      dateFormatted,
      e.title,
      e.category || "General",
      e.type ? e.type.toUpperCase() : "EXPENSE",
      e.paymentMethod || "UPI",
      formattedAmt,
      e.notes || "-",
    ];
  });

  autoTable(doc, {
    startY: currentY + 10,
    head: [["Date", "Title / Payee", "Category", "Type", "Payment Mode", "Amount", "Notes"]],
    body: tableRows.length > 0 ? tableRows : [["-", "No transactions recorded", "-", "-", "-", "-", "-"]],
    theme: "striped",
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: 255,
      fontSize: 8.5,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 8,
      cellPadding: 5,
    },
    columnStyles: {
      5: { fontStyle: "bold" },
    },
    margin: { left: 40, right: 40 },
    didDrawPage: (data) => {
      // Footer page numbering
      const str = `Page ${doc.internal.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, pageWidth - 40, doc.internal.pageSize.getHeight() - 20, { align: "right" });
      doc.text("FinFlow • Smart Wealth & Expense Tracking", 40, doc.internal.pageSize.getHeight() - 20);
    },
  });

  // Download directly as PDF
  const filename = `FinFlow_Expense_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}
