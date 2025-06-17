import {
  FaStethoscope,
  FaClipboardList,
  FaUserMd,
  FaHospitalUser,
  FaCog,
  FaNotesMedical,
  FaHistory,
  FaBed,
  FaCalendarCheck, FaMoneyBillWave
} from "react-icons/fa";
import {
  Moon
} from 'lucide-react';
import { MdOutlineMedicalServices, MdDashboard } from "react-icons/md";
import { BsPeopleFill } from "react-icons/bs";

export const menuItems = {
  doctor: [
    {
      icon: <FaStethoscope size={20} />,
      path: "/doctor",
      label: "Shifokor Qabuli",
    },
  ],
  reception: [
    {
      icon: <FaHospitalUser size={20} />,
      path: "/reception",
      label: "Ro'yxatga olish",
    },
    {
      icon: <FaMoneyBillWave />,
      path: "/expense",
      label: "Harajatlar",
    },
    {
      icon: <FaHistory size={20} />, // Changed to FaHistory for medical history
      path: "/history",
      label: "Tarix",
    },
    {
      icon: <FaBed size={20} />, // Changed to FaBed for treatment/cabins
      path: "/cabins",
      label: "Davolanish",
    },
    {
      icon: <FaCalendarCheck size={20} />, // Changed to FaCalendarCheck for attendance
      path: "/attendance",
      label: "Davomat",
    },
    {
      icon: <MdOutlineMedicalServices size={20} />, // Changed to FaCalendarCheck for attendance
      path: "/service",
      label: "Xizmatlar",
    },
    {
      icon: <Moon size={20} />, // Changed to FaCalendarCheck for attendance
      path: "/nightShift",
      label: "Smena Boshqaruvi",
    },
  ],
  director: [
    {
      icon: <MdDashboard size={20} />,
      path: "/director",
      label: "Boshqaruv paneli",
    },
    {
      icon: <BsPeopleFill size={20} />,
      path: "/workers",
      label: "Xodimlar",
    },
    {
      icon: <FaCog size={20} />,
      path: "/setting",
      label: "Sozlamalar",
    },
    {
      icon: <FaNotesMedical size={20} />, // Changed to FaNotesMedical for reception department
      label: "Qabul bo‘limi",
      children: [
        {
          icon: <FaClipboardList size={20} />,
          path: "/reception",
          label: "Ro'yxatdan o'tkazish",
        },
        {
          icon: <FaMoneyBillWave />,
          path: "/expense",
          label: "Harajatlar",
        },
        {
          icon: <FaHistory size={20} />, // Changed to FaHistory for history
          path: "/history",
          label: "Tarix",
        },
        {
          icon: <FaBed size={20} />, // Changed to FaBed for treatment/cabins
          path: "/cabins",
          label: "Davolanish",
        },
        {
          icon: <FaCalendarCheck size={20} />, // Changed to FaCalendarCheck for attendance
          path: "/attendance",
          label: "Davomat",
        },
        {
          icon: <MdOutlineMedicalServices size={20} />, // Changed to FaCalendarCheck for attendance
          path: "/service",
          label: "Xizmatlar",
        },
        {
          icon: <Moon size={20} />, // Changed to FaCalendarCheck for attendance
          path: "/nightShift",
          label: "Smena Boshqaruvi",
        },
      ],
    },
    {
      icon: <FaUserMd size={20} />,
      label: "Shifokorlar",
      children: [
        {
          icon: <FaStethoscope size={20} />,
          path: "/doctor",
          label: "Qabul sahifasi",
        },
      ],
    },
  ],
};