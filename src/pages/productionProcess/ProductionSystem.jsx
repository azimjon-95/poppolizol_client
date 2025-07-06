import React, { useState } from "react";
import { Select, Tabs } from "antd";
import ruberoid from "../../assets/ruberoid.jpg";
import betumImg from "../../assets/betum.jpg";
import { GiOilDrum } from "react-icons/gi";
import { useGetAllNormaQuery } from "../../context/normaApi";
import {
  useGetFinishedProductsQuery,
  useStartProductionProcessMutation,
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

const { Option } = Select;
const { TabPane } = Tabs;

const ProductionSystem = () => {
  const [selectedNorma, setSelectedNorma] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");
  const [quantityToProduce, setQuantityToProduce] = useState(1);

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
        `Muvaffaqiyatli ishlab chiqarildi: ${quantityToProduce} dona ${normas?.innerData?.find((n) => n._id === selectedNorma)?.productName
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
            <div className="summary-section">
              <div className="summary-item">
                <span className="summary-icon">📦</span>
                <span className="summary-label">Mahsulotlar soni: </span>
                <span className="summary-value">{finishedProducts?.length || 0} ta</span>
              </div>
              <div className="summary-item">
                <span className="summary-icon">💸</span>
                <span className="summary-label">Umumiy tannarx: </span>
                <span className="summary-value">
                  {NumberFormat(
                    finishedProducts?.reduce(
                      (total, product) => total + +product.productionCost * +product.quantity,
                      0
                    ) || 0
                  )} so'm
                </span>
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
                    {
                      product.category === "Stakan" || product.category === "Qop" ? (
                        <div className="product-imagebn">
                          <img src={betumImg} alt="Ruberoid" />
                        </div>
                      ) : (
                        <div className="product-image">
                          <img src={ruberoid} alt="Ruberoid" />
                        </div>
                      )
                    }

                    {
                      product.category === "Stakan" || product.category === "Qop" ? (
                        <h3 className="product-name">
                          BN-5 {capitalizeFirstLetter(product.productName)}
                        </h3>
                      ) : (
                        <h3 className="product-name">
                          {capitalizeFirstLetter(product.productName)}
                        </h3>
                      )
                    }
                    <p className="product-category">
                      📂 Kategoriya: <span>{product.category}</span>
                    </p>
                    <p className="product-cost">
                      💰 <strong>Tannarx:</strong> <span>{NumberFormat(+product.productionCost)} so'm</span>
                    </p>
                    <div className="product-quantity-block">
                      {
                        product.category === "Stakan" || product.category === "Qop" ? (
                          <span className="product-quantity">
                            {NumberFormat(product.quantity)} kg
                          </span>
                        ) : (
                          <span className="product-quantity">
                            {NumberFormat(product.quantity)} dona
                          </span>
                        )
                      }
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
            <span style={{ display: "flex", alignmentBaseline: "center" }}>
              <History size={20} style={{ marginRight: 8 }} />
              Tarix
            </span>
          }
          key="history"
        >
          <Tabs defaultActiveKey="production" className="custom-tabs">
            <TabPane
              tab={
                <span style={{ display: "flex", alignmentBaseline: "center" }}>
                  <Factory size={20} style={{ marginRight: 8 }} />
                  Ruberoid Ishlab Chiqarish Tarixi
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
                <span style={{ display: "flex", alignmentBaseline: "center" }}>
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
