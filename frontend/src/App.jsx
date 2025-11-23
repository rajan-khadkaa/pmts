import React from "react";
import "../index.css";

import Login from "./Admin/Login.jsx";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Admin/Dashboard.jsx";

import Userboard from "./User/Userboard.jsx";
import UserHome from "./User/UserHome.jsx";
import Income from "./User/Income.jsx";
import Expense from "./User/Expense.jsx";
import History from "./User/History.jsx";
import Category from "./User/Category.jsx";

import User from "./User/User.jsx";
import Home from "./Additional/Home.jsx";
import Start from "./Additional/Start.jsx";
import UserLogin from "./User/UserLogin.jsx";
import PageNotFound from "./Additional/PageNotFound.jsx";
import Register from "./User/Register.jsx";
import RegistrationInfo from "./User/RegistrationInfo.jsx";
import UserRegistration from "./User/UserRegistration.jsx";
import { useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";
import Cookies from "js-cookie";

function ProtectedRoute({ children }) {
  const token = Cookies.get("token");
  return token ? children : <Navigate to="/" />;
}

function UserProtectedRoute({ children }) {
  const { id } = useParams(); // Get the user ID from the URL
  const token = Cookies.get("user_token");

  if (!token) return <Navigate to="/userlogin" />;

  // Decode the token to get the user ID
  const decodedToken = jwt_decode(token);
  const tokenUserId = decodedToken.id;

  // Check if the user ID in the token matches the user ID in the URL
  if (tokenUserId.toString() === id) {
    return children;
  } else {
    return <Navigate to="/userlogin" />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/userlogin" element={<UserLogin />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/userboard/:id"
          element={
            <UserProtectedRoute>
              <Userboard />
            </UserProtectedRoute>
          }
        >
          {/* Default dashboard (UserHome) */}
          <Route index element={<UserHome />} />

          {/* Nested routes under Userboard */}
          <Route path="income" element={<Income />} />
          <Route path="expense" element={<Expense />} />
          <Route path="history" element={<History />} />
          <Route path="category" element={<Category />} />
        </Route>

        {/* Updated Route: Userboard now expects a user ID */}
        {/* <Route
          path="/userboard/:id"
          element={
            <UserProtectedRoute>
              <Userboard />
            </UserProtectedRoute>
          }
        >
          <Route path="/userboard/:id" element={<UserHome />} />{" "}
          {/* Default dashboard 
          <Route path="/userboard/:id/income" element={<Income />} />
          <Route path="/userboard/:id/expense" element={<Expense />} />
          <Route path="/userboard/:id/history" element={<History />} />
          <Route path="/userboard/:id/category" element={<Category />} />
        </Route> */}

        {/* <Route path="/leaveform/:id" element={<LeaveForm />} /> */}
        <Route path="/register" element={<Register />} />
        <Route path="/registrationinfo" element={<RegistrationInfo />} />
        {/* <Route path="/employeeview/:id" element={<EmployeeView />} /> */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Home />} />
          <Route path="/dashboard/user" element={<User />} />
          {/* <Route path="/dashboard/create" element={<AddEmployee />} /> */}
          {/* <Route path="/dashboard/leave" element={<Leave />} /> */}
          <Route
            path="/dashboard/userregistration"
            element={<UserRegistration />}
          />
          {/* <Route
            path="/dashboard/:role/employeeEdit/:id"
            element={<EmployeeEdit />}
          /> */}
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
