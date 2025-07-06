import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "./components/layout/Layout";
import PrivateRoute from "./auth/PrivateRoute";
import Login from "./components/login/Login";
import { routes } from "./routes/Routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [isOnline, setIsOnline] = useState(
    navigator.onLine ? "Online" : "Offline"
  );
  const { token, role } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline("Online");
      const timer = setTimeout(() => setIsOnline(null), 5000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline("Offline");
      const timer = setTimeout(() => setIsOnline(null), 5000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Get default route based on user role
  const getDefaultRoute = (userRole) => {
    const roleRoutes = {
      director: "/director",
      manager: "/manager",
    };
    return roleRoutes[userRole] || "/dashboard";
  };

  if (token && role) {
    return (
      <div className="app">
        <ToastContainer />
        {!isOnline && (
          <p
            style={{
              background: isOnline === "Offline" ? "#ff4d4f" : "#52c41a",
              color: "white",
              padding: "8px 16px",
              margin: 0,
              textAlign: "center",
              fontSize: "14px",
              fontWeight: "500",
            }}
            className="isOnline"
          >
            {isOnline}
          </p>
        )}

        <Routes>
          {/* Routes wrapped in Layout */}
          <Route element={<Layout />}>
            {routes
              .filter((route) => route.path !== "/feedback") // Exclude feedback route
              .map(({ path, element, private: isPrivate, role: requiredRole }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    isPrivate ? (
                      <PrivateRoute role={requiredRole}>{element}</PrivateRoute>
                    ) : (
                      element
                    )
                  }
                />
              ))}
          </Route>

          {/* Feedback route without Layout */}
          <Route
            path="/feedback"
            element={
              routes.find((route) => route.path === "/feedback").element
            }
          />

          {/* Redirect login attempts to user's default route */}
          <Route
            path="/login"
            element={<Navigate to={getDefaultRoute(role)} replace />}
          />

          {/* Redirect root to user's default route */}
          <Route
            path="/"
            element={<Navigate to={getDefaultRoute(role)} replace />}
          />

          {/* Catch all other routes and redirect to default */}
          <Route
            path="*"
            element={<Navigate to={getDefaultRoute(role)} replace />}
          />
        </Routes>
      </div>
    );
  }

  // If not authenticated, show login page or feedback page
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/feedback"
          element={
            routes.find((route) => route.path === "/feedback").element
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;