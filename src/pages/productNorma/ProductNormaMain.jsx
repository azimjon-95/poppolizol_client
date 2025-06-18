import React, { useState } from "react";
import {
  Tabs,
  Table,
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  Space,
  Modal,
  Popconfirm,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  useDeleteNormaMutation,
  useGetAllNormaQuery,
  useUpdateNormaMutation,
} from "../../context/normaApi";
import { useGetAllMaterialsQuery } from "../../context/materialApi";
import AddProductNorma from "./AddProductNorma";
import "./ProductNorma.css";
import { toast } from "react-toastify";

const { Option } = Select;

const ProductNorma = () => {
  const [updateForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingNormaId, setEditingNormaId] = useState(null);
  const [isViewMaterials, setIsViewMaterials] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  // RTK Query hook’lari
  const { data: normas, isLoading: normasLoading } = useGetAllNormaQuery();
  const { data: materialsData, isLoading: materialsLoading } =
    useGetAllMaterialsQuery();

  const [deleteProductNorma, { isLoading: deleteLoading }] =
    useDeleteNormaMutation();
  const [updateProductNorma, { isLoading: updateLoading }] =
    useUpdateNormaMutation();

  let materials = materialsData?.innerData || [];

  // Normalar ro‘yxati uchun ma'lumotlar
  const normasData = normas?.innerData || [];

  // delete confirm
  const confirmDelete = async (id) => {
    try {
      await deleteProductNorma(id).unwrap();
      toast.success("Norma o'chirildi");
    } catch (err) {
      toast.error(err?.data?.message || "Norma o'chirilmadi");
    }
  };

  // Edit button handler
  const handleEdit = (norma) => {
    setEditingNormaId(norma._id);
    // Pre-fill form with norma data
    updateForm.setFieldsValue({
      productName: norma.productName,
      category: norma.category,
      color: norma.color,
      size: norma.size,
      uniqueCode: norma.uniqueCode,
      description: norma.description || "",
      materials: norma.materials.map((m) => ({
        materialId: m.materialId?._id || m.materialId,
        quantity: m.quantity,
      })),
      image: norma.image
        ? [{ uid: "-1", name: "image", status: "done", url: norma.image }]
        : [],
    });
    setIsUpdateModalOpen(true);
  };

  const onUpdateFinish = async (values) => {
    try {
      const updateData = {
        productName: values.productName,
        category: values.category,
        color: values.color,
        size: values.size,
        description: values.description || "",
        materials: values.materials.map((newMaterial) => {
          const existingMaterial = normasData
            .find((norma) => norma._id === editingNormaId)
            ?.materials.find(
              (m) =>
                (m.materialId?._id || m.materialId) === newMaterial.materialId
            );
          return {
            materialId: newMaterial.materialId,
            quantity: newMaterial.quantity || existingMaterial?.quantity || "",
          };
        }),
      };

      const res = await updateProductNorma({
        id: editingNormaId,
        body: updateData,
      }).unwrap();
      toast.success(res.message || "Norma muvaffaqiyatli yangilandi");
      setIsUpdateModalOpen(false);
      updateForm.resetFields();

      setEditingNormaId(null);
    } catch (error) {
      message.error(
        "Norma yangilashda xatolik: " + (error.data?.message || "Noma'lum xato")
      );
    }
  };

  const columns = [
    { title: "Nomi", dataIndex: "productName", key: "productName" },
    { title: "O'lchov", dataIndex: "size", key: "size" },
    { title: "Kategoriya", dataIndex: "category", key: "category" },
    {
      title: "Qo'shilgan sana",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("uz-UZ"),
    },
    {
      title: "Materiallar",
      dataIndex: "materials",
      key: "materials",
      render: (materials) => (
        <EyeOutlined
          style={{ cursor: "pointer" }}
          onClick={() => {
            setSelectedMaterials(materials);
            setIsViewMaterials(true);
          }}
        />
      ),
    },

    {
      title: "Tavsif",
      dataIndex: "description",
      key: "description",
      render: (description) => (
        <EyeOutlined
          style={{ cursor: "pointer" }}
          onClick={() => showModal(description)}
        />
      ),
    },
    {
      title: "Amallar",
      render: (_, item) => {
        return (
          <div className="norma_actions">
            <Popconfirm
              title="Rostdan ham o'chirmoqchimisiz?"
              onConfirm={() => confirmDelete(item._id)}
            >
              <Button type="primary" danger icon={<DeleteOutlined />} />
            </Popconfirm>
            <EditOutlined onClick={() => handleEdit(item)} />
          </div>
        );
      },
    },
  ];

  // Modalni ochish funksiyasi
  const showModal = (description) => {
    setSelectedDescription(description);
    setIsModalOpen(true);
  };

  // Modalni yopish funksiyasi
  const handleOk = () => setIsModalOpen(false);

  // Update modalni yopish
  const handleUpdateOk = () => {
    setIsUpdateModalOpen(false);
    updateForm.resetFields();
    setEditingNormaId(null);
  };

  const handleUpdateCancel = () => {
    setIsUpdateModalOpen(false);
    updateForm.resetFields();
    setEditingNormaId(null);
  };

  return (
    <div className="product_norma">
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Normalar ro‘yxati" key="1">
          <Table
            columns={columns}
            dataSource={normasData}
            loading={normasLoading}
            rowKey="_id"
            pagination={false}
            size="small"
          />
          <Modal
            title="Tavsif"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleOk}
            okText="Yopish"
            footer={(_, { OkBtn }) => (
              <>
                <OkBtn />
              </>
            )}
          >
            <p>{selectedDescription || "Tavsif mavjud emas"}</p>
          </Modal>
          {/* view materials */}
          <Modal
            title="Materiallar"
            open={isViewMaterials}
            onOk={() => setIsViewMaterials(false)}
            onCancel={() => setIsViewMaterials(false)}
            okText="Yopish"
            footer={(_, { OkBtn }) => (
              <>
                <OkBtn />
              </>
            )}
          >
            <Table
              columns={[
                {
                  title: "Material nomi",
                  dataIndex: "name",
                  key: "name",
                  render: (text, record) => record.materialId.name,
                },
                { title: "Miqdor", dataIndex: "quantity", key: "quantity" },
                {
                  title: "O'lchov birligi",
                  dataIndex: "unit",
                  key: "unit",
                  render: (text, record) => record.materialId.unit,
                },
              ]}
              dataSource={selectedMaterials}
              rowKey="_id"
              size="small"
              pagination={false}
            />
          </Modal>

          {/* Update Modal */}
          <Modal
            title="Normani tahrirlash"
            open={isUpdateModalOpen}
            onOk={handleUpdateOk}
            onCancel={handleUpdateCancel}
            footer={null}
            width={800}
          >
            <Form
              form={updateForm}
              layout="vertical"
              onFinish={onUpdateFinish}
              initialValues={{ materials: [{ materialId: "", quantity: "" }] }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Mahsulot nomi"
                    name="productName"
                    rules={[
                      { required: true, message: "Mahsulot nomini kiriting!" },
                    ]}
                  >
                    <Input placeholder="Masalan: Kichik sumka" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Kategoriya"
                    name="category"
                    rules={[
                      { required: true, message: "Kategoriyani tanlang!" },
                    ]}
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

              <Form.List name="materials">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => {
                      // Tanlangan materialId'ga mos units ni olish
                      const selectedMaterialId = updateForm.getFieldValue([
                        "materials",
                        name,
                        "materialId",
                      ]);
                      const selectedMaterial = materials?.find(
                        (m) => m._id === selectedMaterialId
                      );
                      const availableUnits = selectedMaterial?.units || [];

                      return (
                        <Space
                          key={key}
                          align="baseline"
                          style={{ display: "flex", marginBottom: 8 }}
                        >
                          {/* Material tanlash */}
                          <Form.Item
                            {...restField}
                            name={[name, "materialId"]}
                            rules={[
                              {
                                required: true,
                                message: "Materialni tanlang!",
                              },
                            ]}
                          >
                            <Select
                              placeholder="Materialni tanlang"
                              loading={materialsLoading}
                              style={{ width: 200 }}
                              showSearch
                              optionFilterProp="children"
                              onChange={() => {
                                // material o‘zgarganda unit ni reset qilish
                                const updatedMaterials = [
                                  ...(updateForm.getFieldValue("materials") ||
                                    []),
                                ];
                                updatedMaterials[name] = {
                                  ...updatedMaterials[name],
                                  unit: undefined,
                                };
                                updateForm.setFieldsValue({
                                  materials: updatedMaterials,
                                });
                              }}
                            >
                              {materials?.map((material) => (
                                <Option key={material._id} value={material._id}>
                                  {material.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>

                          {/* Miqdor */}
                          <Form.Item
                            {...restField}
                            name={[name, "quantity"]}
                            rules={[
                              { required: true, message: "Miqdorni kiriting!" },
                            ]}
                          >
                            <Input
                              type="number"
                              placeholder="Miqdor"
                              style={{ width: 100 }}
                            />
                          </Form.Item>

                          {/* O‘chirish tugmasi */}
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Space>
                      );
                    })}

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

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Tavsif"
                    name="description"
                    rules={[{ required: false }]}
                  >
                    <Input.TextArea
                      placeholder="Qo‘shimcha ma'lumot"
                      rows={4}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={updateLoading}
                >
                  {updateLoading ? "Yangilanmoqda..." : "Normani yangilash"}
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </Tabs.TabPane>

        {/* Norma qo‘shish */}
        <Tabs.TabPane tab="Norma qo‘shish" key="2">
          <AddProductNorma />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default ProductNorma;
