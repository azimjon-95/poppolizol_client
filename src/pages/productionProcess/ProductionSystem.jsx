import React, { useState, useMemo } from "react";
import { Tabs, Modal, Form, Input, Button, Checkbox, Select } from "antd";
import ruberoid from "../../assets/ruberoid.jpg";
import betumImg from "../../assets/betum.jpg";
import { GiOilDrum } from "react-icons/gi";
import { RiDeleteBinLine } from "react-icons/ri";
import { useGetAllNormaQuery } from "../../context/normaApi";
import { HiOutlineArrowTrendingDown, HiOutlineArrowTrendingUp, HiOutlineArrowsRightLeft } from "react-icons/hi2";
import {
  useGetFinishedProductsQuery,
  useStartProductionProcessMutation,
  useUpdateFinishedMutation,
  useDeleteFinishedMutation
} from "../../context/productionApi";
import { capitalizeFirstLetter } from "../../hook/CapitalizeFirstLitter";
import { NumberFormat } from "../../hook/NumberFormat";
import { Factory, Archive, History, Plus, Minus } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.css";
import BitumProductionSystem from "./bitumProduction/BitumProductionSystem";
import InventoryTable from "./bitumProduction/InventoryTable";
import ProductionHistoryTable from "./productionHistory/ProductionHistoryTable";

const { TabPane } = Tabs;
const { Option } = Select;

const ProductionSystem = () => {
  const [selectedNorma, setSelectedNorma] = useState("");
  const [quantityToProduce, setQuantityToProduce] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("polizol");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isDefectiveModalOpen, setIsDefectiveModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedReturnProduct, setSelectedReturnProduct] = useState(null);
  const [selectedDefectiveProduct, setSelectedDefectiveProduct] = useState(null);
  const [isDefective, setIsDefective] = useState(false);
  const [filterValue, setFilterValue] = useState("all"); // New state for filter selection
  const [form] = Form.useForm();

  // RTK Query hooks
  const { data: normas, isLoading: normasLoading, error: normasError } = useGetAllNormaQuery();
  const { data: finishedProducts, isLoading: productsLoading, error: productsError } = useGetFinishedProductsQuery();
  const [startProduction, { isLoading: productionLoading }] = useStartProductionProcessMutation();
  const [updateFinished, { isLoading: updateLoading }] = useUpdateFinishedMutation();
  const [deleteFinished, { isLoading: deleteLoading }] = useDeleteFinishedMutation();
  const [consumedQuantities, setConsumedQuantities] = useState({});
  const role = localStorage.getItem("role");

  // Handle errors
  if (normasError) {
    toast.error(
      normasError.data?.message || "Mahsulot turlari ma'lumotlarini olishda xatolik yuz berdi",
      { toastId: "normas-error" }
    );
  }
  if (productsError) {
    toast.error(
      productsError.data?.message || "Tayyor mahsulotlar ma'lumotlarini olishda xatolik yuz berdi",
      { toastId: "products-error" }
    );
  }

  // Handle consumed quantity input
  const handleConsumedQuantityChange = (materialId, value) => {
    const parsedValue = parseFloat(value) || 0;
    setConsumedQuantities((prev) => ({
      ...prev,
      [materialId]: parsedValue,
    }));
  };

  // Handle production process with defective info
  const handleProduce = async () => {
    if (!selectedNorma || quantityToProduce <= 0) {
      return toast.warning("Iltimos, mahsulot turi va miqdorini tanlang");
    }

    const selectedNormaData = normas?.innerData?.find((n) => n._id === selectedNorma);
    const materialStats = selectedNormaData?.materials?.map((req) => {
      const consumed = consumedQuantities[req.materialId._id] || 0;
      const required = req.quantity * quantityToProduce;
      const status = getIconStatus(req.materialId._id);
      return {
        materialId: req.materialId._id,
        materialName: req.materialId.name,
        unit: req.materialId.unit,
        requiredQuantity: required,
        consumedQuantity: consumed,
        status: status,
        difference: consumed - required,
      };
    }) || [];

    try {
      const defectiveData = isDefective
        ? {
          isDefective: true,
          defectiveReason: form.getFieldValue("defectiveReason") || "",
          defectiveDescription: form.getFieldValue("defectiveDescription") || "",
        }
        : {};

      await startProduction({
        productNormaId: selectedNorma,
        productName: selectedNormaData?.productName,
        quantityToProduce,
        consumedMaterials: materialStats.map((stat) => ({
          materialId: stat.materialId,
          quantity: stat.consumedQuantity,
        })),
        materialStatistics: materialStats,
        ...defectiveData,
      }).unwrap();
      toast.success(
        `Muvaffaqiyatli ishlab chiqarildi: ${quantityToProduce} dona ${selectedNormaData?.productName}${isDefective ? " (Brak sifatida belgilandi)" : ""
        }`
      );
      setSelectedNorma("");
      setQuantityToProduce(1);
      setConsumedQuantities({});
      setIsDefective(false);
      form.resetFields();
    } catch (error) {
      toast.error(error.data?.innerData || error.data?.message || "Ishlab chiqarishda xatolik yuz berdi");
    }
  };

  // Handle delete product
  const handleDelete = (productId) => {
    Modal.confirm({
      title: "Mahsulotni o'chirishni xohlaysizmi?",
      content: "Bu amalni qaytarib bo'lmaydi.",
      okText: "O'chirish",
      cancelText: "Bekor qilish",
      onOk: async () => {
        try {
          await deleteFinished(productId).unwrap();
          toast.success("Mahsulot muvaffaqiyatli o'chirildi");
        } catch (error) {
          toast.error(error.data?.message || "Mahsulotni o'chirishda xatolik yuz berdi");
        }
      },
    });
  };

  // Handle update product
  const handleUpdate = (product) => {
    setSelectedProduct(product);
    form.setFieldsValue({
      quantity: product.quantity,
      productionCost: product.productionCost,
      isDefective: product.isDefective,
      defectiveReason: product.defectiveInfo?.defectiveReason || "",
      defectiveDescription: product.defectiveInfo?.defectiveDescription || "",
    });
    setIsModalOpen(true);
  };

  // Handle defective info modal
  const handleShowDefectiveInfo = (product) => {
    setSelectedDefectiveProduct(product);
    setIsDefectiveModalOpen(true);
  };

  // Handle return info modal
  const handleShowReturnInfo = (product) => {
    setSelectedReturnProduct(product);
    setIsReturnModalOpen(true);
  };

  // Handle modal form submission
  const handleModalSubmit = async (values) => {
    try {
      await updateFinished({
        id: selectedProduct._id,
        quantity: parseFloat(values.quantity),
        productionCost: parseFloat(values.productionCost),
        isDefective: values.isDefective || false,
        defectiveInfo: values.isDefective
          ? {
            defectiveReason: values.defectiveReason || "",
            defectiveDescription: values.defectiveDescription || "",
            defectiveDate: values.isDefective ? new Date() : null,
          }
          : {
            defectiveReason: "",
            defectiveDescription: "",
            defectiveDate: null,
          },
      }).unwrap();
      toast.success("Mahsulot muvaffaqiyatli yangilandi");
      setIsModalOpen(false);
      form.resetFields();
      setSelectedProduct(null);
    } catch (error) {
      toast.error(error.data?.message || "Mahsulotni yangilashda xatolik yuz berdi");
    }
  };

  // Filter normas based on selected category
  const filteredNormas = normas?.innerData?.filter(
    (norma) => norma.category === selectedCategory
  );

  // Determine icon status for each material
  const getIconStatus = (materialId) => {
    const selectedNormaData = normas?.innerData?.find((n) => n._id === selectedNorma);
    const material = selectedNormaData?.materials?.find((m) => m.materialId._id === materialId);
    const consumed = consumedQuantities[materialId] || 0;
    const required = material ? material.quantity * quantityToProduce : 0;

    if (consumed > required) return "exceed";
    if (consumed < required) return "insufficient";
    return "equal";
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Create unique options for the Select component
  const productOptions = useMemo(() => {
    const options = [
      { value: "all", label: "Barchasi" },
      { value: "returned", label: "Mijozdan qaytgan" },
      { value: "defective", label: "Brak mahsulot" },
    ];

    // Extract unique productName and category combinations
    const productMap = new Map();
    finishedProducts?.forEach((product) => {
      const key = `${product.productName}|${product.category}`;
      if (!productMap.has(key)) {
        productMap.set(key, {
          value: key,
          label: `${capitalizeFirstLetter(product.productName)} (${product.category})`,
        });
      }
    });

    return [...options, ...Array.from(productMap.values())];
  }, [finishedProducts]);

  // Filter products based on selected filterValue
  const filteredProducts = useMemo(() => {
    if (filterValue === "all") {
      return finishedProducts;
    } else if (filterValue === "returned") {
      return finishedProducts?.filter((product) => product.isReturned);
    } else if (filterValue === "defective") {
      return finishedProducts?.filter((product) => product.isDefective);
    } else {
      const [productName, category] = filterValue.split("|");
      return finishedProducts?.filter(
        (product) =>
          product.productName === productName && product.category === category
      );
    }
  }, [finishedProducts, filterValue]);

  return (
    <div className="production-system-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Update Modal */}
      <Modal
        title="Mahsulotni Tahrirlash"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setSelectedProduct(null);
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleModalSubmit} layout="vertical">
          <Form.Item
            label="Miqdor"
            name="quantity"
            rules={[{ required: true, message: "Iltimos, miqdorni kiriting" }, { type: "number", min: 1, message: "Miqdor 1 dan kichik bo'lmasligi kerak" }]}
          >
            <Input type="number" min="1" step="1" />
          </Form.Item>
          <Form.Item
            label="Tannarx (so'm)"
            name="productionCost"
            rules={[{ required: true, message: "Iltimos, tannarxni kiriting" }, { type: "number", min: 0, message: "Tannarx manfiy bo'lmasligi kerak" }]}
          >
            <Input type="number" min="0" step="1000" />
          </Form.Item>
          <Form.Item name="isDefective" valuePropName="checked">
            <Checkbox onChange={(e) => setIsDefective(e.target.checked)}>Brak mahsulot</Checkbox>
          </Form.Item>
          {isDefective && (
            <>
              <Form.Item
                label="Brak sababi"
                name="defectiveReason"
                rules={[{ required: true, message: "Iltimos, brak sababini kiriting" }]}
              >
                <Input placeholder="Sababni kiriting" />
              </Form.Item>
              <Form.Item
                label="Brak tavsifi"
                name="defectiveDescription"
              >
                <Input.TextArea placeholder="Tavsifni kiriting" rows={4} />
              </Form.Item>
            </>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={updateLoading}>
              Saqlash
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Defective Info Modal */}
      <Modal
        title="Brak Mahsulot Ma'lumotlari"
        open={isDefectiveModalOpen}
        onCancel={() => {
          setIsDefectiveModalOpen(false);
          setSelectedDefectiveProduct(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsDefectiveModalOpen(false);
              setSelectedDefectiveProduct(null);
            }}
          >
            Yopish
          </Button>,
        ]}
      >
        {selectedDefectiveProduct ? (
          <div>
            <p><strong>Mahsulot Nomi:</strong> {capitalizeFirstLetter(selectedDefectiveProduct.productName)}</p>
            <p><strong>Kategoriya:</strong> {selectedDefectiveProduct.category}</p>
            <p><strong>Brak Sababi:</strong> {selectedDefectiveProduct.defectiveInfo?.defectiveReason || "Noma'lum"}</p>
            <p><strong>Brak Tavsifi:</strong> {selectedDefectiveProduct.defectiveInfo?.defectiveDescription || "Tavsif yo'q"}</p>
            <p><strong>Brak Sanasi:</strong> {selectedDefectiveProduct.defectiveInfo?.defectiveDate ? formatDate(selectedDefectiveProduct.defectiveInfo.defectiveDate) : "Noma'lum"}</p>
          </div>
        ) : (
          <p>Yuklanmoqda...</p>
        )}
      </Modal>

      {/* Return Info Modal */}
      <Modal
        title="Qaytarilgan Mahsulot Ma'lumotlari"
        open={isReturnModalOpen}
        onCancel={() => {
          setIsReturnModalOpen(false);
          setSelectedReturnProduct(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsReturnModalOpen(false);
              setSelectedReturnProduct(null);
            }}
          >
            Yopish
          </Button>,
        ]}
      >
        {selectedReturnProduct ? (
          <div>
            <p><strong>Mahsulot Nomi:</strong> {capitalizeFirstLetter(selectedReturnProduct.productName)}</p>
            <p><strong>Kategoriya:</strong> {selectedReturnProduct.category}</p>
            <p><strong>Qaytarilgan Sana:</strong> {formatDate(selectedReturnProduct.returnInfo.returnDate)}</p>
            <p><strong>Qaytarish Sababi:</strong> {selectedReturnProduct.returnInfo.returnReason}</p>
          </div>
        ) : (
          <p>Yuklanmoqda...</p>
        )}
      </Modal>

      <Tabs defaultActiveKey={role === "direktor" ? "finished" : "production"} className="custom-tabs">
        {
          role !== "direktor" &&
          <TabPane
            tab={
              <span style={{ display: "flex", alignItems: "center" }}>
                <Factory size={20} style={{ marginRight: 8 }} />
                Ruberoid va Polizol Ishlab Chiqarish
              </span>
            }
            key="production"
          >
            <div className="space-y-8">
              <div className="production-card">
                <div className="category-buttons">
                  <button
                    className={`category-button ${selectedCategory === "ruberoid" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("ruberoid")}
                  >
                    Ruberoid
                  </button>
                  <button
                    className={`category-button ${selectedCategory === "polizol" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("polizol")}
                  >
                    Polizol
                  </button>
                </div>

                <div className="production-form-box">
                  <div className="production-form-grid">
                    <div>
                      <label className="form-label">Mahsulot turini tanlang</label>
                      <div className="norma-menu">
                        {normasLoading ? (
                          <p>Yuklanmoqda...</p>
                        ) : filteredNormas?.length > 0 ? (
                          filteredNormas.map((norma) => (
                            <div
                              key={norma._id}
                              className={`norma-item ${selectedNorma === norma._id ? "selected" : ""}`}
                              onClick={() => setSelectedNorma(norma._id)}
                            >
                              {capitalizeFirstLetter(norma.productName)}
                            </div>
                          ))
                        ) : (
                          <p>Mahsulot topilmadi</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedNorma && (
                    <div className="materials-required-card">
                      <h3 className="materials-required-title">Kerakli xom ashyolar:</h3>
                      {normas?.innerData
                        ?.find((n) => n._id === selectedNorma)
                        ?.materials?.map((req, index) => (
                          <div key={index} className="material-item">
                            <span>{req.materialId?.name}</span>
                            <span className="material-quantity">
                              Norma: {req.quantity} {req.materialId?.unit}
                            </span>
                            <span className="material-quantity">
                              Jami kerak: {NumberFormat(req.quantity * quantityToProduce)} {req.materialId?.unit}
                            </span>
                            <span className="material-status-icons" style={{ width: "120px" }}>
                              <HiOutlineArrowTrendingDown
                                className={`status-icon ${getIconStatus(req.materialId._id) === "insufficient" ? "active insufficient" : ""}`}
                              />
                              <HiOutlineArrowTrendingUp
                                className={`status-icon ${getIconStatus(req.materialId._id) === "exceed" ? "active exceed" : ""}`}
                              />
                              <HiOutlineArrowsRightLeft
                                className={`status-icon ${getIconStatus(req.materialId._id) === "equal" ? "active equal" : ""}`}
                              />
                            </span>
                            <span className="materialId_unitInp">
                              <input
                                type="number"
                                placeholder="Sariflangan miqdori..."
                                value={consumedQuantities[req.materialId._id] || ""}
                                onChange={(e) => handleConsumedQuantityChange(req.materialId._id, e.target.value)}
                                className="material-consumed-input"
                                min="0"
                              />
                              <span className="materialId_unit">{req.materialId?.unit}</span>
                            </span>
                          </div>
                        )) || <p>Xom ashyo ma'lumotlari topilmadi</p>}
                      <Form form={form} layout="vertical">
                        <Form.Item name="isDefective" valuePropName="checked">
                          <Checkbox onChange={(e) => setIsDefective(e.target.checked)}>Brak mahsulot</Checkbox>
                        </Form.Item>
                        {isDefective && (
                          <>
                            <Form.Item
                              label="Brak sababi"
                              name="defectiveReason"
                              rules={[{ required: true, message: "Iltimos, brak sababini kiriting" }]}
                            >
                              <Input placeholder="Sababni kiriting" />
                            </Form.Item>
                            <Form.Item
                              label="Brak tavsifi"
                              name="defectiveDescription"
                            >
                              <Input.TextArea placeholder="Tavsifni kiriting" rows={4} />
                            </Form.Item>
                          </>
                        )}
                      </Form>
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">Ishlab chiqarish miqdori</label>
                  <div className="quantity-input-container">
                    <button
                      onClick={() => setQuantityToProduce(Math.max(1, quantityToProduce - 1))}
                      className="quantity-button quantity-button-left"
                    >
                      <Minus size={22} />
                    </button>
                    <input
                      type="number"
                      value={quantityToProduce}
                      onChange={(e) =>
                        setQuantityToProduce(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="quantity-input"
                      min="1"
                    />
                    <button
                      onClick={() => setQuantityToProduce(quantityToProduce + 1)}
                      className="quantity-button quantity-button-right"
                    >
                      <Plus size={22} />
                    </button>
                  </div>
                </div>

                <button
                  disabled={
                    !selectedNorma ||
                    quantityToProduce <= 0 ||
                    normasLoading ||
                    productionLoading
                  }
                  onClick={handleProduce}
                  className="produce-button"
                >
                  {productionLoading ? "Ishlab chiqarilmoqda..." : "Ishlab Chiqarish"}
                </button>
              </div>
            </div>
          </TabPane>
        }
        {
          role !== "direktor" &&
          <TabPane
            tab={
              <span style={{ display: "flex", alignItems: "center" }}>
                <GiOilDrum size={20} style={{ marginRight: 8 }} />
                BN-5 Ishlab Chiqarish
              </span>
            }
            key="bitum"
          >
            <BitumProductionSystem />
          </TabPane>
        }
        <TabPane
          tab={
            <span style={{ display: "flex", alignItems: "center" }}>
              <Archive size={20} style={{ marginRight: 8 }} />
              Tayyor Mahsulotlar
            </span>
          }
          key="finished"
        >
          <div className="history-header-section">
            <div className="history-title-container">
              <div className="history-icon-wrapper">
                <Archive className="history-title-icon" />
              </div>
              <div>
                <h2 className="header-title">Tayyor Mahsulotlar Ombori</h2>
                <p className="header-description">
                  Xom ashyo va tayyor mahsulotlarni boshqaring
                </p>
              </div>
            </div>
            <div className="Select_mki-summary">
              <Select
                value={filterValue}
                onChange={(value) => setFilterValue(value)}
                style={{ width: 250 }}
              >
                {productOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
              <div className="mki-summary-section">
                <div className="mki-summary-item">
                  <span className="mki-summary-icon">📦</span>
                  <span className="mki-summary-label">Mahsulotlar soni: </span>
                  <span className="mki-summary-value">
                    {filteredProducts?.length || 0} ta
                  </span>
                </div>
                <div className="mki-summary-item">
                  <span className="mki-summary-icon">💸</span>
                  <span className="mki-summary-label">Umumiy tannarx: </span>
                  <span className="mki-summary-value">
                    {NumberFormat(
                      filteredProducts?.reduce(
                        (total, product) =>
                          total + +product.productionCost * +product.quantity,
                        0
                      ) || 0
                    )}{" "}
                    so'm
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="finished-products-wrapper">
            <div className="finished-products-grid">
              {productsLoading ? (
                <p className="loading-text">Yuklanmoqda...</p>
              ) : filteredProducts?.length > 0 ? (
                filteredProducts.map((product, inx) => (
                  <div key={inx} className="product-card-container">
                    {/* <div className="product-card_actins">
                      <button
                        onClick={() => handleUpdate(product)}
                        disabled={deleteLoading || updateLoading}
                        title="Tahrirlash"
                        className="edit-button"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        disabled={deleteLoading || updateLoading}
                        title="O'chirish"
                      >
                        <RiDeleteBinLine />
                      </button>
                    </div> */}
                    {product.category === "Stakan" || product.category === "Qop" ? (
                      <div className="product-imagebn">
                        <img src={betumImg} alt="Bitum" />
                        {product.isReturned && (
                          <div className="return-info">
                            <p style={{ color: "#d32f2f", fontWeight: "bold" }}>
                              Mijozdan qaytgan
                            </p>
                            <Button
                              type="link"
                              onClick={() => handleShowReturnInfo(product)}
                              style={{ padding: 0, color: "#1890ff" }}
                            >
                              Batafsil
                            </Button>
                          </div>
                        )}
                        {product.isDefective && (
                          <div className="defective-info">
                            <p style={{ color: "#ff9800", fontWeight: "bold" }}>
                              Brak mahsulot
                            </p>
                            <Button
                              type="link"
                              onClick={() => handleShowDefectiveInfo(product)}
                              style={{ padding: 0, color: "#1890ff" }}
                            >
                              Batafsil
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="product-image">
                        <img src={ruberoid} alt="Ruberoid" />
                        {product.isReturned && (
                          <div className="return-info">
                            <p style={{ color: "#d32f2f", fontWeight: "bold" }}>
                              Mijozdan qaytgan
                            </p>
                            <Button
                              type="link"
                              onClick={() => handleShowReturnInfo(product)}
                              style={{ padding: 0, color: "#1890ff" }}
                            >
                              Batafsil
                            </Button>
                          </div>
                        )}
                        {product.isDefective && (
                          <div className="defective-infobox">
                            <p style={{ color: "#000000", fontWeight: "bold" }}>
                              Brak mahsulot
                            </p>
                            <Button
                              type="link"
                              onClick={() => handleShowDefectiveInfo(product)}
                              style={{ padding: 0, color: "#0084ff" }}
                            >
                              Batafsil
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    {product.category === "Stakan" || product.category === "Qop" ? (
                      <h3 className="product-name">
                        BN-5 {capitalizeFirstLetter(product.productName)}
                      </h3>
                    ) : (
                      <h3 className="product-name">
                        {capitalizeFirstLetter(product.productName)}
                      </h3>
                    )}
                    <p className="product-category">
                      📂 Kategoriya: <span>{product.category}</span>
                    </p>
                    <p className="product-cost">
                      💰 <strong>Tannarx:</strong> <span>{NumberFormat(+product.productionCost)} so'm</span>
                    </p>
                    <div className="product-quantity-block">
                      {product.category === "Stakan" || product.category === "Qop" ? (
                        <span className="product-quantity">
                          {NumberFormat(product.quantity)} kg
                        </span>
                      ) : (
                        <span className="product-quantity">
                          {NumberFormat(product.quantity)} dona
                        </span>
                      )}
                      <span className="product-Cost">
                        Jami: {NumberFormat(+product.productionCost * +product.quantity)} so'm
                      </span>
                    </div>
                  </div>
                ))

              ) : (
                <div className="empty-state-container">
                  <Archive size={48} className="empty-icon" />
                  <p className="empty-text">Hozircha tayyor mahsulotlar yo'q</p>
                </div>
              )}
            </div>
          </div>
        </TabPane>


        <TabPane
          tab={
            <span style={{ display: "flex", alignItems: "center" }}>
              <History size={20} style={{ marginRight: 8 }} />
              Tarix
            </span>
          }
          key="history"
        >
          <Tabs defaultActiveKey="productionrb" className="custom-tabs">
            <TabPane
              tab={
                <span style={{ display: "flex", alignItems: "center" }}>
                  <Factory size={20} style={{ marginRight: 8 }} />
                  Ruberoid va Polizol Ishlab Chiqarish Tarixi
                </span>
              }
              key="productionrb"
            >
              <div className="history-card">
                <ProductionHistoryTable />
              </div>
            </TabPane>
            <TabPane
              tab={
                <span style={{ display: "flex", alignItems: "center" }}>
                  <Factory size={20} style={{ marginRight: 8 }} />
                  BN-5 Ishlab Chiqarish Tarixi
                </span>
              }
              key="productionbn"
            >
              <InventoryTable />
            </TabPane>
          </Tabs>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProductionSystem;
