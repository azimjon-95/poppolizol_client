import React, { useState } from "react";
import {
  Table, Button, Modal, Form, Input, Select, Radio, Popconfirm, Card, Row, Col, Space, Tag, Typography, Divider
} from "antd";
import {
  useGetAllMaterialsQuery, useDeleteMaterialMutation, useUpdateMaterialMutation, useCreateMaterialMutation,
  useGetFirmsQuery, useCreateFirmMutation, useCreateIncomeMutation, useGetIncomesQuery
} from "../../context/materialApi";
import { numberFormat } from "../../utils/numberFormat";
import { capitalizeFirstLetter } from "../../hook/CapitalizeFirstLitter";
import { useSelector } from "react-redux";
import { DeleteOutlined, EditOutlined, PlusOutlined, ShopOutlined, BarChartOutlined, BuildOutlined, SafetyOutlined } from "@ant-design/icons";
import { LuPackagePlus } from "react-icons/lu";
import { toast } from "react-toastify";
import FormattedInput from "../../components/FormattedInput";
import IncomeListModal from "./IncomeListModal";
import "./Materials.css";

const { Option } = Select;
const { Title, Text } = Typography;

const WarehouseManagement = () => {
  const [materialForm] = Form.useForm();
  const [firmForm] = Form.useForm();
  const [incomeForm] = Form.useForm();

  // API Hooks
  const { data: materials, refetch, isLoading: materialsLoading } = useGetAllMaterialsQuery();
  const { data: firms, isLoading: firmsLoading } = useGetFirmsQuery();
  const { data: incomesData, isLoading: incomesIsLoading } = useGetIncomesQuery();
  const [createMaterial, { isLoading: createMaterialLoading }] = useCreateMaterialMutation();
  const [updateMaterial, { isLoading: updateMaterialLoading }] = useUpdateMaterialMutation();
  const [deleteMaterial] = useDeleteMaterialMutation();
  const [createFirm, { isLoading: createFirmLoading }] = useCreateFirmMutation();
  const [createIncome, { isLoading: createIncomeLoading }] = useCreateIncomeMutation();
  console.log(materials);
  // Data
  const materialsData = materials?.innerData || [];
  const firmsData = firms?.innerData || [];
  const incomesDataList = incomesData?.innerData || [];
  const searchTextValue = useSelector((s) => s.search.searchQuery);

  // State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFirmModalOpen, setIsFirmModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isIncomeListModalOpen, setIsIncomeListModalOpen] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [incomeSearchText, setIncomeSearchText] = useState("");

  // Handlers
  const handleDeleteMaterial = async (id) => {
    try {
      await deleteMaterial(id).unwrap();
      toast.success("Material muvaffaqiyatli o'chirildi");
    } catch (error) {
      toast.error(error?.data?.message || "Materialni o'chirishda xatolik yuz berdi");
    }
  };

  const handleUpdateMaterial = async (values) => {
    try {
      const updatedValues = {
        ...values,
        quantity: Number(values.quantity),
        price: Number(values.price),
        currency: "sum",
      };
      await updateMaterial({ id: editingMaterial._id, body: updatedValues }).unwrap();
      toast.success("Material muvaffaqiyatli tahrirlandi");
      setIsEditModalOpen(false);
      setEditingMaterial(null);
      materialForm.resetFields();
    } catch (error) {
      toast.error(error?.data?.message || "Materialni tahrirlashda xatolik yuz berdi");
    }
  };

  const handleCreateFirm = async (values) => {
    try {
      await createFirm(values).unwrap();
      toast.success("Firma muvaffaqiyatli qo'shildi");
      firmForm.resetFields();
      setIsFirmModalOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || "Firma qo'shishda xatolik yuz berdi");
    }
  };

  const handleAddMaterialToIncome = () => {
    const newMaterial = {
      id: Date.now(),
      name: "",
      quantity: 0,
      price: 0,
      currency: "sum",
      category: "BN-3",
      unit: "kilo",
    };
    setSelectedMaterials([...selectedMaterials, newMaterial]);
  };

  const handleRemoveMaterialFromIncome = (id) => {
    setSelectedMaterials(selectedMaterials.filter((m) => m.id !== id));
  };

  const handleMaterialChange = (id, field, value) => {
    setSelectedMaterials(
      selectedMaterials.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };
  console.log(selectedMaterials);
  const handleIncomeSubmit = async () => {
    try {
      const values = await incomeForm.validateFields();

      if (selectedMaterials.length === 0) {
        toast.error("Hech bo'lmaganda bitta material qo'shing");
        return;
      }

      for (const material of selectedMaterials) {

        if (
          !material.name ||
          !material.quantity ||
          !material.price ||
          !material.unit ||
          !material.category
        ) {
          toast.error("Barcha materiallar to'liq to'ldirilishi kerak");
          return;
        }
      }

      const selectedFirm = firmsData.find((firm) => firm._id === values.firmId);
      if (!selectedFirm) {
        toast.error("Firma topilmadi");
        return;
      }

      const incomeData = {
        firm: {
          name: selectedFirm.name,
          phone: selectedFirm.phone,
          address: selectedFirm.address,
        },
        materials: selectedMaterials.map((material) => ({
          name: material.name,
          quantity: Number(material.quantity),
          price: Number(material.price),
          currency: "sum",
          unit: material.unit,
          category: material.category,
        })),
        price: Number(values.paidAmount) || 0,
      };
      await createIncome(incomeData).unwrap();
      toast.success("Kirim muvaffaqiyatli qo'shildi");
      setIsIncomeModalOpen(false);
      setSelectedMaterials([]);
      refetch()
      incomeForm.resetFields();
    } catch (error) {
      toast.error(error?.data?.message || "Kirim qo'shishda xatolik yuz berdi");
    }
  };

  // Table columns
  const materialColumns = [
    {
      title: "Material",
      dataIndex: "name",
      key: "name",
      className: "warehouse-table-cell-primary",
      render: (text) => (
        <div className="warehouse-material-name">
          <LuPackagePlus className="warehouse-material-icon" />
          <Text strong>{capitalizeFirstLetter(text)}</Text>
        </div>
      ),
    },
    {
      title: "Birlik narxi",
      dataIndex: "price",
      key: "price",
      className: "warehouse-table-cell-price",
      render: (price, record) => (
        <Tag className={`warehouse-price-tag warehouse-price-tag-${record.currency}`}>
          {numberFormat(price)} <Text type="secondary">so'm</Text>
        </Tag>
      ),
    },
    {
      title: "Umumiy summa",
      key: "totalPrice",
      className: "warehouse-table-cell-price",
      render: (_, record) => (
        <Tag className={`warehouse-price-tag warehouse-price-tag-${record.currency}`}>
          {numberFormat(record.price * record.quantity)} <Text type="secondary"> so'm</Text>
        </Tag>
      ),
    },
    {
      title: "Miqdor",
      dataIndex: "quantity",
      key: "quantity",
      className: "warehouse-table-cell-quantity",
      render: (quantity, record) => (
        <div className="warehouse-quantity-display">
          <Text strong className="warehouse-quantity-number">{numberFormat(quantity)}</Text>
        </div>
      ),
    },
    {
      title: "Birlik",
      dataIndex: "unit",
      key: "unit",
      className: "warehouse-table-cell-unit",
      render: (unit) => (
        <Tag className={`warehouse-unit-tag warehouse-unit-tag-${unit}`}>
          {unit}
        </Tag>
      ),
    },
    {
      title: "Harakatlar",
      key: "actions",
      className: "warehouse-table-cell-actions",
      render: (_, record) => (
        <Space className="warehouse-action-buttons">
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            className="warehouse-edit-btn"
            onClick={() => {
              setEditingMaterial(record);
              setIsEditModalOpen(true);
              materialForm.setFieldsValue({
                ...record,
                price: record.avgPrice,
              });
            }}
          />
          <Popconfirm
            title="Materialni o'chirish"
            description="Haqiqatan ham bu materialni o'chirmoqchimisiz?"
            okText="Ha"
            cancelText="Yo'q"
            onConfirm={() => handleDeleteMaterial(record._id)}
            okButtonProps={{ className: "warehouse-confirm-btn" }}
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              className="warehouse-delete-btn"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Filter materials and incomes
  const filteredMaterials = materialsData.filter((material) =>
    material.name.toLowerCase().includes(searchTextValue.toLowerCase())
  );

  const filteredIncomes = incomesDataList.filter((income) => {
    const firmName = income.firm?.name?.toLowerCase() || "";
    const materialNames =
      income.materials?.map((m) => m.material?.name?.toLowerCase()).join(" ") || "";
    const searchLower = incomeSearchText.toLowerCase();
    return firmName.includes(searchLower) || materialNames.includes(searchLower);
  });

  // Calculate statistics
  const totalMaterials = materialsData.length;
  const totalValue = materialsData.reduce(
    (sum, material) => sum + (material.price || 0) * material.quantity,
    0
  );
  const lowStockMaterials = materialsData.filter((m) => m.quantity < 10).length;

  return (
    <div className="warehouse-container">
      <div className="warehouse-main-content">
        {/* Statistics Cards */}
        <Row gutter={[24, 24]} className="warehouse-stats-row">
          <Col xs={24} sm={12} lg={6}>
            <Card className="warehouse-stat-card warehouse-stat-card-primary">
              <div className="warehouse-stat-content">
                <div className="warehouse-stat-icon">
                  <LuPackagePlus />
                </div>
                <div className="warehouse-stat-info">
                  <Text className="warehouse-stat-number">{totalMaterials}</Text>
                  <Text className="warehouse-stat-label">Jami materiallar</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="warehouse-stat-card warehouse-stat-card-success">
              <div className="warehouse-stat-content">
                <div className="warehouse-stat-icon">
                  <BarChartOutlined />
                </div>
                <div className="warehouse-stat-info">
                  <Text className="warehouse-stat-number">{numberFormat(totalValue)} so'm</Text>
                  <Text className="warehouse-stat-label">Umumiy qiymat</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="warehouse-stat-card warehouse-stat-card-warning">
              <div className="warehouse-stat-content">
                <div className="warehouse-stat-icon">
                  <SafetyOutlined />
                </div>
                <div className="warehouse-stat-info">
                  <Text className="warehouse-stat-number">{lowStockMaterials}</Text>
                  <Text className="warehouse-stat-label">Kam qolgan</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="warehouse-stat-card warehouse-stat-card-info">
              <div className="warehouse-stat-content">
                <div className="warehouse-stat-icon">
                  <ShopOutlined />
                </div>
                <div className="warehouse-stat-info">
                  <Text className="warehouse-stat-number">{firmsData.length}</Text>
                  <Text className="warehouse-stat-label">Hamkor firmalar</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Materials Table */}
        <Card className="warehouse-table-card">
          <div className="warehouse-table-header">
            <Title level={4} className="warehouse-table-title">
              <BuildOutlined /> Ombordagi Materiallar
            </Title>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="warehouse-add-btn"
                onClick={() => setIsIncomeModalOpen(true)}
              >
                Yangi material keldi
              </Button>
              <Button
                type="primary"
                icon={<ShopOutlined />}
                className="warehouse-add-btn"
                onClick={() => setIsFirmModalOpen(true)}
              >
                Firma qo'shish
              </Button>
              <Button
                type="primary"
                icon={<BarChartOutlined />}
                className="warehouse-add-btn warehouse-income-list-btn"
                onClick={() => setIsIncomeListModalOpen(true)}
              >
                Kirimlar tarixi
              </Button>
            </Space>
          </div>
          <Table
            columns={materialColumns}
            dataSource={filteredMaterials}
            loading={materialsLoading}
            rowKey="_id"
            pagination={false}
            className="warehouse-materials-table"
            size="small"
            bordered
          />
        </Card>
      </div>

      {/* Edit Material Modal */}
      <Modal
        title={<span style={{ color: "#fff" }}>Materialni Tahrirlash</span>}
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingMaterial(null);
          materialForm.resetFields();
        }}
        footer={null}
        className="warehouse-modal"
      >
        <Form
          form={materialForm}
          layout="vertical"
          onFinish={handleUpdateMaterial}
          className="warehouse-add-form"
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Material nomi"
                name="name"
                rules={[{ required: true, message: "Material nomi kiritish shart" }]}
                className="warehouse-form-item"
              >
                <Input
                  placeholder="Material nomini kiriting"
                  className="warehouse-input"
                  prefix={<LuPackagePlus />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="O'lchov birligi"
                name="unit"
                rules={[{ required: true, message: "O'lchov birligini tanlash shart" }]}
                className="warehouse-form-item"
              >
                <Select placeholder="Birlikni tanlang" className="warehouse-select">
                  <Option value="kilo">Kilogram (kg)</Option>
                  <Option value="dona">Dona</Option>
                  <Option value="metr">Metr (m)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Kategoriya"
                name="category"
                rules={[{ required: true, message: "Kategoriyani tanlash shart" }]}
                // initialValue="BN-3"
                className="warehouse-form-item"
              >
                <Select placeholder="Kategoriyani tanlang" className="warehouse-select">
                  <Option value="BN-3">BN-3</Option>
                  <Option value="BN-5">BN-5</Option>
                  <Option value="Mel">Mel</Option>
                  <Option value="Others">Boshqalar</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Miqdori"
                name="quantity"
                rules={[{ required: true, message: "Miqdor kiritish shart" }]}
                className="warehouse-form-item"
              >
                <FormattedInput placeholder="Miqdorini kiriting" className="warehouse-input" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Narxi"
                name="price"
                rules={[{ required: true, message: "Narxini kiritish shart" }]}
                className="warehouse-form-item"
              >
                <FormattedInput placeholder="Narxini kiriting" className="warehouse-input" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item className="warehouse-form-submit">
            <Button
              type="primary"
              htmlType="submit"
              loading={updateMaterialLoading}
              icon={<EditOutlined />}
              size="large"
              className="warehouse-submit-btn"
            >
              Saqlash
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Firm Modal */}
      <Modal
        title={<span style={{ color: "#fff" }}>Firma Qo'shish</span>}
        open={isFirmModalOpen}
        onCancel={() => {
          setIsFirmModalOpen(false);
          firmForm.resetFields();
        }}
        footer={null}
        className="warehouse-modal"
      >
        <Form
          form={firmForm}
          layout="vertical"
          onFinish={handleCreateFirm}
          className="warehouse-add-form"
        >
          <Form.Item
            label="Firma nomi"
            name="name"
            rules={[{ required: true, message: "Firma nomi kiritish shart" }]}
            className="warehouse-form-item"
          >
            <Input
              placeholder="Firma nomini kiriting"
              className="warehouse-input"
              prefix={<ShopOutlined />}
            />
          </Form.Item>
          <Form.Item
            label="Telefon raqami"
            name="phone"
            rules={[{ required: true, message: "Telefon raqami kiritish shart" }]}
            className="warehouse-form-item"
          >
            <Input placeholder="Telefon raqamini kiriting" className="warehouse-input" />
          </Form.Item>
          <Form.Item
            label="Manzil"
            name="address"
            rules={[{ required: true, message: "Manzil kiritish shart" }]}
            className="warehouse-form-item"
          >
            <Input placeholder="Manzilni kiriting" className="warehouse-input" />
          </Form.Item>
          <Form.Item className="warehouse-form-submit">
            <Button
              type="primary"
              htmlType="submit"
              loading={createFirmLoading}
              icon={<PlusOutlined />}
              size="large"
              className="warehouse-submit-btn"
            >
              Firma Qo'shish
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Income Material Modal */}
      <Modal
        title={<span style={{ color: "#fff" }}>Yangi Material Keldi</span>}
        open={isIncomeModalOpen}
        onCancel={() => {
          setIsIncomeModalOpen(false);
          setSelectedMaterials([]);
          incomeForm.resetFields();
        }}
        footer={null}
        className="warehouse-modal"
        width={800}
      >
        <Form
          form={incomeForm}
          layout="vertical"
          onFinish={handleIncomeSubmit}
          className="warehouse-add-form"
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Firmani tanlang"
                name="firmId"
                rules={[{ required: true, message: "Firmani tanlash shart" }]}
                className="warehouse-form-item"
              >
                <Select
                  placeholder="Firmani tanlang"
                  className="warehouse-select"
                  loading={firmsLoading}
                >
                  {firmsData?.map((firm) => (
                    <Option key={firm._id} value={firm._id}>
                      {firm.name} | {firm.phone}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="To'langan summa"
                name="paidAmount"
                className="warehouse-form-item"
              >
                <FormattedInput
                  placeholder="To'langan summani kiriting"
                  className="warehouse-input"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider className="warehouse-divider">Materiallar</Divider>

          {selectedMaterials.map((material) => (
            <div key={material.id} style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
                <Col xs={24} md={8}>
                  <Input
                    placeholder="Material nomini kiriting"
                    value={material.name}
                    onChange={(e) => handleMaterialChange(material.id, "name", e.target.value)}
                    className="warehouse-input"
                    prefix={<LuPackagePlus />}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <FormattedInput
                    placeholder="Miqdor"
                    value={material.quantity}
                    onChange={(value) => handleMaterialChange(material.id, "quantity", value)}
                    className="warehouse-input"
                  />
                </Col>
                <Col xs={24} md={8}>
                  <FormattedInput
                    placeholder="Narx"
                    value={material.price}
                    onChange={(value) => handleMaterialChange(material.id, "price", value)}
                    className="warehouse-input"
                  />
                </Col>
              </Row>
              <Row gutter={[16, 16]}>

                <Col xs={24} md={8}>
                  <Select
                    placeholder="Birlikni tanlang"
                    onChange={(e) => handleMaterialChange(material.id, "unit", e.target.value)}
                    className="warehouse-selectoption"
                  >
                    <Option value="kilo">Kilogram (kg)</Option>
                    <Option value="dona">Dona</Option>
                    <Option value="metr">Metr (m)</Option>
                  </Select>
                </Col>
                <Col xs={24} md={8}>
                  <Select
                    placeholder="Kategoriyani tanlang"
                    onChange={(e) => handleMaterialChange(material.id, "category", e.target.value)}
                    className="warehouse-selectoption"
                  >
                    <Option value="BN-3">BN-3</Option>
                    <Option value="BN-5">BN-5</Option>
                    <Option value="Mel">Mel</Option>
                    <Option value="Others">Boshqalar</Option>
                  </Select>
                </Col>
                <Col xs={24} md={8}>
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveMaterialFromIncome(material.id)}
                    className="warehouse-delete-btn"
                    style={{ width: "100%", height: "38px" }}
                  />
                </Col>
              </Row>
            </div>
          ))}

          <Button
            type="dashed"
            onClick={handleAddMaterialToIncome}
            block
            icon={<PlusOutlined />}
            className="warehouse-add-material-btn"
            style={{ marginBottom: 24 }}
          >
            Material Qo'shish
          </Button>

          <Form.Item className="warehouse-form-submit">
            <Button
              type="primary"
              htmlType="submit"
              loading={createIncomeLoading}
              icon={<PlusOutlined />}
              size="large"
              className="warehouse-submit-btn"
            >
              Saqlash
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Income List Modal */}
      <IncomeListModal
        isIncomeListModalOpen={isIncomeListModalOpen}
        setIsIncomeListModalOpen={setIsIncomeListModalOpen}
        incomeSearchText={incomeSearchText}
        setIncomeSearchText={setIncomeSearchText}
        incomesIsLoading={incomesIsLoading}
        filteredIncomes={filteredIncomes}
      />
    </div>
  );
};

export default WarehouseManagement;


