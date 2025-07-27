import React, { useState, useEffect } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Package, ShoppingCart } from "lucide-react";
import { useProductionForSalesBN5Mutation } from "../../../context/productionApi";
import { toast } from "react-toastify";

const Bn5ProcessDialog = ({
  refetch,
  material,
  gasPrice,
  electricityPrice,
}) => {
  const [packagingType, setPackagingType] = useState("bag"); // 'bag', 'smallCup', 'largeCup'
  const [unitType, setUnitType] = useState("dona"); // 'dona', 'gram', 'kilo'
  const [showBn5ProcessDialog, setShowBn5ProcessDialog] = useState(false);
  const [bn5Amount, setBn5Amount] = useState("");
  const [quantity, setQuantity] = useState("");
  const [inputValues, setInputValues] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // New loading state

  const [createBn5Production] = useProductionForSalesBN5Mutation();

  const [currentBn5Process, setCurrentBn5Process] = useState({
    date: new Date().toISOString().split("T")[0],
    bn5Amount: "5000",
    melAmount: "1800",
    electricity: "200",
    gasAmount: "200",
    notes: "",
    extra: "271000",
    kraftPaper: "20",
    sellingPrice: "6500",
    qop: "87",
    price: "",
  });

  const packagingConfig = {
    bag: {
      label: "Qop",
      weight: 39,
      ropePerUnit: 1.5,
      kraftPerUnit: unitType !== "dona" ? 0.25 : 0,
    },
    smallCup: {
      label: "Stakan kichik",
      weight: 0.5,
      ropePerUnit: 1.5,
      kraftPerUnit: 0,
    },
    largeCup: {
      label: "Stakan katta",
      weight: 1,
      ropePerUnit: 1.5,
      kraftPerUnit: 0,
    },
  };

  const handleChange = (key, value) => {
    setCurrentBn5Process((prev) => ({ ...prev, [key]: value }));
  };

  const handleDeleteInputValue = (index) => {
    setInputValues((prev) => prev.filter((_, i) => i !== index));
    toast.success("Qadoqlash birligi o‘chirildi!");
  };

  useEffect(() => {
    const bn5 = parseFloat(currentBn5Process.bn5Amount) || 0;
    const mel = parseFloat(currentBn5Process.melAmount) || 0;
    const electric = parseFloat(currentBn5Process.electricity) || 0;
    const gas = parseFloat(currentBn5Process.gasAmount) || 0;
    const kraft = parseFloat(currentBn5Process.kraftPaper) || 0;
    const qop = parseFloat(currentBn5Process.qop) || 0;

    const bn5Price = material?.find((m) => m.category === "BN-5")?.price || 0;
    const melPrice = material?.find((m) => m.category === "Mel")?.price || 0;

    const bn5Sum = bn5 * bn5Price;
    const melSum = mel * melPrice;
    const gazSum = gas * gasPrice;
    const elektrSum = electric * electricityPrice;
    const qopSum = qop * 6100; // 1 qop = 6100 so'm
    const kraftSum = kraft * 14000; // 1 kg kraft = 14000 so'm
    const ishHaqi = 1020000;

    const total =
      bn5Sum + melSum + gazSum + elektrSum + qopSum + kraftSum + ishHaqi;

    const extraForCalculation =
      (parseFloat(currentBn5Process.extra) || 271000) * 0.01;

    const totalWithExtra = total + extraForCalculation;

    const totalWeight = bn5 + mel;
    const targetPrice = 4105;
    const adjustedTotal = targetPrice * totalWeight;

    const pricePerKg = adjustedTotal / totalWeight;

    setCurrentBn5Process((prev) => ({
      ...prev,
      price: Math.round(pricePerKg),
      extra: prev.extra || "271000",
    }));
  }, [
    currentBn5Process.bn5Amount,
    currentBn5Process.melAmount,
    currentBn5Process.electricity,
    currentBn5Process.gasAmount,
    currentBn5Process.kraftPaper,
    currentBn5Process.qop,
    material,
  ]);

  const validateBn5Processing = () => {
    const { bn5Amount, melAmount } = currentBn5Process;
    const bn5 = parseFloat(bn5Amount) || 0;
    const mel = parseFloat(melAmount) || 0;

    const bn5Stock =
      material?.find((m) => m.category === "BN-5")?.quantity || 0;
    const melStock = material?.find((m) => m.category === "Mel")?.quantity || 0;

    if (bn5Stock < bn5) {
      toast.error("Omborda yetarli BN-5 yo'q!");
      return false;
    }
    if (melStock < mel) {
      toast.error("Omborda yetarli Mel yo'q!");
      return false;
    }

    const totalMix = bn5 + mel;
    const bn5Percent = (bn5 / totalMix) * 100;
    const melPercent = (mel / totalMix) * 100;
    const expectedBn5Percent = (5000 / (5000 + 1800)) * 100;
    const expectedMelPercent = (1800 / (5000 + 1800)) * 100;
    const tolerance = 0.2;

    if (
      Math.abs(bn5Percent - expectedBn5Percent) > tolerance ||
      Math.abs(melPercent - expectedMelPercent) > tolerance
    ) {
      toast.error(
        `Nisbat noto'g'ri! BN-5: ${bn5Percent.toFixed(
          1
        )}%, Mel: ${melPercent.toFixed(1)}%`
      );
      return false;
    }

    setShowBn5ProcessDialog(true);
    return true;
  };

  const confirmBn5Processing = async () => {
    setIsLoading(true); // Start loading
    try {
      const payload = {
        processData: {
          ...currentBn5Process,
          bn5Amount: parseFloat(currentBn5Process.bn5Amount) || 0,
          melAmount: parseFloat(currentBn5Process.melAmount) || 0,
          electricity: parseFloat(currentBn5Process.electricity) || 0,
          gasAmount: parseFloat(currentBn5Process.gasAmount) || 0,
          kraftPaper: parseFloat(currentBn5Process.kraftPaper) || 0,
          qop: parseFloat(currentBn5Process.qop) || 0,
          extra: parseFloat(currentBn5Process.extra) || 271000,
          price: parseFloat(currentBn5Process.price) || 0,
          sellingPrice: parseFloat(currentBn5Process.sellingPrice) || 0,
        },
        packagingData: inputValues.map((input) => ({
          label: input.label,
          bn5Amount: parseFloat(input.bn) || 0,
          quantity: parseFloat(input.value) || 0,
          unit: "kg",
          rope:
            input.label === "Qop"
              ? (parseFloat(input.value) * 1.5).toFixed(2)
              : 0,
        })),
        timestamp: new Date().toISOString(),
      };

      const res = await createBn5Production(payload);

      if (res?.error.status === 400) {
        return toast.error(
          res?.error.data.message ||
            "Xatolik yuz berdi, iltimos qaytadan urinib ko‘ring!"
        );
      }

      refetch();
      toast.success("Mahsulot muvaffiyatli qadoqlandi va serverga tayyor!");
      setShowBn5ProcessDialog(false);
    } catch (error) {
      toast.error("Xatolik yuz berdi, iltimos qaytadan urinib ko‘ring!");
      console.error(error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const renderInputFields = () => {
    const fields = [
      { label: "BN-5 miqdori (kg)", key: "bn5Amount", placeholder: "5000" },
      { label: "Mel miqdori (kg)", key: "melAmount", placeholder: "1800" },
      {
        label: (
          <>
            Elektr energiyasi (kWh){" "}
            <span className="price-info">({electricityPrice} so‘m/kWh)</span>
          </>
        ),
        key: "electricity",
        placeholder: "200",
      },
      {
        label: (
          <>
            Gaz (m³) <span className="price-info">({gasPrice} so‘m/m³)</span>
          </>
        ),
        key: "gasAmount",
        placeholder: "200",
      },
      {
        label: "Boshqa xarajatlar",
        key: "extra",
        placeholder: "271000",
        readOnly: true,
      },
      { label: "Kraf qog‘oz (kg)", key: "kraftPaper", placeholder: "20" },
      { label: "Qop (dona)", key: "qop", placeholder: "87" },
      {
        label: "BN-5 Tannarxi (1kg)",
        key: "price",
        placeholder: "0",
        readOnly: true,
      },
      {
        label: "BN-5 Sotuv narxi (1kg)",
        key: "sellingPrice",
        placeholder: "0",
      },
    ];

    return fields.map(({ label, key, placeholder, readOnly }) => (
      <div className="bitum-input-group" key={key}>
        <label>{label}</label>
        <input
          type="number"
          value={currentBn5Process[key]}
          onChange={(e) => handleChange(key, e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      </div>
    ));
  };

  const handleOK = () => {
    if (!bn5Amount || !quantity) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }

    const newEntry = {
      label: packagingConfig[packagingType].label,
      bn: bn5Amount,
      value: quantity,
    };

    setInputValues((prev) => [...prev, newEntry]);

    // Inputlarni tozalash
    setBn5Amount("");
    setQuantity("");

    toast.success("Qadoqlash birligi qo‘shildi!");
  };

  return (
    <>
      <div className="bitum-production-panel">
        <div className="bitum-panel-header">
          <Package size={24} color="#059669" />
          <h2>2-BOSQICH: BN-5 + Mel</h2>
        </div>

        <div className="bitum-input-grid">{renderInputFields()}</div>

        <button
          className="bitum-action-button bitum-bn5-action"
          onClick={validateBn5Processing}
        >
          <ShoppingCart size={20} /> Qadoqlashga Tayyorlash
        </button>
      </div>

      {showBn5ProcessDialog && (
        <div className="bitum-dialog-overlay">
          <div className="bitum-dialog-box">
            <h3>Mahsulotni Qadoqlash</h3>
            <p>
              Umumiy aralashma:{" "}
              <strong>
                {(
                  parseFloat(currentBn5Process.bn5Amount) +
                  parseFloat(currentBn5Process.melAmount) -
                  inputValues.reduce(
                    (sum, input) => sum + (parseFloat(input.bn) || 0),
                    0
                  )
                ).toLocaleString()}{" "}
                kg
              </strong>
            </p>

            <div className="bitum-packaging-buttons">
              {Object.keys(packagingConfig).map((type) => (
                <button
                  key={type}
                  className={`bitum-action-button ${
                    packagingType === type ? "active" : ""
                  }`}
                  onClick={() => {
                    setPackagingType(type);
                    setUnitType(type === "bag" ? "dona" : "kilo");
                  }}
                >
                  {packagingConfig[type].label}
                </button>
              ))}
            </div>
            <div className="input-container">
              <input
                type="text"
                className="input-field"
                placeholder="Bn-5 miqdorini kiriting (kg)"
                value={bn5Amount}
                onChange={(e) => setBn5Amount(e.target.value)}
              />
              <input
                type="text"
                className="input-field"
                placeholder={
                  unitType === "dona"
                    ? "Qoplar sonini kiriting"
                    : "Kraf qog'oz miqdorini (kg)"
                }
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <button className="action-button" onClick={handleOK}>
                OK
              </button>
            </div>
            <div className="input-values-container">
              {inputValues.length > 0 ? (
                inputValues.map((input, index) => (
                  <div key={index} className="input-value-card">
                    <button
                      className="del-inp-value"
                      onClick={() => handleDeleteInputValue(index)}
                    >
                      <RiDeleteBin6Line />
                    </button>
                    <span className="package-type">{input.label}</span>
                    <span className="package-info">BN-5: {input.bn} kg</span>
                    <span className="package-info">
                      {input.label === "Qop" ? input.label : "Kraf qog'oz"}{" "}
                      {input.value} {input.label === "Qop" ? "dona" : "kg"}
                    </span>
                    {input.label === "Qop" && (
                      <span className="package-info">
                        Ip: {(parseFloat(input.value) * 1.5).toFixed(2)} g
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-package-text">
                  Hech qanday qadoqlash birligi qo‘shilmagan.
                </p>
              )}
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
                disabled={isLoading} // Disable button when loading
              >
                {isLoading ? (
                  <span>Loading...</span> // Replace with a spinner if desired
                ) : (
                  "Tasdiqlash"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Bn5ProcessDialog;
