import React, { useState, useEffect } from "react";
import {
  useMarkAttendanceMutation,
  useGetAllAttendanceQuery,
} from "../../context/attendanceApi";
import { useGetWorkersQuery } from "../../context/workersApi";
import { Button, Card, Select, Table, Spin, Tabs } from "antd";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import "react-toastify/dist/ReactToastify.css";
import AttendanceHistory from "./AttendanceHistory";
import Search from "antd/es/input/Search";

const { Option } = Select;
const { TabPane } = Tabs;

function Attendance() {
  const [attendanceData, setAttendanceData] = useState({});
  const [markedToday, setMarkedToday] = useState({});
  const [filterUnit, setFilterUnit] = useState("all"); // ⭐️ filter state
  const [searchTerm, setSearchTerm] = useState(""); // ⭐️ search state
  const [markAttendance, { isLoading }] = useMarkAttendanceMutation();
  const { data: workers, isLoading: isWorkersLoading } = useGetWorkersQuery();

  const today = dayjs().format("YYYY-MM-DD");

  const { data: existingRecords } = useGetAllAttendanceQuery({
    startDate: today,
    endDate: today,
  });

  useEffect(() => {
    if (existingRecords) {
      const map = {};
      const filled = {};
      existingRecords.forEach((r) => {
        map[r.employee._id] = true;
        filled[r.employee._id] = {
          department: r.department,
          percentage: r.percentage,
        };
      });
      setMarkedToday(map);
      setAttendanceData((prev) => ({ ...filled, ...prev }));
    }
  }, [existingRecords]);

  const handleChange = (employeeId, field, value) => {
    setAttendanceData((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (employeeId) => {
    const record = attendanceData[employeeId];
    if (!record?.percentage) return toast.warning("Foiz tanlanmagan");
    if (!record?.department) return toast.warning("Bo‘lim tanlanmagan");

    try {
      await markAttendance({
        employeeId,
        date: today,
        percentage: record.percentage,
        department: record.department,
      }).unwrap();
      toast.success("Davomat saqlandi");
      setMarkedToday((prev) => ({ ...prev, [employeeId]: true }));
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi");
    }
  };

  if (isWorkersLoading) return <Spin />;

  const filteredWorkers = (workers?.innerData || [])
    .filter((w) => {
      if (filterUnit === "all") return true;
      return (w.unit || "").toLowerCase() === filterUnit;
    })
    .filter((w) => {
      if (!searchTerm.trim()) return true;
      const fio = [w.firstName, w.lastName, w.middleName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return fio.includes(searchTerm.trim().toLowerCase());
    });

  const columns = [
    {
      title: "Ism",
      dataIndex: "firstName",
      key: "firstName",
    },
    {
      title: "Familiya",
      dataIndex: "lastName",
      key: "lastName",
    },
    {
      title: "Yo'nalish",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Bo‘lim",
      key: "department",
      render: (_, record) => {
        return (
          <Select
            placeholder="Bo‘lim tanlang"
            style={{ width: 150 }}
            value={attendanceData[record._id]?.department}
            onChange={(value) => handleChange(record._id, "department", value)}
            disabled={
              record.department !== "transport" && markedToday[record._id]
            }
          >
            <Option value="polizol">Polizol</Option>
            <Option value="bt_3">BT-3</Option>
            <Option value="bt_5">BT-5</Option>
          </Select>
        );
      },
    },
    {
      title: "Davomat %",
      key: "percentage",
      render: (_, record) => {
        const isTransport = record.department === "transport";
        const options = isTransport
          ? [{ value: 0.33, label: "33%" }]
          : [
              { value: 0.33, label: "33%" },
              { value: 0.5, label: "50%" },
              { value: 0.75, label: "75%" },
              { value: 1, label: "100%" },
              { value: 1.5, label: "1.5 kun" },
              { value: 2, label: "2 kun" },
            ];

        return (
          <Select
            placeholder="Foiz tanlang"
            style={{ width: 120 }}
            value={attendanceData[record._id]?.percentage}
            onChange={(value) => handleChange(record._id, "percentage", value)}
            disabled={!isTransport && markedToday[record._id]}
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
      title: "Harakat",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleSave(record._id)}
          loading={isLoading}
          disabled={
            record.department !== "transport" && markedToday[record._id]
          }
        >
          Saqlash
        </Button>
      ),
    },
  ];

  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="Davomat" key="1">
        <Card
          title={
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p>Bugungi davomat</p>
              <div>
                <Search
                  placeholder="Qidiruv"
                  style={{ width: 200, marginRight: 8 }}
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
                  <Option value="polizol">Polizol</Option>
                  <Option value="rubiroid">Rubiroid</Option>
                  <Option value="ochisleniya">Ochisleniya</Option>
                  <Option value="boshqa">Boshqa</Option>
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
            scroll={{ y: 700 }}
          />
        </Card>
      </TabPane>
      <TabPane tab="Davomat tarixi" key="2">
        <AttendanceHistory />
      </TabPane>
    </Tabs>
  );
}

export default Attendance;
