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
    path: "/dashboard",
    element: <Dashboard />,
    role: ["direktor", "buxgalteriya", "menejir"],
    private: true,
  },
  {
    path: "/workers",
    element: <Workers />,
    role: ["direktor", "buxgalteriya", "menejir"],
    private: true,
  },
  {
    path: "/expense",
    element: <ExpenseManager />,
    role: ["direktor", "buxgalteriya", "menejir"],
    private: true,
  },
  {
    path: "/warehouse",
    element: <Materials />,
    role: ["direktor", "buxgalteriya", "menejir"],
    private: true,
  },
  {
    path: "/norma",
    element: <Norma />,
    role: ["direktor", "buxgalteriya", "menejir"],
    private: true,
  },
  {
    path: "/production",
    element: <ProductionSystem />,
    role: ["direktor", "buxgalteriya", "menejir"],
    private: true,
  },
  {
    path: "/setting",
    element: <FactoryConfigPanel />,
    role: ["direktor", "buxgalteriya", "menejir"],
    private: true,
  },
  {
    path: "/sales",
    element: <FactorySalesSystem />,
    role: ["direktor", "buxgalteriya", "menejir"],
    private: true,
  },
  {
    path: "/saler_meneger",
    element: <FactorySalesSystem />,
    role: ["saler_meneger", "sotuvchi"],
    private: true,
  },
  {
    path: "/saler",
    element: <FactorySalesSystem />,
    role: ["direktor", "buxgalteriya", "sotuvchi",
      "sotuvchi eksport",
      "sotuvchi menejir",],
    private: true,
  },
  {
    path: "/attendance",
    element: <Atendance />,
    role: ["direktor", "buxgalteriya", "menejir"],
    private: true,
  },
  {
    path: "/salary",
    element: <Salary />,
    role: ["direktor", "buxgalteriya", "menejir"],
    private: true,
  },
];
















// import React from "react";
// import Dashboard from "../pages/admin/Dashboard/Dashboard";
// import Workers from "../pages/admin/workers/Workers";
// import ExpenseManager from "../pages/reseption/expense/ExpenseManager";
// import Materials from "../pages/materials/Materials";
// import Norma from "../pages/productNorma/ProductNormaMain";
// import ProductionSystem from "../pages/productionProcess/ProductionSystem";
// import FactoryConfigPanel from "../pages/admin/setting/Setting";
// import FactorySalesSystem from "../pages/reseption/salesDepartment/SalesDepartment";
// import Atendance from "../pages/attendance/Atendance";
// import Salary from "../pages/salary/Salary";

// export const routes = [
//   {
//     path: "/buxgalteriya",
//     element: <Dashboard />,
//     role: ["direktor", "buxgalteriya", "menejir"],
//     private: true,
//   },
//   {
//     path: "/direktor",
//     element: <Dashboard />,
//     role: ["direktor", "buxgalteriya", "menejir"],
//     private: true,
//   },
//   {
//     path: "/workers",
//     element: <Workers />,
//     role: ["direktor", "buxgalteriya", "menejir"],
//     private: true,
//   },
//   {
//     path: "/expense",
//     element: <ExpenseManager />,
//     role: ["direktor", "buxgalteriya", "menejir"],
//     private: true,
//   },
//   {
//     path: "/warehouse",
//     element: <Materials />,
//     role: ["direktor", "buxgalteriya", "menejir"],
//     private: true,
//   },
//   {
//     path: "/norma",
//     element: <Norma />,
//     role: ["direktor", "buxgalteriya", "menejir"],
//     private: true,
//   },
//   {
//     path: "/production",
//     element: <ProductionSystem />,
//     role: ["direktor", "buxgalteriya", "menejir"],
//     private: true,
//   },
//   {
//     path: "/setting",
//     element: <FactoryConfigPanel />,
//     role: ["direktor", "buxgalteriya", "menejir"],
//     private: true,
//   },
//   {
//     path: "/sales",
//     element: <FactorySalesSystem />,
//     role: ["direktor", "buxgalteriya", "menejir"],
//     private: true,
//   },
//   {
//     path: "/saler_meneger",
//     element: <FactorySalesSystem />,
//     role: ["saler_meneger", "sotuvchi"],
//     private: true,
//   },
//   {
//     path: "/saler",
//     element: <FactorySalesSystem />,
//     role: ["saler_meneger", "sotuvchi"],
//     private: true,
//   },
//   {
//     path: "/attendance",
//     element: <Atendance />,
//     role: ["direktor", "buxgalteriya", "menejir"],
//     private: true,
//   },
//   {
//     path: "/Salary",
//     element: <Salary />,
//     role: ["direktor", "buxgalteriya", "menejir"],
//     private: true,
//   },
// ];
