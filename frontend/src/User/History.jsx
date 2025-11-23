import React, { useState, useEffect } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { RotateCcw, Trash2, Archive } from "lucide-react";

function History() {
  const [deletedRecords, setDeletedRecords] = useState([]);

  useEffect(() => {
    const token = Cookies.get("user_token");
    const decodedToken = jwt_decode(token);
    const loggedInUserId = decodedToken.id;

    axios
      .get("http://localhost:4000/recover")
      .then((response) => {
        const filteredRecords = response.data.filter(
          (record) => record.user_id === loggedInUserId
        );
        setDeletedRecords(filteredRecords);
      })
      .catch((error) =>
        console.error("Error fetching deleted records:", error)
      );
  }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete?",
      text: "Do you really want to delete this record permanently?",
      showCancelButton: true,
      confirmButtonColor: "#0284c7",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:4000/recover/${id}`)
          .then(() => {
            Swal.fire(
              "Deleted!",
              "The record has been deleted permanently.",
              "success"
            );
            setDeletedRecords((prevRecords) =>
              prevRecords.filter((record) => record.id !== id)
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

  const handleRecover = (id) => {
    axios
      .post(`http://localhost:4000/recover/${id}`)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Data Recovered",
          text: "The record has been successfully recovered!",
        });
        setDeletedRecords((prevRecords) =>
          prevRecords.filter((record) => record.id !== id)
        );
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong. Please try again.",
        });
        console.error("Error recovering record:", error);
      });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA");
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="font-geist text-2xl leading-3 font-semibold text-gray-700">
          Deleted Records
        </p>
        <p className="text-gray-600 mt-1">Recover or permanently delete your deleted records</p>
      </div>

      {/* Table */}
      {deletedRecords.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-lg p-12 text-center">
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Archive className="h-12 w-12 mb-3" />
            <p className="text-sm">No deleted records found.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {deletedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Rs. {record.amount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {formatDate(record.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{record.parent}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRecover(record.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 border border-green-600 hover:bg-green-50 rounded-md"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Recover
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 border border-red-500 hover:bg-red-100 rounded-md"
                        >
                          <Trash2 className="h-4 w-4" />
                          Permanent Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
