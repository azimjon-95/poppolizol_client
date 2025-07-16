import React, { useState } from "react";
import { useCreateNormaMutation } from "../../context/normaApi";
import { useGetAllMaterialsQuery } from "../../context/materialApi";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Form, Button, Row, Col, Select, InputNumber } from "antd";
import { polizolFolygoizol, ruberoid } from "../../utils/materialOptions";
import { toast } from "react-toastify";
import "./ProductNorma.css";

function AddProductNorma({ setModalState }) {
  const [form] = Form.useForm();
  const { Option } = Select;
  const { data: materialsData, isLoading: materialsLoading } = useGetAllMaterialsQuery();
  let materials = materialsData?.innerData;

  const [createProductNorma, { isLoading: createLoading }] = useCreateNormaMutation();
  const [productOptions, setProductOptions] = useState([]);
  const [productCategory, setProductCategory] = useState("polizol");

  // Function to extract size from product name
  const extractSize = (productName, category) => {
    if (productName.includes("(Brak)")) return "Brak";
    if (category === "polizol") {
      const match = productName.match(/(\d+\.?\d*\s*mm)/);
      return match ? match[0] : "";
    } else if (category === "ruberoid") {
      const match = productName.match(/(\d+m)/);
      return match ? match[0] : "";
    }
    return "";
  };

  // Handle button clicks to set product options
  const handleButtonClick = (type) => {
    if (type === "polizol") {
      setProductOptions(polizolFolygoizol);
      setProductCategory(type);
    } else if (type === "ruberoid") {
      setProductOptions(ruberoid);
      setProductCategory(type);
    }
    form.setFieldsValue({ productName: undefined, size: undefined });
  };

  // Handle product selection to set size
  const handleProductChange = (productName) => {
    const size = extractSize(productName, productCategory);
    form.setFieldsValue({ size });
  };

  const onFinish = async (values) => {
    const cost = {
      gasPerUnit: values.gasPerUnit || 0,
      electricityPerUnit: values.electricityPerUnit || 0,
      laborCost: values.laborCost || 0,
      otherExpenses: values.otherExpenses || 0,
    };

    values.cost = cost;
    values.category = productCategory;
    values.description = "";

    try {
      const res = await createProductNorma(values).unwrap();
      toast.success(res.data.message);

      // Reset form and states explicitly
      form.resetFields();
      setProductOptions([]);
      setProductCategory("polizol");
      setModalState((prev) => ({ ...prev, isViewOpen: true }))
    } catch (error) {
      toast.error(error.data?.message || "Noma'lum xato");
    }
  };

  return (
    <div className="hdr-main-container">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          materials: [{ materialId: "", quantity: "" }],
          size: "",
          gasPerUnit: 0,
          electricityPerUnit: 0,
          laborCost: 0,
          otherExpenses: 0,
          salePrice: 0,
          productName: undefined, // Ensure productName is cleared
          description: "", // Ensure description is cleared
        }}
        className="hdr-form"
      >
        <div className="hdr-category-section">
          <h3 className="hdr-section-title">Mahsulot Kategoriyasi</h3>
          <div className="hdr-category-buttons">
            <Button
              type="primary"
              onClick={() => handleButtonClick("polizol")}
              className={`hdr-category-btn ${productCategory === "polizol" ? "hdr-active-btn" : ""}`}
            >
              Polizol
            </Button>
            <Button
              type="primary"
              onClick={() => handleButtonClick("ruberoid")}
              className={`hdr-category-btn ${productCategory === "ruberoid" ? "hdr-active-btn" : ""}`}
            >
              Ruberoid
            </Button>
          </div>
          <br />
          <Col span={24}>
            <Form.Item
              label="Mahsulot nomi"
              name="productName"
              rules={[{ required: true, message: "Mahsulot nomini tanlang!" }]}
              className="hdr-form-item"
            >
              <Select
                placeholder="Mahsulotni tanlang"
                className="hdr-select"
                showSearch
                onChange={handleProductChange}
                optionFilterProp="children"
              >
                {productOptions.map((option, index) => (
                  <Option key={index} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </div>

        <div className="hdr-materials-section">
          <h3 className="hdr-section-title">Materiallar Ro'yxati</h3>
          <Form.List name="materials">
            {(fields, { add, remove }) => (
              <div className="hdr-materials-list">
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="hdr-material-item">
                    <Form.Item
                      {...restField}
                      name={[name, "materialId"]}
                      rules={[{ required: true, message: "Materialni tanlang!" }]}
                      className="hdr-material-select"
                    >
                      <Select
                        placeholder="Materialni tanlang"
                        loading={materialsLoading}
                        className="hdr-select hdr-material-dropdown"
                        showSearch
                        optionFilterProp="children"
                      >
                        {materials?.map((material) => (
                          <Option key={material._id} value={material._id}>
                            {material.name} (Narxi: {material?.price?.toLocaleString()} so'm)
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "quantity"]}
                      rules={[
                        { required: true, message: "Miqdorni kiriting!" },
                        { type: "number", min: 1, message: "Miqdor 1 dan kam bo'lmasligi kerak!" },
                      ]}
                      className="hdr-quantity-input"
                    >
                      <InputNumber
                        placeholder="Miqdor"
                        className="hdr-input hdr-quantity-field"
                        min={1}
                      />
                    </Form.Item>

                    <Button
                      type="text"
                      onClick={() => remove(name)}
                      className="hdr-remove-btn"
                      icon={<MinusCircleOutlined />}
                    />
                  </div>
                ))}
                <Form.Item className="hdr-add-material-wrapper">
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    className="hdr-add-material-btn"
                  >
                    Material qo'shish
                  </Button>
                </Form.Item>
              </div>
            )}
          </Form.List>
        </div>

        <div className="hdr-cost-section">
          <h3 className="hdr-section-title">Xarajatlar</h3>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Gaz (kub metr)"
                name="gasPerUnit"
                rules={[{ required: true, message: "Gaz miqdorini kiriting!" }]}
              >
                <InputNumber
                  placeholder="Gaz miqdori"
                  className="hdr-input"
                  min={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Elektr energiyasi (kVt)"
                name="electricityPerUnit"
                rules={[{ required: true, message: "Elektr miqdorini kiriting!" }]}
              >
                <InputNumber
                  placeholder="Elektr miqdori"
                  className="hdr-input"
                  min={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ishchilar xarajati (so'm)"
                name="laborCost"
                rules={[{ required: true, message: "Ishchilar xarajatini kiriting!" }]}
              >
                <InputNumber
                  placeholder="Ishchilar xarajati"
                  className="hdr-input"
                  min={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Boshqa xarajatlar (so'm)"
                name="otherExpenses"
                rules={[{ required: true, message: "Boshqa xarajatlar kiriting!" }]}
              >
                <InputNumber
                  placeholder="Boshqa xarajatlar"
                  className="hdr-input"
                  min={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Sotuv narxi"
                name="salePrice"
                rules={[{ required: true, message: "Boshqa xarajatlar kiriting!" }]}
              >
                <InputNumber
                  placeholder="Boshqa xarajatlar"
                  className="hdr-input"
                  min={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>


        <div className="hdr-submit-section">
          <Form.Item className="hdr-submit-wrapper">
            <Button
              type="primary"
              htmlType="submit"
              loading={createLoading}
              className="hdr-submit-btn"
              size="large"
            >
              {createLoading ? "Saqlanmoqda..." : "Norma qo'shish"}
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}

export default AddProductNorma;


