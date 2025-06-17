import React from "react";
import { Form, Button, Row, Col, Select, Radio } from "antd";
import {
  useCreateMaterialMutation,
  useGetAllMaterialsQuery,
} from "../../context/materialApi";
import FormattedInput from "../../components/FormattedInput";
import { toast } from "react-toastify";

const { Option } = Select;

function AddMaterial() {
  const [form] = Form.useForm();
  const [createMaterial, { isLoading }] = useCreateMaterialMutation();
  const { data: materials } = useGetAllMaterialsQuery();
  const materialsData = materials?.innerData || [];

  const onFinish = async (values) => {
    try {
      values.quantity = Number(values.quantity);
      values.price = Number(values.price);
      await createMaterial(values).unwrap();
      toast.success("Material muvaffaqiyatli qo'shildi");
      form.resetFields();
    } catch (error) {
      toast.error(
        error.data?.message || "Material qo'shishda xatolik yuz berdi"
      );
    }
  };

  const handleSearch = (value) => {
    if (
      value &&
      !materialsData.some(
        (material) => material.name.toLowerCase() === value.toLowerCase()
      )
    ) {
      form.setFieldsValue({ name: value });
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Nomi"
            name="name"
            rules={[
              { required: true, message: "Material nomi kiritish shart" },
            ]}
          >
            <Select
              showSearch
              placeholder="Material nomini tanlang"
              onSearch={handleSearch}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              allowClear
            >
              {materialsData.map((material) => (
                <Option
                  key={material._id}
                  value={material.name}
                  material={material}
                >
                  {material.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
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
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Miqdori"
            name="quantity"
            rules={[{ required: true, message: "Miqdor kiritish shart" }]}
          >
            <FormattedInput placeholder="Miqdorini kiriting" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Narxi"
            name="price"
            rules={[{ required: true, message: "Narxini kiritish shart" }]}
          >
            <FormattedInput placeholder="Tan narxini kiriting" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="Pul birligi"
            name="currency"
            rules={[{ required: true, message: "Pul birligini tanlash shart" }]}
          >
            <Radio.Group>
              <Radio value="sum">So‘m</Radio>
              <Radio value="dollar">Dollar</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Button loading={isLoading} type="primary" htmlType="submit">
          Material qo‘shish
        </Button>
      </Form.Item>
    </Form>
  );
}

export default AddMaterial;
