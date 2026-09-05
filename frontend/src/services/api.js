const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Fetch list of expenses with optional query filters
 */
export async function fetchExpenses(params = {}) {
  const query = new URLSearchParams();

  if (params.category && params.category !== "All") query.append("category", params.category);
  if (params.type && params.type !== "All") query.append("type", params.type);
  if (params.search && params.search.trim()) query.append("search", params.search.trim());
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.sortOrder) query.append("sortOrder", params.sortOrder);
  if (params.limit) query.append("limit", params.limit);

  const url = `${API_BASE_URL}/expenses?${query.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch expenses: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data || [];
}

/**
 * Fetch financial statistics and charts data
 */
export async function fetchExpenseStats() {
  const res = await fetch(`${API_BASE_URL}/expenses/stats`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch expense statistics");
  }
  const json = await res.json();
  return json.data;
}

/**
 * Create a new expense/income transaction
 */
export async function createExpense(data) {
  const res = await fetch(`${API_BASE_URL}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create transaction");
  }
  return await res.json();
}

/**
 * Update an existing expense/income transaction
 */
export async function updateExpense(id, data) {
  const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update transaction");
  }
  return await res.json();
}

/**
 * Delete a transaction
 */
export async function deleteExpense(id) {
  const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete transaction");
  }
  return await res.json();
}

/**
 * Seed database with sample transactions
 */
export async function seedSampleData(overwrite = false) {
  const res = await fetch(`${API_BASE_URL}/expenses/seed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ overwrite }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to seed sample data");
  }
  return await res.json();
}

/**
 * Check backend and MongoDB connection status
 */
export async function checkServerHealth() {
  try {
    const res = await fetch(`${API_BASE_URL.replace("/expenses", "")}/health`, {
      cache: "no-store",
    });
    if (!res.ok) return { status: "offline", database: { isConnected: false } };
    return await res.json();
  } catch (e) {
    return { status: "offline", database: { isConnected: false } };
  }
}

/**
 * Bulk import multiple expenses
 */
export async function bulkImportExpenses(items) {
  const res = await fetch(`${API_BASE_URL}/expenses/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to bulk import transactions");
  }
  return await res.json();
}

/**
 * Get CSV export URL
 */
export function getExportCsvUrl() {
  return `${API_BASE_URL}/expenses/export`;
}
