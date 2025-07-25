import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./auth/PrivateRoute";
import Layout from "./components/layout/Layout";
import { routes } from "./routes/Routes";
import Login from "./components/login/Login";
import QRFeedbackPage from "./pages/reseption/salesDepartment/QRFeedbackPage";

const App = () => {
  const [authToken, setAuthToken] = useState(localStorage.getItem("token"));
  const [authRole, setAuthRole] = useState(localStorage.getItem("role"));

  // If no token, show login routes
  if (!authToken) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/feedback" element={<QRFeedbackPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // If token exists, show authenticated routes
  return (
    <Routes>
      <Route element={<Layout />}>
        {routes.map(({ path, element, private: isPrivate, role }) => (
          <Route
            key={path}
            path={path}
            element={
              isPrivate ? (
                <PrivateRoute role={role}>{element}</PrivateRoute>
              ) : (
                element
              )
            }
          />
        ))}
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/feedback" element={<QRFeedbackPage />} />
      <Route path="*" element={<Navigate to={`/${authRole}`} />} />
    </Routes>
  );
};

export default App;

