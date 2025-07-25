import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import "./Layout.css";
import { menuItems } from "../../utils/SidebarMenu";
import Sidebar from "../sidebar/Sidebar";
import Header from "../header/Header";

function Layout() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const location = useLocation();

  useEffect(() => {
    // if (!role || !menuItems[role]) {
    if (!role) {
      navigate("/login");
    }
  }, [role, navigate]);

  const isDirectorPath = location.pathname === "/direktor" || "/expense";
  return (
    <div className="layout">
      {role === "sotuvchi" ? (
        <></>
      ) : (
        <div className="layout_left">
          <Sidebar />
        </div>
      )}

      <div className="layout_right">
        {role === "sotuvchi" ? <></> : <Header />}
        <main
          style={{
            background: ["direktor", "expense"].includes(isDirectorPath)
              ? "#0f172a"
              : "#f1f5f9",
            padding: isDirectorPath ? "0px" : "15px",
          }}
          className="main-content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
