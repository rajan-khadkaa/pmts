import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowRight, X, CheckCircle, XCircle, Clock } from "lucide-react";

function RegistrationInfo() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  const handleCheckStatus = () => {
    if (!email) {
      alert("Please enter your email address.");
      return;
    }
    axios
      .get(`http://localhost:4000/seeUserStatus/${email}`)
      .then((response) => {
        setStatus(response.data.Result);
      })
      .catch((error) => {
        console.error(`Error fetching status: ${error}`);
        alert("Error checking status. Please try again.");
      });
  };

  const handleOkClick = () => {
    if (status === "accepted" || status === "rejected") {
      axios
        .post(`http://localhost:4000/deleteUserRequest/${email}`)
        .then((response) => {
          navigate("/");
        })
        .catch((error) => {
          console.error(`Error deleting request: ${error}`);
        });
    } else {
      navigate("/");
    }
  };

  const getStatusIcon = () => {
    if (status === "accepted") {
      return <CheckCircle className="h-8 w-8 text-green-600" />;
    } else if (status === "rejected") {
      return <XCircle className="h-8 w-8 text-red-600" />;
    } else if (status === "pending") {
      return <Clock className="h-8 w-8 text-yellow-600" />;
    }
    return null;
  };

  const getStatusColor = () => {
    if (status === "accepted") {
      return "text-green-600 bg-green-50 border-green-200";
    } else if (status === "rejected") {
      return "text-red-600 bg-red-50 border-red-200";
    } else if (status === "pending") {
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <span className="font-geist text-2xl font-semibold text-sky-600">PMTS</span>
        </div>

        {/* Registration Info Card */}
        <div className="bg-white border border-gray-100 rounded-lg p-8">
          <h2 className="font-geist text-2xl font-semibold text-gray-900 mb-6">Check Registration Status</h2>

          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCheckStatus}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-base font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md"
              >
                Check
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
              >
                Cancel
                <X className="h-4 w-4" />
              </button>
            </div>

            {status && (
              <div className={`mt-6 p-4 border rounded-lg ${getStatusColor()}`}>
                <div className="flex items-center gap-3">
                  {getStatusIcon()}
                  <div>
                    <p className="font-medium">Your request is {status}.</p>
                    {(status === "accepted" || status === "rejected") && (
                      <p className="text-sm mt-1 opacity-80">
                        You can now close this window.
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleOkClick}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md"
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrationInfo;
