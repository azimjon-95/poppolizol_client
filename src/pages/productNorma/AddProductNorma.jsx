import React, { useState } from "react";
import { useCreateNormaMutation } from "../../context/normaApi";
import { useGetAllMaterialsQuery } from "../../context/materialApi";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Form, Input, Button, Row, Col, Select, Space } from "antd";
import { toast } from "react-toastify";

function AddProductNorma() {
  const [form] = Form.useForm();
  const { Option } = Select;
  const { data: materialsData, isLoading: materialsLoading } =
    useGetAllMaterialsQuery();
  let materials = materialsData?.innerData;

  const [createProductNorma, { isLoading: createLoading }] =
    useCreateNormaMutation();

  const onFinish = async (values) => {
    const cost = {
      productionCost: 25300,     // bitta mahsulot uchun umumiy ishlab chiqarish narxi
      gasPerUnit: 90,            // bitta mahsulot uchun gaz sarfi
      electricityPerUnit: 100,   // bitta mahsulot uchun elektr sarfi
    };

    values.cost = cost;

    try {
      const res = await createProductNorma(values).unwrap();
      toast.success(res.message);
      form.resetFields();
    } catch (error) {
      toast.error(error.data?.message || "Noma'lum xato");
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        materials: [{ materialId: "", quantity: "" }],
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Mahsulot nomi"
            name="productName"
            rules={[{ required: true, message: "Mahsulot nomini kiriting!" }]}
          >
            <Input placeholder="Masalan: polizol A" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Kategoriya"
            name="category"
            rules={[{ required: true, message: "Kategoriyani kiriting !" }]}
          >
            <Input placeholder="Yangi kategoriyani kiriting" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="size"
            label="O'lcham"
            rules={[{ required: true, message: "O'lchamni tanlang!" }]}
          >
            <Input type="text" placeholder="O'lcham" />
          </Form.Item>
        </Col>
      </Row>

      {/* Materiallar ro‘yxati */}
      <Form.List name="materials">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space
                key={key}
                align="baseline"
                style={{ display: "flex", marginBottom: 8 }}
              >
                <Form.Item
                  {...restField}
                  name={[name, "materialId"]}
                  rules={[{ required: true, message: "Materialni tanlang!" }]}
                >
                  <Select
                    placeholder="Materialni tanlang"
                    loading={materialsLoading}
                    style={{ width: 200 }}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option?.children
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {materials?.map((material) => (
                      <Option key={material._id} value={material._id}>
                        {material.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  {...restField}
                  name={[name, "quantity"]}
                  rules={[
                    { required: true, message: "Miqdorni kiriting!" },
                    {
                      message: "Miqdor 1 dan kam bo‘lmasligi kerak!",
                    },
                  ]}
                >
                  <Input
                    type="number"
                    placeholder="Miqdor"
                    style={{ width: 100 }}
                  />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Material qo‘shish
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      {/* Tavsif */}
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Tavsif"
            name="description"
            rules={[{ required: false }]}
          >
            <Input.TextArea placeholder="Qo‘shimcha ma'lumot" rows={4} />
          </Form.Item>
        </Col>
      </Row>

      {/* Yuborish tugmasi */}
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={createLoading}>
          {createLoading ? "Saqlanmoqda..." : "Norma qo‘shish"}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default AddProductNorma;
