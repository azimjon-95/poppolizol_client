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

const { Option } = Select;
const { TabPane } = Tabs;

function Attendance() {
  const [attendanceData, setAttendanceData] = useState({});
  const [markedToday, setMarkedToday] = useState({});
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
      title: "Bo‘lim",
      key: "department",
      render: (_, record) => (
        <Select
          placeholder="Bo‘lim tanlang"
          style={{ width: 150 }}
          value={attendanceData[record._id]?.department}
          onChange={(value) => handleChange(record._id, "department", value)}
          disabled={markedToday[record._id]}
        >
          <Option value="polizol">Polizol</Option>
          <Option value="bt_3">BT-3</Option>
          <Option value="bt_5">BT-5</Option>
        </Select>
      ),
    },
    {
      title: "Davomat %",
      key: "percentage",
      render: (_, record) => (
        <Select
          placeholder="Foiz tanlang"
          style={{ width: 120 }}
          value={attendanceData[record._id]?.percentage}
          onChange={(value) => handleChange(record._id, "percentage", value)}
          disabled={markedToday[record._id]}
        >
          <Option value={0.33}>33%</Option>
          <Option value={0.5}>50%</Option>
          <Option value={0.75}>75%</Option>
          <Option value={1}>100%</Option>
          <Option value={1.5}>1.5 kun</Option>
          <Option value={2}>2 kun</Option>
        </Select>
      ),
    },
    {
      title: "Harakat",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleSave(record._id)}
          loading={isLoading}
          disabled={markedToday[record._id]}
        >
          Saqlash
        </Button>
      ),
    },
  ];

  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="Davomat" key="1">
        <Card title="Bugungi davomat">
          <Table
            rowKey="_id"
            dataSource={workers?.innerData || []}
            columns={columns}
            pagination={false}
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
