export const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "AU$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
];

export const CATEGORIES = [
  { id: "Housing", name: "Housing", color: "#6366f1", icon: "Home", type: "expense" },
  { id: "Groceries", name: "Groceries", color: "#10b981", icon: "ShoppingCart", type: "expense" },
  { id: "Dining Out", name: "Dining Out", color: "#f59e0b", icon: "Utensils", type: "expense" },
  { id: "Transportation", name: "Transportation", color: "#3b82f6", icon: "Car", type: "expense" },
  { id: "Utilities", name: "Utilities", color: "#06b6d4", icon: "Zap", type: "expense" },
  { id: "Entertainment", name: "Entertainment", color: "#ec4899", icon: "Film", type: "expense" },
  { id: "Shopping", name: "Shopping", color: "#8b5cf6", icon: "ShoppingBag", type: "expense" },
  { id: "Healthcare", name: "Healthcare", color: "#ef4444", icon: "HeartPulse", type: "expense" },
  { id: "Investment", name: "Investment", color: "#14b8a6", icon: "TrendingUp", type: "expense" },
  { id: "Salary", name: "Salary", color: "#10b981", icon: "Briefcase", type: "income" },
  { id: "Freelance", name: "Freelance", color: "#8b5cf6", icon: "Laptop", type: "income" },
  { id: "Business", name: "Business", color: "#3b82f6", icon: "Building", type: "income" },
  { id: "Investment Returns", name: "Investment Returns", color: "#06b6d4", icon: "Coins", type: "income" },
  { id: "Other", name: "Other", color: "#9ca3af", icon: "Tag", type: "both" },
];

export const PAYMENT_METHODS = ["UPI", "Card", "Cash", "Bank Transfer", "Other"];

export function formatCurrency(amount, currencyCode = "INR") {
  const curr = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
  const num = Number(amount) || 0;
  return `${curr.symbol}${num.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
