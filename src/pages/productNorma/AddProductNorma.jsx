import React, { useState } from "react";
import { useCreateNormaMutation } from "../../context/normaApi";
import { useGetAllMaterialsQuery } from "../../context/materialApi";
import { useGetAllCategoriesQuery } from "../../context/categoryApi";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Form, Button, Row, Col, Select, InputNumber } from "antd";
import "./ProductNorma.css";

// Message komponenti
const Message = ({ type, content, onClose }) => {
  // 3 soniyadan keyin xabar avtomatik yopiladi
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`hdr-message hdr-message-${type}`}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "12px 24px",
        borderRadius: "4px",
        color: "#fff",
        backgroundColor: type === "success" ? "#52c41a" : "#ff4d4f",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        zIndex: 1000,
      }}
    >
      {content}
    </div>
  );
};

function AddProductNorma({ setModalState, renderTable }) {
  const [form] = Form.useForm();
  const { Option } = Select;
  const { data: materialsData, isLoading: materialsLoading } = useGetAllMaterialsQuery();
  const materials = materialsData?.innerData || [];
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const categories = categoriesData?.innerData || [];
  const [createProductNorma, { isLoading: createLoading }] = useCreateNormaMutation();
  const [productOptions, setProductOptions] = useState([]);
  const [productCategory, setProductCategory] = useState("polizol");
  const [salePrice, setSalePrice] = useState(0);
  // Message state
  const [message, setMessage] = useState({ visible: false, type: "", content: "" });

  // Number formatter and parser
  const numberFormatter = (value) => {
    if (!value) return "";
    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const numberParser = (value) => {
    if (!value) return "";
    return value.replace(/\./g, "");
  };

  // Function to extract size from product name
  const extractSize = (productName, category) => {
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
      setProductOptions(categories.filter((i) => i.category === "Polizol"));
      setProductCategory(type);
    } else if (type === "folygoizol") {
      setProductOptions(categories.filter((i) => i.category === "Folygoizol"));
      setProductCategory(type);
    } else if (type === "ruberoid") {
      setProductOptions(categories.filter((i) => i.category === "Ruberoid"));
      setProductCategory(type);
    }
    form.setFieldsValue({ productName: undefined, size: undefined });
  };

  // Handle product selection to set size
  const handleProductChange = (productName) => {
    const size = extractSize(productName, productCategory);
    form.setFieldsValue({ size });
  };

  // Show message
  const showMessage = (type, content) => {
    setMessage({ visible: true, type, content });
  };

  // Hide message
  const hideMessage = () => {
    setMessage({ visible: false, type: "", content: "" });
  };

  const onFinish = async (values) => {
    const payload = {
      ...values,
      category: productCategory,
      description: "",
      salePrice: salePrice,
    };

    try {
      const res = await createProductNorma(payload).unwrap();
      console.log(res);
      showMessage("success", res.message || "Norma muvaffaqiyatli qo'shildi!");

      // Reset form and states
      form.resetFields();
      setProductOptions([]);
      setProductCategory("polizol");
      renderTable(productCategory);
      setSalePrice(0);
      setModalState((prev) => ({ ...prev, isViewOpen: false }));
    } catch (error) {
      console.log(error);
      showMessage("error", error.data?.message || "Noma'lum xatolik yuz berdi");
    }
  };

  return (
    <div className="hdr-main-container">
      {/* Message komponentini ko'rsatish */}
      {message.visible && (
        <Message
          type={message.type}
          content={message.content}
          onClose={hideMessage}
        />
      )}
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
          productName: undefined,
          description: "",
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
              loading={categoriesLoading}
            >
              Polizol
            </Button>
            <Button
              type="primary"
              onClick={() => handleButtonClick("folygoizol")}
              className={`hdr-category-btn ${productCategory === "folygoizol" ? "hdr-active-btn" : ""}`}
              loading={categoriesLoading}
            >
              Folygoizol
            </Button>
            <Button
              type="primary"
              onClick={() => handleButtonClick("ruberoid")}
              className={`hdr-category-btn ${productCategory === "ruberoid" ? "hdr-active-btn" : ""}`}
              loading={categoriesLoading}
            >
              Ruberoid
            </Button>
          </div>
          <br />
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mahsulot nomi"
                name="productName"
                rules={[{ required: true, message: "Mahsulot nomini tanlang!" }]}
              >
                <Select
                  placeholder="Mahsulotni tanlang"
                  className="hdr-select"
                  showSearch
                  onChange={handleProductChange}
                  optionFilterProp="children"
                  loading={categoriesLoading}
                >
                  {productOptions.map((option) => (
                    <Option key={option._id} value={option.name}>
                      {option.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Sotuv narxi"
                name="salePrice"
                rules={[{ required: true, message: "Sotuv narxini kiriting!" }]}
              >
                <InputNumber
                  placeholder="Sotuv narxi"
                  className="hdr-input"
                  min={0}
                  style={{ width: "100%" }}
                  formatter={numberFormatter}
                  parser={numberParser}
                  onChange={(value) => setSalePrice(value ? Number(numberParser(String(value))) : 0)}
                />
              </Form.Item>
            </Col>
          </Row>
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
                        {materials.map((material) => (
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