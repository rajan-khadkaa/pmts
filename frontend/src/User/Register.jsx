import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateForm } from "../Validation";
import { ArrowRight, X } from "lucide-react";

function Register() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    image: "",
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [confirmPassword, setConfirmPassword] = useState("");

  // Function to clear validation messages
  const clearValidationMessages = () => {
    setTimeout(() => {
      setErrors({});
    }, 4000);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const formErrors = validateForm(data);
    // Validate confirm password
    if (confirmPassword !== data.password) {
      setErrors({ ...errors, confirmPassword: "Passwords do not match." });
      return;
    }
    if (Object.keys(formErrors).length === 0) {
      const formdata = new FormData();
      formdata.append("name", data.name);
      formdata.append("email", data.email);
      formdata.append("password", data.password);
      formdata.append("image", data.image);

      axios
        .post("http://localhost:4000/userRequest", formdata)
        .then((res) => {
          if (res.data.Status === "Success") {
            alert("Registration request sent");
            navigate("/registrationinfo");
          } else if (res.data.Error === "Email is taken. Try another.") {
            setErrors({ ...errors, email: "Email is taken. Try another." });
            clearValidationMessages();
          } else {
            console.error(res.data.Error);
            alert("Registration failed: " + res.data.Error);
          }
        })
        .catch((err) => console.log(err));
    } else {
      setErrors(formErrors);
      clearValidationMessages();
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="text-center mb-8">
          <span className="font-geist text-2xl font-semibold text-sky-600">PMTS</span>
        </div>

        {/* Registration Card */}
        <div className="bg-white border border-gray-100 rounded-lg p-8">
          <h2 className="font-geist text-2xl font-semibold text-gray-900 mb-6">User Registration Form</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="inputName" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
                id="inputName"
                placeholder="Enter Name"
                autoComplete="off"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="inputEmail4" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
                id="inputEmail4"
                placeholder="Enter Email"
                autoComplete="off"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="inputPassword4" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
                id="inputPassword4"
                placeholder="Enter Password"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
                id="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
              {confirmPassword !== data.password && confirmPassword !== "" && !errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match.</p>
              )}
            </div>

            <div>
              <label htmlFor="formFile" className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
                type="file"
                id="formFile"
                accept="image/*"
                onChange={(e) => setData({ ...data, image: e.target.files[0] })}
              />
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-base font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md"
              >
                Register
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
                onClick={() => navigate("/")}
              >
                Cancel
                <X className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
