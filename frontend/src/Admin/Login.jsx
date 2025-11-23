import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ArrowRight } from "lucide-react";

function Login() {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    axios
      .post("http://localhost:4000/login", values)
      .then((res) => {
        if (res.data.Status === "Success") {
          Cookies.set("token", res.data.token);
          navigate("/dashboard");
        } else {
          setError(res.data.Error);
          setTimeout(() => setError(""), 3000);
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <span className="font-geist text-2xl font-semibold text-sky-600">PMTS</span>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-100 rounded-lg p-8">
          <h2 className="font-geist text-2xl font-semibold text-gray-900 mb-6">Admin Login</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter email"
                value={values.email}
                onChange={(e) => setValues({ ...values, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter password"
                value={values.password}
                onChange={(e) => setValues({ ...values, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-base font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md"
            >
              Log in
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="gridCheck"
                className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-600"
              />
              <label htmlFor="gridCheck" className="ml-2 text-sm text-gray-600">
                By logging in, you agree terms and conditions.
              </label>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
