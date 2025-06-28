import React, { useState, useEffect } from "react";
import { Calculator, Package, TrendingUp, ShoppingCart } from "lucide-react";
import {
  useGetFilteredMaterialsQuery,
  useUpdateMaterialMutation,
  useCreateMaterialMutation,
} from "../../../context/materialApi";
import "./style.css";
import { useGetFactoriesQuery } from "../../../context/clinicApi";
import { useGetWorkersQuery } from "../../../context/workersApi";

const BitumProductionSystem = () => {
  const [bn3ToBn5Productions, setBn3ToBn5Productions] = useState([]);
  const [bn5Processing, setBn5Processing] = useState([]);
  const { data: material } = useGetFilteredMaterialsQuery();
  const [updateMaterial] = useUpdateMaterialMutation();
  const [createMaterial] = useCreateMaterialMutation();

  const { data: factories } = useGetFactoriesQuery();
  const factory = factories?.innerData[0];

  const { data: workersData } = useGetWorkersQuery();
  const worker =
    workersData?.innerData?.filter((w) => w.isOfficeWorker === false) || [];

  const materialObj =
    material?.reduce((acc, item) => {
      acc[item.category.replace(/-/g, "").toLowerCase()] = item;
      return acc;
    }, {}) || {};

  const [currentBn3Production, setCurrentBn3Production] = useState({
    id: null,
    date: new Date().toISOString().split("T")[0],
    bn3Amount: "15000",
    wasteAmount: "500",
    gasAmount: "4500",
    temperature: "250",
    electricEnergy: "14.5",
    boilingHours: "19",
    notes: "",
    electricity: "1200",
    price: "",
  });

  const [currentBn5Process, setCurrentBn5Process] = useState({
    id: null,
    date: new Date().toISOString().split("T")[0],
    bn5Amount: "5000",
    melAmount: "1800",
    exportBags: "",
    localBags: "",
    notes: "",
  });

  const [inventory, setInventory] = useState({
    bn3Stock: 50000,
    bn5Stock: 0,
    melStock: 10000,
    gasStock: 20000,
    exportBagStock: 1000,
    kraftPaperStock: 5000,
    ropeStock: 2000,
    readyProductStorage: { exportBags: 0, localBags: 0 },
  });

  const [showBn3Dialog, setShowBn3Dialog] = useState(false);
  const [showBn5ProcessDialog, setShowBn5ProcessDialog] = useState(false);
  const [calculatedBn5, setCalculatedBn5] = useState(0);
  const [actualBn5Result, setActualBn5Result] = useState("");

  const [electricityPrice, setElectricityPrice] = useState(0);
  const [gasPrice, setGasPrice] = useState(0);

  useEffect(() => {
    setElectricityPrice(factory?.electricityPrice || 0);
    setGasPrice(factory?.methaneGasPrice || 0);
  }, [factory]);

  const recipe = {
    bn5Percentage: 75,
    melPercentage: 25,
    exportBagWeight: 39,
    localBagWeight: 35,
    kraftPaperPerBag: 0.25,
    ropePerExportBag: 2,
  };

  // Mock: Ishchi oyliklari
  const workers = worker.map((worker) => {
    return {
      fullName: worker.firstName + " " + worker.lastName,
      salary: worker.salary,
    };
  });

  // Hisoblash
  useEffect(() => {
    const { bn3Amount, wasteAmount, gasAmount, electricity } =
      currentBn3Production;

    const bn3 = parseFloat(bn3Amount) || 0;
    const waste = parseFloat(wasteAmount) || 0;
    const gas = parseFloat(gasAmount) || 0;
    const electricityUsed = parseFloat(electricity) || 0;
    const bn3Price = materialObj?.bn3?.price || 0;

    // Ishchilar oyligi jami
    const totalWorkersSalary = workers.reduce(
      (sum, worker) => sum + worker.salary,
      0
    );

    // Umumiy xarajatlar
    const totalBn3Cost = bn3 * bn3Price;
    const totalGasCost = gas * gasPrice;
    const totalElectricityCost = electricityUsed * electricityPrice;

    const totalCost =
      totalBn3Cost + totalGasCost + totalElectricityCost + totalWorkersSalary;
    const finalBn5 = bn3 - waste;
    const unitCostBn5 = finalBn5 > 0 ? (totalCost / finalBn5).toFixed(2) : "0";

    setCurrentBn3Production((prev) => ({
      ...prev,
      price: unitCostBn5.toString(),
    }));
  }, [
    currentBn3Production.bn3Amount,
    currentBn3Production.wasteAmount,
    currentBn3Production.gasAmount,
    currentBn3Production.electricity,
    materialObj?.bn3?.price,
    electricityPrice,
    gasPrice,
  ]);

  const handleBn3Production = async () => {
    const { bn3Amount, gasAmount, boilingHours, price } = currentBn3Production;
    const bn3 = parseFloat(bn3Amount) || 0;
    const gas = parseFloat(gasAmount) || 0;
    const hours = parseFloat(boilingHours) || 0;

    if (!gas || hours !== 19)
      return confirm(
        "Gaz miqdorini kiriting va 19 soat qaynaganligini tasdiqlang!"
      );
    if (inventory.bn3Stock < bn3) return alert("Omborida yetarli BN-3 yo'q!");

    const data = {
      name: "BN-5",
      quantity: finalBn5,
      price: parseFloat(price),
      currency: "sum",
      unit: "kilo",
      category: "BN-5",
    };
    materialObj?.bn5
      ? await updateMaterial({
          id: materialObj.bn5._id,
          body: {
            ...materialObj.bn5,
            quantity: materialObj.bn5.quantity + finalBn5,
          },
        })
      : await createMaterial(data);

    setCalculatedBn5(finalBn5);
    setShowBn3Dialog(true);
  };

  const confirmBn3Production = () => {
    const actualBn5 = parseFloat(actualBn5Result) || 0;
    if (actualBn5 <= 0) return alert("Haqiqiy BN-5 miqdorini kiriting!");

    const { bn3Amount, gasAmount } = currentBn3Production;
    setBn3ToBn5Productions([
      ...bn3ToBn5Productions,
      {
        ...currentBn3Production,
        id: Date.now(),
        actualBn5,
        timestamp: new Date().toLocaleString("uz-UZ"),
      },
    ]);

    setInventory((prev) => ({
      ...prev,
      bn3Stock: prev.bn3Stock - parseFloat(bn3Amount),
      bn5Stock: prev.bn5Stock + actualBn5,
      gasStock: prev.gasStock - parseFloat(gasAmount),
    }));

    setCurrentBn3Production({
      ...currentBn3Production,
      id: null,
      bn3Amount: "15000",
      wasteAmount: "500",
      gasAmount: "4500",
      notes: "",
      electricity: "1200",
      price: "",
    });
    setActualBn5Result("");
    setShowBn3Dialog(false);
  };

  const handleBn5Processing = () => {
    const { bn5Amount, melAmount } = currentBn5Process;
    const bn5 = parseFloat(bn5Amount) || 0;
    const mel = parseFloat(melAmount) || 0;

    if (inventory.bn5Stock < bn5) return alert("Omborida yetarli BN-5 yo'q!");
    if (inventory.melStock < mel) return alert("Omborida yetarli mel yo'q!");

    const totalMix = bn5 + mel;
    const bn5Percent = (bn5 / totalMix) * 100;
    const melPercent = (mel / totalMix) * 100;

    if (Math.abs(bn5Percent - 75) > 5 || Math.abs(melPercent - 25) > 5)
      return alert(
        `Nisbat noto'g'ri! BN-5: ${bn5Percent.toFixed(
          1
        )}%, Mel: ${melPercent.toFixed(1)}%`
      );

    setShowBn5ProcessDialog(true);
  };

  const confirmBn5Processing = () => {
    const { bn5Amount, melAmount, exportBags, localBags } = currentBn5Process;
    const bn5Used = parseFloat(bn5Amount) || 0;
    const melUsed = parseFloat(melAmount) || 0;
    const exportBagsNum = parseFloat(exportBags) || 0;
    const localBagsNum = parseFloat(localBags) || 0;
    const totalMix = bn5Used + melUsed;
    const exportAmount = exportBagsNum * recipe.exportBagWeight;
    const localAmount = localBagsNum * recipe.localBagWeight;
    const totalPacked = exportAmount + localAmount;
    const ropeNeeded = exportBagsNum * recipe.ropePerExportBag;
    const kraftNeeded = localBagsNum * recipe.kraftPaperPerBag;

    if (inventory.exportBagStock < exportBagsNum)
      return alert("Yetarli eksport qopi yo'q!");
    if (inventory.ropeStock < ropeNeeded) return alert("Yetarli ip yo'q!");
    if (inventory.kraftPaperStock < kraftNeeded)
      return alert("Yetarli kraft qog'oz yo'q");
    if (totalPacked > totalMix)
      return alert("Qadoqlash miqdori aralashmadan ko'p bo'lishi mumkin emas!");

    setBn5Processing([
      ...bn5Processing,
      {
        ...currentBn5Process,
        id: Date.now(),
        totalMix,
        exportBags: exportBagsNum,
        localBags: localBagsNum,
        exportAmount,
        localAmount,
        ropeUsed: ropeNeeded,
        kraftUsed: kraftNeeded,
        timestamp: new Date().toLocaleString("uz-UZ"),
      },
    ]);

    setInventory((prev) => ({
      ...prev,
      bn5Stock: prev.bn5Stock - bn5Used,
      melStock: prev.melStock - melUsed,
      exportBagStock: prev.exportBagStock - exportBagsNum,
      kraftPaperStock: prev.kraftPaperStock - kraftNeeded,
      ropeStock: prev.ropeStock - ropeNeeded,
      readyProductStorage: {
        exportBags: prev.readyProductStorage.exportBags + exportBagsNum,
        localBags: prev.readyProductStorage.localBags + localBagsNum,
      },
    }));

    setCurrentBn5Process({
      ...currentBn5Process,
      id: null,
      bn5Amount: "5000",
      melAmount: "1800",
      exportBags: "",
      localBags: "",
      notes: "",
    });
    setShowBn5ProcessDialog(false);
  };

  return (
    <div className="bitum-system-container">
      <div className="bitum-inventory-grid">
        <div className="bitum-inventory-card">
          <h4>BN-3 Ombori</h4>
          <p className="bn3-inventory">
            {(materialObj?.bn3?.quantity || 0).toLocaleString()} kg
          </p>
        </div>
        <div className="bitum-inventory-card">
          <h4>BN-5 Ombori</h4>
          <p className="bn5-inventory">
            {(materialObj?.bn5?.quantity || 0).toLocaleString()} kg
          </p>
        </div>
        <div className="bitum-inventory-card">
          <h4>Mel Ombori</h4>
          <p className="mel-inventory">
            {(materialObj?.mel?.quantity || 0).toLocaleString()} kg
          </p>
        </div>
        <div className="bitum-inventory-card">
          <h4>Tayyor Mahsulot</h4>
          <p className="ready-product-inventory">
            Eksport: {inventory.readyProductStorage.exportBags} qop
            <br />
            Ichki: {inventory.readyProductStorage.localBags} qop
          </p>
        </div>
      </div>

      <div className="bitum-production-sections">
        <div className="bitum-production-panel">
          <div className="bitum-panel-header">
            <Calculator size={24} color="#667eea" />
            <h2>1-BOSQICH: BN-3 → BN-5</h2>
          </div>
          <div className="bitum-input-grid">
            {[
              {
                label: "BN-3 miqdori (kg)",
                key: "bn3Amount",
                placeholder: "15000",
              },
              {
                label: "Chiqindi (kg)",
                key: "wasteAmount",
                placeholder: "500",
              },
              {
                label: (
                  <span>
                    Elektr energiyasi (kWh){" "}
                    <span className="price-info">
                      ({electricityPrice} so‘m/kWh)
                    </span>
                  </span>
                ),
                key: "electricity",
                placeholder: "1200",
              },
              {
                label: (
                  <span>
                    Gaz (m³){" "}
                    <span className="price-info">({gasPrice} so‘m/m³)</span>
                  </span>
                ),
                key: "gasAmount",
                placeholder: "4500",
              },
              {
                label: "BN-5 (1kg narx)",
                key: "price",
                placeholder: "5.850",
                readOnly: true,
              },
              {
                label: "Qaynash vaqti (soat)",
                key: "boilingHours",
                placeholder: "19",
              },
            ].map(({ label, key, placeholder, readOnly }) => (
              <div className="bitum-input-group" key={key}>
                <label>{label}</label>
                <input
                  type="number"
                  value={currentBn3Production[key]}
                  onChange={(e) =>
                    !readOnly &&
                    setCurrentBn3Production({
                      ...currentBn3Production,
                      [key]: e.target.value,
                    })
                  }
                  placeholder={placeholder}
                  readOnly={readOnly}
                />
              </div>
            ))}
          </div>
          <button
            className="bitum-action-button bitum-bn3-action"
            onClick={handleBn3Production}
          >
            <TrendingUp size={20} /> BN-5 Ishlab Chiqarish
          </button>
        </div>

        <div className="bitum-production-panel">
          <div className="bitum-panel-header">
            <Package size={24} color="#059669" />
            <h2>2-BOSQICH: BN-5 + Mel</h2>
          </div>
          <div className="bitum-input-flex">
            {[
              {
                label: "BN-5 miqdori (kg)",
                key: "bn5Amount",
                placeholder: "5000",
              },
              {
                label: "Mel miqdori (kg)",
                key: "melAmount",
                placeholder: "1800",
              },
            ].map(({ label, key, placeholder }) => (
              <div className="bitum-input-group" key={key}>
                <label>{label}</label>
                <input
                  type="number"
                  value={currentBn5Process[key]}
                  onChange={(e) =>
                    setCurrentBn5Process({
                      ...currentBn5Process,
                      [key]: e.target.value,
                    })
                  }
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
          <button
            className="bitum-action-button bitum-bn5-action"
            onClick={handleBn5Processing}
          >
            <ShoppingCart size={20} /> Qadoqlashga Tayyorlash
          </button>
        </div>
      </div>

      {showBn3Dialog && (
        <div className="bitum-dialog-overlay">
          <div className="bitum-dialog-box">
            <h3>BN-5 Ishlab Chiqarish Natijasi</h3>
            <p>
              Hisoblangan BN-5 miqdori:{" "}
              <strong>{calculatedBn5.toLocaleString()} kg</strong>
            </p>
            <div className="bitum-dialog-input">
              <label>Haqiqiy BN-5 miqdori (kg)</label>
              <input
                type="number"
                value={actualBn5Result}
                onChange={(e) => setActualBn5Result(e.target.value)}
                placeholder={calculatedBn5.toLocaleString()}
              />
            </div>
            <div className="bitum-dialog-actions">
              <button
                className="bitum-cancel-button"
                onClick={() => setShowBn3Dialog(false)}
              >
                Bekor qilish
              </button>
              <button
                className="bitum-confirm-button bitum-bn3-confirm"
                onClick={confirmBn3Production}
              >
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {showBn5ProcessDialog && (
        <div className="bitum-dialog-overlay">
          <div className="bitum-dialog-box">
            <h3>Mahsulotni Qadoqlash</h3>
            <p>
              Umumiy aralashma:{" "}
              <strong>
                {(
                  parseFloat(currentBn5Process.bn5Amount) +
                  parseFloat(currentBn5Process.melAmount)
                ).toLocaleString()}{" "}
                kg
              </strong>
            </p>
            <div className="bitum-input-grid">
              {[
                {
                  label: "Eksport qoplari (39 kg)",
                  key: "exportBags",
                  placeholder: "0",
                },
                {
                  label: "Ichki bozor qoplari (35 kg)",
                  key: "localBags",
                  placeholder: "0",
                },
              ].map(({ label, key, placeholder }) => (
                <div className="bitum-input-group" key={key}>
                  <label>{label}</label>
                  <input
                    type="number"
                    value={currentBn5Process[key]}
                    onChange={(e) =>
                      setCurrentBn5Process({
                        ...currentBn5Process,
                        [key]: e.target.value,
                      })
                    }
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
            <div className="bitum-packaging-details">
              <p>
                Eksport miqdori:{" "}
                <strong>
                  {(
                    (parseFloat(currentBn5Process.exportBags) || 0) *
                    recipe.exportBagWeight
                  ).toLocaleString()}{" "}
                  kg
                </strong>
              </p>
              <p>
                Ichki bozor miqdori:{" "}
                <strong>
                  {(
                    (parseFloat(currentBn5Process.localBags) || 0) *
                    recipe.localBagWeight
                  ).toLocaleString()}{" "}
                  kg
                </strong>
              </p>
              <p>
                Ip sarfi:{" "}
                <strong>
                  {(
                    (parseFloat(currentBn5Process.exportBags) || 0) *
                    recipe.ropePerExportBag
                  ).toLocaleString()}{" "}
                  metr
                </strong>
              </p>
              <p>
                Kraft qog'oz sarfi:{" "}
                <strong>
                  {(
                    (parseFloat(currentBn5Process.localBags) || 0) *
                    recipe.kraftPaperPerBag
                  ).toLocaleString()}{" "}
                  kg
                </strong>
              </p>
            </div>
            <div className="bitum-dialog-actions">
              <button
                className="bitum-cancel-button"
                onClick={() => setShowBn5ProcessDialog(false)}
              >
                Bekor qilish
              </button>
              <button
                className="bitum-confirm-button bitum-bn5-confirm"
                onClick={confirmBn5Processing}
              >
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BitumProductionSystem;
