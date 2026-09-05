const express = require("express");
const router = express.Router();
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  exportExpensesCSV,
  seedSampleData,
  bulkImportExpenses,
} = require("../controllers/expenseController");

// Analytics & Utility endpoints (defined before :id to prevent matching conflicts)
router.get("/stats", getExpenseStats);
router.get("/export", exportExpensesCSV);
router.post("/seed", seedSampleData);
router.post("/batch", bulkImportExpenses);

// Main CRUD routes
router.route("/").get(getExpenses).post(createExpense);
router.route("/:id").get(getExpenseById).put(updateExpense).delete(deleteExpense);

module.exports = router;
