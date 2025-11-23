import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { TrendingDown, Trash2, Plus } from "lucide-react";

function Expense() {
  const { id: userId } = useParams();
  const [expenseList, setExpenseList] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 5);
  const maxDate = new Date(today);
  const [newExpense, setNewExpense] = useState({
    category: "",
    title: "",
    amount: "",
    date: "",
    description: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    axios
      .get(`http://localhost:4000/expense?userId=${userId}`)
      .then((res) => setExpenseList(res.data))
      .catch((err) => console.log(err));
  }, [userId]);

  useEffect(() => {
    axios
      .get(`http://localhost:4000/total-expense?userId=${userId}`)
      .then((res) => setTotalExpense(res.data.total_expense))
      .catch((err) => console.log(err));
  }, [userId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!newExpense.category) {
      errors.category = "Category is required.";
    }

    const titlePattern = /^[A-Za-z\s]+$/;
    if (!newExpense.title) {
      errors.title = "Title is required.";
    } else if (!titlePattern.test(newExpense.title)) {
      errors.title = "Title must contain only letters.";
    }

    if (!newExpense.amount) {
      errors.amount = "Amount is required.";
    } else if (isNaN(newExpense.amount)) {
      errors.amount = "Amount must be a valid number.";
    }

    if (!newExpense.date) {
      errors.date = "Date is required.";
    }

    if (!newExpense.description) {
      errors.description = "Description is required.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setTimeout(() => setValidationErrors(""), 3000);
      return;
    }

    setValidationErrors({});

    axios
      .post("http://localhost:4000/expense", { ...newExpense, userId })
      .then((res) => {
        setExpenseList([res.data, ...expenseList]);
        setNewExpense({
          category: "",
          title: "",
          amount: "",
          date: "",
          description: "",
        });
      })
      .catch((err) => console.log(err));
  };

  const handleDelete = (expenseId) => {
    Swal.fire({
      title: "Delete?",
      text: "Do you really want to delete this expense?",
      showCancelButton: true,
      confirmButtonColor: "#0284c7",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:4000/expense/${expenseId}`)
          .then((res) => {
            Swal.fire("Deleted!", "The expense has been deleted.", "success");
            setExpenseList(
              expenseList.filter((expense) => expense.id !== expenseId)
            );
          })
          .catch((err) => {
            Swal.fire(
              "Error!",
              "Something went wrong. Please try again.",
              "error"
            );
            console.log(err);
          });
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="font-geist text-2xl leading-3 font-semibold text-gray-700">
          Expense
        </p>
        <p className="text-gray-600 mt-1">Manage your expense records</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Column */}
        <div className="space-y-6">
          {/* Total Expense Card */}
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
                  Total Expense
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  Rs. {totalExpense || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-sky-600" />
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <select
                  value={newExpense.category}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  <option value="Institutional">Institutional</option>
                  <option value="Rent">Rent</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Transportation">Transport</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
                {validationErrors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.category}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Expense Title"
                  value={newExpense.title}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
                />
                {validationErrors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.title}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="number"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
                />
                {validationErrors.amount && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.amount}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
                  min={minDate.toISOString().split("T")[0]}
                  max={maxDate.toISOString().split("T")[0]}
                />
                {validationErrors.date && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.date}
                  </p>
                )}
              </div>

              <div>
                <textarea
                  placeholder="Description"
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, description: e.target.value })
                  }
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
                />
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.description}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md"
              >
                <Plus className="h-4 w-4" />
                Add Expense
              </button>
            </form>
          </div>
        </div>

        {/* History Column */}
        <div>
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <p className="font-geist text-lg font-semibold text-gray-900 mb-4">
              Expense History
            </p>
            {expenseList.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <TrendingDown className="h-12 w-12 mb-3" />
                  <p className="text-sm">No expense data inserted.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {expenseList.map((expense, index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-900">
                        {expense.title}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        Rs. {expense.amount}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
                      <span>Category: {expense.category}</span>
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {expense.description}
                    </p>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 border border-red-500 hover:bg-red-100 rounded-md"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Expense;
