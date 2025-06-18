import React, { useState } from "react";
import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Radio,
  Popconfirm,
} from "antd";
import {
  useGetAllMaterialsQuery,
  useDeleteMaterialMutation,
  useUpdateMaterialMutation,
} from "../../context/materialApi";
import { numberFormat } from "../../utils/numberFormat";
import AddMaterial from "./AddMaterial";
import { useSelector } from "react-redux";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import FormattedInput from "../../components/FormattedInput";
import "./Materials.css";

const Materials = () => {
  const [form] = Form.useForm();

  const { data: materials, isLoading } = useGetAllMaterialsQuery();
  const materialsData = materials?.innerData || [];
  const [removeMaterial] = useDeleteMaterialMutation();
  const searchTextValue = useSelector((s) => s.search.searchQuery);

  const [updateMaterial] = useUpdateMaterialMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const deleteMaterial = async (id) => {
    try {
      await removeMaterial(id);
      toast.success("Material muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error("Error deleting material:", error);
      toast.error(
        error.data.message || "Materialni o'chirishda xatolik yuz berdi"
      );
    }
  };

  const columns = [
    {
      title: "Nomi",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Narxi",
      dataIndex: "price",
      key: "price",
      render: (price, record) => `${numberFormat(price)} ${record.currency}`,
    },
    {
      title: "Miqdori",
      dataIndex: "quantity",
      key: "quantity",
    },
    { title: "O'lchov birlik", dataIndex: "unit", key: "unit" },
    {
      title: "Amallar",
      key: "actions",
      render: (text, record) => (
        <div className="actions">
          <Popconfirm
            title="Haqiqatan ham o‘chirmoqchimisiz?"
            okText="Ha"
            cancelText="Yo‘q"
            onConfirm={() => deleteMaterial(record._id)}
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setIsModalOpen(record);
              form.setFieldsValue(record);
            }}
          />
        </div>
      ),
    },
  ];

  const filteredMaterials = materialsData.filter((material) =>
    material.name.toLowerCase().includes(searchTextValue.toLowerCase())
  );

  const updateM = async (values) => {
    try {
      values.quantity = Number(values.quantity);
      values.price = Number(values.price);
      await updateMaterial({ id: isModalOpen._id, body: values });
      toast.success("Material muvaffaqiyatli tahrirlandi");
      setIsModalOpen(false);
    } catch (error) {
      toast.error(
        error.data.message || "Materialni tahrirlashda xatolik yuz berdi"
      );
    }
  };

  return (
    <div>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Materiallar" key="1">
          <Modal
            title="Materialni tahrirlash"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
          >
            <Form form={form} layout="vertical" onFinish={updateM}>
              <Form.Item
                label="Nomi"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Material nomi kiritish shart",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="O‘lchov birligi"
                name="unit"
                rules={[
                  {
                    required: true,
                    message: "Material o'lchov birligini tanlash shart",
                  },
                ]}
              >
                <Select placeholder="Tanlang">
                  <Option value="kilo">Kilogram</Option>
                  <Option value="dona">Dona</Option>
                  <Option value="metr">Metr</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Miqdori"
                name="quantity"
                rules={[{ required: true, message: "Miqdor kiritish shart" }]}
              >
                <FormattedInput placeholder="Miqdorini kiriting" />
              </Form.Item>
              <Form.Item
                label="Narxi"
                name="price"
                rules={[{ required: true, message: "Narxini kiritish shart" }]}
              >
                <FormattedInput placeholder="Tan narxini kiriting" />
              </Form.Item>
              <Form.Item
                label="Pul birligi"
                name="currency"
                rules={[
                  {
                    required: true,
                    message: "Pul birligini tanlash shart",
                  },
                ]}
              >
                <Radio.Group>
                  <Radio value="sum">So‘m</Radio>
                  <Radio value="dollar">Dollar</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item>
                <Button loading={isLoading} type="primary" htmlType="submit">
                  Saqlash
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          <Table
            columns={columns}
            dataSource={filteredMaterials}
            loading={isLoading}
            rowKey="_id"
            pagination={false}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Material qo'shish" key="2">
          <AddMaterial />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default Materials;
