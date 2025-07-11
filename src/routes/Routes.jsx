import React from "react";
import Dashboard from "../pages/admin/Dashboard/Dashboard";
import Workers from "../pages/admin/workers/Workers";
import ExpenseManager from "../pages/reseption/expense/ExpenseManager";
import Materials from "../pages/materials/Materials";
import Norma from "../pages/productNorma/ProductNormaMain";
import ProductionSystem from "../pages/productionProcess/ProductionSystem";
import FactoryConfigPanel from "../pages/admin/setting/Setting";
import FactorySalesSystem from "../pages/reseption/salesDepartment/SalesDepartment";
import Atendance from "../pages/attendance/Atendance";
import Salary from "../pages/salary/Salary";

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
    path: "/sales",
    element: <FactorySalesSystem />,
    role: ["director"],
    private: true,
  },
  {
    path: "/saler_meneger",
    element: <FactorySalesSystem />,
    role: ["saler_meneger", "saler"],
    private: true,
  },
  {
    path: "/saler",
    element: <FactorySalesSystem />,
    role: ["saler_meneger", "saler"],
    private: true,
  },

  {
    path: "/attendance",
    element: <Atendance />,
    role: ["director"],
    private: true,
  },
  {
    path: "/Salary",
    element: <Salary />,
    role: ["director"],
    private: true,
  },
];
