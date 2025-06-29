import React, { useState } from "react";
import { Select, Tabs } from "antd";
import ruberoid from "../../assets/ruberoid.jpg";
import { GiOilDrum } from "react-icons/gi";
import { useGetAllNormaQuery } from "../../context/normaApi";
import {
  useGetFinishedProductsQuery,
  useGetProductionHistoryQuery,
  useStartProductionProcessMutation,
} from "../../context/productionApi";
import { capitalizeFirstLetter } from "../../hook/CapitalizeFirstLitter";
import { Factory, Archive, History, Plus, Minus } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.css";
import BitumProductionSystem from "./bitumProduction/BitumProductionSystem";

const { Option } = Select;
const { TabPane } = Tabs;

const ProductionSystem = () => {
  const [selectedNorma, setSelectedNorma] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");
  const [quantityToProduce, setQuantityToProduce] = useState(1);
  const [selectedMaterials, setSelectedMaterials] = useState(null);

  // Fetch data using RTK Query hooks
  const {
    data: normas,
    isLoading: normasLoading,
    error: normasError,
  } = useGetAllNormaQuery();
  const {
    data: finishedProducts,
    isLoading: productsLoading,
    error: productsError,
  } = useGetFinishedProductsQuery();
  const {
    data: productionHistory,
    isLoading: historyLoading,
    error: historyError,
  } = useGetProductionHistoryQuery();
  const [startProduction, { isLoading: productionLoading }] =
    useStartProductionProcessMutation();

  // Handle errors from RTK Query hooks
  if (normasError) {
    toast.error(
      normasError.data?.message ||
        "Mahsulot turlari ma'lumotlarini olishda xatolik yuz berdi",
      { toastId: "normas-error" }
    );
  }
  if (productsError) {
    toast.error(
      productsError.data?.message ||
        "Tayyor mahsulotlar ma'lumotlarini olishda xatolik yuz berdi",
      { toastId: "products-error" }
    );
  }
  if (historyError) {
    toast.error(
      historyError.data?.message ||
        "Ishlab chiqarish tarixini olishda xatolik yuz berdi",
      { toastId: "history-error" }
    );
  }

  // Handle production process
  const handleProduce = async () => {
    if (!selectedNorma || quantityToProduce <= 0 || !selectedMarket) {
      return toast.warning("Iltimos, mahsulot turi va miqdorini tanlang");
    }
    try {
      await startProduction({
        productNormaId: selectedNorma,
        quantityToProduce,
        selectedMarket,
      }).unwrap();
      toast.success(
        `Muvaffaqiyatli ishlab chiqarildi: ${quantityToProduce} dona ${
          normas?.innerData?.find((n) => n._id === selectedNorma)?.productName
        }`
      );

      setSelectedNorma("");
      setQuantityToProduce(1);
      setSelectedMarket("");
    } catch (error) {
      toast.error(
        error.data?.message || "Ishlab chiqarishda xatolik yuz berdi"
      );
    }
  };

  return (
    <div className="production-system-container">
      {/* Toast Container */}
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

      {/* Tabs */}
      <Tabs defaultActiveKey="production" className="custom-tabs">
        <TabPane
          tab={
            <span style={{ display: "flex", alignmentBaseline: "center" }}>
              <Factory size={20} style={{ marginRight: 8 }} />
              Ruberoid Ishlab Chiqarish
            </span>
          }
          key="production"
        >
          <div className="history-header-section">
            <div className="history-title-container">
              <div className="history-icon-wrapper">
                <Factory className="history-title-icon" />
              </div>
              <div>
                <h2 className="header-title"> (Ruberoid) Ishlab Chiqarish</h2>
                <p className="header-description">
                  Xom ashyo va tayyor mahsulotlarni boshqaring
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="production-card">
              <div className="production-form-grid">
                <div>
                  <label className="form-label">Mahsulot turini tanlang</label>
                  <Select
                    showSearch
                    placeholder="Mahsulotni tanlang..."
                    value={selectedNorma || undefined}
                    onChange={(value) => setSelectedNorma(value)}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option?.children
                        ?.toLowerCase()
                        ?.includes(input?.toLowerCase())
                    }
                    className="w-full"
                    loading={normasLoading}
                  >
                    {normas?.innerData?.map((norma) => (
                      <Option key={norma._id} value={norma._id}>
                        {capitalizeFirstLetter(norma.productName)} ({norma.size}
                        )
                      </Option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="form-label">Bozorni tanlang</label>
                  <Select
                    showSearch
                    placeholder="Bozorni tanlang..."
                    value={selectedMarket || undefined}
                    onChange={(value) => setSelectedMarket(value)}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option?.children
                        ?.toLowerCase()
                        ?.includes(input?.toLowerCase())
                    }
                    className="w-full"
                  >
                    <Option value="tashqi">Tashqi bozor</Option>
                    <Option value="ichki">Ichki bozor</Option>
                  </Select>
                </div>
              </div>
              <div>
                <label className="form-label">Ishlab chiqarish miqdori</label>
                <div className="quantity-input-container">
                  <button
                    onClick={() =>
                      setQuantityToProduce(Math.max(1, quantityToProduce - 1))
                    }
                    className="quantity-button quantity-button-left"
                  >
                    <Minus size={22} />
                  </button>
                  <input
                    type="number"
                    value={quantityToProduce}
                    onChange={(e) =>
                      setQuantityToProduce(
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
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

              {selectedNorma && (
                <div className="materials-required-card">
                  <h3 className="materials-required-title">
                    Kerakli xom ashyolar:
                  </h3>
                  {normas?.innerData
                    ?.find((n) => n._id === selectedNorma)
                    ?.materials?.map((req, index) => (
                      <div key={index} className="material-item">
                        <span>{req.materialId?.name}</span>
                        <span className="material-quantity">
                          {req.quantity * quantityToProduce}{" "}
                          {req.materialId?.unit}
                        </span>
                      </div>
                    )) || <p>Xom ashyo ma'lumotlari topilmadi</p>}
                </div>
              )}

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
                {productionLoading
                  ? "Ishlab chiqarilmoqda..."
                  : "Ishlab Chiqarish"}
              </button>
            </div>
          </div>
        </TabPane>
        <TabPane
          tab={
            <span style={{ display: "flex", alignmentBaseline: "center" }}>
              <GiOilDrum size={20} style={{ marginRight: 8 }} />
              BN-5 Ishlab Chiqarish
            </span>
          }
          key="bitum"
        >
          <BitumProductionSystem />
        </TabPane>
        <TabPane
          tab={
            <span style={{ display: "flex", alignmentBaseline: "center" }}>
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
          </div>
          <div className="finished-products-wrapper">
            <div className="finished-products-grid">
              {productsLoading ? (
                <p className="loading-text">Yuklanmoqda...</p>
              ) : finishedProducts?.length > 0 ? (
                finishedProducts.map((product, inx) => (
                  <div key={inx} className="product-card-container">
                    <div className="product-image">
                      <img src={ruberoid} alt="Ruberoid" />
                    </div>
                    <h3 className="product-name">
                      {capitalizeFirstLetter(product.productName)}
                    </h3>
                    <p className="product-category">
                      📂 Kategoriya: <span>{product.category}</span>
                    </p>
                    <p className="product-size">
                      📏 O'lcham: <span>{product.size}</span>
                    </p>
                    <div className="product-quantity-block">
                      <span className="product-quantity">
                        {product.quantity}
                      </span>
                      <span className="product-unit">dona</span>
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
            <span style={{ display: "flex", alignmentBaseline: "center" }}>
              <History size={20} style={{ marginRight: 8 }} />
              Tarix
            </span>
          }
          key="history"
        >
          <div className="history-header-section">
            <div className="history-title-container">
              <div className="history-icon-wrapper">
                <History className="history-title-icon" />
              </div>
              <div>
                <h2 className="header-title">
                  Ruberoid Ishlab Chiqarish Tarixi
                </h2>
                <p className="header-description">
                  Barcha ishlab chiqarish jarayonlari ro'yxati{" "}
                </p>
              </div>
            </div>
          </div>
          <div className="history-card">
            <div className="history-list">
              {historyLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Ma'lumotlar yuklanmoqda...</p>
                </div>
              ) : productionHistory?.length > 0 ? (
                <div className="history-entries">
                  {productionHistory?.map((entry, index) => (
                    <div key={entry._id} className="history-entry">
                      <div className="entry-badge">
                        <span className="badge-number">#{index + 1}</span>
                      </div>
                      <div className="history-content">
                        <div className="history-main-info">
                          <div className="product-info">
                            <div className="product-icon">
                              <img src={ruberoid} alt="" />
                            </div>
                            <div>
                              <h3 className="history-product-title">
                                {entry.productName}
                              </h3>
                              <div className="product-meta">
                                <span className="quantity-badge">
                                  📦 {entry.quantityProduced} dona
                                </span>
                                <span className="date-badge">
                                  📅{" "}
                                  {new Date(entry.createdAt).toLocaleDateString(
                                    "uz-UZ"
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="cost-section">
                            <div className="cost-wrapper">
                              <span className="cost-label">Umumiy xarajat</span>
                              <span className="history-cost">
                                💰 {entry.totalCost.toLocaleString()} so'm
                              </span>
                            </div>
                          </div>
                          <div className="materials-section">
                            <div className="materials-header">
                              <button
                                className="materials-toggle-btn"
                                onClick={() =>
                                  setSelectedMaterials(entry.materialsUsed)
                                }
                              >
                                <span className="materials-icon">🧱</span>
                                <span>Ishlatilgan xom ashyolar</span>
                                <span className="materials-count">
                                  ({entry.materialsUsed.length} ta)
                                </span>
                                <span className="arrow-icon">👁️</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <History size={64} />
                  </div>
                  <div className="empty-content">
                    <h3 className="empty-title">
                      Hozircha ishlab chiqarish tarixi yo'q
                    </h3>
                    <p className="empty-description">
                      Birinchi ruberoid partiyasini ishlab chiqaring va bu yerda
                      ko'ring
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Materials Modal */}
            {selectedMaterials && (
              <div
                className="modal-overlay"
                onClick={() => setSelectedMaterials(null)}
              >
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <div className="modal-title-section">
                      <div className="modal-icon">🧱</div>
                      <div>
                        <h3 className="modal-title">
                          Ishlatilgan Xom Ashyolar
                        </h3>
                        <p className="modal-subtitle">
                          Ushbu partiya uchun sarflangan materiallar
                        </p>
                      </div>
                    </div>
                    <button
                      className="modal-close-btn"
                      onClick={() => setSelectedMaterials(null)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="materials-modal-grid">
                      {selectedMaterials.map((material, idx) => (
                        <div key={idx} className="modal-material-card">
                          <div className="material-card-header">
                            <div className="material-card-icon">⚡</div>
                            <div className="material-card-info">
                              <h4 className="material-card-name">
                                {material.materialName}
                              </h4>
                              <p className="material-card-category">
                                Xom ashyo
                              </p>
                            </div>
                          </div>
                          <div className="material-card-quantity">
                            <span className="quantity-number">
                              {material.quantityUsed}
                            </span>
                            <span className="quantity-unit">
                              {material.unit || "dona"}
                            </span>
                          </div>
                          <div className="material-card-progress">
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${Math.min(
                                    (material.quantityUsed / 100) * 100,
                                    100
                                  )}%`,
                                  animationDelay: `${idx * 0.1}s`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <div className="modal-stats">
                      <div className="stat-box">
                        <span className="stat-value">
                          {selectedMaterials.length}
                        </span>
                        <span className="stat-label">Jami material turi</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-value">
                          {selectedMaterials.reduce(
                            (sum, m) => sum + m.quantityUsed,
                            0
                          )}
                        </span>
                        <span className="stat-label">Umumiy miqdor</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProductionSystem;
