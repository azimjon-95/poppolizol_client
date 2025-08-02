import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  useMarkAttendanceMutation,
  useGetAllAttendanceQuery,
  useDeleteAttendanceMutation,
} from "../../context/attendanceApi";
import { BsCheck2Circle } from "react-icons/bs";
import { useGetProductionEmployeesQuery } from "../../context/workersApi";
import { capitalizeFirstLetter } from "../../hook/CapitalizeFirstLitter";
import {
  Button,
  Card,
  Select,
  Table,
  Spin,
  Tabs,
  Input,
  Popconfirm,
  Checkbox,
} from "antd";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import AttendanceHistory from "./AttendanceHistory";
import DailyWorkers from "./DailyWorkers";

const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;

const PERCENTAGE_OPTIONS = {
  transport: [{ value: 0.33, label: "33%" }],
  ochisleniya: [
    { value: 0.33, label: "33%" },
    { value: 0.5, label: "50%" },
    { value: 0.75, label: "75%" },
    { value: 1, label: "100%" },
  ],
  default: [
    { value: 0.33, label: "33%" },
    { value: 0.5, label: "50%" },
    { value: 0.75, label: "75%" },
    { value: 1, label: "100%" },
    { value: 1.5, label: "1.5 kun" },
    { value: 2, label: "2 kun" },
  ],
};

const DEPARTMENT_OPTIONS = [
  { value: "polizol", label: "Polizol" },
  { value: "rubiroid", label: "Rubiroid" },
  { value: "ochisleniya", label: "Ochisleniya" },
];
const LOCATION_ROLES = [
  "polizol ish boshqaruvchi",
  "ochisleniya ish boshqaruvchi",
  "rubiroid ish boshqaruvchi",
];

function Attendance() {
  const [attendanceData, setAttendanceData] = useState({});
  const [markedToday, setMarkedToday] = useState({});
  const [filterUnit, setFilterUnit] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [markAttendance, { isLoading: isMarkLoading }] =
    useMarkAttendanceMutation();
  const [deleteAttendance, { isLoading: isDeleteLoading }] =
    useDeleteAttendanceMutation();
  const { data: workers, isLoading: isWorkersLoading } =
    useGetProductionEmployeesQuery();
  const role = localStorage.getItem("role");
  const isLocationRole = role && LOCATION_ROLES.includes(role);
  const navigate = useNavigate(); // Hook for navigation

  const { data: existingRecords } = useGetAllAttendanceQuery({
    startDate: selectedDate,
    endDate: selectedDate,
  });

  useEffect(() => {
    if (existingRecords) {
      const newMarkedToday = {};
      const newAttendanceData = {};
      existingRecords.forEach((r) => {
        newMarkedToday[r.employee._id] = true;
        newAttendanceData[r.employee._id] = {
          department: r.department,
          percentage: r.percentage,
          attendanceId: r._id,
        };
      });
      setMarkedToday(newMarkedToday);
      setAttendanceData((prev) => ({ ...newAttendanceData, ...prev }));
    }
  }, [existingRecords]);

  // Reset attendanceData when filterUnit or selectedDate changes
  useEffect(() => {
    setAttendanceData({});
  }, [filterUnit, selectedDate]);

  const handleChange = useCallback((employeeId, field, value) => {
    setAttendanceData((prev) => {
      // If value is undefined or empty, remove the employee's data
      if (!value) {
        const { [employeeId]: _, ...rest } = prev;
        return rest;
      }
      // Otherwise, update the employee's data
      return {
        ...prev,
        [employeeId]: { ...prev[employeeId], [field]: value },
      };
    });
  }, []);

  const handleDateChange = useCallback((e) => {
    const formattedDate = e.target.value || dayjs().format("YYYY-MM-DD");
    setSelectedDate(formattedDate);
  }, []);

  const handleSave = useCallback(
    async (employeeId) => {
      const record = attendanceData[employeeId];
      if (!record?.percentage) {
        toast.warning("Foiz tanlanmagan", { autoClose: 3000 });
        return;
      }
      if (!record?.department && filterUnit === "all") {
        toast.warning("Bo‘lim tanlanmagan", { autoClose: 3000 });
        return;
      }
      try {
        await markAttendance({
          employeeId,
          date: selectedDate,
          percentage: record.percentage,
          department: record.department ?? filterUnit,
          cleaning: record.cleaning,
        }).unwrap();
        toast.success("Davomat saqlandi", { autoClose: 3000 });
        setMarkedToday((prev) => ({ ...prev, [employeeId]: true }));
      } catch (err) {
        console.error(err);
        toast.error(err?.data?.message || "Xatolik yuz berdi", {
          autoClose: 3000,
        });
      }
    },
    [attendanceData, filterUnit, markAttendance, selectedDate]
  );

  const handleDelete = useCallback(
    async (employeeId) => {
      const record = attendanceData[employeeId._id];

      if (!record) {
        toast.warning("O‘chirish uchun davomat topilmadi", { autoClose: 3000 });
        return;
      }

      try {
        await deleteAttendance({
          attendanceId: record.attendanceId,
          unit: record.department ?? filterUnit,
        }).unwrap();
        toast.success("Davomat o‘chirildi", { autoClose: 3000 });
        setMarkedToday((prev) => {
          const newMarked = { ...prev };
          delete newMarked[employeeId._id];
          return newMarked;
        });
        setAttendanceData((prev) => {
          const newData = { ...prev };
          delete newData[employeeId._id];
          return newData;
        });
      } catch (err) {
        console.error(err);
        toast.error(err?.data?.message || "O‘chirishda xatolik yuz berdi", {
          autoClose: 3000,
        });
      }
    },
    [attendanceData, deleteAttendance, filterUnit]
  );

  const filteredWorkers = useMemo(() => {
    if (!workers?.innerData) return [];
    return workers.innerData
      .filter(
        (w) => filterUnit === "all" || w.unit?.toLowerCase() === filterUnit
      )
      .filter((w) => {
        if (!searchTerm.trim()) return true;
        const fio = [w.firstName, w.lastName, w.middleName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return fio.includes(searchTerm.trim().toLowerCase());
      });
  }, [workers, filterUnit, searchTerm]);

  const baseColumns = useMemo(
    () => [
      {
        title: "Ism",
        dataIndex: "firstName",
        render: (_, record) =>
          `${capitalizeFirstLetter(record.firstName)} ${record.lastName}`,
      },
      {
        title: "Bo'limi",
        dataIndex: "unit",
        render: (_, record) => capitalizeFirstLetter(record.unit),
      },
      {
        title: "Davomat %",
        render: (_, record) => {
          const isTransport = record.unit === "transport";
          const isOchisleniya = record.unit === "ochisleniya";
          const options = isTransport
            ? PERCENTAGE_OPTIONS.transport
            : isOchisleniya
            ? PERCENTAGE_OPTIONS.ochisleniya
            : PERCENTAGE_OPTIONS.default;

          return (
            <Select
              placeholder="Foiz tanlang"
              style={{ width: 120 }}
              value={attendanceData[record._id]?.percentage}
              onChange={(value) =>
                handleChange(record._id, "percentage", value)
              }
              disabled={
                (!isTransport && markedToday[record._id]) || isDeleteLoading
              }
              allowClear
            >
              {options.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          );
        },
      },
      {
        title: "Shanbalik",
        render: (_, record) => {
          return (
            <Checkbox
              // checked={attendanceData[record._id] || false}
              onChange={(e) =>
                handleChange(record._id, "cleaning", e.target.checked)
              }
            />
          );
        },
      },
      {
        title: "Saqlash",
        render: (_, record) => (
          <div style={{ display: "flex", gap: 8 }}>
            {(record.unit !== "transport" && markedToday[record._id]) ||
            isDeleteLoading ? (
              <BsCheck2Circle style={{ color: "green", fontSize: "25px" }} />
            ) : (
              <Button
                type="primary"
                onClick={() => handleSave(record._id)}
                loading={isMarkLoading}
                disabled={
                  (record.unit !== "transport" && markedToday[record._id]) ||
                  isDeleteLoading
                }
              >
                Saqlash
              </Button>
            )}
          </div>
        ),
      },
    ],
    [
      attendanceData,
      handleChange,
      handleSave,
      handleDelete,
      isMarkLoading,
      isDeleteLoading,
      markedToday,
    ]
  );
  if (!isLocationRole) {
    baseColumns.push({
      title: "O‘chirish",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          {markedToday[record._id] ? (
            <Popconfirm
              title="Davomatni o‘chirishni xohlaysizmi?"
              onConfirm={() => handleDelete(record)}
              okText="Ha"
              cancelText="Yo‘q"
              disabled={isMarkLoading || isDeleteLoading}
            >
              <Button
                type="primary"
                danger
                loading={isDeleteLoading}
                disabled={isMarkLoading}
              >
                O‘chirish
              </Button>
            </Popconfirm>
          ) : (
            <i style={{ fontSize: "13px", color: "grey" }}>Mavjud emas</i>
          )}
        </div>
      ),
    });
  }

  const departmentColumn = useMemo(
    () => ({
      title: "Boshqa bo‘limga yo'naltrish",
      render: (_, record) => {
        const isTransport = record.unit === "transport";
        const defaultDepartment =
          filterUnit !== "all" &&
          DEPARTMENT_OPTIONS.some((opt) => opt.value === filterUnit)
            ? filterUnit
            : attendanceData[record._id]?.department;

        return (
          <Select
            placeholder="Bo‘lim tanlang"
            style={{ width: 190 }}
            value={defaultDepartment}
            onChange={(value) => handleChange(record._id, "department", value)}
            disabled={
              (!isTransport && markedToday[record._id]) || isDeleteLoading
            }
            allowClear
          >
            {DEPARTMENT_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        );
      },
    }),
    [attendanceData, filterUnit, handleChange, markedToday, isDeleteLoading]
  );

  const columns = useMemo(
    () =>
      filterUnit === "all"
        ? [
            ...baseColumns.slice(0, 2),
            departmentColumn,
            ...baseColumns.slice(2),
          ]
        : baseColumns,
    [baseColumns, departmentColumn, filterUnit]
  );

  const handleLogout = () => {
    localStorage.clear(); // Clear all localStorage data
    toast.success("Tizimdan chiqildi", { autoClose: 2000 }); // Show success message
    navigate("/login"); // Redirect to login page (adjust the path as needed)
  };
  if (isWorkersLoading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        {" "}
        <Spin size="large" />
      </div>
    );

  return (
    <div
      style={{
        padding: "0rem 1rem ",
      }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Tabs
        defaultActiveKey="1"
        tabBarExtraContent={
          isLocationRole && (
            <Button type="primary" onClick={handleLogout}>
              Tizimdan chiqish
            </Button>
          )
        }
      >
        <TabPane tab="Davomat" key="1">
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Bugungi davomat</span>
                <div style={{ display: "flex", gap: 8 }}>
                  {!isLocationRole && (
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      style={{
                        width: 150,
                        padding: "3.1px 11px",
                        border: "1px solid #d9d9d9",
                        borderRadius: 2,
                        fontSize: 14,
                        borderRadius: "6px",
                        lineHeight: "1.5715",
                        outline: "none",
                        transition: "border-color 0.3s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#40a9ff")}
                      onBlur={(e) => (e.target.style.borderColor = "#d9d9d9")}
                    />
                  )}
                  <Search
                    placeholder="Qidiruv"
                    style={{ width: 200 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                    enterButton
                  />
                  <Select
                    style={{ width: 150 }}
                    value={filterUnit}
                    onChange={setFilterUnit}
                  >
                    <Option value="all">Barchasi</Option>
                    {DEPARTMENT_OPTIONS.map((opt) => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
            }
          >
            <Table
              rowKey="_id"
              dataSource={filteredWorkers}
              columns={columns}
              pagination={false}
              size="small"
              bordered
            />
          </Card>
        </TabPane>
        <TabPane tab="Kunlik xodimlar" key="3">
          <DailyWorkers />
        </TabPane>
        <TabPane tab="Davomat tarixi" key="2">
          <AttendanceHistory />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default Attendance;
