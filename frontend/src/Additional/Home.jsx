import axios from "axios";
import React, { useState, useEffect } from "react";
import { Users, UserCheck, Clock } from "lucide-react";

function Home() {
  const [adminCount, setAdminCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [userReqCount, setUserReqCount] = useState(0);

  useEffect(() => {
    axios
      .get("http://localhost:4000/adminCount")
      .then((res) => {
        setAdminCount(res.data[0].admin);
      })
      .catch((err) => console.log(err));

    axios
      .get("http://localhost:4000/userReqCount")
      .then((res) => {
        setUserReqCount(res.data[0].user_req);
      })
      .catch((err) => console.log(err));

    axios
      .get("http://localhost:4000/userCount")
      .then((res) => {
        setUserCount(res.data[0].user);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
      <p className="font-geist text-2xl leading-3 font-semibold text-gray-700 mb-3">
          Welcome, Admin!
        </p>
        <p className="text-gray-600">
          Manage your organization efficiently by tracking users and handling new registrations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Admin Card */}
        <div className="bg-white border border-gray-100 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-sky-600" />
            </div>
          </div>
          <p className="font-geist text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">
            Admin
          </p>
          <p className="text-5xl font-bold text-gray-700">{adminCount || 0}</p>
        </div>

        {/* User Card */}
        <div className="bg-white border border-gray-100 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-sky-600" />
            </div>
          </div>
          <p className="font-geist text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">
            User
          </p>
          <p className="text-5xl font-bold text-gray-700">{userCount || 0}</p>
        </div>

        {/* User Requests Card */}
        <div className="bg-white border border-gray-100 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-sky-600" />
            </div>
          </div>
          <p className="font-geist text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">
            User Requests
          </p>
          <p className="text-5xl font-bold text-gray-700">{userReqCount || 0}</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
