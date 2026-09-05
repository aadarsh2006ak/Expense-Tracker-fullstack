const Expense = require("../models/Expense");
const mongoose = require("mongoose");

// Sample realistic data for quick demo seeding
const SAMPLE_EXPENSES = [
  {
    title: "Monthly Salary",
    amount: 75000,
    type: "income",
    category: "Salary",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    paymentMethod: "Bank Transfer",
    notes: "Main employment monthly salary credit",
    tags: ["income", "work"],
  },
  {
    title: "Freelance UI Design Project",
    amount: 18500,
    type: "income",
    category: "Freelance",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 3),
    paymentMethod: "Bank Transfer",
    notes: "Client milestone payment for website redesign",
    tags: ["freelance", "design"],
  },
  {
    title: "Apartment Rent",
    amount: 22000,
    type: "expense",
    category: "Housing",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 2),
    paymentMethod: "Bank Transfer",
    notes: "Monthly apartment rent payment",
    tags: ["rent", "essentials"],
  },
  {
    title: "Whole Foods & Supermarket",
    amount: 4350,
    type: "expense",
    category: "Groceries",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 4),
    paymentMethod: "UPI",
    notes: "Weekly vegetables, fruits, and pantry restock",
    tags: ["groceries", "food"],
  },
  {
    title: "Electricity & Water Bill",
    amount: 2850,
    type: "expense",
    category: "Utilities",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
    paymentMethod: "UPI",
    notes: "State power and water utility bill payment",
    tags: ["utilities", "bills"],
  },
  {
    title: "Weekend Dinner & Drinks",
    amount: 3200,
    type: "expense",
    category: "Dining Out",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
    paymentMethod: "Card",
    notes: "Italian restaurant with friends",
    tags: ["food", "leisure"],
  },
  {
    title: "High-Speed Internet Fiber",
    amount: 1199,
    type: "expense",
    category: "Utilities",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 6),
    paymentMethod: "UPI",
    notes: "300 Mbps Unlimited Fiber Broadband",
    tags: ["internet", "bills"],
  },
  {
    title: "Petrol / Fuel Refill",
    amount: 2500,
    type: "expense",
    category: "Transportation",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 7),
    paymentMethod: "Card",
    notes: "Full tank petrol for car",
    tags: ["fuel", "travel"],
  },
  {
    title: "Mutual Fund SIP Investment",
    amount: 15000,
    type: "expense",
    category: "Investment",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 8),
    paymentMethod: "Bank Transfer",
    notes: "Nifty 50 Index Fund Monthly SIP",
    tags: ["investment", "savings"],
  },
  {
    title: "Netflix & Spotify Subscription",
    amount: 899,
    type: "expense",
    category: "Entertainment",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
    paymentMethod: "Card",
    notes: "Monthly OTT & music streaming plans",
    tags: ["subscription", "entertainment"],
  },
  {
    title: "New Ergonomic Keyboard",
    amount: 6499,
    type: "expense",
    category: "Shopping",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 12),
    paymentMethod: "Card",
    notes: "Mechanical wireless keyboard for home office",
    tags: ["gadgets", "shopping"],
  },
  {
    title: "Gym Membership",
    amount: 2500,
    type: "expense",
    category: "Healthcare",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 14),
    paymentMethod: "UPI",
    notes: "Monthly fitness gym access fee",
    tags: ["health", "fitness"],
  },
];

/**
 * @desc    Get all expenses with search, category, type, and date filters
 * @route   GET /api/expenses
 */
exports.getExpenses = async (req, res) => {
  try {
    const { category, type, search, startDate, endDate, sortBy = "date", sortOrder = "desc", limit } = req.query;

    const filter = {};

    // Filter by Category
    if (category && category !== "All") {
      filter.category = category;
    }

    // Filter by Type (expense / income)
    if (type && type !== "All") {
      filter.type = type.toLowerCase();
    }

    // Search query across title and notes
    if (search && search.trim() !== "") {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { notes: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // End of the day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    let query = Expense.find(filter).sort(sortOptions);
    if (limit && !isNaN(limit)) {
      query = query.limit(parseInt(limit, 10));
    }

    const expenses = await query;

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error fetching expenses",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single expense by ID
 * @route   GET /api/expenses/:id
 */
exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Expense ID format" });
    }

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error fetching expense",
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new expense or income record
 * @route   POST /api/expenses
 */
exports.createExpense = async (req, res) => {
  try {
    const { title, amount, type, category, date, paymentMethod, notes, tags } = req.body;

    if (!title || amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: "Please provide both title and a valid amount",
      });
    }

    const expense = await Expense.create({
      title: title.trim(),
      amount: Number(amount),
      type: type || "expense",
      category: category || "General",
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || "UPI",
      notes: notes || "",
      tags: Array.isArray(tags) ? tags : [],
    });

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: expense,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({
      success: false,
      message: "Server Error creating transaction",
      error: error.message,
    });
  }
};

/**
 * @desc    Update an existing expense
 * @route   PUT /api/expenses/:id
 */
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Expense ID format" });
    }

    const { title, amount, type, category, date, paymentMethod, notes, tags } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (amount !== undefined) updateData.amount = Number(amount);
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (date !== undefined) updateData.date = new Date(date);
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (notes !== undefined) updateData.notes = notes;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];

    const expense = await Expense.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: expense,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({
      success: false,
      message: "Server Error updating transaction",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete an expense
 * @route   DELETE /api/expenses/:id
 */
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Expense ID format" });
    }

    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error deleting transaction",
      error: error.message,
    });
  }
};

/**
 * @desc    Get comprehensive stats & financial summaries
 * @route   GET /api/expenses/stats
 */
exports.getExpenseStats = async (req, res) => {
  try {
    const allItems = await Expense.find().sort({ date: -1 });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap = {};
    const paymentMap = {};
    const monthlyMap = {};

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    allItems.forEach((item) => {
      const amount = Number(item.amount) || 0;
      const date = new Date(item.date);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

      // Initialize monthly map
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, income: 0, expense: 0, sortDate: new Date(date.getFullYear(), date.getMonth(), 1) };
      }

      if (item.type === "income") {
        totalIncome += amount;
        monthlyMap[monthKey].income += amount;
      } else {
        totalExpense += amount;
        monthlyMap[monthKey].expense += amount;

        // Category breakdown for expenses
        const cat = item.category || "General";
        categoryMap[cat] = (categoryMap[cat] || 0) + amount;
      }

      // Payment method breakdown
      const pm = item.paymentMethod || "Other";
      paymentMap[pm] = (paymentMap[pm] || 0) + amount;
    });

    const totalBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    // Category breakdown array with percentages
    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? Number(((amount / totalExpense) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly trends array sorted chronologically
    const monthlyTrends = Object.values(monthlyMap)
      .sort((a, b) => a.sortDate - b.sortDate)
      .slice(-6)
      .map(({ month, income, expense }) => ({ month, income, expense }));

    // Payment methods array
    const paymentMethodBreakdown = Object.entries(paymentMap).map(([method, total]) => ({
      method,
      total,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalBalance,
        totalIncome,
        totalExpense,
        savingsRate: Number(savingsRate.toFixed(1)),
        totalTransactions: allItems.length,
        categoryBreakdown,
        monthlyTrends,
        paymentMethodBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error calculating statistics",
      error: error.message,
    });
  }
};

/**
 * @desc    Export expenses to CSV format
 * @route   GET /api/expenses/export
 */
exports.exportExpensesCSV = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });

    const headers = ["ID", "Title", "Amount", "Type", "Category", "Date", "Payment Method", "Notes"];
    const rows = expenses.map((e) => [
      `"${e._id}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      e.amount,
      e.type,
      `"${e.category.replace(/"/g, '""')}"`,
      `"${new Date(e.date).toISOString().split("T")[0]}"`,
      `"${e.paymentMethod || ""}"`,
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="expenses_export_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error exporting CSV",
      error: error.message,
    });
  }
};

/**
 * @desc    Seed sample data for instant interactive demo
 * @route   POST /api/expenses/seed
 */
exports.seedSampleData = async (req, res) => {
  try {
    const { overwrite = false } = req.body;

    if (overwrite) {
      await Expense.deleteMany({});
    }

    const count = await Expense.countDocuments();
    if (count > 0 && !overwrite) {
      return res.status(200).json({
        success: true,
        message: `Database already contains ${count} records. Pass { overwrite: true } to replace them.`,
      });
    }

    const created = await Expense.insertMany(SAMPLE_EXPENSES);

    res.status(201).json({
      success: true,
      message: `Successfully seeded ${created.length} sample transactions!`,
      count: created.length,
      data: created,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error seeding sample data",
      error: error.message,
    });
  }
};

/**
 * @desc    Bulk import multiple expenses (from CSV or PDF parser)
 * @route   POST /api/expenses/batch
 */
exports.bulkImportExpenses = async (req, res) => {
  try {
    const { items = [] } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a non-empty array of expense items to import.",
      });
    }

    const formattedItems = items.map((item) => ({
      title: (item.title || "Imported Transaction").trim(),
      amount: Math.abs(parseFloat(item.amount)) || 0,
      type: item.type === "income" ? "income" : "expense",
      category: item.category || "General",
      date: item.date ? new Date(item.date) : new Date(),
      paymentMethod: item.paymentMethod || "UPI",
      notes: item.notes || "Imported via statement",
      tags: Array.isArray(item.tags) ? item.tags : ["imported"],
    })).filter((item) => item.amount > 0);

    if (formattedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid transactions with amount > 0 found to import.",
      });
    }

    const inserted = await Expense.insertMany(formattedItems);

    res.status(201).json({
      success: true,
      message: `Successfully imported ${inserted.length} transactions!`,
      count: inserted.length,
      data: inserted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error importing batch transactions",
      error: error.message,
    });
  }
};
