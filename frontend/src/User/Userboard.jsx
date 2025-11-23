import React, { useState, useEffect } from "react";
import { Outlet, Link, useParams, useLocation } from "react-router-dom";
import jwt_decode from "jwt-decode";
import Cookies from "js-cookie";
import axios from "axios";
import Swal from "sweetalert2";
import { LayoutDashboard, TrendingUp, TrendingDown, Trash2, LogOut } from "lucide-react";

function Userboard() {
  const { id } = useParams();
  const location = useLocation();
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const token = Cookies.get("user_token");
    if (token) {
      const decodedToken = jwt_decode(token);
      const userId = decodedToken.id;

      if (userId.toString() === id) {
        axios
          .get(`http://localhost:4000/user/${userId}`)
          .then((res) => setUserData(res.data))
          .catch((err) => console.log(err));
      }
    }
  }, [id]);

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
        Cookies.remove("user_token");
        window.location.href = "/";
      }
    });
  };

  const isActive = (path) => {
    if (path === `/userboard/${id}`) {
      return location.pathname === `/userboard/${id}` && location.pathname !== `/userboard/${id}/income` && location.pathname !== `/userboard/${id}/expense` && location.pathname !== `/userboard/${id}/history`;
    }
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col">
        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src={
                userData.image
                  ? `http://localhost:4000/images/${userData.image}`
                  : `http://localhost:4000/images/default-profile.png`
              }
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-sky-600"
            />
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {userData.name || "User"}
              </p>
              <p className="text-xs text-gray-500">{userData.email || ""}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to={`/userboard/${id}`}
            style={{ textDecoration: "none" }}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-md transition-colors ${
              isActive(`/userboard/${id}`)
                ? "bg-sky-50 text-sky-600 border-l-4 border-sky-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            to={`/userboard/${id}/income`}
            style={{ textDecoration: "none" }}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-md transition-colors ${
              isActive(`/userboard/${id}/income`)
                ? "bg-sky-50 text-sky-600 border-l-4 border-sky-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">Income</span>
          </Link>

          <Link
            to={`/userboard/${id}/expense`}
            style={{ textDecoration: "none" }}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-md transition-colors ${
              isActive(`/userboard/${id}/expense`)
                ? "bg-sky-50 text-sky-600 border-l-4 border-sky-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <TrendingDown className="h-4 w-4" />
            <span className="font-medium">Expense</span>
          </Link>

          <Link
            to={`/userboard/${id}/history`}
            style={{ textDecoration: "none" }}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-md transition-colors ${
              isActive(`/userboard/${id}/history`)
                ? "bg-sky-50 text-sky-600 border-l-4 border-sky-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Trash2 className="h-4 w-4" />
            <span className="font-medium">History Bin</span>
          </Link>
        </nav>

        {/* Logout Button */}
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
        <header className="bg-white border-b border-gray-100 px-3 pt-4 pb-2 ">
          <p className="font-geist text-xl leading-0 text-sky-600 font-semibold">PMTS</p>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Userboard;
