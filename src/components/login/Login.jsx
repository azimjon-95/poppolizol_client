import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { setCredentials } from "../../context/actions/authSlice";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import axios from "../../api";
import {
  Eye,
  EyeOff,
  Factory,
  Shield,
  User,
  Lock,
  ArrowRight,
} from "lucide-react";
import "./login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    username: localStorage.getItem("rememberedUsername") || "",
    password: localStorage.getItem("rememberedPassword") || "",
  });

  useEffect(() => {
    if (
      localStorage.getItem("rememberedUsername") &&
      localStorage.getItem("rememberedPassword")
    ) {
      setRememberMe(true);
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
    if (!e.target.checked) {
      localStorage.removeItem("rememberedUsername");
      localStorage.removeItem("rememberedPassword");
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && role) {
      const getDefaultRoute = (userRole) => {
        const roleRoutes = {
          manager: "/manager",
        };
        return roleRoutes[userRole] || "/director";
      };

      navigate(getDefaultRoute(role), { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const clearForm = () => {
    setFormData({ username: "", password: "" });
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      message.warning("Login va parolni kiriting!");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/admin/login", {
        login: formData.username.trim(),
        password: formData.password.trim(),
      });

      const { message: successMessage, innerData } = res.data;

      // Store doctor name for backward compatibility
      const doctorName = `${innerData?.employee?.firstName || ""} ${innerData?.employee?.lastName || ""
        }`.trim();
      localStorage.setItem("doctor", doctorName);
      localStorage.setItem("workerId", innerData?.employee?._id);

      // Save credentials to localStorage if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", formData.username.trim());
        localStorage.setItem("rememberedPassword", formData.password.trim());
      }

      // Dispatch credentials to Redux store
      dispatch(
        setCredentials({
          adminFullname: doctorName,
          role: innerData?.employee?.role,
          token: innerData?.token,
        })
      );

      message.success(successMessage || "Muvaffaqiyatli tizimga kirdingiz!");

      // Clear form
      clearForm();

      // Navigate to appropriate route based on role
      // const defaultRoute = getDefaultRoute(innerData?.employee?.role);
      // navigate(defaultRoute, { replace: true });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Tizimga kirishda xatolik yuz berdi!";
      message.error(errorMessage);
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bpf-authentication-wrapper">
      {/* Animatsion fon elementlari */}
      <div className="bpf-animated-background-overlay">
        <div className="bpf-floating-paper-roll-primary"></div>
        <div className="bpf-floating-paper-roll-secondary"></div>
        <div className="bpf-floating-paper-roll-tertiary"></div>
      </div>

      {/* Zavod silueti foni */}
      <div className="bpf-industrial-silhouette-container">
        <div className="bpf-factory-architectural-layout">
          <div className="bpf-manufacturing-building-primary"></div>
          <div className="bpf-industrial-chimney-primary"></div>
          <div className="bpf-manufacturing-building-secondary"></div>
          <div className="bpf-industrial-chimney-secondary"></div>
        </div>
      </div>

      {/* Asosiy kirish konteyneri */}
      <div className="bpf-authentication-container-wrapper">
        {/* Sarlavha */}
        <div className="bpf-brand-identity-section">
          <div className="bpf-corporate-logo-container">
            <Factory className="w-10 h-10 text-white" />
          </div>
          <h1 className="bpf-company-title-primary">POP POLIZOL</h1>
          <p className="bpf-system-description-subtitle">
            CRM Boshqaruv Tizimi
          </p>
        </div>

        {/* Kirish formasi */}
        <div className="bpf-authentication-panel-container">
          <div className="bpf-form-fields-container">
            {/* Foydalanuvchi nomi maydoni */}
            <div className="bpf-input-field-grouping-wrapper">
              <label htmlFor="username" className="bpf-field-label-typography">
                Foydalanuvchi nomi
              </label>
              <div className="bpf-interactive-input-container">
                <div className="bpf-input-icon-positioning-wrapper">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="bpf-primary-text-input-field"
                  placeholder="Foydalanuvchi nomingizni kiriting"
                  required
                />
              </div>
            </div>

            {/* Parol maydoni */}
            <div className="bpf-input-field-grouping-wrapper">
              <label htmlFor="password" className="bpf-field-label-typography">
                Parol
              </label>
              <div className="bpf-interactive-input-container">
                <div className="bpf-input-icon-positioning-wrapper">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bpf-password-input-field"
                  placeholder="Parolingizni kiriting"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="bpf-password-visibility-toggle-button"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Eslab qolish checkbox */}
            <div className="bpf-remember-me-container">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                className="bpf-remember-me-checkbox"
              />
              <label htmlFor="rememberMe" className="bpf-remember-me-label">
                Eslab qol
              </label>
            </div>

            {/* Kirish tugmasi */}
            <button
              onClick={handleSubmit}
              className="bpf-primary-authentication-button"
            >
              <span>CRM tizimiga kirish</span>
              <ArrowRight className="w-5 h-5 bpf-button-icon-animation-wrapper" />
            </button>
          </div>
        </div>

        {/* Xavfsizlik belgisi */}
        <div className="bpf-security-certification-badge">
          <Shield className="w-4 h-4" />
          <span className="bpf-security-badge-text">Xavfsiz ulanish</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
