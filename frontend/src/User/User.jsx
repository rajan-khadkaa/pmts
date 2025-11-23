import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Trash2, Search, Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";

function User() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Name");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:4000/getUser")
      .then((res) => {
        if (res.data.Status === "Success") {
          setData(res.data.Result);
        } else {
          Swal.fire({
            title: "Error",
            text: "Something went wrong!",
            icon: "error",
            position: "center",
          });
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    setIsFilterOpen(false);
  };

  const filteredData = data.filter((employee) => {
    if (selectedFilter === "Filter") return true;
    return employee[selectedFilter.toLowerCase()]
      .toLowerCase()
      .startsWith(searchTerm.toLowerCase());
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the user record.",
      showCancelButton: true,
      confirmButtonColor: "#0284c7",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete("http://localhost:4000/delete/" + id)
          .then((res) => {
            if (res.data.Status === "Success") {
              Swal.fire("Deleted!", "The user has been deleted.", "success");
              setData(data.filter((employee) => employee.id !== id));
            } else {
              Swal.fire({
                title: "Error",
                text: "Something went wrong!",
                position: "center",
              });
            }
          })
          .catch((err) => console.log(err));
      }
    });
  };

  const exportToExcel = () => {
    const excelData = data.map((employee, index) => ({
      "S.N": index + 1,
      Name: employee.name,
      Email: employee.email,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "User List");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveExcelFile(excelBuffer, "UserList.xlsx");
    setIsExportOpen(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["S.N", "Name", "Email"];
    const tableRows = [];

    data.forEach((employee, index) => {
      const employeeData = [index + 1, employee.name, employee.email];
      tableRows.push(employeeData);
    });

    autoTable(doc, {
      startY: 20,
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("UserList.pdf");
    setIsExportOpen(false);
  };

  const saveExcelFile = (buffer, fileName) => {
    const data = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(data);
    link.download = fileName;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="font-geist text-2xl leading-3 font-semibold text-gray-700">
          Users List
        </p>
        <p className="text-gray-600">Manage and view all registered users</p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md"
          >
            <Download className="h-4 w-4" />
            Export
            <ChevronDown className="h-4 w-4" />
          </button>
          {isExportOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsExportOpen(false)}
              />
              <div className="absolute top-full mt-2 w-48 bg-white border border-gray-100 rounded-lg z-20">
                <button
                  onClick={exportToExcel}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </button>
                <button
                  onClick={exportToPDF}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  PDF file
                </button>
              </div>
            </>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 sm:justify-end">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md"
            >
              {selectedFilter}
              <ChevronDown className="h-4 w-4" />
            </button>
            {isFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsFilterOpen(false)}
                />
                <div className="absolute top-full mt-2 w-32 bg-white border border-gray-100 rounded-lg z-20">
                  <button
                    onClick={() => handleFilterSelect("Name")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Name
                  </button>
                  <button
                    onClick={() => handleFilterSelect("Email")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Email
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search users`}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Profile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredData.length === 0 ? (
                <>
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Search className="h-12 w-12 mb-3" />
                        <p className="text-sm">No results found</p>
                      </div>
                    </td>
                  </tr>
                </>
              ) : (
                filteredData.map((employee, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <img
                        src={`http://localhost:4000/images/${employee.image}`}
                        alt={employee.name}
                        className="h-10 w-10 rounded-full object-cover border-2 border-gray-100"
                      />
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.name}
                      </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{employee.email}</div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 border border-red-500 hover:bg-red-100 rounded-md"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default User;
