import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Filter,
  Edit,
  Trash2,
  Building,
  Shield,
  Clock,
  Key,
  Phone,
  MapPin,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useSelector } from "react-redux";
import { PhoneNumberFormat } from "../../../hook/NumberFormat";
import "./style.css";
import EmployeeModal from "./WorkersForm";
import {
  useGetWorkersQuery,
  useAddWorkerMutation,
  useUpdateWorkerMutation,
  useDeleteWorkerMutation,
} from "../../../context/workersApi";
import { toast } from "react-toastify";

const RuberoidFactoryHR = () => {
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const { searchQuery } = useSelector((state) => state.search);

  const {
    data: employees = [],
    isLoading,
    isError,
    error,
  } = useGetWorkersQuery();
  const [addWorker] = useAddWorkerMutation();
  const [updateWorker] = useUpdateWorkerMutation();
  const [deleteWorker] = useDeleteWorkerMutation();

  const departments = {
    all: "Barcha bo'limlar",
    ishlab_chiqarish: "Ishlab chiqarish",
    sifat_nazorati: "Sifat nazorati",
    saler_meneger: "Saler menejer",
    ombor: "Ombor",
    buxgalteriya: "Buxgalteriya",
    elektrik: "Elektrik xizmati",
    transport: "Ichki transport",
    xavfsizlik: "Qo'riqlash xizmati",
    tozalash: "Tozalash xizmati",
    oshxona: "Ovqatlanish",
    Sotuvchi: "Sotuvchi",
  };

  const paymentTypes = {
    oylik: "Oylik maosh",
    kunlik: "Kunlik maosh",
    soatlik: "Soatlik maosh",
    ishbay: "Ishbay maosh",
  };

  const roles = {
    admin: "Administrator",
    manager: "Menejer",
    specialist: "Mutaxassis",
    warehouse: "Omborchi",
    accountant: "Buxgalter",
    saler: "Sotuvchi",
  };

  useEffect(() => {
    let filtered = employees;

    if (selectedDepartment !== "all") {
      filtered = filtered.filter(
        (emp) => emp.department === selectedDepartment
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((emp) =>
        [
          emp.firstName,
          emp.department || "",
          emp.lastName,
          departments[emp.department],
          emp.position,
          emp.phone,
          emp.address,
        ].some((field) =>
          field.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Faqat filtered o'zgargan bo'lsa, setFilteredEmployees chaqiriladi
    setFilteredEmployees((prev) => {
      const prevStr = JSON.stringify(prev);
      const nextStr = JSON.stringify(filtered);
      return prevStr !== nextStr ? filtered : prev;
    });
  }, [employees, selectedDepartment, searchQuery, departments]);

  const handleAddEmployee = async (newEmployee) => {
    try {
      const employee = {
        ...newEmployee,
        salary: Number(newEmployee.salary),
      };
      await addWorker(employee).unwrap();
      setShowAddModal(false);
      toast.success("Ishchi muvaffaqiyatli qo'shildi!");
    } catch (err) {
      toast.error(
        `Ishchi qo'shishda xatolik: ${err.data?.message || err.message}`
      );
    }
  };

  const handleUpdateEmployee = async (updatedEmployee) => {
    try {
      const { id, ...employeeData } = updatedEmployee;
      await updateWorker({ id, ...employeeData }).unwrap();
      setEditingEmployee(null);
      toast.success("Ishchi ma'lumotlari muvaffaqiyatli yangilandi!");
    } catch (err) {
      toast.error(
        `Ma'lumotlarni yangilashda xatolik: ${err.data?.message || err.message}`
      );
    }
  };

  const handleDeleteEmployee = (id) => {
    toast(
      ({ closeToast }) => (
        <div className="confirm-toast">
          <p>Ishchini o'chirishni tasdiqlaysizmi?</p>
          <div className="confirm-toast-buttons">
            <button
              onClick={async () => {
                console.log(id);
                try {
                  await deleteWorker(id).unwrap();
                  toast.success("Ishchi muvaffaqiyatli o'chirildi!");
                  closeToast();
                } catch (err) {
                  toast.error(
                    `O'chirishda xatolik: ${err.data?.message || err.message}`
                  );
                  closeToast();
                }
              }}
              className="confirm-btn"
            >
              Tasdiqlash
            </button>
            <button onClick={closeToast} className="cancel-btn">
              Bekor qilish
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        position: "top-center",
      }
    );
  };

  const formatSalary = (salary, type) => {
    const formatted = salary?.toLocaleString("uz-UZ");
    switch (type) {
      case "oylik":
        return `${formatted} so'm/oy`;
      case "kunlik":
        return `${formatted} so'm/kun`;
      case "soatlik":
        return `${formatted} so'm/soat`;
      default:
        return `${formatted} so'm`;
    }
  };

  const exportToExcel = () => {
    const excelData = filteredEmployees?.innerData?.map((emp, index) => ({
      "№": index + 1,
      Ism: emp.firstName,
      Familya: emp.lastName,
      "Otasining ismi": emp.middleName || "",
      "Bo'lim": departments[emp.department],
      Lavozim: emp.position,
      "Ish staji": emp.experience,
      "Pasport seriyasi": emp.passportSeries,
      Telefon: emp.phone,
      Manzil: emp.address,
      "To'lov turi": paymentTypes[emp.paymentType],
      Miqdor: formatSalary(emp.salary, emp.paymentType),
      "Ofis xodimi": emp.isOfficeWorker ? "Ha" : "Yo'q",
      Login: emp.login || "Tayinlanmagan",
      Rol: emp.role ? roles[emp.role] : "Tayinlanmagan",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    const colWidths = [
      { wch: 5 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
      { wch: 12 },
      { wch: 15 },
      { wch: 18 },
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
      { wch: 12 },
      { wch: 20 },
      { wch: 15 },
    ];
    ws["!cols"] = colWidths;

    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };

    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = headerStyle;
    }

    const dataStyle = {
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "CCCCCC" } },
        bottom: { style: "thin", color: { rgb: "CCCCCC" } },
        left: { style: "thin", color: { rgb: "CCCCCC" } },
        right: { style: "thin", color: { rgb: "CCCCCC" } },
      },
    };

    for (let row = 1; row <= range.e.r; row++) {
      const fillColor = row % 2 === 0 ? "F8F9FA" : "FFFFFF";
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
          ...dataStyle,
          fill: { fgColor: { rgb: fillColor } },
        };
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Ishchilar ro'yxati");
    const currentDate = new Date()
      .toLocaleDateString("uz-UZ")
      .replace(/\//g, "-");
    const filename = `Ishchilar_royxati_${currentDate}.xlsx`;
    XLSX.writeFile(wb, filename);
    toast.success("Excel fayli muvaffaqiyatli yuklab olindi!");
  };

  if (isLoading) {
    return <div className="ruberoid-factory-hr-container">Yuklanmoqda...</div>;
  }

  return (
    <div className="ruberoid-factory-hr-container">
      <div className="hr-dashboard-header">
        <div className="header-content-wrapper">
          <div className="factory-brand-section">
            <Building className="factory-logo-icon" />
            <div className="brand-text-container">
              <h1 className="factory-main-title">Kadrlar Boshqaruvi Tizimi</h1>
              <p className="factory-subtitle"></p>
            </div>
          </div>
          <div className="header-stats-panel">
            <div className="stat-item-card">
              <Users className="stat-icon" />
              <div className="stat-details">
                <span className="stat-number">
                  {employees?.innerData.length}
                </span>
                <span className="stat-label">Jami ishchilar</span>
              </div>
            </div>
            <div className="stat-item-card">
              <Shield className="stat-icon" />
              <div className="stat-details">
                <span className="stat-number">
                  {employees?.innerData?.filter((e) => e.isOfficeWorker).length}
                </span>
                <span className="stat-label">Ofis xodimlari</span>
              </div>
            </div>
            <div className="controls-panel-section">
              <button
                onClick={() => setShowAddModal(true)}
                className="add-employee-btn"
              >
                <UserPlus className="btn-icon" />
                Yangi ishchi qo'shish
              </button>
              <div className="department-filter-wrapper">
                <Filter className="filter-dropdown-icon" />
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="department-filter-select"
                >
                  {Object.entries(departments).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={exportToExcel}
              className="export-excel-btn"
              title="Excel faylini yuklab olish"
            >
              <Download />
              Excel
            </button>
          </div>
        </div>
      </div>

      <div className="hr-main-content">
        <div className="employees-table-container">
          <table className="employees-data-table">
            <thead className="table-header-section">
              <tr>
                <th>Ism Familya Otasini ismi</th>
                <th>Bo'lim</th>
                <th>Lavozim</th>
                <th>Ish staji</th>
                <th>Pasport</th>
                <th>Telefon</th>
                <th>Manzil</th>
                <th>Miqdor</th>
                <th>Login ma'lumotlari</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody className="table-body-section">
              {filteredEmployees?.innerData?.map((employee, inx) => (
                <tr key={inx} className="employee-table-row">
                  <td>
                    <span className="employee-name-cell">
                      {employee.firstName} {employee.lastName}{" "}
                      {employee.middleName}
                      {employee.isOfficeWorker && (
                        <span className="office-worker-badge">
                          <Shield className="badge-icon" />
                        </span>
                      )}
                    </span>
                  </td>
                  <td>{departments[employee.department]}</td>
                  <td>
                    {employee.position === "Required" ? "-" : employee.position}
                  </td>
                  <td>
                    <span className="experience-badge">
                      <Clock className="experience-icon" />
                      {employee.experience || 0}
                    </span>
                  </td>
                  <td className="passport-series-cell">
                    {employee.passportSeries}
                  </td>
                  <td className="phone-cell">
                    <Phone className="phone-icon" />
                    {PhoneNumberFormat(employee.phone)}
                  </td>
                  <td className="address-cell">
                    <MapPin className="address-icon" />
                    {employee.address}
                  </td>
                  <td className="salary-amount-cell">
                    {formatSalary(employee.salary, employee.paymentType)}
                  </td>
                  <td className="login-credentials-cell">
                    {employee.isOfficeWorker ? (
                      <div className="credentials-info">
                        <div className="login-display">
                          <Key className="credentials-icon" />
                          {employee.login || "Tayinlanmagan"}
                        </div>
                        {employee.role && (
                          <span className="role-badge">
                            {roles[employee.role]}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="no-credentials-text">
                        Login talab qilinmaydi
                      </span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons-group">
                      <button
                        onClick={() => setEditingEmployee(employee)}
                        className="edit-action-btn"
                        title="Tahrirlash"
                      >
                        <Edit className="action-icon" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee._id)}
                        className="delete-action-btn"
                        title="O'chirish"
                      >
                        <Trash2 className="action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(showAddModal || editingEmployee) && (
        <EmployeeModal
          roles={roles}
          paymentTypes={paymentTypes}
          departments={departments}
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
          editingEmployee={editingEmployee}
          setEditingEmployee={setEditingEmployee}
          handleAddEmployee={handleAddEmployee}
          handleUpdateEmployee={handleUpdateEmployee}
        />
      )}
    </div>
  );
};

export default RuberoidFactoryHR;
