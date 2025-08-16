import React, { useMemo, useState, useEffect } from "react";
import {
  Table,
  Space,
  Button,
  Popconfirm,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import {
  useDeleteBonusMutation,
  useUpdateBonusMutation,
} from "../../context/bonusApi";
import { toast, ToastContainer } from "react-toastify";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

const monthFormat = "YYYY-MM";

function getEmployeeName(emp) {
  if (!emp) return "-";
  if (typeof emp === "string") return emp;
  const parts = [emp.lastName, emp.firstName, emp.middleName].filter(Boolean);
  return parts.join(" ") || emp._id || "-";
}

export default function Bonus({ data = [] }) {
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [deleteBonus] = useDeleteBonusMutation();
  const [updateBonus] = useUpdateBonusMutation();

  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        amount: editing.amount,
        period: dayjs(editing.period, monthFormat),
        description: editing.description || "",
      });
    } else {
      form.resetFields();
    }
  }, [editing, form]);

  const columns = useMemo(
    () => [
      {
        title: "№",
        key: "index",
        width: 60,
        render: (_v, _r, i) => i + 1,
      },
      {
        title: "Hodim",
        key: "employee",
        render: (_, record) => getEmployeeName(record.employeeId),
      },
      {
        title: "Miqdori",
        dataIndex: "amount",
        key: "amount",
        render: (v) =>
          typeof v === "number" ? `${v.toLocaleString()} so‘m` : v,
      },
      { title: "Oy uchun", dataIndex: "period", key: "period" },
      {
        title: "Izoh",
        dataIndex: "description",
        key: "description",
        ellipsis: true,
      },
      {
        title: "Amallar",
        key: "actions",
        fixed: "right",
        width: 160,
        render: (_, record) => (
          <Space>
            <Button
              onClick={() => {
                setEditing(record);
                setOpenEdit(true);
              }}
              type="primary"
              icon={<EditOutlined />}
            />
            <Popconfirm
              title="O‘chirishni tasdiqlaysizmi?"
              okText="Ha"
              cancelText="Yo‘q"
              onConfirm={() => handleDelete(record._id)}
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    []
  );

  // Handle delete action
  const handleDelete = async (id) => {
    try {
      await deleteBonus(id).unwrap();
      toast.success("O‘chirildi");
    } catch (e) {
      toast.error(e?.data.message || "O‘chirishda xatolik");
    }
  };

  const onEditFinish = async (values) => {
    if (!editing?._id) return;

    const payload = {
      amount: Number(values.amount),
      period: values.period?.format(monthFormat),
      description: values.description || "",
    };

    try {
      await updateBonus({ id: editing?._id, data: payload });
      toast.success("Yangilandi");
      setOpenEdit(false);
      setEditing(null);
    } catch (e) {
      toast.error(e?.message || "Yangilashda xatolik");
    }
  };

  if (!data || data.length === 0) {
    return <p>Bonus ma'lumotlari topilmadi</p>;
  }

  return (
    <>
      <ToastContainer />
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        pagination={false} // page/limit YO‘Q
        scroll={{ x: 900 }}
        size="small"
      />

      <Modal
        title="Bonusni tahrirlash"
        open={openEdit}
        onCancel={() => {
          setOpenEdit(false);
          setEditing(null);
        }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={onEditFinish}>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Amount kiriting" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="period"
            label="Period"
            rules={[{ required: true, message: "Oy tanlang" }]}
          >
            <DatePicker picker="month" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Izoh (ixtiyoriy)" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
