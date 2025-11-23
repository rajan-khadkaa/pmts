import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { TrendingUp, Trash2, Plus } from "lucide-react";

function Income() {
  const { id: userId } = useParams();
  const [incomeList, setIncomeList] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 5);
  const maxDate = new Date(today);
  const [newIncome, setNewIncome] = useState({
    category: "",
    title: "",
    amount: "",
    date: "",
    description: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    axios
      .get(`http://localhost:4000/income?userId=${userId}`)
      .then((res) => setIncomeList(res.data))
      .catch((err) => console.log(err));
  }, [userId]);

  useEffect(() => {
    axios
      .get(`http://localhost:4000/total-income?userId=${userId}`)
      .then((res) => setTotalIncome(res.data.total_income))
      .catch((err) => console.log(err));
  }, [userId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = {};

    if (!newIncome.category) {
      errors.category = "Category is required.";
    }

    const titlePattern = /^[A-Za-z\s]+$/;
    if (!newIncome.title) {
      errors.title = "Title is required.";
    } else if (!titlePattern.test(newIncome.title)) {
      errors.title = "Title must contain only letters.";
    }

    if (!newIncome.amount) {
      errors.amount = "Amount is required.";
    } else if (isNaN(newIncome.amount)) {
      errors.amount = "Amount must be a valid number.";
    }

    if (!newIncome.date) {
      errors.date = "Date is required.";
    }

    if (!newIncome.description) {
      errors.description = "Description is required.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setTimeout(() => setValidationErrors(""), 3000);
      return;
    }

    setValidationErrors({});

    axios
      .post("http://localhost:4000/income", { ...newIncome, userId })
      .then((res) => {
        setIncomeList([res.data, ...incomeList]);
        setNewIncome({
          category: "",
          title: "",
          amount: "",
          date: "",
          description: "",
        });
      })
      .catch((err) => console.log(err));
  };

  const handleDelete = (incomeId) => {
    Swal.fire({
      title: "Delete?",
      text: "Do you really want to delete this income?",
      showCancelButton: true,
      confirmButtonColor: "#0284c7",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:4000/income/${incomeId}`)
          .then((res) => {
            Swal.fire("Deleted!", "The income has been deleted.", "success");
            setIncomeList(incomeList.filter((income) => income.id !== incomeId));
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
      {/* <div className="mb-6">
        <p className="font-geist text-xl leading-3 font-semibold text-gray-700">
          Income
        </p>
        <p className="text-gray-600 mt-1">Manage your income records</p>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Column */}
        <div className="space-y-6">
          {/* Total Income Card */}
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-10">
                  Total Income
                </p>
                <p className="text-3xl leading-2 font-bold text-green-600">
                  Rs. {totalIncome || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
                {/* <TrendingUp className="h-6 w-6 text-sky-600" /> */}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <select
                  value={newIncome.category}
                  onChange={(e) =>
                    setNewIncome({ ...newIncome, category: e.target.value })
                  }
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  <option value="Salary">Salary</option>
                  <option value="Freelancing">Freelancing</option>
                  <option value="Rental Income">Rental Income</option>
                  <option value="Business Income">Business Income</option>
                  <option value="Interest Income">Interest Income</option>
                  <option value="Stock Income">Stock Income</option>
                  <option value="Social Security Income">
                    Social Security Income
                  </option>
                  <option value="Other">Other</option>
                </select>
                {validationErrors.category && (
                  <p className="mt-1 text-xs text-red-600">
                    {validationErrors.category}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Income Title"
                  value={newIncome.title}
                  onChange={(e) =>
                    setNewIncome({ ...newIncome, title: e.target.value })
                  }
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
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
                  value={newIncome.amount}
                  onChange={(e) =>
                    setNewIncome({ ...newIncome, amount: e.target.value })
                  }
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
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
                  value={newIncome.date}
                  onChange={(e) =>
                    setNewIncome({ ...newIncome, date: e.target.value })
                  }
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
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
                  value={newIncome.description}
                  onChange={(e) =>
                    setNewIncome({ ...newIncome, description: e.target.value })
                  }
                  rows="4"
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
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
                Add Income
              </button>
            </form>
          </div>
        </div>

        {/* History Column */}
        <div>
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <p className="font-geist text-lg font-semibold text-gray-900 mb-3">
              Income History
            </p>
            {incomeList.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <TrendingUp className="h-12 w-12 mb-3" />
                  <p className="text-sm">No income data inserted.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {incomeList.map((income, index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-900">{income.title}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        Rs. {income.amount}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
                      <span>Category: {income.category}</span>
                      <span>
                        {new Date(income.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-0">
                      {income.description}
                    </p>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(income.id)}
                        className="inline-flex items-center gap-2 py-2 px-2.5 text-sm font-medium text-red-500 border border-red-500 hover:bg-red-100 rounded-md"
                      >
                        <Trash2 className="h-4 w-4" />
                        {/* Delete */}
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

export default Income;
