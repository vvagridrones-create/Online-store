import React from "react";
import ReactDOM from "react-dom/client";
import ShopSphere from "../ShopSphere.jsx";
import AdminDashboard from "../ShopSphere_Admin.jsx";

const isAdmin = window.location.pathname === "/admin";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isAdmin ? <AdminDashboard /> : <ShopSphere />}
  </React.StrictMode>
);
