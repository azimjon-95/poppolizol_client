import { MdDashboard } from "react-icons/md";
import { FaWarehouse, FaUsers, FaMoneyBillWave } from "react-icons/fa";
import { BiCategoryAlt } from "react-icons/bi";
import { GiFactory } from "react-icons/gi";
import { IoSettingsOutline } from "react-icons/io5";
import { FaTruckMoving } from "react-icons/fa";
import { CalendarOutlined } from "@ant-design/icons";

export const menuItems = {
  director: [
    {
      icon: <MdDashboard size={20} />,
      path: "/director",
      label: "Boshqaruv paneli",
    },
    {
      icon: <FaUsers size={20} />,
      path: "/workers",
      label: "Hodimlar",
    },
    {
      icon: <FaWarehouse size={20} />,
      path: "/warehouse",
      label: "Ombor",
    },
    {
      icon: <BiCategoryAlt size={20} />,
      path: "/norma",
      label: "Normalar",
    },
    {
      icon: <GiFactory size={20} />,
      path: "/production",
      label: "Ishlab chiqarish",
    },
    {
      icon: <FaMoneyBillWave size={20} />,
      path: "/expense",
      label: "Xarajatlar",
    },
    {
      icon: <IoSettingsOutline size={20} />,
      path: "/setting",
      label: "Sozlamalar",
    },
    {
      icon: <FaTruckMoving size={20} />,
      path: "/sales",
      label: "Sotuv bo'limi",
    },
    {
      icon: <CalendarOutlined size={20} />,
      path: "/attendance",
      label: "Davomat",
    },
    {
      icon: <CalendarOutlined size={20} />,
      path: "/salary",
      label: "Maoshlar",
    },
  ],
};
