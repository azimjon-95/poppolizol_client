import React from "react";
import Dashboard from "../pages/admin/Dashboard/Dashboard";
import Workers from "../pages/admin/workers/Workers";
import ExpenseManager from "../pages/reseption/expense/ExpenseManager";
import Materials from "../pages/materials/Materials";
import Norma from "../pages/productNorma/ProductNormaMain";
import ProductionSystem from "../pages/productionProcess/ProductionSystem";
import FactoryConfigPanel from "../pages/admin/setting/Setting";
import ExpenseTracker from "../pages/reseption/expense/ExpenseManager";
import SalaryManagement from "../pages/reseption/salary/SalaryManagement";
import FactorySalesSystem from "../pages/reseption/salesDepartment/SalesDepartment";
import QRFeedbackPage from '../pages/reseption/salesDepartment/QRFeedbackPage';

export const routes = [
  {
    path: "/director",
    element: <Dashboard />,
    role: ["director"],
    private: true,
  },
  {
    path: "/workers",
    element: <Workers />,
    role: ["director"],
    private: true,
  },
  {
    path: "/expense",
    element: <ExpenseManager />,
    role: ["director"],
    private: true,
  },
  {
    path: "/warehouse",
    element: <Materials />,
    role: ["director"],
    private: true,
  },
  {
    path: "/norma",
    element: <Norma />,
    role: ["director"],
    private: true,
  },
  {
    path: "/production",
    element: <ProductionSystem />,
    role: ["director"],
    private: true,
  },
  {
    path: "/setting",
    element: <FactoryConfigPanel />,
    role: ["director"],
    private: true,
  },
  {
    path: "/expense",
    element: <ExpenseTracker />,
    role: ["director"],
    private: true,
  },
  {
    path: "/salary",
    element: <SalaryManagement />,
    role: ["director"],
    private: true,
  },
  {
    path: "/sales",
    element: <FactorySalesSystem />,
    role: ["director"],
    private: true,
  },
  {
    path: "/feedback",
    element: <QRFeedbackPage />,
    role: [""],
    private: false,
  },
];
