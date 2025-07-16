import React, { useState } from "react";
import { useGetAllAttendanceQuery } from "../../context/attendanceApi";
import { Calendar, Badge, Card, DatePicker, Spin, Modal, Table } from "antd";
import dayjs from "dayjs";
import { skipToken } from "@reduxjs/toolkit/query";

function AttendanceHistory() {
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const validRange = dateRange && dateRange[0] && dateRange[1];
  const { data, isLoading } = useGetAllAttendanceQuery(
    validRange
      ? {
          startDate: dateRange[0].format("YYYY-MM-DD"),
          endDate: dateRange[1].format("YYYY-MM-DD"),
        }
      : skipToken // <-- bu bilan query ishlamaydi
  );

  const attendanceByDate = {};

  data?.forEach((record) => {
    const day = dayjs(record.date).format("YYYY-MM-DD");
    if (!attendanceByDate[day]) attendanceByDate[day] = [];
    attendanceByDate[day].push(record);
  });

  const handleDateClick = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    if (attendanceByDate[dateStr]?.length) {
      setSelectedDate(dateStr);
      setModalOpen(true);
    }
  };

  const dateCellRender = (value) => {
    const dayKey = value.format("YYYY-MM-DD");
    const records = attendanceByDate[dayKey] || [];

    return records.length > 0 ? (
      <div
        style={{
          cursor: "pointer",
          color: "#1677ff",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={() => handleDateClick(value)}
      >
        <Badge count={records.length} style={{ backgroundColor: "#52c41a" }} />
      </div>
    ) : null;
  };

  const modalColumns = [
    {
      title: "Ism",
      dataIndex: ["employee", "firstName"],
      key: "firstName",
    },
    {
      title: "Familiya",
      dataIndex: ["employee", "lastName"],
      key: "lastName",
    },
    {
      title: "Davomat %",
      dataIndex: "percentage",
      key: "percentage",
      render: (text, record) =>
        record.employee.position === "Bo'lim boshlig'i"
          ? `${text - 0.2} smena`
          : `${text} smena`,
    },
    {
      title: "Bo‘lim",
      dataIndex: "unit",
      key: "unit",
    },
  ];

  if (isLoading) return <Spin size="large" />;

  return (
    <Card title="Davomat kalendari">
      <DatePicker.RangePicker
        value={dateRange}
        onChange={(range) => setDateRange(range || [])}
        allowClear
      />
      <Calendar cellRender={dateCellRender} />

      <Modal
        title={`${selectedDate} - Davomat ro'yxati`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={800}
      >
        <Table
          size="small"
          rowKey="_id"
          columns={modalColumns}
          dataSource={attendanceByDate[selectedDate] || []}
          pagination={false}
        />
      </Modal>
    </Card>
  );
}

export default AttendanceHistory;
