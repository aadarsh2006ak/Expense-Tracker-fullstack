import Papa from "papaparse";

/**
 * Smart category inference based on title or description text
 */
export function inferCategory(text = "", type = "expense") {
  const lower = text.toLowerCase();

  if (type === "income" || lower.includes("salary") || lower.includes("payroll") || lower.includes("stipend")) {
    return "Salary";
  }
  if (lower.includes("freelance") || lower.includes("client") || lower.includes("consulting")) {
    return "Freelance";
  }
  if (lower.includes("dividend") || lower.includes("interest") || lower.includes("return")) {
    return "Investment Returns";
  }

  // Expenses
  if (lower.includes("rent") || lower.includes("maintenance") || lower.includes("lease")) return "Housing";
  if (lower.includes("grocery") || lower.includes("supermarket") || lower.includes("vegetable") || lower.includes("milk") || lower.includes("walmart") || lower.includes("zepto") || lower.includes("blinkit") || lower.includes("instamart")) return "Groceries";
  if (lower.includes("restaurant") || lower.includes("cafe") || lower.includes("coffee") || lower.includes("starbucks") || lower.includes("swiggy") || lower.includes("zomato") || lower.includes("mcdonald") || lower.includes("burger") || lower.includes("pizza") || lower.includes("dining")) return "Dining Out";
  if (lower.includes("uber") || lower.includes("ola") || lower.includes("petrol") || lower.includes("fuel") || lower.includes("metro") || lower.includes("cab") || lower.includes("flight") || lower.includes("train")) return "Transportation";
  if (lower.includes("electricity") || lower.includes("water") || lower.includes("wifi") || lower.includes("broadband") || lower.includes("airtel") || lower.includes("jio") || lower.includes("utility") || lower.includes("bill")) return "Utilities";
  if (lower.includes("amazon") || lower.includes("flipkart") || lower.includes("myntra") || lower.includes("zara") || lower.includes("clothing") || lower.includes("mall") || lower.includes("store")) return "Shopping";
  if (lower.includes("netflix") || lower.includes("spotify") || lower.includes("cinema") || lower.includes("movie") || lower.includes("prime") || lower.includes("game")) return "Entertainment";
  if (lower.includes("hospital") || lower.includes("pharmacy") || lower.includes("doctor") || lower.includes("medicine") || lower.includes("gym") || lower.includes("fitness")) return "Healthcare";
  if (lower.includes("sip") || lower.includes("mutual fund") || lower.includes("stock") || lower.includes("equity") || lower.includes("crypto") || lower.includes("invest")) return "Investment";

  return "General";
}

/**
 * Parse CSV file into standardized transaction objects
 */
export function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            return reject(new Error("The uploaded CSV file contains no readable rows."));
          }

          const parsed = results.data.map((row, index) => {
            // Find columns flexibly
            const keys = Object.keys(row);

            const findVal = (...aliases) => {
              for (const alias of aliases) {
                const matchedKey = keys.find((k) => k.trim().toLowerCase() === alias.toLowerCase());
                if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
                  return row[matchedKey];
                }
              }
              return "";
            };

            const title = findVal("title", "description", "details", "narrative", "payee", "name") || `Transaction #${index + 1}`;
            const rawAmount = findVal("amount", "amt", "debit", "credit", "total", "value");
            const rawType = findVal("type", "transaction type", "cr/dr");
            const rawCategory = findVal("category", "tag");
            const rawDate = findVal("date", "txn date", "transaction date", "time");
            const rawPaymentMethod = findVal("payment method", "payment mode", "mode", "method");
            const rawNotes = findVal("notes", "remarks", "memo", "comment");

            // Clean amount
            const cleanAmtStr = String(rawAmount).replace(/[^0-9.-]+/g, "");
            const parsedAmount = Math.abs(parseFloat(cleanAmtStr)) || 0;

            // Determine type
            let type = "expense";
            const lowerType = String(rawType).toLowerCase();
            const lowerTitle = String(title).toLowerCase();
            if (
              lowerType.includes("income") ||
              lowerType.includes("credit") ||
              lowerType === "cr" ||
              lowerTitle.includes("salary") ||
              lowerTitle.includes("refund")
            ) {
              type = "income";
            }

            // Determine Category
            const category = rawCategory.trim() || inferCategory(title, type);

            // Determine Date
            let date = new Date();
            if (rawDate) {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) date = d;
            }

            return {
              id: `imported-${Date.now()}-${index}`,
              title: title.trim(),
              amount: parsedAmount,
              type,
              category,
              date: date.toISOString().split("T")[0],
              paymentMethod: rawPaymentMethod.trim() || "UPI",
              notes: rawNotes.trim() || "Imported from CSV statement",
            };
          }).filter((item) => item.amount > 0);

          if (parsed.length === 0) {
            return reject(new Error("No valid transactions with amounts could be extracted from this CSV."));
          }

          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err),
    });
  });
}

/**
 * Parse PDF / Text statement file into standardized transactions
 */
export async function parsePDFFile(file) {
  try {
    const text = await file.text();

    // Split into lines
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    const extracted = [];
    const dateRegex = /\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})\b/i;
    const amountRegex = /(?:[$₹€£]?\s*)(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/;

    lines.forEach((line, idx) => {
      const dateMatch = line.match(dateRegex);
      const amountMatch = line.match(amountRegex);

      if (dateMatch && amountMatch) {
        const rawDate = dateMatch[0];
        const rawAmount = amountMatch[1].replace(/,/g, "");
        const parsedAmount = parseFloat(rawAmount);

        if (!isNaN(parsedAmount) && parsedAmount > 0) {
          // Clean title by removing date and amount
          let title = line
            .replace(dateMatch[0], "")
            .replace(amountMatch[0], "")
            .replace(/[₹$€£\-,|]/g, " ")
            .trim();

          if (!title || title.length < 3) title = `Statement Entry #${idx + 1}`;

          const isIncome = line.toLowerCase().includes("cr") || line.toLowerCase().includes("credit") || line.toLowerCase().includes("salary");
          const type = isIncome ? "income" : "expense";
          const category = inferCategory(title, type);

          const d = new Date(rawDate);
          const validDate = !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

          extracted.push({
            id: `imported-pdf-${Date.now()}-${idx}`,
            title,
            amount: parsedAmount,
            type,
            category,
            date: validDate,
            paymentMethod: "UPI",
            notes: `Extracted from PDF: ${file.name}`,
          });
        }
      }
    });

    if (extracted.length === 0) {
      // Fallback: If text format was non-standard or binary PDF, provide helpful message with structured CSV option
      throw new Error(
        "Could not automatically detect tabular transaction rows in this PDF format. Tip: For exact bank statements, upload a CSV or text statement format."
      );
    }

    return extracted;
  } catch (err) {
    throw err;
  }
}
