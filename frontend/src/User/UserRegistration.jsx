import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Search, User } from "lucide-react";

function UserRegistration() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:4000/getUserRequests", {
        withCredentials: true,
      })
      .then((response) => {
        setData(response.data.Result);
      })
      .catch((error) => {
        console.error(`Error fetching data: ${error}`);
      });
  }, []);

  const handleAccept = (id) => {
    axios
      .post(`http://localhost:4000/acceptUserRequest/${id}`)
      .then((response) => {
        setData(data.filter((request) => request.id !== id));
      })
      .catch((error) => {
        console.error(`Error accepting request: ${error}`);
      });
  };

  const handleReject = (id) => {
    axios
      .post(`http://localhost:4000/rejectUserRequest/${id}`)
      .then((response) => {
        setData(data.filter((request) => request.id !== id));
      })
      .catch((error) => {
        console.error(`Error rejecting request: ${error}`);
      });
  };

  const filteredData = data.filter((employeeRequest) =>
    employeeRequest.name.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="font-geist text-2xl leading-3 font-semibold text-gray-700">
          User Registration
        </p>
        <p className="text-gray-600 mt-1">Manage user registration requests</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex justify-end">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search registration"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
          />
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
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <User className="h-12 w-12 mb-3" />
                      <p className="text-sm">No registration requests found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((employeeRequest, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <img
                        src={`http://localhost:4000/images/${employeeRequest.image}`}
                        alt={employeeRequest.name}
                        className="h-10 w-10 rounded-full object-cover border-2 border-gray-100"
                      />
                    </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {employeeRequest.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {employeeRequest.email}
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAccept(employeeRequest.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 border border-green-600 hover:bg-green-100 rounded-md"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(employeeRequest.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-500 border border-red-500 hover:bg-red-100 rounded-md"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
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

export default UserRegistration;
