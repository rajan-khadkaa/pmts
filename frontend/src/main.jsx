import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// import App from "./src/App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { AuthProvider } from "../contexts/AuthContext";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <AuthProvider>
//       {" "}
//       {/* Wrap App inside AuthProvider */}
//       <App />
//     </AuthProvider>
//   </React.StrictMode>
// );
