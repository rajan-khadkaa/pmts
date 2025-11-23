import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { LayoutDashboard, Users, UserPlus, LogOut } from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminDetails, setAdminDetails] = useState(null);
  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios
      .get("http://localhost:4000/dashboard", { withCredentials: true })
      .then((res) => {
        if (res.data.Status === "Success") {
          if (res.data.role !== "admin") {
            navigate("/dashboard");
          } else {
            setAdminDetails(res.data);
          }
        } else {
          navigate("/");
        }
      });
  }, [navigate]);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout",
      text: "Do you really want to log out?",
      showCancelButton: true,
      confirmButtonColor: "#0284c7",
      cancelButtonColor: "#d33",
      confirmButtonText: "Logout",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .get("http://localhost:4000/logout")
          .then((res) => {
            navigate("/");
          })
          .catch((err) => console.log(err));
      }
    });
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <span className="font-geist text-xl font-semibold text-sky-600">
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
          style={{ textDecoration: 'none' }}
            to="/dashboard"
            className={`flex items-center gap-2 px-3 py-2.5 rounded-md transition-colors underline ${
              isActive("/dashboard") && location.pathname === "/dashboard"
                ? "bg-sky-50 text-sky-600 border-l-4 border-sky-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
          style={{ textDecoration: 'none' }}
            to="/dashboard/user"
            className={`flex items-center gap-2 px-3 py-2.5 rounded-md transition-colors no-underline ${
              isActive("/dashboard/user")
                ? "bg-sky-50 text-sky-600 border-l-4 border-sky-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Users className="h-4 w-4" />
            <span className="font-medium">Users</span>
          </Link>

          <Link
          style={{ textDecoration: 'none' }}
            to="/dashboard/userregistration"
              className={`flex items-center gap-2 px-3 py-2.5 rounded-md transition-colors no-underline ${
              isActive("/dashboard/userregistration")
                ? "bg-sky-50 text-sky-600 border-l-4 border-sky-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span className="font-medium">Registration</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md border border-red-600 text-red-700 hover:bg-red-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-base font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="font-geist text-xl text-sky-600 font-semibold">
              PMTS
            </p>
            {adminDetails && (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1">
                <img
                  src={`http://localhost:4000/admin_image/${adminDetails.image}`}
                  alt="Admin Profile"
                  className="w-9 h-9 rounded-full border-2 border-sky-600 object-cover"
                />
                <div className="text-left flex-col p-2">
                  <p className="leading-2 mt-2 font-medium text-gray-900">
                    {adminDetails.name}
                  </p>
                  <p className="text-sm leading-0 text-gray-500">{adminDetails.email}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
