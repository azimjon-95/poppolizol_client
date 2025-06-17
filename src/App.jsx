// App.js - Main application component with optimized routing
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "./components/layout/Layout";
import PrivateRoute from "./auth/PrivateRoute";
import Login from "./components/login/Login";
import { routes } from "./routes/Routes";

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine ? "Online" : "Offline");
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
      'director': '/director',
      'doctor': '/doctor',
      'reception': '/reception'
    };
    return roleRoutes[userRole] || '/dashboard';
  };

  // If user is authenticated, show main app
  if (token && role) {
    return (
      <div className="app">
        {!isOnline && (
          <p
            style={{
              background: isOnline === "Offline" ? "#ff4d4f" : "#52c41a",
              color: "white",
              padding: "8px 16px",
              margin: 0,
              textAlign: "center",
              fontSize: "14px",
              fontWeight: "500"
            }}
            className="isOnline"
          >
            {isOnline}
          </p>
        )}

        <Routes>
          <Route element={<Layout />}>
            {routes.map(({ path, element, private: isPrivate, role: requiredRole }) => (
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

  // If not authenticated, show login page only
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;


