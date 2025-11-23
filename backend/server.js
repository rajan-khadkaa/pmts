import express from "express";
// import { databaseSetup } from "./databaseSetup.js";
import mysql from "mysql";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import SLR from "ml-regression"; // Import Simple Linear Regression from ml-regression

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.static("./public"));
// database connection
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "prabhash_pmts",
});
// const con = databaseSetup();

app.use(
  "/images",
  express.static(path.join(path.resolve(), "./public/images"))
);

app.use(
  "/admin_image",
  express.static(path.join(path.resolve(), "./public", "admin_image"))
);

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    exposedHeaders: ["Content-Disposition"],
  })
);

//middleware for file (image) upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});

// Function to fetch expenses of last three months for a specific user and category
const fetchUserExpenses = (userId, category) => {
  return new Promise((resolve, reject) => {
    // Get today's date
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const threeMonthsAgo = new Date(startOfMonth);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const query = `
      SELECT * FROM expense 
      WHERE user_id = ? AND category = ? AND date >= ? AND date < ?
      ORDER BY date ASC
    `;

    // Log the query and parameters
    // console.log("Executing query:", query);
    // console.log("Parameters:", [
    //   userId,
    //   category,
    //   threeMonthsAgo,
    //   startOfMonth,
    // ]);

    con.query(
      query,
      [userId, category, threeMonthsAgo, startOfMonth],
      (err, results) => {
        if (err) return reject(err);

        // Log the results from the database
        // console.log("Query results:", results);

        resolve(results);
      }
    );
  });
};

// Function to fetch distinct categories for a specific user in the last three months
const fetchDistinctCategories = (userId) => {
  return new Promise((resolve, reject) => {
    // Get today's date
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const threeMonthsAgo = new Date(startOfMonth);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const query = `
      SELECT DISTINCT category FROM expense 
      WHERE user_id = ? AND date >= ? AND date < ?
    `;

    con.query(query, [userId, threeMonthsAgo, startOfMonth], (err, results) => {
      if (err) return reject(err);

      // Extract category names
      const categories = results.map((row) => row.category);
      resolve(categories);
    });
  });
};

//insert categories
// Endpoint to save/update user categories

app.post("/categories", async (req, res) => {
  const { user_id, categories } = req.body;

  try {
    // Remove existing categories for the user
    await con.query("DELETE FROM categories WHERE user_id = ?", [user_id]);

    // Insert updated categories
    for (const category of categories) {
      const { category_name, priority, min_threshold, is_disabled } = category;
      await con.query(
        `INSERT INTO categories (user_id, category_name, priority, min_threshold, is_disabled)
         VALUES (?, ?, ?, ?, ?)`,
        [user_id, category_name, priority, min_threshold, is_disabled ? 1 : 0]
      );
    }

    res.status(200).json({ message: "Categories saved successfully" });
  } catch (error) {
    console.error("Error saving categories:", error);
    res.status(500).json({ message: "Failed to save categories" });
  }
});

app.get("/categories/:userId", (req, res) => {
  const userId = req.params.userId;
  // console.log("Received userId:", userId);

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const query = `
    SELECT category_name, priority, min_threshold, is_disabled AS isDisabled 
    FROM categories 
    WHERE user_id = ?`;

  con.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Log the data being fetched from the database
    // console.log("Fetched categories data:", results);

    // Instead of 404, return an empty array if no categories are found
    if (!results || results.length === 0) {
      // console.log("No categories found for user:", userId);
      return res.json([]); // Return an empty array if no categories are found
    }

    res.json(results);
  });
});

// app.post("/categories", async (req, res) => {
//   const { user_id, categories } = req.body;

//   try {
//     // Delete existing categories for this user
//     await con.query("DELETE FROM categories WHERE user_id = ?", [user_id]);

//     // Insert new categories
//     for (const category of categories) {
//       const { category_name, priority, min_threshold, is_disabled } = category;
//       await con.query(
//         `INSERT INTO categories (user_id, category_name, priority, min_threshold, is_disabled)
//          VALUES (?, ?, ?, ?, ?)`,
//         [user_id, category_name, priority, min_threshold, is_disabled ? 1 : 0]
//       );
//     }

//     res.status(200).json({ message: "Categories saved successfully" });
//   } catch (error) {
//     console.error("Error saving categories:", error);
//     res.status(500).json({ message: "Failed to save categories" });
//   }
// });

// Get categories info

// //get categories info
// app.get("/categories/:user_id", async (req, res) => {
//   const { user_id } = req.params;

//   try {
//     const [categories] = await con.query(
//       "SELECT * FROM categories WHERE user_id = ?",
//       [user_id]
//     );

//     res.status(200).json(categories);
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     res.status(500).json({ message: "Failed to fetch categories" });
//   }
// });

//insert and retrieve income
// Route to fetch income data
// Route to fetch income data
app.get("/income", (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  con.query(
    // "SELECT * FROM income WHERE user_id = ? ORDER BY created_at DESC",
    "SELECT * FROM income WHERE user_id = ? ORDER BY date DESC", // Sort by date column in descending order
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
});

// Route to insert new income data
app.post("/income", (req, res) => {
  const { userId, category, title, amount, date, description } = req.body;

  if (!userId || !category || !title || !amount || !date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query =
    "INSERT INTO income (user_id, category, title, amount, date, description) VALUES (?, ?, ?, ?, ?, ?)";
  const values = [userId, category, title, amount, date, description || ""];
  console.log("Values are" + values);
  con.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    console.log(result);
    res.json({ id: result.insertId, ...req.body });
  });
});

// Route to delete an income by id
// app.delete("/income/:id", (req, res) => {
//   const incomeId = req.params.id;

//   if (!incomeId) {
//     return res.status(400).json({ error: "Income ID is required" });
//   }

//   const query = "DELETE FROM income WHERE id = ?";
//   con.query(query, [incomeId], (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Income not found" });
//     }

//     res.json({ message: "Income deleted successfully" });
//   });
// });

//DELETION WITH RECOVER
// Route to delete an income by id and move it to the recover table
app.delete("/income/:id", (req, res) => {
  const incomeId = req.params.id;

  if (!incomeId) {
    return res.status(400).json({ error: "Income ID is required" });
  }
  // First, select the income data before deleting
  const selectQuery = "SELECT * FROM income WHERE id = ?";
  con.query(selectQuery, [incomeId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Income not found" });
    }

    const incomeData = result[0];

    // Insert the data into the recover table
    const insertQuery = `
      INSERT INTO recover (user_id, category, title, amount, date, description, created_at, parent)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'income')
    `;
    const insertValues = [
      incomeData.user_id,
      incomeData.category,
      incomeData.title,
      incomeData.amount,
      incomeData.date,
      incomeData.description,
      incomeData.created_at,
    ];

    con.query(insertQuery, insertValues, (err, insertResult) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Now delete from the income table
      const deleteQuery = "DELETE FROM income WHERE id = ?";
      con.query(deleteQuery, [incomeId], (err, deleteResult) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({ message: "Income deleted and moved to recover table" });
      });
    });
  });
});

//for expense

// Route to fetch expense data
app.get("/expense", (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  con.query(
    // "SELECT * FROM expense WHERE user_id = ? ORDER BY created_at DESC",
    "SELECT * FROM expense WHERE user_id = ? ORDER BY date DESC", // Sort by date column in descending order
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      // console.log("the data are: " + results);
      res.json(results);
    }
  );
});

// Route to insert new expense data
app.post("/expense", (req, res) => {
  const { userId, category, title, amount, date, description } = req.body;

  if (!userId || !category || !title || !amount || !date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query =
    "INSERT INTO expense (user_id, category, title, amount, date, description) VALUES (?, ?, ?, ?, ?, ?)";
  const values = [userId, category, title, amount, date, description || ""];

  con.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: result.insertId, ...req.body });
  });
});

//DELETION WITH RECOVER
// Route to delete an expense by id and move it to the recover table
app.delete("/expense/:id", (req, res) => {
  const expenseId = req.params.id;

  if (!expenseId) {
    return res.status(400).json({ error: "Expense ID is required" });
  }
  // First, select the expense data before deleting
  const selectQuery = "SELECT * FROM expense WHERE id = ?";
  con.query(selectQuery, [expenseId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }

    const expenseData = result[0];

    // Insert the data into the recover table
    const insertQuery = `
      INSERT INTO recover (user_id, category, title, amount, date, description, created_at, parent)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'expense')
    `;
    const insertValues = [
      expenseData.user_id,
      expenseData.category,
      expenseData.title,
      expenseData.amount,
      expenseData.date,
      expenseData.description,
      expenseData.created_at,
    ];

    con.query(insertQuery, insertValues, (err, insertResult) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Now delete from the expense table
      const deleteQuery = "DELETE FROM expense WHERE id = ?";
      con.query(deleteQuery, [expenseId], (err, deleteResult) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({ message: "Expense deleted and moved to recover table" });
      });
    });
  });
});

//Display recover list
// Route to fetch all deleted records from recover table
app.get("/recover", (req, res) => {
  const query = "SELECT * FROM recover";
  // console.log(query);
  con.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // console.log(result);
    res.json(result);
  });
});

//permanently delete from recover table as well
// Route to permanently delete a record from recover table
app.delete("/recover/:id", (req, res) => {
  const recoverId = req.params.id;

  if (!recoverId) {
    return res.status(400).json({ error: "Recover ID is required" });
  }

  const deleteQuery = "DELETE FROM recover WHERE id = ?";
  con.query(deleteQuery, [recoverId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: "Record permanently deleted from recover table" });
  });
});

//recover bact to parent table
// Route to recover a record back to expense or income table
app.post("/recover/:id", (req, res) => {
  const recoverId = req.params.id;

  // First, select the record from recover table
  const selectQuery = "SELECT * FROM recover WHERE id = ?";
  con.query(selectQuery, [recoverId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const record = result[0];

    // Decide whether to insert into income or expense based on the 'parent' field
    const targetTable = record.parent === "expense" ? "expense" : "income";
    const insertQuery = `
      INSERT INTO ${targetTable} (user_id, category, title, amount, date, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const insertValues = [
      record.user_id,
      record.category,
      record.title,
      record.amount,
      record.date,
      record.description,
      record.created_at,
    ];

    // Insert into the appropriate table
    con.query(insertQuery, insertValues, (err, insertResult) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Now delete the record from the recover table
      const deleteQuery = "DELETE FROM recover WHERE id = ?";
      con.query(deleteQuery, [recoverId], (err, deleteResult) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({
          message: "Record recovered and removed from recover table",
        });
      });
    });
  });
});

//ORGINAL DELETE WITH NO RECOVER
// // Route to delete an expense by id
// app.delete("/expense/:id", (req, res) => {
//   const expenseId = req.params.id;

//   if (!expenseId) {
//     return res.status(400).json({ error: "Expense ID is required" });
//   }

//   const query = "DELETE FROM expense WHERE id = ?";
//   con.query(query, [expenseId], (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Expense not found" });
//     }

//     res.json({ message: "Expense deleted successfully" });
//   });
// });

//ALGORITHM

//1. TREND ANALYSIS ALGORITHM
app.get("/expenseoverview", (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  // Step 1: Find the latest month available in the data
  const latestMonthQuery = `
    SELECT MAX(DATE_FORMAT(date, '%Y-%m')) as latestMonth
    FROM expense
    WHERE user_id = ?
  `;

  con.query(latestMonthQuery, [userId], (err, latestMonthResult) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: err.message });
    }

    const latestMonth = latestMonthResult[0].latestMonth;

    if (!latestMonth) {
      return res.status(404).json({ error: "No expense data found" });
    }

    // Convert latestMonth to a Date object
    const latestDate = new Date(`${latestMonth}-01`);
    // Step 2: Calculate the previous two months
    const month1 = new Date(latestDate.setMonth(latestDate.getMonth() - 1));
    const month2 = new Date(latestDate.setMonth(latestDate.getMonth() - 1));

    const startMonth1 = month1.toISOString().slice(0, 7) + "-01";
    const endMonth1 = new Date(month1.getFullYear(), month1.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    const startMonth2 = month2.toISOString().slice(0, 7) + "-01";
    const endMonth2 = new Date(month2.getFullYear(), month2.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    // Step 3: Fetch data for the last two months
    const expenseQuery = `
      SELECT * FROM expense
      WHERE user_id = ?
      AND (
        (DATE(date) BETWEEN ? AND ?) OR
        (DATE(date) BETWEEN ? AND ?)
      )
      ORDER BY DATE(date) DESC
    `;

    con.query(
      expenseQuery,
      [userId, startMonth1, endMonth1, startMonth2, endMonth2],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: err.message });
        }

        const insights = {
          increasing: [],
          decreasing: [],
          stable: [],
        };

        const recommendations = {
          reallocateCategories: [],
        };

        const categorySums = {};
        const categoryMonths = {};

        // Aggregate expenses by category and month
        results.forEach((expense) => {
          const month = new Date(expense.date).getMonth(); // 0 = January, 11 = December
          const category = expense.category;

          if (!categorySums[category]) {
            categorySums[category] = {};
          }
          if (!categorySums[category][month]) {
            categorySums[category][month] = 0;
          }
          categorySums[category][month] += parseFloat(expense.amount);

          if (!categoryMonths[category]) {
            categoryMonths[category] = new Set();
          }
          categoryMonths[category].add(month);
        });

        // Define threshold for considering stable (e.g., 300 units difference)
        // const stableThreshold = 200;
        const stableThreshold = 0.15; //if increased or decreased by 15% relatively to previous month then
        //  it will say increasing or decreasing. but if the change is below 15% then it will say stable

        // Process the insights and recommendations
        Object.keys(categorySums).forEach((category) => {
          const months = Array.from(categoryMonths[category]);

          if (months.length === 2) {
            // Define indices based on sorted months array
            const month1Index = Math.min(...months); // Previous month
            const month2Index = Math.max(...months); // Latest month

            const month1 = categorySums[category][month1Index] || 0; // Previous month
            const month2 = categorySums[category][month2Index] || 0; // Latest month

            const diff = month2 - month1; // Calculate the difference (latest month - previous month)
            const avg = (month1 + month2) / 2;

            // Determine if the expense increased, decreased, or remained stable
            // if (Math.abs(diff) <= stableThreshold) {

            // const percentageChange = Math.abs((month2 - month1) / month1); this ight crash if month 1 is 0
            let percentageChange;

            if (month1 === 0) {
              // Special case: last month was $0
              if (month2 === 0) {
                percentageChange = 0; // 0% change (both $0)
              } else {
                percentageChange = 1; // 100% increase (from $0 to something)
              }
            } else {
              // Normal case
              percentageChange = Math.abs((month2 - month1) / month1);
            }
            if (percentageChange <= stableThreshold) {
              insights.stable.push({ category, amount: month2, avg });
            } else if (diff > 0) {
              // Positive diff means an increase
              const timesIncrease = month2 / month1;
              const percentageIncrease = ((month2 - month1) / month1) * 100;
              insights.increasing.push({
                category,
                difference: diff, // Positive difference for increase
                times: timesIncrease.toFixed(1),
                percentage: Math.round(percentageIncrease),
              });
            } else {
              // Negative diff means a decrease
              const timesDecrease = month1 / month2;
              const percentageDecrease = ((month1 - month2) / month1) * 100;
              insights.decreasing.push({
                category,
                difference: -diff, // Use negative difference to show a decrease
                times: timesDecrease.toFixed(1),
                percentage: Math.round(percentageDecrease),
              });
            }

            // Recommend reallocation based on the lower of the two months
            const recommendedAmount = Math.min(month1, month2);
            recommendations.reallocateCategories.push({
              category,
              recommendedAmount, // Use the lowest expense between the two months
            });
          }
        });

        res.json({ insights, recommendations });
      }
    );
  });
});

//2. SIMPLE LINEAR REGRESSION ALGORITHM
// Function to predict expenses for a given category
const predictExpense = (userId, category) => {
  return fetchUserExpenses(userId, category).then((expenses) => {
    // Get the current date
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Current month (1-12)
    const previousMonth1 = currentMonth - 1; // Previous month
    const previousMonth2 = currentMonth - 2; // Two months ago
    const previousMonth3 = currentMonth - 3; // Three months ago

    // Case 1: No prediction if category is disabled or no data in the last three months
    if (expenses.length === 0) {
      return { category, prediction: 0, message: "No data for prediction" };
    }

    // Extract amounts and corresponding months for regression
    const amounts = [];
    const months = [];
    let hasDataForCurrentMonth = false;
    let lastMonthWithData = null;

    expenses.forEach((expense) => {
      const monthNumber = new Date(expense.date).getMonth() + 1; // Extract month from date
      amounts.push(expense.amount);
      months.push(monthNumber);
      if (
        monthNumber === previousMonth1 ||
        monthNumber === previousMonth2 ||
        monthNumber === previousMonth3
      ) {
        lastMonthWithData = monthNumber;
      }
      if (monthNumber === previousMonth1) {
        hasDataForCurrentMonth = true;
      }
    });

    // If there's no data for the last month (previousMonth1), return no prediction
    if (!hasDataForCurrentMonth) {
      return { category, prediction: 0, message: "No Data Available" };
    }

    // Case 2: Only one month of data
    if (amounts.length === 1) {
      // Predict the same value for the next month
      return {
        category,
        prediction: amounts[0],
        message: "Insufficient data (same old value)",
      };
    }

    // Case 3: Two or more months of data, apply linear regression
    const regression = new SLR.SimpleLinearRegression(months, amounts);
    // const nextMonth = new Date().getMonth() + 2; // Predict for the next month but has potential isues
    const nextMonth = currentMonth + 1; // so adds new month to currentMonth giving january of next year and not 13, 14 months like above
    const predictedAmount = regression.predict(nextMonth);

    return {
      category,
      prediction: predictedAmount,
      message: "",
    };
  });
};

// Endpoint for predicting expenses based on categories
// Modified endpoint for predicting expenses based on fetched categories
app.post("/expensePredict", (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  // Fetch categories for the user and predict expenses
  fetchDistinctCategories(userId)
    .then((categories) => {
      // Predict for each category
      const predictions = categories.map((category) =>
        predictExpense(userId, category)
      );

      // Wait for all predictions to complete
      Promise.all(predictions)
        .then((results) => res.json({ predictions: results }))
        .catch((error) =>
          res
            .status(500)
            .json({ error: "Error in prediction: " + error.message })
        );
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "Error fetching categories: " + error.message });
    });
});

app.get("/totals", (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  // Query to get the latest month and year for the income and expense data
  const getLastMonthYearQuery = `
    SELECT 
      MAX(YEAR(date)) AS year, 
      MAX(MONTH(date)) AS month 
    FROM 
      (
        SELECT date FROM income WHERE user_id = ? 
        UNION 
        SELECT date FROM expense WHERE user_id = ?
      ) AS all_dates
  `;

  // Get total income and expenses for the latest month
  const getTotalsQuery = `
    SELECT 
      COALESCE(SUM(amount), 0) AS total, 'income' AS type 
    FROM income 
    WHERE user_id = ? AND YEAR(date) = ? AND MONTH(date) = ? 
    UNION 
    SELECT 
      COALESCE(SUM(amount), 0) AS total, 'expense' AS type 
    FROM expense 
    WHERE user_id = ? AND YEAR(date) = ? AND MONTH(date) = ?
  `;

  con.query(getLastMonthYearQuery, [userId, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const latestYear = results[0]?.year;
    const latestMonth = results[0]?.month;

    if (!latestYear || !latestMonth) {
      return res.json({ income: 0, expense: 0 });
    }

    con.query(
      getTotalsQuery,
      [userId, latestYear, latestMonth, userId, latestYear, latestMonth],
      (err, totals) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        let income = 0;
        let expense = 0;

        totals.forEach((item) => {
          if (item.type === "income") {
            income = item.total;
          } else if (item.type === "expense") {
            expense = item.total;
          }
        });

        const savings = income - expense;
        res.json({ income, expense });
      }
    );
  });
});

//Total income of latest month
app.get("/total-income", (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  // Query to get the latest month and year for income data
  const getLastMonthYearQuery = `
    SELECT 
      MAX(YEAR(date)) AS year, 
      MAX(MONTH(date)) AS month 
    FROM income 
    WHERE user_id = ?
  `;

  // Get total income for the latest month
  const getTotalIncomeQuery = `
    SELECT 
      COALESCE(SUM(amount), 0) AS total_income 
    FROM income 
    WHERE user_id = ? AND YEAR(date) = ? AND MONTH(date) = ?
  `;

  con.query(getLastMonthYearQuery, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const latestYear = results[0]?.year;
    const latestMonth = results[0]?.month;

    if (!latestYear || !latestMonth) {
      return res.json({ total_income: 0 });
    }

    con.query(
      getTotalIncomeQuery,
      [userId, latestYear, latestMonth],
      (err, incomeResult) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        const totalIncome = incomeResult[0]?.total_income || 0;
        res.json({ total_income: totalIncome });
      }
    );
  });
});

//Total expense of latest month
app.get("/total-expense", (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  // Query to get the latest month and year for expense data
  const getLastMonthYearQuery = `
    SELECT 
      MAX(YEAR(date)) AS year, 
      MAX(MONTH(date)) AS month 
    FROM expense 
    WHERE user_id = ?
  `;

  // Get total expenses for the latest month
  const getTotalExpenseQuery = `
    SELECT 
      COALESCE(SUM(amount), 0) AS total_expense 
    FROM expense 
    WHERE user_id = ? AND YEAR(date) = ? AND MONTH(date) = ?
  `;

  con.query(getLastMonthYearQuery, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const latestYear = results[0]?.year;
    const latestMonth = results[0]?.month;

    // console.log(latestMonth);  trying to see if displays latest month

    if (!latestYear || !latestMonth) {
      return res.json({ total_expense: 0 });
    }

    con.query(
      getTotalExpenseQuery,
      [userId, latestYear, latestMonth],
      (err, expenseResult) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        const totalExpense = expenseResult[0]?.total_expense || 0;
        // console.log(totalExpense);  trying to see what data it is sending to frontend
        res.json({ total_expense: totalExpense });
        // console.log(totalExpense);  trying to see what data it is sending to frontend
      }
    );
  });
});

//get previous month's savings
// Route to calculate savings for the previous month of the latest month
app.get("/savings", (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  // Step 1: Find the latest date from the 'date' column in both income and expense tables
  const getLatestMonthQuery = `
    SELECT MAX(YEAR(date)) AS year, MAX(MONTH(date)) AS month
    FROM (
      SELECT date FROM income WHERE user_id = ?
      UNION
      SELECT date FROM expense WHERE user_id = ?
    ) AS combined`;

  // console.log("Executing getLatestMonthQuery:", getLatestMonthQuery);

  con.query(getLatestMonthQuery, [userId, userId], (err, latestMonthResult) => {
    if (err) {
      console.error("Error executing getLatestMonthQuery:", err);
      return res.status(500).json({ error: err.message });
    }

    // console.log("Latest Month Result:", latestMonthResult);

    // Step 2: Calculate the previous month from the latest month
    let { year, month } = latestMonthResult[0];
    if (!year || !month) {
      console.log("No data available for income or expense.");
      return res.json({ message: "No data available for income or expense." });
    }

    if (month === 1) {
      year -= 1;
      month = 12;
    } else {
      month -= 1;
    }

    // console.log(`Previous month calculated as Year: ${year}, Month: ${month}`);

    // Step 3: Calculate total income for the previous month using the 'date' column
    const incomeQuery = `
      SELECT * 
      FROM income 
      WHERE user_id = ? AND YEAR(date) = ? AND MONTH(date) = ?`;
    // console.log("Executing incomeQuery:", incomeQuery);

    con.query(incomeQuery, [userId, year, month], (err, incomeRows) => {
      if (err) {
        console.error("Error executing incomeQuery:", err);
        return res.status(500).json({ error: err.message });
      }

      const totalIncome = incomeRows.reduce(
        (acc, row) => acc + parseFloat(row.amount),
        0
      );
      // console.log("Income Rows:", incomeRows);
      // console.log("Total Income:", totalIncome);

      // Step 4: Calculate total expense for the previous month using the 'date' column
      const expenseQuery = `
        SELECT * 
        FROM expense 
        WHERE user_id = ? AND YEAR(date) = ? AND MONTH(date) = ?`;
      // console.log("Executing expenseQuery:", expenseQuery);

      con.query(expenseQuery, [userId, year, month], (err, expenseRows) => {
        if (err) {
          console.error("Error executing expenseQuery:", err);
          return res.status(500).json({ error: err.message });
        }

        const totalExpense = expenseRows.reduce(
          (acc, row) => acc + parseFloat(row.amount),
          0
        );
        // console.log("Expense Rows:", expenseRows);
        // console.log("Total Expense:", totalExpense);

        // Step 5: Calculate savings and send response
        const savings = totalIncome - totalExpense;
        // console.log(
        //   `Calculated Savings for Year: ${year}, Month: ${month} is Rs. ${savings}`
        // );
        res.json({ savings, month, year });
      });
    });
  });
});

app.get("/getUser", (req, res) => {
  // const sql = "SELECT * FROM user";
  const sql = "SELECT * FROM user";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Error: "Get user error in sql" });
    return res.json({ Status: "Success", Result: result });
  });
});

app.get("/get/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM user where id =?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Error: "Get user error in sql" });
    return res.json({ Status: "Success", Result: result });
  });
});

app.get("/user/:id", (req, res) => {
  const userId = req.params.id;

  // Validate userId to ensure it's a number
  if (!Number.isInteger(parseInt(userId))) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  con.query("SELECT * FROM user WHERE id = ?", [userId], (err, result) => {
    if (err) {
      console.error("Database query error:", err); // Log the error for debugging
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result[0]);
  });
});

// app.get("/user/:id", (req, res) => {
//   const userId = req.params.id;
//   con.query("SELECT * FROM users WHERE id = ?", [userId], (err, result) => {
//     if (err) {
//       return res.status(500).send(err);
//     }
//     res.json(result[0]);
//   });
// });

//latest code for admin
app.get("/getAdmin/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM admin where id =?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Error: "Get admin error in SQL" });
    return res.json({ Status: "Success", Result: result });
  });
});

// old Function to hash a password
// const hashPassword = (password) => {
//   return bcrypt.hashSync(password, 10);
// };

// new function
const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM user WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Error: "Delete user error in sql" });
    return res.json({ Status: "Success" });
  });
});

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ Error: "You are not authorized" });
  } else {
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
      if (err) return res.json({ Error: "Token wrong" });
      req.role = decoded.role;
      req.id = decoded.id;
      next();
    });
  }
};

app.get("/dashboard", verifyUser, (req, res) => {
  if (req.role === "admin") {
    const sql = "SELECT name, image, email FROM admin WHERE id = ?"; // Include the email column
    con.query(sql, [req.id], (err, result) => {
      if (err) return res.json({ Error: "Error in running query" });

      const admin = result[0];
      return res.json({
        Status: "Success",
        role: req.role,
        id: req.id,
        name: admin.name,
        image: admin.image,
        // image: `http://localhost:4000/admin_image/${admin.image}`, // Include the image path
        email: admin.email, // Include the email
      });
    });
  } else {
    return res.json({ Status: "Success", role: req.role, id: req.id });
  }
});

app.get("/adminCount", (req, res) => {
  const sql = "SELECT count(id) as admin from admin";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Error: "Error in running query" });
    return res.json(result);
  });
});

app.get("/userCount", (req, res) => {
  const sql = "SELECT count(id) as user from user";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Error: "Error in running query" });
    return res.json(result);
  });
});

app.get("/userReqCount", (req, res) => {
  const sql =
    "SELECT count(id) as user_req from user_requests WHERE status = 'pending'";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Error: "Error in running query" });
    // console.log(result);
    return res.json(result);
  });
  // console.log(res.json(result));
});

app.post("/login", (req, res) => {
  // Check if email and password are provided
  if (!req.body.email || !req.body.password) {
    return res.json({
      Status: "Error",
      Error: "Please fill both fields.",
    });
  }

  // Check if email exists
  const sqlEmailCheck = "SELECT * FROM admin WHERE email = ?";
  con.query(sqlEmailCheck, [req.body.email], (err, result) => {
    if (err)
      return res.json({ Status: "Error", Error: "Error in running query" });

    if (result.length === 0) {
      return res.json({ Status: "Error", Error: "Email does not exist" });
    }

    // Check if password matches
    const sqlPasswordCheck =
      "SELECT * FROM admin WHERE email = ? AND password = ?";
    con.query(
      sqlPasswordCheck,
      [req.body.email, req.body.password],
      (err, result) => {
        if (err)
          return res.json({ Status: "Error", Error: "Error in running query" });

        if (result.length > 0) {
          const id = result[0].id;
          // const token = jwt.sign({ role: "admin" }, "jwt-secret-key", {
          //   expiresIn: "1d",
          // });
          const token = jwt.sign(
            { role: "admin", id: result[0].id },
            "jwt-secret-key",
            {
              expiresIn: "1d",
            }
          );

          res.cookie("token", token);
          return res.json({ Status: "Success", token: token });
        } else {
          return res.json({ Status: "Error", Error: "Incorrect Password" });
        }
      }
    );
  });
});

app.post("/userlogin", (req, res) => {
  // Check if email and password are provided
  if (!req.body.email || !req.body.password) {
    return res.json({
      Status: "Error",
      Error: "Please fill both fields.",
    });
  }

  // Check if email exists
  const sqlEmailCheck = "SELECT * FROM user WHERE email = ?";
  con.query(sqlEmailCheck, [req.body.email], (err, result) => {
    if (err)
      return res.json({ Status: "Error", Error: "Error in running query" });

    if (result.length === 0) {
      return res.json({ Status: "Error", Error: "Email does not exist." });
    }

    // Compare the password using bcrypt
    bcrypt.compare(
      req.body.password.toString(),
      result[0].password,
      (err, response) => {
        if (err) return res.json({ Error: "Password error" });
        if (response) {
          const token = jwt.sign(
            { role: "user", id: result[0].id },
            "jwt-secret-key",
            { expiresIn: "1d" }
          );
          // Include the token in the JSON response
          return res.json({
            Status: "Success",
            token: token,
            id: result[0].id,
          });
        } else {
          return res.json({ Status: "Error", Error: "Incorrect Password." });
        }
      }
    );
  });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: "Success" });
});

// app.get("/userlogout", (req, res) => {
//   res.clearCookie("user_token");
//   return res.json({ Status: "Success" });
// });

/////
/////
/////
/////
/////
/////
/////
/////
/////
/////
/////
/////
/////
/////
/////
/////
/////
//user registration

// Endpoint for users to submit a registration request
app.post("/userRequest", upload.single("image"), (req, res) => {
  console.log("Request Body:", req.body); // Logs the form data (name, email, etc.)
  console.log("Uploaded File:", req.file); // Logs the file information

  // Check if email already exists in the user table
  const checkEmailSql = "SELECT * FROM user WHERE email = ?";
  con.query(checkEmailSql, [req.body.email], (err, result) => {
    if (err) {
      console.log(err); // Logs any database error
      return res.json({ Error: "Error checking email" });
    }
    if (result.length > 0) {
      // If email is found in the user table, return an error
      return res.json({ Error: "Email is taken. Try another." });
    }

    // If email is not found, proceed with registration
    const sql =
      "INSERT INTO user_requests (`name`, `email`, `password`, `image` ) VALUES (?)";
    bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
      if (err) {
        console.log(err); // Logs the hashing error
        return res.json({ Error: "Error in hashing password" });
      }
      const values = [req.body.name, req.body.email, hash, req.file.filename];
      con.query(sql, [values], (err, result) => {
        if (err) {
          console.log(err); // Logs any error inside the query
          return res.json({ Error: "Inside signup query" });
        }
        return res.json({ Status: "Success" });
      });
    });
  });
});

//changed from getUserRequests
app.get("/getUserRequests", (req, res) => {
  const sql = "SELECT * FROM user_requests WHERE status = 'pending'";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Error: "Get user requests error in sql" });
    return res.json({ Status: "Success", Result: result });
  });
});

//changed from acceptUserRequest
app.post("/acceptUserRequest/:id", (req, res) => {
  const id = req.params.id;
  const sqlUpdateStatus =
    "UPDATE user_requests SET status = 'accepted' WHERE id = ?";
  const sqlGet = "SELECT * FROM user_requests WHERE id = ?";
  const sqlInsert =
    "INSERT INTO user (`name`, `email`, `password`, `image` ) VALUES (?)";

  con.query(sqlGet, [id], (err, result) => {
    if (err) return res.json({ Error: "Error in getting request" });
    const values = [
      result[0].name,
      result[0].email,
      result[0].password,
      result[0].image,
    ];
    con.query(sqlInsert, [values], (err, result) => {
      if (err) return res.json({ Error: "Error in inserting user" });
      con.query(sqlUpdateStatus, [id], (err, result) => {
        if (err) return res.json({ Error: "Error in updating request status" });
        return res.json({ Status: "Success" });
      });
    });
  });
});

//changed from rejectUserRequest
app.post("/rejectUserRequest/:id", (req, res) => {
  const id = req.params.id;
  const sql = "UPDATE user_requests SET status = 'rejected' WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Error: "Error in rejecting request" });
    return res.json({ Status: "Success" });
  });
});

app.get("/seeUserStatus/:email", (req, res) => {
  const email = req.params.email;
  const sqlGetFromRequests = "SELECT * FROM user_requests WHERE email = ?";
  const sqlGetFromUsers = "SELECT * FROM user WHERE email = ?";

  // Check the user_requests table
  con.query(sqlGetFromRequests, [email], (err, result) => {
    if (err)
      return res.json({
        Error: "Error in getting request from user_requests",
      });

    // If found in user_requests, return the status
    if (result.length > 0) {
      return res.json({ Status: "Success", Result: result[0].status });
    } else {
      // If not found in user_requests, check the user table
      con.query(sqlGetFromUsers, [email], (err, result) => {
        if (err)
          return res.json({
            Error: "Error in getting request from user",
          });

        // If found in user, return "accepted"
        if (result.length > 0) {
          return res.json({ Status: "Success", Result: "accepted" });
        } else {
          // If not found in either table, return "You are not registered."
          return res.json({
            Status: "Success",
            Result: "unregistered. Register first",
          });
        }
      });
    }
  });
});

app.post("/deleteUserRequest/:email", (req, res) => {
  const email = req.params.email;
  const sql = "DELETE FROM user_requests WHERE email = ?";
  con.query(sql, [email], (err, result) => {
    if (err) return res.json({ Error: "Error in deleting request" });
    return res.json({ Status: "Success" });
  });
});

app.listen(4000, () => {
  console.log("Running on 4000");
});
